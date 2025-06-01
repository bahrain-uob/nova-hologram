const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const bedrock = new AWS.BedrockRuntime({ region: process.env.AWS_REGION || 'us-east-1' });

// Table names from environment variables
const BOOKS_TABLE = process.env.BOOKS_TABLE || 'Books';
const READING_PROGRESS_TABLE = process.env.READING_PROGRESS_TABLE || 'ReadingProgress';
const READING_SESSION_TABLE = process.env.READING_SESSION_TABLE || 'ReadingSession';
const BOOK_CATEGORIES_TABLE = process.env.BOOK_CATEGORIES_TABLE || 'BookCategories';
const USER_PREFERENCES_TABLE = process.env.USER_PREFERENCES_TABLE || 'UserPreferences';
const USER_POOL_ID = process.env.USER_POOL_ID || 'me-south-1_X7adr285t';

/**
 * Provides personalized book recommendations based on reading history and preferences
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Extract HTTP method and path parameters
    const httpMethod = event.httpMethod;
    const pathParameters = event.pathParameters || {};
    const queryParameters = event.queryStringParameters || {};
    
    // Parse request body if present
    let requestBody = {};
    if (event.body) {
      requestBody = JSON.parse(event.body);
    }
    
    // Get user info from Cognito authorizer
    const userInfo = getUserInfoFromEvent(event);
    
    // Route based on HTTP method
    switch (httpMethod) {
      case 'GET':
        // Get personalized recommendations for a user
        if (pathParameters.userId) {
          return await getPersonalizedRecommendations(
            pathParameters.userId, 
            queryParameters.limit || 10,
            queryParameters.includeRationale === 'true'
          );
        }
        // Get recommendations based on a book
        else if (queryParameters.bookId) {
          return await getSimilarBooks(
            queryParameters.bookId, 
            queryParameters.limit || 10,
            queryParameters.includeRationale === 'true'
          );
        }
        // Get trending or popular books
        else if (queryParameters.type === 'trending') {
          return await getTrendingBooks(queryParameters.limit || 10);
        }
        // Default to personalized recommendations for the authenticated user
        else if (userInfo) {
          return await getPersonalizedRecommendations(
            userInfo.userId, 
            queryParameters.limit || 10,
            queryParameters.includeRationale === 'true'
          );
        } else {
          return errorResponse(400, 'Missing required parameters');
        }
        
      case 'POST':
        // Update user preferences for recommendations
        if (requestBody.action === 'updatePreferences') {
          return await updateUserPreferences(requestBody, userInfo);
        }
        // Rate a book (used for improving recommendations)
        else if (requestBody.action === 'rateBook') {
          return await rateBook(requestBody, userInfo);
        }
        // Default error
        else {
          return errorResponse(400, 'Invalid action');
        }
        
      default:
        return errorResponse(405, 'Method not allowed');
    }
  } catch (error) {
    console.error('Error processing request:', error);
    return errorResponse(500, 'Internal server error', error.message);
  }
};

/**
 * Extract user information from the event
 */
function getUserInfoFromEvent(event) {
  try {
    if (event.requestContext && 
        event.requestContext.authorizer && 
        event.requestContext.authorizer.claims) {
      
      const claims = event.requestContext.authorizer.claims;
      
      return {
        userId: claims.sub,
        email: claims.email,
        userType: claims['custom:userType'] || 'reader',
        name: claims.name || claims.email
      };
    }
    
    return null;
  } catch (error) {
    console.error('Error extracting user info:', error);
    return null;
  }
}

/**
 * Get personalized book recommendations for a user
 */
async function getPersonalizedRecommendations(userId, limit, includeRationale) {
  // Get user's reading history
  const readingHistory = await getUserReadingHistory(userId);
  
  // Get user preferences
  const userPreferences = await getUserPreferences(userId);
  
  // Get all available books
  const allBooks = await getAllBooks();
  
  // Filter out books the user has already read
  const readBookIds = new Set(readingHistory.map(item => item.bookId));
  const unreadBooks = allBooks.filter(book => !readBookIds.has(book.book_id));
  
  // If user has no reading history or preferences, return trending books
  if (readingHistory.length === 0 && (!userPreferences || Object.keys(userPreferences).length === 0)) {
    const trending = await getTrendingBooks(limit);
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: trending.body
    };
  }
  
  // Score books based on user's reading history and preferences
  const scoredBooks = scoreBooks(unreadBooks, readingHistory, userPreferences);
  
  // Sort by score and take the top N
  const recommendations = scoredBooks
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  // Generate rationales if requested
  let recommendationsWithRationale = recommendations;
  if (includeRationale && recommendations.length > 0) {
    recommendationsWithRationale = await generateRecommendationRationales(
      recommendations, 
      readingHistory, 
      userPreferences
    );
  }
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      userId,
      recommendations: recommendationsWithRationale.map(book => ({
        bookId: book.book_id,
        title: book.book_title,
        author: book.author,
        category: book.category,
        coverImage: book.cover_image,
        summary: book.summary,
        rationale: book.rationale || null,
        matchScore: Math.round(book.score * 100) / 100
      }))
    })
  };
}

/**
 * Get books similar to a specific book
 */
async function getSimilarBooks(bookId, limit, includeRationale) {
  // Get the source book
  const sourceBook = await getBookDetails(bookId);
  
  if (!sourceBook) {
    return errorResponse(404, 'Book not found');
  }
  
  // Get all books
  const allBooks = await getAllBooks();
  
  // Filter out the source book
  const otherBooks = allBooks.filter(book => book.book_id !== bookId);
  
  // Score books based on similarity to source book
  const scoredBooks = otherBooks.map(book => {
    let score = 0;
    
    // Same category
    if (book.category === sourceBook.category) {
      score += 0.5;
    }
    
    // Same author
    if (book.author === sourceBook.author) {
      score += 0.3;
    }
    
    // Same grade level
    if (book.grade_level === sourceBook.grade_level) {
      score += 0.2;
    }
    
    // Similar tags
    if (book.tags && sourceBook.tags) {
      const bookTags = new Set(book.tags);
      const sourceTags = new Set(sourceBook.tags);
      
      const intersection = new Set([...bookTags].filter(tag => sourceTags.has(tag)));
      score += intersection.size * 0.1;
    }
    
    return {
      ...book,
      score
    };
  });
  
  // Sort by score and take the top N
  const recommendations = scoredBooks
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
  
  // Generate rationales if requested
  let recommendationsWithRationale = recommendations;
  if (includeRationale && recommendations.length > 0) {
    recommendationsWithRationale = await generateSimilarityRationales(
      recommendations, 
      sourceBook
    );
  }
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      sourceBookId: bookId,
      sourceBookTitle: sourceBook.book_title,
      recommendations: recommendationsWithRationale.map(book => ({
        bookId: book.book_id,
        title: book.book_title,
        author: book.author,
        category: book.category,
        coverImage: book.cover_image,
        summary: book.summary,
        rationale: book.rationale || null,
        similarityScore: Math.round(book.score * 100) / 100
      }))
    })
  };
}

/**
 * Get trending or popular books
 */
async function getTrendingBooks(limit) {
  // Get all reading sessions
  const sessionParams = {
    TableName: READING_SESSION_TABLE
  };
  
  const sessionResult = await dynamoDB.scan(sessionParams).promise();
  const sessions = sessionResult.Items || [];
  
  // Count sessions per book in the last 30 days
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  const bookSessionCounts = {};
  
  sessions.forEach(session => {
    if (!session.start_date) return;
    
    const sessionDate = new Date(session.start_date);
    if (sessionDate >= thirtyDaysAgo) {
      const bookId = session.book_id;
      
      if (!bookSessionCounts[bookId]) {
        bookSessionCounts[bookId] = 0;
      }
      
      bookSessionCounts[bookId] += 1;
    }
  });
  
  // Get all books
  const allBooks = await getAllBooks();
  
  // Score books by session count
  const scoredBooks = allBooks.map(book => ({
    ...book,
    sessionCount: bookSessionCounts[book.book_id] || 0
  }));
  
  // Sort by session count and take the top N
  const trendingBooks = scoredBooks
    .sort((a, b) => b.sessionCount - a.sessionCount)
    .slice(0, limit);
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      trendingBooks: trendingBooks.map(book => ({
        bookId: book.book_id,
        title: book.book_title,
        author: book.author,
        category: book.category,
        coverImage: book.cover_image,
        summary: book.summary,
        recentReaders: book.sessionCount
      }))
    })
  };
}

/**
 * Update user preferences for recommendations
 */
async function updateUserPreferences(data, userInfo) {
  // Validate required fields
  if (!data.preferences) {
    return errorResponse(400, 'preferences object is required');
  }
  
  // Use authenticated user ID or the provided one
  const userId = userInfo ? userInfo.userId : data.userId;
  
  if (!userId) {
    return errorResponse(400, 'userId is required when not authenticated');
  }
  
  // Validate that the user can only update their own preferences
  if (userInfo && userInfo.userId !== userId && userInfo.userType !== 'librarian') {
    return errorResponse(403, 'You can only update your own preferences');
  }
  
  // Get existing preferences
  const existingPreferences = await getUserPreferences(userId);
  
  // Merge with new preferences
  const updatedPreferences = {
    ...existingPreferences,
    ...data.preferences,
    lastUpdated: new Date().toISOString()
  };
  
  // Save to DynamoDB
  const params = {
    TableName: USER_PREFERENCES_TABLE,
    Item: {
      user_id: userId,
      preferences: updatedPreferences
    }
  };
  
  await dynamoDB.put(params).promise();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'User preferences updated successfully',
      userId,
      preferences: updatedPreferences
    })
  };
}

/**
 * Rate a book (used for improving recommendations)
 */
async function rateBook(data, userInfo) {
  // Validate required fields
  if (!data.bookId || data.rating === undefined) {
    return errorResponse(400, 'bookId and rating are required');
  }
  
  // Use authenticated user ID or the provided one
  const userId = userInfo ? userInfo.userId : data.userId;
  
  if (!userId) {
    return errorResponse(400, 'userId is required when not authenticated');
  }
  
  // Validate that the user can only rate books for themselves
  if (userInfo && userInfo.userId !== userId) {
    return errorResponse(403, 'You can only rate books for yourself');
  }
  
  // Check if the book exists
  const bookExists = await checkBookExists(data.bookId);
  if (!bookExists) {
    return errorResponse(404, 'Book not found');
  }
  
  // Get existing preferences
  const existingPreferences = await getUserPreferences(userId);
  
  // Update book ratings in preferences
  const updatedPreferences = {
    ...existingPreferences,
    bookRatings: {
      ...(existingPreferences.bookRatings || {}),
      [data.bookId]: {
        rating: data.rating,
        timestamp: new Date().toISOString(),
        feedback: data.feedback || null
      }
    },
    lastUpdated: new Date().toISOString()
  };
  
  // Save to DynamoDB
  const params = {
    TableName: USER_PREFERENCES_TABLE,
    Item: {
      user_id: userId,
      preferences: updatedPreferences
    }
  };
  
  await dynamoDB.put(params).promise();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Book rating saved successfully',
      userId,
      bookId: data.bookId,
      rating: data.rating
    })
  };
}

/**
 * Get user's reading history
 */
async function getUserReadingHistory(userId) {
  // Get progress data
  const progressParams = {
    TableName: READING_PROGRESS_TABLE,
    FilterExpression: 'user_id = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  };
  
  const progressResult = await dynamoDB.scan(progressParams).promise();
  const progressItems = progressResult.Items || [];
  
  // Get session data
  const sessionParams = {
    TableName: READING_SESSION_TABLE,
    FilterExpression: 'user_id = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  };
  
  const sessionResult = await dynamoDB.scan(sessionParams).promise();
  const sessionItems = sessionResult.Items || [];
  
  // Combine data to create reading history
  const bookMap = {};
  
  // Process progress data
  progressItems.forEach(progress => {
    const bookId = progress.book_id;
    
    if (!bookMap[bookId]) {
      bookMap[bookId] = {
        bookId,
        progressPercentage: progress.progress_percentage || 0,
        lastRead: progress.last_updated || null,
        totalReadingTime: 0,
        sessionCount: 0
      };
    } else {
      bookMap[bookId].progressPercentage = progress.progress_percentage || 0;
      
      if (progress.last_updated && (!bookMap[bookId].lastRead || new Date(progress.last_updated) > new Date(bookMap[bookId].lastRead))) {
        bookMap[bookId].lastRead = progress.last_updated;
      }
    }
  });
  
  // Process session data
  sessionItems.forEach(session => {
    const bookId = session.book_id;
    
    if (!bookMap[bookId]) {
      bookMap[bookId] = {
        bookId,
        progressPercentage: 0,
        lastRead: session.start_date || null,
        totalReadingTime: 0,
        sessionCount: 0
      };
    }
    
    if (session.start_date && (!bookMap[bookId].lastRead || new Date(session.start_date) > new Date(bookMap[bookId].lastRead))) {
      bookMap[bookId].lastRead = session.start_date;
    }
    
    bookMap[bookId].sessionCount += 1;
    
    if (session.start_date && session.end_date) {
      const startTime = new Date(session.start_date);
      const endTime = new Date(session.end_date);
      const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
      
      bookMap[bookId].totalReadingTime += durationMinutes;
    }
  });
  
  // Convert to array
  return Object.values(bookMap);
}

/**
 * Get user preferences
 */
async function getUserPreferences(userId) {
  const params = {
    TableName: USER_PREFERENCES_TABLE,
    Key: { user_id: userId }
  };
  
  try {
    const result = await dynamoDB.get(params).promise();
    return result.Item?.preferences || {};
  } catch (error) {
    console.error('Error getting user preferences:', error);
    return {};
  }
}

/**
 * Get all books
 */
async function getAllBooks() {
  const params = {
    TableName: BOOKS_TABLE
  };
  
  try {
    const result = await dynamoDB.scan(params).promise();
    return result.Items || [];
  } catch (error) {
    console.error('Error getting all books:', error);
    return [];
  }
}

/**
 * Get book details
 */
async function getBookDetails(bookId) {
  const params = {
    TableName: BOOKS_TABLE,
    Key: { book_id: bookId }
  };
  
  try {
    const result = await dynamoDB.get(params).promise();
    return result.Item;
  } catch (error) {
    console.error('Error getting book details:', error);
    return null;
  }
}

/**
 * Check if a book exists
 */
async function checkBookExists(bookId) {
  const book = await getBookDetails(bookId);
  return !!book;
}

/**
 * Score books based on user's reading history and preferences
 */
function scoreBooks(books, readingHistory, userPreferences) {
  // Extract category information from reading history
  const categoryPreferences = {};
  const authorPreferences = {};
  
  // Get book details for reading history
  const readBookPromises = readingHistory.map(async historyItem => {
    const bookDetails = await getBookDetails(historyItem.bookId);
    return {
      ...historyItem,
      details: bookDetails
    };
  });
  
  // Wait for all book details to be fetched
  return Promise.all(readBookPromises)
    .then(readBooksWithDetails => {
      // Calculate category and author preferences
      readBooksWithDetails.forEach(book => {
        if (book.details) {
          // Category preferences
          const category = book.details.category;
          if (category) {
            if (!categoryPreferences[category]) {
              categoryPreferences[category] = 0;
            }
            
            // Weight by reading time and completion
            const weight = (book.totalReadingTime / 60) * (book.progressPercentage / 100);
            categoryPreferences[category] += weight;
          }
          
          // Author preferences
          const author = book.details.author;
          if (author) {
            if (!authorPreferences[author]) {
              authorPreferences[author] = 0;
            }
            
            // Weight by reading time and completion
            const weight = (book.totalReadingTime / 60) * (book.progressPercentage / 100);
            authorPreferences[author] += weight;
          }
        }
      });
      
      // Normalize preferences
      const maxCategoryWeight = Math.max(...Object.values(categoryPreferences), 1);
      const maxAuthorWeight = Math.max(...Object.values(authorPreferences), 1);
      
      Object.keys(categoryPreferences).forEach(category => {
        categoryPreferences[category] /= maxCategoryWeight;
      });
      
      Object.keys(authorPreferences).forEach(author => {
        authorPreferences[author] /= maxAuthorWeight;
      });
      
      // Score books
      return books.map(book => {
        let score = 0;
        
        // Category match
        if (book.category && categoryPreferences[book.category]) {
          score += categoryPreferences[book.category] * 0.4;
        }
        
        // Author match
        if (book.author && authorPreferences[book.author]) {
          score += authorPreferences[book.author] * 0.3;
        }
        
        // Explicit preferences from user
        if (userPreferences) {
          // Preferred categories
          if (userPreferences.preferredCategories && 
              userPreferences.preferredCategories.includes(book.category)) {
            score += 0.2;
          }
          
          // Preferred authors
          if (userPreferences.preferredAuthors && 
              userPreferences.preferredAuthors.includes(book.author)) {
            score += 0.2;
          }
          
          // Grade level preference
          if (userPreferences.preferredGradeLevel && 
              book.grade_level === userPreferences.preferredGradeLevel) {
            score += 0.1;
          }
          
          // Previous ratings
          if (userPreferences.bookRatings && 
              userPreferences.bookRatings[book.book_id]) {
            // Don't recommend books with low ratings
            const rating = userPreferences.bookRatings[book.book_id].rating;
            if (rating < 3) {
              score = 0;
            }
          }
        }
        
        return {
          ...book,
          score
        };
      });
    });
}

/**
 * Generate rationales for recommendations using Bedrock
 */
async function generateRecommendationRationales(recommendations, readingHistory, userPreferences) {
  // Get book details for reading history
  const readBookPromises = readingHistory.map(async historyItem => {
    const bookDetails = await getBookDetails(historyItem.bookId);
    return {
      ...historyItem,
      details: bookDetails
    };
  });
  
  const readBooksWithDetails = await Promise.all(readBookPromises);
  
  // Generate rationales for each recommendation
  const recommendationsWithRationales = await Promise.all(
    recommendations.map(async book => {
      // Find similar books the user has read
      const similarBooks = readBooksWithDetails
        .filter(readBook => 
          readBook.details && 
          (readBook.details.category === book.category || 
           readBook.details.author === book.author))
        .map(readBook => readBook.details.book_title)
        .slice(0, 3);
      
      // Create prompt for Bedrock
      const prompt = `
Generate a brief, personalized recommendation rationale (1-2 sentences) for why a student might enjoy the book "${book.book_title}" by ${book.author || 'Unknown'}.

Book information:
- Category: ${book.category || 'Unknown'}
- Grade level: ${book.grade_level || 'Unknown'}
- Summary: ${book.summary || 'Not available'}

${similarBooks.length > 0 ? `The student has previously read and enjoyed: ${similarBooks.join(', ')}` : ''}
${userPreferences && userPreferences.interests ? `The student has expressed interest in: ${userPreferences.interests.join(', ')}` : ''}

The rationale should be engaging, educational, and appropriate for a student. Keep it concise and focused on why this book would be a good match for them.
`;
      
      try {
        // Call Bedrock API
        const params = {
          modelId: 'anthropic.claude-v2',
          contentType: 'application/json',
          accept: 'application/json',
          body: JSON.stringify({
            prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
            max_tokens_to_sample: 150,
            temperature: 0.7,
            top_p: 0.9
          })
        };
        
        const response = await bedrock.invokeModel(params).promise();
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        
        // Extract the rationale from the response
        const rationale = responseBody.completion.trim();
        
        return {
          ...book,
          rationale
        };
      } catch (error) {
        console.error('Error generating rationale with Bedrock:', error);
        return book;
      }
    })
  );
  
  return recommendationsWithRationales;
}

/**
 * Generate similarity rationales for book recommendations
 */
async function generateSimilarityRationales(recommendations, sourceBook) {
  // Generate rationales for each recommendation
  const recommendationsWithRationales = await Promise.all(
    recommendations.map(async book => {
      // Create prompt for Bedrock
      const prompt = `
Generate a brief explanation (1-2 sentences) of why the book "${book.book_title}" by ${book.author || 'Unknown'} is similar to "${sourceBook.book_title}" by ${sourceBook.author || 'Unknown'}.

Source book information:
- Category: ${sourceBook.category || 'Unknown'}
- Grade level: ${sourceBook.grade_level || 'Unknown'}
- Summary: ${sourceBook.summary || 'Not available'}

Recommended book information:
- Category: ${book.category || 'Unknown'}
- Grade level: ${book.grade_level || 'Unknown'}
- Summary: ${book.summary || 'Not available'}

The explanation should be educational and highlight meaningful connections between the books. Keep it concise and focused on why someone who enjoyed the source book would also enjoy this recommendation.
`;
      
      try {
        // Call Bedrock API
        const params = {
          modelId: 'anthropic.claude-v2',
          contentType: 'application/json',
          accept: 'application/json',
          body: JSON.stringify({
            prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
            max_tokens_to_sample: 150,
            temperature: 0.7,
            top_p: 0.9
          })
        };
        
        const response = await bedrock.invokeModel(params).promise();
        const responseBody = JSON.parse(new TextDecoder().decode(response.body));
        
        // Extract the rationale from the response
        const rationale = responseBody.completion.trim();
        
        return {
          ...book,
          rationale
        };
      } catch (error) {
        console.error('Error generating similarity rationale with Bedrock:', error);
        return book;
      }
    })
  );
  
  return recommendationsWithRationales;
}

/**
 * Helper function to create error responses
 */
function errorResponse(statusCode, message, details = null) {
  const response = {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message
    })
  };
  
  if (details) {
    response.body = JSON.stringify({
      message,
      details
    });
  }
  
  return response;
}

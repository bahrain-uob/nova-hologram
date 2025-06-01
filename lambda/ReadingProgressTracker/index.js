const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

// Table to store reading progress
const READING_PROGRESS_TABLE = process.env.READING_PROGRESS_TABLE || 'ReadingProgress';
const READING_SESSION_TABLE = process.env.READING_SESSION_TABLE || 'ReadingSession';
const BOOKS_TABLE = process.env.BOOKS_TABLE || 'Books';
// Cognito User Pool ID from environment variables
const USER_POOL_ID = process.env.USER_POOL_ID || 'us-east-1_U0iB4Rowp';

/**
 * Manages reading progress for students
 * Tracks reading sessions, page progress, and completion rates
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
    
    // Get user info from Cognito authorizer if available
    const userInfo = getUserInfoFromEvent(event);
    
    // Route based on HTTP method
    switch (httpMethod) {
      case 'GET':
        // Get reading progress for a specific book or user
        if (pathParameters.progressId) {
          return await getReadingProgress(pathParameters.progressId);
        } else {
          // List reading progress based on query parameters
          return await listReadingProgress(queryParameters, userInfo);
        }
        
      case 'POST':
        // Create or update reading progress
        if (requestBody.action === 'startSession') {
          return await startReadingSession(requestBody, userInfo);
        } else if (requestBody.action === 'endSession') {
          return await endReadingSession(requestBody, userInfo);
        } else {
          return await updateReadingProgress(requestBody, userInfo);
        }
        
      case 'PUT':
        // Update reading progress
        if (!pathParameters.progressId) {
          return errorResponse(400, 'Missing progressId parameter');
        }
        return await updateReadingProgressById(pathParameters.progressId, requestBody, userInfo);
        
      case 'DELETE':
        // Delete reading progress (rarely used, but included for completeness)
        if (!pathParameters.progressId) {
          return errorResponse(400, 'Missing progressId parameter');
        }
        return await deleteReadingProgress(pathParameters.progressId, userInfo);
        
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
    // Check if we have authorizer claims
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
 * Start a new reading session
 */
async function startReadingSession(data, userInfo) {
  // Validate required fields
  if (!data.bookId) {
    return errorResponse(400, 'bookId is required');
  }
  
  // Use authenticated user ID or the provided one
  const userId = userInfo ? userInfo.userId : data.userId;
  
  if (!userId) {
    return errorResponse(400, 'userId is required when not authenticated');
  }
  
  // Check if the book exists
  const bookExists = await checkBookExists(data.bookId);
  if (!bookExists) {
    return errorResponse(404, 'Book not found');
  }
  
  // Generate a unique ID for the session
  const sessionId = `session-${Date.now()}`;
  const timestamp = new Date().toISOString();
  
  // Create a new reading session
  const sessionItem = {
    reading_session_id: sessionId,
    user_id: userId,
    book_id: data.bookId,
    start_date: timestamp,
    end_date: null,
    device_info: data.deviceInfo || null,
    reading_mode: data.readingMode || 'standard' // standard, hologram, audio
  };
  
  // Save to DynamoDB
  const params = {
    TableName: READING_SESSION_TABLE,
    Item: sessionItem
  };
  
  await dynamoDB.put(params).promise();
  
  // Check if there's existing progress for this book and user
  const progressExists = await getExistingProgress(userId, data.bookId);
  
  if (!progressExists) {
    // Create new progress record if none exists
    const progressId = `progress-${Date.now()}`;
    const progressItem = {
      progress_id: progressId,
      user_id: userId,
      book_id: data.bookId,
      current_page_id: data.pageId || null,
      last_position_timestamp: timestamp,
      last_updated: timestamp,
      progress_percentage: 0,
      total_reading_time: 0,
      current_chapter: data.chapterId || null
    };
    
    await dynamoDB.put({
      TableName: READING_PROGRESS_TABLE,
      Item: progressItem
    }).promise();
  }
  
  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Reading session started successfully',
      sessionId: sessionId,
      startTime: timestamp
    })
  };
}

/**
 * End an existing reading session
 */
async function endReadingSession(data, userInfo) {
  // Validate required fields
  if (!data.sessionId) {
    return errorResponse(400, 'sessionId is required');
  }
  
  // Use authenticated user ID or the provided one
  const userId = userInfo ? userInfo.userId : data.userId;
  
  // Get the session
  const sessionParams = {
    TableName: READING_SESSION_TABLE,
    Key: { reading_session_id: data.sessionId }
  };
  
  const sessionResult = await dynamoDB.get(sessionParams).promise();
  const session = sessionResult.Item;
  
  if (!session) {
    return errorResponse(404, 'Reading session not found');
  }
  
  // Check if user has permission to end this session
  if (session.user_id !== userId && (!userInfo || userInfo.userType !== 'librarian')) {
    return errorResponse(403, 'You can only end your own reading sessions');
  }
  
  // Update session with end time
  const endTime = new Date().toISOString();
  const updateParams = {
    TableName: READING_SESSION_TABLE,
    Key: { reading_session_id: data.sessionId },
    UpdateExpression: 'SET end_date = :endDate, pages_read = :pagesRead, notes = :notes',
    ExpressionAttributeValues: {
      ':endDate': endTime,
      ':pagesRead': data.pagesRead || 0,
      ':notes': data.notes || null
    },
    ReturnValues: 'ALL_NEW'
  };
  
  const updateResult = await dynamoDB.update(updateParams).promise();
  
  // Calculate session duration in minutes
  const startTime = new Date(session.start_date);
  const endTimeDate = new Date(endTime);
  const durationMinutes = Math.round((endTimeDate - startTime) / (1000 * 60));
  
  // Update reading progress with new data
  await updateProgressAfterSession(
    session.user_id,
    session.book_id,
    data.currentPageId || session.current_page_id,
    data.progressPercentage,
    durationMinutes,
    data.chapterId
  );
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Reading session ended successfully',
      sessionId: data.sessionId,
      endTime: endTime,
      duration: durationMinutes,
      session: updateResult.Attributes
    })
  };
}

/**
 * Update reading progress after a session ends
 */
async function updateProgressAfterSession(userId, bookId, currentPageId, progressPercentage, durationMinutes, chapterId) {
  // Get existing progress
  const existingProgress = await getExistingProgress(userId, bookId);
  
  if (!existingProgress) {
    return; // Should not happen as progress is created when session starts
  }
  
  // Calculate new total reading time
  const totalReadingTime = (existingProgress.total_reading_time || 0) + durationMinutes;
  
  // Update progress
  const updateParams = {
    TableName: READING_PROGRESS_TABLE,
    Key: { progress_id: existingProgress.progress_id },
    UpdateExpression: 'SET current_page_id = :pageId, last_position_timestamp = :timestamp, ' +
                      'last_updated = :updated, total_reading_time = :totalTime' +
                      (progressPercentage !== undefined ? ', progress_percentage = :progress' : '') +
                      (chapterId ? ', current_chapter = :chapter' : ''),
    ExpressionAttributeValues: {
      ':pageId': currentPageId || existingProgress.current_page_id,
      ':timestamp': new Date().toISOString(),
      ':updated': new Date().toISOString(),
      ':totalTime': totalReadingTime
    }
  };
  
  if (progressPercentage !== undefined) {
    updateParams.ExpressionAttributeValues[':progress'] = progressPercentage;
  }
  
  if (chapterId) {
    updateParams.ExpressionAttributeValues[':chapter'] = chapterId;
  }
  
  await dynamoDB.update(updateParams).promise();
}

/**
 * Update reading progress (without a session)
 */
async function updateReadingProgress(data, userInfo) {
  // Validate required fields
  if (!data.bookId) {
    return errorResponse(400, 'bookId is required');
  }
  
  // Use authenticated user ID or the provided one
  const userId = userInfo ? userInfo.userId : data.userId;
  
  if (!userId) {
    return errorResponse(400, 'userId is required when not authenticated');
  }
  
  // Get existing progress or create new
  const existingProgress = await getExistingProgress(userId, data.bookId);
  const timestamp = new Date().toISOString();
  
  if (existingProgress) {
    // Update existing progress
    const updateParams = {
      TableName: READING_PROGRESS_TABLE,
      Key: { progress_id: existingProgress.progress_id },
      UpdateExpression: 'SET last_updated = :updated' +
                        (data.currentPageId ? ', current_page_id = :pageId' : '') +
                        (data.progressPercentage !== undefined ? ', progress_percentage = :progress' : '') +
                        (data.chapterId ? ', current_chapter = :chapter' : ''),
      ExpressionAttributeValues: {
        ':updated': timestamp
      }
    };
    
    if (data.currentPageId) {
      updateParams.ExpressionAttributeValues[':pageId'] = data.currentPageId;
      updateParams.UpdateExpression += ', last_position_timestamp = :timestamp';
      updateParams.ExpressionAttributeValues[':timestamp'] = timestamp;
    }
    
    if (data.progressPercentage !== undefined) {
      updateParams.ExpressionAttributeValues[':progress'] = data.progressPercentage;
    }
    
    if (data.chapterId) {
      updateParams.ExpressionAttributeValues[':chapter'] = data.chapterId;
    }
    
    await dynamoDB.update(updateParams).promise();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Reading progress updated successfully',
        progressId: existingProgress.progress_id
      })
    };
  } else {
    // Create new progress
    const progressId = `progress-${Date.now()}`;
    const progressItem = {
      progress_id: progressId,
      user_id: userId,
      book_id: data.bookId,
      current_page_id: data.currentPageId || null,
      last_position_timestamp: timestamp,
      last_updated: timestamp,
      progress_percentage: data.progressPercentage || 0,
      total_reading_time: 0,
      current_chapter: data.chapterId || null
    };
    
    await dynamoDB.put({
      TableName: READING_PROGRESS_TABLE,
      Item: progressItem
    }).promise();
    
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({
        message: 'Reading progress created successfully',
        progressId: progressId
      })
    };
  }
}

/**
 * Update reading progress by ID
 */
async function updateReadingProgressById(progressId, data, userInfo) {
  // Get existing progress
  const params = {
    TableName: READING_PROGRESS_TABLE,
    Key: { progress_id: progressId }
  };
  
  const result = await dynamoDB.get(params).promise();
  
  if (!result.Item) {
    return errorResponse(404, 'Reading progress not found');
  }
  
  // Check if user has permission to update this progress
  if (userInfo && userInfo.userType !== 'librarian' && result.Item.user_id !== userInfo.userId) {
    return errorResponse(403, 'You can only update your own reading progress');
  }
  
  // Update progress
  const updateParams = {
    TableName: READING_PROGRESS_TABLE,
    Key: { progress_id: progressId },
    UpdateExpression: 'SET last_updated = :updated' +
                      (data.currentPageId ? ', current_page_id = :pageId' : '') +
                      (data.progressPercentage !== undefined ? ', progress_percentage = :progress' : '') +
                      (data.chapterId ? ', current_chapter = :chapter' : ''),
    ExpressionAttributeValues: {
      ':updated': new Date().toISOString()
    }
  };
  
  if (data.currentPageId) {
    updateParams.ExpressionAttributeValues[':pageId'] = data.currentPageId;
    updateParams.UpdateExpression += ', last_position_timestamp = :timestamp';
    updateParams.ExpressionAttributeValues[':timestamp'] = new Date().toISOString();
  }
  
  if (data.progressPercentage !== undefined) {
    updateParams.ExpressionAttributeValues[':progress'] = data.progressPercentage;
  }
  
  if (data.chapterId) {
    updateParams.ExpressionAttributeValues[':chapter'] = data.chapterId;
  }
  
  await dynamoDB.update(updateParams).promise();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Reading progress updated successfully',
      progressId: progressId
    })
  };
}

/**
 * Get reading progress by ID
 */
async function getReadingProgress(progressId) {
  const params = {
    TableName: READING_PROGRESS_TABLE,
    Key: { progress_id: progressId }
  };
  
  const result = await dynamoDB.get(params).promise();
  
  if (!result.Item) {
    return errorResponse(404, 'Reading progress not found');
  }
  
  // Get book details
  const bookDetails = await getBookDetails(result.Item.book_id);
  
  // Get recent reading sessions
  const sessions = await getRecentSessions(result.Item.user_id, result.Item.book_id);
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      progress: {
        ...result.Item,
        book: bookDetails,
        recentSessions: sessions
      }
    })
  };
}

/**
 * List reading progress with optional filtering
 */
async function listReadingProgress(queryParams, userInfo) {
  let params = {
    TableName: READING_PROGRESS_TABLE
  };
  
  // Apply filters based on query parameters
  let filterExpressions = [];
  let expressionAttributeValues = {};
  
  // Filter by user ID
  if (queryParams.userId) {
    filterExpressions.push('user_id = :userId');
    expressionAttributeValues[':userId'] = queryParams.userId;
  }
  
  // Filter by book ID
  if (queryParams.bookId) {
    filterExpressions.push('book_id = :bookId');
    expressionAttributeValues[':bookId'] = queryParams.bookId;
  }
  
  // Apply filters if any
  if (filterExpressions.length > 0) {
    params.FilterExpression = filterExpressions.join(' AND ');
    params.ExpressionAttributeValues = expressionAttributeValues;
  }
  
  // If user is a student, only show their progress
  if (userInfo && userInfo.userType === 'reader' && !queryParams.userId) {
    if (!params.FilterExpression) {
      params.FilterExpression = 'user_id = :currentUserId';
    } else {
      params.FilterExpression += ' AND user_id = :currentUserId';
    }
    
    if (!params.ExpressionAttributeValues) {
      params.ExpressionAttributeValues = {};
    }
    params.ExpressionAttributeValues[':currentUserId'] = userInfo.userId;
  }
  
  const result = await dynamoDB.scan(params).promise();
  
  // Enrich progress with book details
  const enrichedProgress = await Promise.all(
    result.Items.map(async (progress) => {
      const bookDetails = await getBookDetails(progress.book_id);
      
      return {
        ...progress,
        book: bookDetails
      };
    })
  );
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      progress: enrichedProgress,
      count: enrichedProgress.length
    })
  };
}

/**
 * Delete reading progress
 */
async function deleteReadingProgress(progressId, userInfo) {
  // Get existing progress
  const params = {
    TableName: READING_PROGRESS_TABLE,
    Key: { progress_id: progressId }
  };
  
  const result = await dynamoDB.get(params).promise();
  
  if (!result.Item) {
    return errorResponse(404, 'Reading progress not found');
  }
  
  // Check permissions
  // Only the user who owns the progress or a librarian can delete it
  if (userInfo && userInfo.userType !== 'librarian' && result.Item.user_id !== userInfo.userId) {
    return errorResponse(403, 'You can only delete your own reading progress');
  }
  
  // Delete from DynamoDB
  const deleteParams = {
    TableName: READING_PROGRESS_TABLE,
    Key: { progress_id: progressId }
  };
  
  await dynamoDB.delete(deleteParams).promise();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Reading progress deleted successfully',
      progressId
    })
  };
}

/**
 * Get existing progress for a user and book
 */
async function getExistingProgress(userId, bookId) {
  const params = {
    TableName: READING_PROGRESS_TABLE,
    FilterExpression: 'user_id = :userId AND book_id = :bookId',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':bookId': bookId
    }
  };
  
  const result = await dynamoDB.scan(params).promise();
  
  if (result.Items && result.Items.length > 0) {
    return result.Items[0];
  }
  
  return null;
}

/**
 * Get recent reading sessions for a user and book
 */
async function getRecentSessions(userId, bookId) {
  const params = {
    TableName: READING_SESSION_TABLE,
    FilterExpression: 'user_id = :userId AND book_id = :bookId',
    ExpressionAttributeValues: {
      ':userId': userId,
      ':bookId': bookId
    }
  };
  
  const result = await dynamoDB.scan(params).promise();
  
  // Sort by start date (most recent first) and limit to 5
  return result.Items
    .sort((a, b) => new Date(b.start_date) - new Date(a.start_date))
    .slice(0, 5);
}

/**
 * Check if a book exists
 */
async function checkBookExists(bookId) {
  const params = {
    TableName: BOOKS_TABLE,
    Key: { book_id: bookId }
  };
  
  try {
    const result = await dynamoDB.get(params).promise();
    return !!result.Item;
  } catch (error) {
    console.error('Error checking if book exists:', error);
    return false;
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
    return result.Item || { book_id: bookId, book_title: 'Unknown Book' };
  } catch (error) {
    console.error('Error getting book details:', error);
    return { book_id: bookId, book_title: 'Unknown Book' };
  }
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

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const bedrock = new AWS.BedrockRuntime({ region: process.env.AWS_REGION || 'me-south-1' });

// Table names from environment variables
const QUIZ_TABLE = process.env.QUIZ_TABLE || 'Quizzes';
const QUIZ_QUESTION_TABLE = process.env.QUIZ_QUESTION_TABLE || 'QuizQuestions';
const QUIZ_RESPONSE_TABLE = process.env.QUIZ_RESPONSE_TABLE || 'QuizResponses';
const BOOKS_TABLE = process.env.BOOKS_TABLE || 'Books';
const USER_POOL_ID = process.env.USER_POOL_ID || 'me-south-1_X7adr285t';

/**
 * Manages reading quizzes and assessments
 * Supports creating quizzes, generating AI questions, and tracking student responses
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
    
    // Route based on HTTP method and path
    if (httpMethod === 'GET') {
      if (pathParameters.quizId && pathParameters.questionId) {
        // Get a specific question in a quiz
        return await getQuizQuestion(pathParameters.quizId, pathParameters.questionId);
      } else if (pathParameters.quizId) {
        // Get a specific quiz
        return await getQuiz(pathParameters.quizId, queryParameters);
      } else if (queryParameters.responseId) {
        // Get a specific quiz response
        return await getQuizResponse(queryParameters.responseId);
      } else {
        // List quizzes
        return await listQuizzes(queryParameters, userInfo);
      }
    } else if (httpMethod === 'POST') {
      if (pathParameters.quizId && requestBody.action === 'submit') {
        // Submit quiz responses
        return await submitQuizResponses(pathParameters.quizId, requestBody, userInfo);
      } else if (pathParameters.quizId && requestBody.action === 'generate') {
        // Generate questions for a quiz
        return await generateQuizQuestions(pathParameters.quizId, requestBody, userInfo);
      } else if (requestBody.action === 'analytics') {
        // Get quiz analytics
        return await getQuizAnalytics(requestBody, userInfo);
      } else {
        // Create a new quiz
        return await createQuiz(requestBody, userInfo);
      }
    } else if (httpMethod === 'PUT') {
      if (pathParameters.quizId && pathParameters.questionId) {
        // Update a specific question
        return await updateQuizQuestion(pathParameters.quizId, pathParameters.questionId, requestBody, userInfo);
      } else if (pathParameters.quizId) {
        // Update a quiz
        return await updateQuiz(pathParameters.quizId, requestBody, userInfo);
      } else {
        return errorResponse(400, 'Missing quizId parameter');
      }
    } else if (httpMethod === 'DELETE') {
      if (pathParameters.quizId && pathParameters.questionId) {
        // Delete a specific question
        return await deleteQuizQuestion(pathParameters.quizId, pathParameters.questionId, userInfo);
      } else if (pathParameters.quizId) {
        // Delete a quiz
        return await deleteQuiz(pathParameters.quizId, userInfo);
      } else {
        return errorResponse(400, 'Missing quizId parameter');
      }
    } else {
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
 * Create a new quiz
 */
async function createQuiz(data, userInfo) {
  // Validate required fields
  if (!data.title || !data.bookId) {
    return errorResponse(400, 'title and bookId are required');
  }
  
  // Only librarians can create quizzes
  if (userInfo && userInfo.userType !== 'librarian') {
    return errorResponse(403, 'Only librarians can create quizzes');
  }
  
  // Check if the book exists
  const bookExists = await checkBookExists(data.bookId);
  if (!bookExists) {
    return errorResponse(404, 'Book not found');
  }
  
  // Generate a unique ID for the quiz
  const quizId = `quiz-${Date.now()}`;
  const timestamp = new Date().toISOString();
  
  // Create quiz item
  const quizItem = {
    quiz_id: quizId,
    title: data.title,
    description: data.description || '',
    book_id: data.bookId,
    chapter_id: data.chapterId || null,
    difficulty_level: data.difficultyLevel || 'medium',
    time_limit_minutes: data.timeLimitMinutes || 0,
    passing_score: data.passingScore || 70,
    question_count: 0,
    is_published: data.isPublished || false,
    created_by: userInfo ? userInfo.userId : data.createdBy,
    created_at: timestamp,
    updated_at: timestamp
  };
  
  // Save to DynamoDB
  const params = {
    TableName: QUIZ_TABLE,
    Item: quizItem
  };
  
  await dynamoDB.put(params).promise();
  
  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Quiz created successfully',
      quizId,
      quiz: quizItem
    })
  };
}

/**
 * Get a specific quiz
 */
async function getQuiz(quizId, queryParams) {
  const params = {
    TableName: QUIZ_TABLE,
    Key: { quiz_id: quizId }
  };
  
  const result = await dynamoDB.get(params).promise();
  
  if (!result.Item) {
    return errorResponse(404, 'Quiz not found');
  }
  
  const quiz = result.Item;
  
  // Include questions if requested
  if (queryParams.includeQuestions === 'true') {
    const questions = await getQuestionsForQuiz(quizId);
    quiz.questions = questions;
  }
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      quiz
    })
  };
}

/**
 * List quizzes with optional filtering
 */
async function listQuizzes(queryParams, userInfo) {
  let params = {
    TableName: QUIZ_TABLE
  };
  
  // Apply filters based on query parameters
  let filterExpressions = [];
  let expressionAttributeValues = {};
  
  // Filter by book ID
  if (queryParams.bookId) {
    filterExpressions.push('book_id = :bookId');
    expressionAttributeValues[':bookId'] = queryParams.bookId;
  }
  
  // Filter by chapter ID
  if (queryParams.chapterId) {
    filterExpressions.push('chapter_id = :chapterId');
    expressionAttributeValues[':chapterId'] = queryParams.chapterId;
  }
  
  // Filter by difficulty level
  if (queryParams.difficultyLevel) {
    filterExpressions.push('difficulty_level = :difficultyLevel');
    expressionAttributeValues[':difficultyLevel'] = queryParams.difficultyLevel;
  }
  
  // Filter by published status
  if (queryParams.isPublished) {
    filterExpressions.push('is_published = :isPublished');
    expressionAttributeValues[':isPublished'] = queryParams.isPublished === 'true';
  }
  
  // Filter by creator
  if (queryParams.createdBy) {
    filterExpressions.push('created_by = :createdBy');
    expressionAttributeValues[':createdBy'] = queryParams.createdBy;
  }
  
  // Apply filters if any
  if (filterExpressions.length > 0) {
    params.FilterExpression = filterExpressions.join(' AND ');
    params.ExpressionAttributeValues = expressionAttributeValues;
  }
  
  const result = await dynamoDB.scan(params).promise();
  
  // If user is not a librarian, only show published quizzes
  let quizzes = result.Items;
  if (userInfo && userInfo.userType !== 'librarian') {
    quizzes = quizzes.filter(quiz => quiz.is_published);
  }
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      quizzes,
      count: quizzes.length
    })
  };
}

/**
 * Update an existing quiz
 */
async function updateQuiz(quizId, data, userInfo) {
  // Get existing quiz
  const params = {
    TableName: QUIZ_TABLE,
    Key: { quiz_id: quizId }
  };
  
  const result = await dynamoDB.get(params).promise();
  
  if (!result.Item) {
    return errorResponse(404, 'Quiz not found');
  }
  
  // Only librarians can update quizzes
  if (userInfo && userInfo.userType !== 'librarian') {
    return errorResponse(403, 'Only librarians can update quizzes');
  }
  
  // Build update expression
  let updateExpression = 'SET updated_at = :updatedAt';
  let expressionAttributeValues = {
    ':updatedAt': new Date().toISOString()
  };
  
  // Update fields if provided
  if (data.title !== undefined) {
    updateExpression += ', title = :title';
    expressionAttributeValues[':title'] = data.title;
  }
  
  if (data.description !== undefined) {
    updateExpression += ', description = :description';
    expressionAttributeValues[':description'] = data.description;
  }
  
  if (data.difficultyLevel !== undefined) {
    updateExpression += ', difficulty_level = :difficultyLevel';
    expressionAttributeValues[':difficultyLevel'] = data.difficultyLevel;
  }
  
  if (data.timeLimitMinutes !== undefined) {
    updateExpression += ', time_limit_minutes = :timeLimitMinutes';
    expressionAttributeValues[':timeLimitMinutes'] = data.timeLimitMinutes;
  }
  
  if (data.passingScore !== undefined) {
    updateExpression += ', passing_score = :passingScore';
    expressionAttributeValues[':passingScore'] = data.passingScore;
  }
  
  if (data.isPublished !== undefined) {
    updateExpression += ', is_published = :isPublished';
    expressionAttributeValues[':isPublished'] = data.isPublished;
  }
  
  // Update in DynamoDB
  const updateParams = {
    TableName: QUIZ_TABLE,
    Key: { quiz_id: quizId },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };
  
  const updateResult = await dynamoDB.update(updateParams).promise();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Quiz updated successfully',
      quiz: updateResult.Attributes
    })
  };
}

/**
 * Delete a quiz
 */
async function deleteQuiz(quizId, userInfo) {
  // Get existing quiz
  const params = {
    TableName: QUIZ_TABLE,
    Key: { quiz_id: quizId }
  };
  
  const result = await dynamoDB.get(params).promise();
  
  if (!result.Item) {
    return errorResponse(404, 'Quiz not found');
  }
  
  // Only librarians can delete quizzes
  if (userInfo && userInfo.userType !== 'librarian') {
    return errorResponse(403, 'Only librarians can delete quizzes');
  }
  
  // Delete all questions for this quiz
  const questions = await getQuestionsForQuiz(quizId);
  
  for (const question of questions) {
    await dynamoDB.delete({
      TableName: QUIZ_QUESTION_TABLE,
      Key: { 
        quiz_id: quizId,
        question_id: question.question_id
      }
    }).promise();
  }
  
  // Delete the quiz
  await dynamoDB.delete({
    TableName: QUIZ_TABLE,
    Key: { quiz_id: quizId }
  }).promise();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Quiz deleted successfully',
      quizId
    })
  };
}

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const bedrock = new AWS.BedrockRuntime({ region: process.env.AWS_REGION || 'me-south-1' });

// Table names from environment variables
const HIGHLIGHTS_TABLE = process.env.HIGHLIGHTS_TABLE || 'Highlights';
const BOOKS_TABLE = process.env.BOOKS_TABLE || 'Books';
const READING_PAGE_TABLE = process.env.READING_PAGE_TABLE || 'ReadingPage';
const USER_POOL_ID = process.env.USER_POOL_ID || 'me-south-1_X7adr285t';

/**
 * Manages user highlights, annotations, and notes for book content
 * Supports CRUD operations for highlights with AI-powered insights
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
        // Get a specific highlight
        if (pathParameters.highlightId) {
          return await getHighlight(pathParameters.highlightId);
        }
        // List highlights based on query parameters
        else {
          return await listHighlights(queryParameters, userInfo);
        }
        
      case 'POST':
        // Create a new highlight
        return await createHighlight(requestBody, userInfo);
        
      case 'PUT':
        // Update an existing highlight
        if (!pathParameters.highlightId) {
          return errorResponse(400, 'Missing highlightId parameter');
        }
        return await updateHighlight(pathParameters.highlightId, requestBody, userInfo);
        
      case 'DELETE':
        // Delete a highlight
        if (!pathParameters.highlightId) {
          return errorResponse(400, 'Missing highlightId parameter');
        }
        return await deleteHighlight(pathParameters.highlightId, userInfo);
        
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
 * Create a new highlight
 */
async function createHighlight(data, userInfo) {
  // Validate required fields
  if (!data.pageId || !data.textSegment) {
    return errorResponse(400, 'pageId and textSegment are required');
  }
  
  // Use authenticated user ID or the provided one
  const userId = userInfo ? userInfo.userId : data.userId;
  
  if (!userId) {
    return errorResponse(400, 'userId is required when not authenticated');
  }
  
  // Check if the page exists
  const pageExists = await checkPageExists(data.pageId);
  if (!pageExists) {
    return errorResponse(404, 'Page not found');
  }
  
  // Generate a unique ID for the highlight
  const highlightId = `highlight-${Date.now()}`;
  const timestamp = new Date().toISOString();
  
  // Create highlight item
  const highlightItem = {
    highlight_id: highlightId,
    user_id: userId,
    page_id: data.pageId,
    chapter_id: data.chapterId || null,
    color: data.color || 'yellow',
    text_segment: data.textSegment,
    start_position: data.startPosition || 0,
    end_position: data.endPosition || data.textSegment.length,
    note: data.note || null,
    created_at: timestamp,
    updated_at: timestamp
  };
  
  // Save to DynamoDB
  const params = {
    TableName: HIGHLIGHTS_TABLE,
    Item: highlightItem
  };
  
  await dynamoDB.put(params).promise();
  
  // If a note is provided, generate AI insights
  let insights = null;
  if (data.note) {
    insights = await generateInsightsForHighlight(data.textSegment, data.note, data.pageId);
    
    // Update the highlight with insights
    if (insights) {
      const updateParams = {
        TableName: HIGHLIGHTS_TABLE,
        Key: { highlight_id: highlightId },
        UpdateExpression: 'SET insights = :insights',
        ExpressionAttributeValues: {
          ':insights': insights
        }
      };
      
      await dynamoDB.update(updateParams).promise();
    }
  }
  
  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Highlight created successfully',
      highlightId,
      highlight: {
        ...highlightItem,
        insights
      }
    })
  };
}

/**
 * Get a specific highlight
 */
async function getHighlight(highlightId) {
  const params = {
    TableName: HIGHLIGHTS_TABLE,
    Key: { highlight_id: highlightId }
  };
  
  const result = await dynamoDB.get(params).promise();
  
  if (!result.Item) {
    return errorResponse(404, 'Highlight not found');
  }
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      highlight: result.Item
    })
  };
}

/**
 * List highlights with optional filtering
 */
async function listHighlights(queryParams, userInfo) {
  let params = {
    TableName: HIGHLIGHTS_TABLE
  };
  
  // Apply filters based on query parameters
  let filterExpressions = [];
  let expressionAttributeValues = {};
  
  // Filter by user ID
  if (queryParams.userId) {
    filterExpressions.push('user_id = :userId');
    expressionAttributeValues[':userId'] = queryParams.userId;
  }
  
  // Filter by page ID
  if (queryParams.pageId) {
    filterExpressions.push('page_id = :pageId');
    expressionAttributeValues[':pageId'] = queryParams.pageId;
  }
  
  // Filter by chapter ID
  if (queryParams.chapterId) {
    filterExpressions.push('chapter_id = :chapterId');
    expressionAttributeValues[':chapterId'] = queryParams.chapterId;
  }
  
  // Filter by book ID (requires joining with page table)
  if (queryParams.bookId) {
    // Get all pages for this book
    const pageIds = await getPageIdsForBook(queryParams.bookId);
    
    if (pageIds.length > 0) {
      filterExpressions.push('page_id IN (:pageIds)');
      expressionAttributeValues[':pageIds'] = pageIds;
    } else {
      // No pages found for this book, return empty result
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*'
        },
        body: JSON.stringify({
          highlights: [],
          count: 0
        })
      };
    }
  }
  
  // Apply filters if any
  if (filterExpressions.length > 0) {
    params.FilterExpression = filterExpressions.join(' AND ');
    params.ExpressionAttributeValues = expressionAttributeValues;
  }
  
  // If user is authenticated and not a librarian, only show their highlights
  if (userInfo && userInfo.userType !== 'librarian' && !queryParams.userId) {
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
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      highlights: result.Items,
      count: result.Items.length
    })
  };
}

/**
 * Update an existing highlight
 */
async function updateHighlight(highlightId, data, userInfo) {
  // Get existing highlight
  const params = {
    TableName: HIGHLIGHTS_TABLE,
    Key: { highlight_id: highlightId }
  };
  
  const result = await dynamoDB.get(params).promise();
  
  if (!result.Item) {
    return errorResponse(404, 'Highlight not found');
  }
  
  // Check if user has permission to update this highlight
  if (userInfo && userInfo.userType !== 'librarian' && result.Item.user_id !== userInfo.userId) {
    return errorResponse(403, 'You can only update your own highlights');
  }
  
  // Build update expression
  let updateExpression = 'SET updated_at = :updatedAt';
  let expressionAttributeValues = {
    ':updatedAt': new Date().toISOString()
  };
  
  // Update fields if provided
  if (data.color) {
    updateExpression += ', color = :color';
    expressionAttributeValues[':color'] = data.color;
  }
  
  if (data.note !== undefined) {
    updateExpression += ', note = :note';
    expressionAttributeValues[':note'] = data.note;
    
    // Generate new insights if note is updated
    if (data.note) {
      const insights = await generateInsightsForHighlight(
        result.Item.text_segment, 
        data.note, 
        result.Item.page_id
      );
      
      if (insights) {
        updateExpression += ', insights = :insights';
        expressionAttributeValues[':insights'] = insights;
      }
    } else {
      // If note is removed, remove insights
      updateExpression += ', insights = :insights';
      expressionAttributeValues[':insights'] = null;
    }
  }
  
  if (data.textSegment) {
    updateExpression += ', text_segment = :textSegment';
    expressionAttributeValues[':textSegment'] = data.textSegment;
  }
  
  if (data.startPosition !== undefined) {
    updateExpression += ', start_position = :startPosition';
    expressionAttributeValues[':startPosition'] = data.startPosition;
  }
  
  if (data.endPosition !== undefined) {
    updateExpression += ', end_position = :endPosition';
    expressionAttributeValues[':endPosition'] = data.endPosition;
  }
  
  // Update in DynamoDB
  const updateParams = {
    TableName: HIGHLIGHTS_TABLE,
    Key: { highlight_id: highlightId },
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
      message: 'Highlight updated successfully',
      highlight: updateResult.Attributes
    })
  };
}

/**
 * Delete a highlight
 */
async function deleteHighlight(highlightId, userInfo) {
  // Get existing highlight
  const params = {
    TableName: HIGHLIGHTS_TABLE,
    Key: { highlight_id: highlightId }
  };
  
  const result = await dynamoDB.get(params).promise();
  
  if (!result.Item) {
    return errorResponse(404, 'Highlight not found');
  }
  
  // Check if user has permission to delete this highlight
  if (userInfo && userInfo.userType !== 'librarian' && result.Item.user_id !== userInfo.userId) {
    return errorResponse(403, 'You can only delete your own highlights');
  }
  
  // Delete from DynamoDB
  const deleteParams = {
    TableName: HIGHLIGHTS_TABLE,
    Key: { highlight_id: highlightId }
  };
  
  await dynamoDB.delete(deleteParams).promise();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Highlight deleted successfully',
      highlightId
    })
  };
}

/**
 * Generate AI insights for a highlight
 */
async function generateInsightsForHighlight(textSegment, note, pageId) {
  try {
    // Get page content for context
    const pageContent = await getPageContent(pageId);
    
    // Create prompt for Bedrock
    const prompt = `
Analyze this highlighted text from a book and the student's note about it. Generate educational insights that would help the student better understand the text.

Highlighted text: "${textSegment}"

Student's note: "${note}"

${pageContent ? `Context from the page: "${pageContent}"` : ''}

Please provide:
1. A brief explanation of the significance of this text (1-2 sentences)
2. One connection to a broader concept or theme
3. One question that would promote deeper thinking about this text

Format your response as JSON with these fields: explanation, connection, thoughtQuestion
`;
    
    // Call Bedrock API
    const params = {
      modelId: 'anthropic.claude-v2',
      contentType: 'application/json',
      accept: 'application/json',
      body: JSON.stringify({
        prompt: `\n\nHuman: ${prompt}\n\nAssistant:`,
        max_tokens_to_sample: 500,
        temperature: 0.7,
        top_p: 0.9
      })
    };
    
    const response = await bedrock.invokeModel(params).promise();
    const responseBody = JSON.parse(new TextDecoder().decode(response.body));
    
    // Extract and parse the insights
    const completion = responseBody.completion.trim();
    
    // Try to parse as JSON
    try {
      // Extract JSON from the response (it might be wrapped in markdown code blocks)
      const jsonMatch = completion.match(/```json\n([\s\S]*?)\n```/) || 
                        completion.match(/```\n([\s\S]*?)\n```/) || 
                        completion.match(/{[\s\S]*?}/);
      
      const jsonString = jsonMatch ? jsonMatch[0] : completion;
      const insights = JSON.parse(jsonString);
      
      return {
        explanation: insights.explanation || '',
        connection: insights.connection || '',
        thoughtQuestion: insights.thoughtQuestion || ''
      };
    } catch (parseError) {
      console.error('Error parsing Bedrock response as JSON:', parseError);
      
      // Fallback: extract insights using regex
      const explanationMatch = completion.match(/explanation[:\s]+(.*?)(?=connection|$)/i);
      const connectionMatch = completion.match(/connection[:\s]+(.*?)(?=thoughtQuestion|$)/i);
      const questionMatch = completion.match(/thoughtQuestion[:\s]+(.*?)(?=$)/i);
      
      return {
        explanation: explanationMatch ? explanationMatch[1].trim() : '',
        connection: connectionMatch ? connectionMatch[1].trim() : '',
        thoughtQuestion: questionMatch ? questionMatch[1].trim() : ''
      };
    }
  } catch (error) {
    console.error('Error generating insights with Bedrock:', error);
    return null;
  }
}

/**
 * Check if a page exists
 */
async function checkPageExists(pageId) {
  const params = {
    TableName: READING_PAGE_TABLE,
    Key: { page_id: pageId }
  };
  
  try {
    const result = await dynamoDB.get(params).promise();
    return !!result.Item;
  } catch (error) {
    console.error('Error checking if page exists:', error);
    return false;
  }
}

/**
 * Get content of a page
 */
async function getPageContent(pageId) {
  const params = {
    TableName: READING_PAGE_TABLE,
    Key: { page_id: pageId }
  };
  
  try {
    const result = await dynamoDB.get(params).promise();
    return result.Item?.content || null;
  } catch (error) {
    console.error('Error getting page content:', error);
    return null;
  }
}

/**
 * Get all page IDs for a book
 */
async function getPageIdsForBook(bookId) {
  const params = {
    TableName: READING_PAGE_TABLE,
    FilterExpression: 'book_id = :bookId',
    ExpressionAttributeValues: {
      ':bookId': bookId
    }
  };
  
  try {
    const result = await dynamoDB.scan(params).promise();
    return result.Items.map(page => page.page_id);
  } catch (error) {
    console.error('Error getting page IDs for book:', error);
    return [];
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

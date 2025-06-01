const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const cognitoIdentityServiceProvider = new AWS.CognitoIdentityServiceProvider();

// Table to store student assignments
const ASSIGNMENTS_TABLE = process.env.ASSIGNMENTS_TABLE || 'StudentBookAssignments';
// Cognito User Pool ID
const USER_POOL_ID = process.env.USER_POOL_ID || 'us-east-1_U0iB4Rowp';

/**
 * Manages book assignments to students
 * Allows teachers/librarians to assign books to students and track reading progress
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
        // If assignmentId is provided, get specific assignment, otherwise list assignments
        if (pathParameters.assignmentId) {
          return await getAssignment(pathParameters.assignmentId);
        } else {
          // If studentId is provided, get assignments for that student
          // If teacherId is provided, get assignments created by that teacher
          return await listAssignments(queryParameters, userInfo);
        }
        
      case 'POST':
        // Create a new assignment
        return await createAssignment(requestBody, userInfo);
        
      case 'PUT':
        // Update an existing assignment (e.g., mark as completed, update progress)
        if (!pathParameters.assignmentId) {
          return errorResponse(400, 'Missing assignmentId parameter');
        }
        return await updateAssignment(pathParameters.assignmentId, requestBody, userInfo);
        
      case 'DELETE':
        // Delete an assignment
        if (!pathParameters.assignmentId) {
          return errorResponse(400, 'Missing assignmentId parameter');
        }
        return await deleteAssignment(pathParameters.assignmentId, userInfo);
        
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
 * Create a new book assignment
 */
async function createAssignment(data, userInfo) {
  // Validate required fields
  if (!data.studentId || !data.bookId) {
    return errorResponse(400, 'studentId and bookId are required');
  }
  
  // Check if the user is authorized to create assignments
  // Only librarians and teachers can create assignments
  if (userInfo && userInfo.userType !== 'librarian' && userInfo.userType !== 'teacher') {
    return errorResponse(403, 'Only librarians and teachers can assign books to students');
  }
  
  // Verify that the student exists
  try {
    await cognitoIdentityServiceProvider.adminGetUser({
      UserPoolId: USER_POOL_ID,
      Username: data.studentId
    }).promise();
  } catch (error) {
    return errorResponse(404, 'Student not found');
  }
  
  // Verify that the book exists
  const bookExists = await checkBookExists(data.bookId);
  if (!bookExists) {
    return errorResponse(404, 'Book not found');
  }
  
  // Generate a unique ID for the assignment
  const assignmentId = `assign-${Date.now()}`;
  
  // Prepare item for DynamoDB
  const timestamp = new Date().toISOString();
  const item = {
    assignmentId,
    studentId: data.studentId,
    bookId: data.bookId,
    assignedBy: userInfo ? userInfo.userId : data.teacherId,
    assignedByName: userInfo ? userInfo.name : data.teacherName,
    status: 'assigned', // assigned, in_progress, completed
    dueDate: data.dueDate || null,
    notes: data.notes || '',
    learningObjectives: data.learningObjectives || [],
    readingLevel: data.readingLevel || 'standard',
    progress: 0, // percentage of completion
    createdAt: timestamp,
    updatedAt: timestamp
  };
  
  // Save to DynamoDB
  const params = {
    TableName: ASSIGNMENTS_TABLE,
    Item: item
  };
  
  await dynamoDB.put(params).promise();
  
  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Assignment created successfully',
      assignment: item
    })
  };
}

/**
 * Get a specific assignment by ID
 */
async function getAssignment(assignmentId) {
  const params = {
    TableName: ASSIGNMENTS_TABLE,
    Key: { assignmentId }
  };
  
  const result = await dynamoDB.get(params).promise();
  
  if (!result.Item) {
    return errorResponse(404, 'Assignment not found');
  }
  
  // Get book details
  const bookDetails = await getBookDetails(result.Item.bookId);
  
  // Get student details
  const studentDetails = await getStudentDetails(result.Item.studentId);
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      assignment: {
        ...result.Item,
        book: bookDetails,
        student: studentDetails
      }
    })
  };
}

/**
 * List assignments with optional filtering
 */
async function listAssignments(queryParams, userInfo) {
  let params = {
    TableName: ASSIGNMENTS_TABLE
  };
  
  // Apply filters based on query parameters
  let filterExpressions = [];
  let expressionAttributeValues = {};
  
  // Filter by student ID
  if (queryParams.studentId) {
    filterExpressions.push('studentId = :studentId');
    expressionAttributeValues[':studentId'] = queryParams.studentId;
  }
  
  // Filter by teacher/librarian ID
  if (queryParams.teacherId) {
    filterExpressions.push('assignedBy = :teacherId');
    expressionAttributeValues[':teacherId'] = queryParams.teacherId;
  }
  
  // Filter by book ID
  if (queryParams.bookId) {
    filterExpressions.push('bookId = :bookId');
    expressionAttributeValues[':bookId'] = queryParams.bookId;
  }
  
  // Filter by status
  if (queryParams.status) {
    filterExpressions.push('status = :status');
    expressionAttributeValues[':status'] = queryParams.status;
  }
  
  // Apply filters if any
  if (filterExpressions.length > 0) {
    params.FilterExpression = filterExpressions.join(' AND ');
    params.ExpressionAttributeValues = expressionAttributeValues;
  }
  
  // If user is a student, only show their assignments
  if (userInfo && userInfo.userType === 'reader') {
    if (!params.FilterExpression) {
      params.FilterExpression = 'studentId = :currentUserId';
    } else {
      params.FilterExpression += ' AND studentId = :currentUserId';
    }
    
    if (!params.ExpressionAttributeValues) {
      params.ExpressionAttributeValues = {};
    }
    params.ExpressionAttributeValues[':currentUserId'] = userInfo.userId;
  }
  
  const result = await dynamoDB.scan(params).promise();
  
  // Enrich assignments with book and student details
  const enrichedAssignments = await Promise.all(
    result.Items.map(async (assignment) => {
      const bookDetails = await getBookDetails(assignment.bookId);
      const studentDetails = await getStudentDetails(assignment.studentId);
      
      return {
        ...assignment,
        book: bookDetails,
        student: studentDetails
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
      assignments: enrichedAssignments,
      count: enrichedAssignments.length
    })
  };
}

/**
 * Update an existing assignment
 */
async function updateAssignment(assignmentId, data, userInfo) {
  // Check if assignment exists
  const getParams = {
    TableName: ASSIGNMENTS_TABLE,
    Key: { assignmentId }
  };
  
  const existingAssignment = await dynamoDB.get(getParams).promise();
  
  if (!existingAssignment.Item) {
    return errorResponse(404, 'Assignment not found');
  }
  
  // Check permissions
  // Students can only update their own assignments and only certain fields
  if (userInfo && userInfo.userType === 'reader') {
    if (existingAssignment.Item.studentId !== userInfo.userId) {
      return errorResponse(403, 'You can only update your own assignments');
    }
    
    // Students can only update progress and status
    const allowedFields = ['progress', 'status'];
    const requestedFields = Object.keys(data);
    
    const disallowedFields = requestedFields.filter(field => !allowedFields.includes(field));
    if (disallowedFields.length > 0) {
      return errorResponse(403, `You cannot update the following fields: ${disallowedFields.join(', ')}`);
    }
  }
  
  // Prepare update expressions
  let updateExpression = 'SET updatedAt = :updatedAt';
  const expressionAttributeValues = {
    ':updatedAt': new Date().toISOString()
  };
  
  // Add fields to update
  const updateableFields = [
    { key: 'status', param: 'status' },
    { key: 'progress', param: 'progress' },
    { key: 'dueDate', param: 'dueDate' },
    { key: 'notes', param: 'notes' },
    { key: 'learningObjectives', param: 'learningObjectives' },
    { key: 'readingLevel', param: 'readingLevel' }
  ];
  
  updateableFields.forEach(field => {
    if (data[field.param] !== undefined) {
      updateExpression += `, ${field.key} = :${field.param}`;
      expressionAttributeValues[`:${field.param}`] = data[field.param];
    }
  });
  
  // Update in DynamoDB
  const updateParams = {
    TableName: ASSIGNMENTS_TABLE,
    Key: { assignmentId },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ReturnValues: 'ALL_NEW'
  };
  
  const result = await dynamoDB.update(updateParams).promise();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Assignment updated successfully',
      assignment: result.Attributes
    })
  };
}

/**
 * Delete an assignment
 */
async function deleteAssignment(assignmentId, userInfo) {
  // Check if assignment exists
  const getParams = {
    TableName: ASSIGNMENTS_TABLE,
    Key: { assignmentId }
  };
  
  const existingAssignment = await dynamoDB.get(getParams).promise();
  
  if (!existingAssignment.Item) {
    return errorResponse(404, 'Assignment not found');
  }
  
  // Check permissions
  // Only the teacher who created the assignment or a librarian can delete it
  if (userInfo && userInfo.userType === 'reader') {
    return errorResponse(403, 'Students cannot delete assignments');
  }
  
  if (userInfo && userInfo.userType === 'teacher' && 
      existingAssignment.Item.assignedBy !== userInfo.userId) {
    return errorResponse(403, 'You can only delete assignments that you created');
  }
  
  // Delete from DynamoDB
  const deleteParams = {
    TableName: ASSIGNMENTS_TABLE,
    Key: { assignmentId }
  };
  
  await dynamoDB.delete(deleteParams).promise();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Assignment deleted successfully',
      assignmentId
    })
  };
}

/**
 * Check if a book exists
 */
async function checkBookExists(bookId) {
  const params = {
    TableName: 'Books',
    Key: { bookId }
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
    TableName: 'Books',
    Key: { bookId }
  };
  
  try {
    const result = await dynamoDB.get(params).promise();
    return result.Item || { bookId, title: 'Unknown Book' };
  } catch (error) {
    console.error('Error getting book details:', error);
    return { bookId, title: 'Unknown Book' };
  }
}

/**
 * Get student details from Cognito
 */
async function getStudentDetails(studentId) {
  try {
    const result = await cognitoIdentityServiceProvider.adminGetUser({
      UserPoolId: USER_POOL_ID,
      Username: studentId
    }).promise();
    
    // Extract user attributes
    const attributes = {};
    result.UserAttributes.forEach(attr => {
      attributes[attr.Name] = attr.Value;
    });
    
    return {
      userId: studentId,
      email: attributes.email || 'Unknown',
      name: attributes.name || attributes.email || 'Unknown Student',
      userType: attributes['custom:userType'] || 'reader'
    };
  } catch (error) {
    console.error('Error getting student details:', error);
    return { userId: studentId, name: 'Unknown Student' };
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

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Table names from environment variables
const CLASSROOM_TABLE = process.env.CLASSROOM_TABLE || 'Classrooms';
const CLASSROOM_STUDENT_TABLE = process.env.CLASSROOM_STUDENT_TABLE || 'ClassroomStudents';
const CLASSROOM_BOOK_TABLE = process.env.CLASSROOM_BOOK_TABLE || 'ClassroomBooks';
const USER_POOL_ID = process.env.USER_POOL_ID || 'me-south-1_X7adr285t';

/**
 * Manages classrooms, student groups, and class assignments
 * Supports creating classrooms, adding students, and assigning books
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
      if (pathParameters.classroomId && pathParameters.studentId) {
        // Get a specific student in a classroom
        return await getClassroomStudent(pathParameters.classroomId, pathParameters.studentId);
      } else if (pathParameters.classroomId && queryParameters.students === 'true') {
        // Get all students in a classroom
        return await getClassroomStudents(pathParameters.classroomId);
      } else if (pathParameters.classroomId && queryParameters.books === 'true') {
        // Get all books assigned to a classroom
        return await getClassroomBooks(pathParameters.classroomId);
      } else if (pathParameters.classroomId) {
        // Get a specific classroom
        return await getClassroom(pathParameters.classroomId);
      } else {
        // List classrooms
        return await listClassrooms(queryParameters, userInfo);
      }
    } else if (httpMethod === 'POST') {
      if (pathParameters.classroomId && requestBody.action === 'addStudent') {
        // Add a student to a classroom
        return await addStudentToClassroom(pathParameters.classroomId, requestBody, userInfo);
      } else if (pathParameters.classroomId && requestBody.action === 'addBook') {
        // Add a book to a classroom
        return await addBookToClassroom(pathParameters.classroomId, requestBody, userInfo);
      } else if (pathParameters.classroomId && requestBody.action === 'removeStudent') {
        // Remove a student from a classroom
        return await removeStudentFromClassroom(pathParameters.classroomId, requestBody, userInfo);
      } else if (pathParameters.classroomId && requestBody.action === 'removeBook') {
        // Remove a book from a classroom
        return await removeBookFromClassroom(pathParameters.classroomId, requestBody, userInfo);
      } else {
        // Create a new classroom
        return await createClassroom(requestBody, userInfo);
      }
    } else if (httpMethod === 'PUT') {
      if (pathParameters.classroomId) {
        // Update a classroom
        return await updateClassroom(pathParameters.classroomId, requestBody, userInfo);
      } else {
        return errorResponse(400, 'Missing classroomId parameter');
      }
    } else if (httpMethod === 'DELETE') {
      if (pathParameters.classroomId) {
        // Delete a classroom
        return await deleteClassroom(pathParameters.classroomId, userInfo);
      } else {
        return errorResponse(400, 'Missing classroomId parameter');
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
 * Create a new classroom
 */
async function createClassroom(data, userInfo) {
  // Validate required fields
  if (!data.name) {
    return errorResponse(400, 'name is required');
  }
  
  // Only librarians can create classrooms
  if (userInfo && userInfo.userType !== 'librarian') {
    return errorResponse(403, 'Only librarians can create classrooms');
  }
  
  // Generate a unique ID for the classroom
  const classroomId = `classroom-${Date.now()}`;
  const timestamp = new Date().toISOString();
  
  // Create classroom item
  const classroomItem = {
    classroom_id: classroomId,
    name: data.name,
    description: data.description || '',
    grade_level: data.gradeLevel || '',
    created_by: userInfo ? userInfo.userId : data.createdBy,
    student_count: 0,
    book_count: 0,
    created_at: timestamp,
    updated_at: timestamp
  };
  
  // Save to DynamoDB
  const params = {
    TableName: CLASSROOM_TABLE,
    Item: classroomItem
  };
  
  await dynamoDB.put(params).promise();
  
  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Classroom created successfully',
      classroomId,
      classroom: classroomItem
    })
  };
}

/**
 * Get a specific classroom
 */
async function getClassroom(classroomId) {
  const params = {
    TableName: CLASSROOM_TABLE,
    Key: { classroom_id: classroomId }
  };
  
  const result = await dynamoDB.get(params).promise();
  
  if (!result.Item) {
    return errorResponse(404, 'Classroom not found');
  }
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      classroom: result.Item
    })
  };
}

/**
 * List classrooms with optional filtering
 */
async function listClassrooms(queryParams, userInfo) {
  // Only librarians can list all classrooms
  if (userInfo && userInfo.userType !== 'librarian') {
    return errorResponse(403, 'Only librarians can list classrooms');
  }
  
  let params = {
    TableName: CLASSROOM_TABLE
  };
  
  // Apply filters based on query parameters
  let filterExpressions = [];
  let expressionAttributeValues = {};
  
  // Filter by grade level
  if (queryParams.gradeLevel) {
    filterExpressions.push('grade_level = :gradeLevel');
    expressionAttributeValues[':gradeLevel'] = queryParams.gradeLevel;
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
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      classrooms: result.Items,
      count: result.Items.length
    })
  };
}

/**
 * Update an existing classroom
 */
async function updateClassroom(classroomId, data, userInfo) {
  // Get existing classroom
  const params = {
    TableName: CLASSROOM_TABLE,
    Key: { classroom_id: classroomId }
  };
  
  const result = await dynamoDB.get(params).promise();
  
  if (!result.Item) {
    return errorResponse(404, 'Classroom not found');
  }
  
  // Only librarians can update classrooms
  if (userInfo && userInfo.userType !== 'librarian') {
    return errorResponse(403, 'Only librarians can update classrooms');
  }
  
  // Build update expression
  let updateExpression = 'SET updated_at = :updatedAt';
  let expressionAttributeValues = {
    ':updatedAt': new Date().toISOString()
  };
  
  // Update fields if provided
  if (data.name !== undefined) {
    updateExpression += ', #name = :name';
    expressionAttributeValues[':name'] = data.name;
  }
  
  if (data.description !== undefined) {
    updateExpression += ', description = :description';
    expressionAttributeValues[':description'] = data.description;
  }
  
  if (data.gradeLevel !== undefined) {
    updateExpression += ', grade_level = :gradeLevel';
    expressionAttributeValues[':gradeLevel'] = data.gradeLevel;
  }
  
  // Add ExpressionAttributeNames if needed
  const expressionAttributeNames = {
    '#name': 'name'
  };
  
  // Update in DynamoDB
  const updateParams = {
    TableName: CLASSROOM_TABLE,
    Key: { classroom_id: classroomId },
    UpdateExpression: updateExpression,
    ExpressionAttributeValues: expressionAttributeValues,
    ExpressionAttributeNames: expressionAttributeNames,
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
      message: 'Classroom updated successfully',
      classroom: updateResult.Attributes
    })
  };
}

/**
 * Delete a classroom
 */
async function deleteClassroom(classroomId, userInfo) {
  // Get existing classroom
  const params = {
    TableName: CLASSROOM_TABLE,
    Key: { classroom_id: classroomId }
  };
  
  const result = await dynamoDB.get(params).promise();
  
  if (!result.Item) {
    return errorResponse(404, 'Classroom not found');
  }
  
  // Only librarians can delete classrooms
  if (userInfo && userInfo.userType !== 'librarian') {
    return errorResponse(403, 'Only librarians can delete classrooms');
  }
  
  // Delete all students from this classroom
  const students = await getClassroomStudentsInternal(classroomId);
  
  for (const student of students) {
    await dynamoDB.delete({
      TableName: CLASSROOM_STUDENT_TABLE,
      Key: { 
        classroom_id: classroomId,
        student_id: student.student_id
      }
    }).promise();
  }
  
  // Delete all books from this classroom
  const books = await getClassroomBooksInternal(classroomId);
  
  for (const book of books) {
    await dynamoDB.delete({
      TableName: CLASSROOM_BOOK_TABLE,
      Key: { 
        classroom_id: classroomId,
        book_id: book.book_id
      }
    }).promise();
  }
  
  // Delete the classroom
  await dynamoDB.delete({
    TableName: CLASSROOM_TABLE,
    Key: { classroom_id: classroomId }
  }).promise();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Classroom deleted successfully',
      classroomId
    })
  };
}

/**
 * Add a student to a classroom
 */
async function addStudentToClassroom(classroomId, data, userInfo) {
  // Validate required fields
  if (!data.studentId) {
    return errorResponse(400, 'studentId is required');
  }
  
  // Only librarians can add students to classrooms
  if (userInfo && userInfo.userType !== 'librarian') {
    return errorResponse(403, 'Only librarians can add students to classrooms');
  }
  
  // Check if classroom exists
  const classroomParams = {
    TableName: CLASSROOM_TABLE,
    Key: { classroom_id: classroomId }
  };
  
  const classroomResult = await dynamoDB.get(classroomParams).promise();
  
  if (!classroomResult.Item) {
    return errorResponse(404, 'Classroom not found');
  }
  
  // Check if student is already in the classroom
  const checkParams = {
    TableName: CLASSROOM_STUDENT_TABLE,
    Key: { 
      classroom_id: classroomId,
      student_id: data.studentId
    }
  };
  
  const checkResult = await dynamoDB.get(checkParams).promise();
  
  if (checkResult.Item) {
    return errorResponse(409, 'Student is already in this classroom');
  }
  
  // Add student to classroom
  const timestamp = new Date().toISOString();
  
  const studentItem = {
    classroom_id: classroomId,
    student_id: data.studentId,
    student_name: data.studentName || '',
    added_by: userInfo ? userInfo.userId : data.addedBy,
    added_at: timestamp
  };
  
  const params = {
    TableName: CLASSROOM_STUDENT_TABLE,
    Item: studentItem
  };
  
  await dynamoDB.put(params).promise();
  
  // Update student count in classroom
  const updateParams = {
    TableName: CLASSROOM_TABLE,
    Key: { classroom_id: classroomId },
    UpdateExpression: 'SET student_count = student_count + :increment, updated_at = :updatedAt',
    ExpressionAttributeValues: {
      ':increment': 1,
      ':updatedAt': timestamp
    }
  };
  
  await dynamoDB.update(updateParams).promise();
  
  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Student added to classroom successfully',
      student: studentItem
    })
  };
}

/**
 * Remove a student from a classroom
 */
async function removeStudentFromClassroom(classroomId, data, userInfo) {
  // Validate required fields
  if (!data.studentId) {
    return errorResponse(400, 'studentId is required');
  }
  
  // Only librarians can remove students from classrooms
  if (userInfo && userInfo.userType !== 'librarian') {
    return errorResponse(403, 'Only librarians can remove students from classrooms');
  }
  
  // Check if classroom exists
  const classroomParams = {
    TableName: CLASSROOM_TABLE,
    Key: { classroom_id: classroomId }
  };
  
  const classroomResult = await dynamoDB.get(classroomParams).promise();
  
  if (!classroomResult.Item) {
    return errorResponse(404, 'Classroom not found');
  }
  
  // Check if student is in the classroom
  const checkParams = {
    TableName: CLASSROOM_STUDENT_TABLE,
    Key: { 
      classroom_id: classroomId,
      student_id: data.studentId
    }
  };
  
  const checkResult = await dynamoDB.get(checkParams).promise();
  
  if (!checkResult.Item) {
    return errorResponse(404, 'Student is not in this classroom');
  }
  
  // Remove student from classroom
  const deleteParams = {
    TableName: CLASSROOM_STUDENT_TABLE,
    Key: { 
      classroom_id: classroomId,
      student_id: data.studentId
    }
  };
  
  await dynamoDB.delete(deleteParams).promise();
  
  // Update student count in classroom
  const updateParams = {
    TableName: CLASSROOM_TABLE,
    Key: { classroom_id: classroomId },
    UpdateExpression: 'SET student_count = student_count - :decrement, updated_at = :updatedAt',
    ExpressionAttributeValues: {
      ':decrement': 1,
      ':updatedAt': new Date().toISOString()
    },
    ConditionExpression: 'student_count > :zero',
    ExpressionAttributeValues: {
      ':decrement': 1,
      ':updatedAt': new Date().toISOString(),
      ':zero': 0
    }
  };
  
  try {
    await dynamoDB.update(updateParams).promise();
  } catch (error) {
    // If condition fails, set count to 0
    if (error.code === 'ConditionalCheckFailedException') {
      const fixParams = {
        TableName: CLASSROOM_TABLE,
        Key: { classroom_id: classroomId },
        UpdateExpression: 'SET student_count = :zero, updated_at = :updatedAt',
        ExpressionAttributeValues: {
          ':zero': 0,
          ':updatedAt': new Date().toISOString()
        }
      };
      
      await dynamoDB.update(fixParams).promise();
    } else {
      throw error;
    }
  }
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Student removed from classroom successfully',
      classroomId,
      studentId: data.studentId
    })
  };
}

/**
 * Get all students in a classroom
 */
async function getClassroomStudents(classroomId) {
  const students = await getClassroomStudentsInternal(classroomId);
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      students,
      count: students.length
    })
  };
}

/**
 * Internal function to get all students in a classroom
 */
async function getClassroomStudentsInternal(classroomId) {
  const params = {
    TableName: CLASSROOM_STUDENT_TABLE,
    KeyConditionExpression: 'classroom_id = :classroomId',
    ExpressionAttributeValues: {
      ':classroomId': classroomId
    }
  };
  
  const result = await dynamoDB.query(params).promise();
  return result.Items;
}

/**
 * Add a book to a classroom
 */
async function addBookToClassroom(classroomId, data, userInfo) {
  // Validate required fields
  if (!data.bookId) {
    return errorResponse(400, 'bookId is required');
  }
  
  // Only librarians can add books to classrooms
  if (userInfo && userInfo.userType !== 'librarian') {
    return errorResponse(403, 'Only librarians can add books to classrooms');
  }
  
  // Check if classroom exists
  const classroomParams = {
    TableName: CLASSROOM_TABLE,
    Key: { classroom_id: classroomId }
  };
  
  const classroomResult = await dynamoDB.get(classroomParams).promise();
  
  if (!classroomResult.Item) {
    return errorResponse(404, 'Classroom not found');
  }
  
  // Check if book is already in the classroom
  const checkParams = {
    TableName: CLASSROOM_BOOK_TABLE,
    Key: { 
      classroom_id: classroomId,
      book_id: data.bookId
    }
  };
  
  const checkResult = await dynamoDB.get(checkParams).promise();
  
  if (checkResult.Item) {
    return errorResponse(409, 'Book is already assigned to this classroom');
  }
  
  // Add book to classroom
  const timestamp = new Date().toISOString();
  
  const bookItem = {
    classroom_id: classroomId,
    book_id: data.bookId,
    book_title: data.bookTitle || '',
    assigned_by: userInfo ? userInfo.userId : data.assignedBy,
    assigned_at: timestamp,
    due_date: data.dueDate || null,
    is_required: data.isRequired || false
  };
  
  const params = {
    TableName: CLASSROOM_BOOK_TABLE,
    Item: bookItem
  };
  
  await dynamoDB.put(params).promise();
  
  // Update book count in classroom
  const updateParams = {
    TableName: CLASSROOM_TABLE,
    Key: { classroom_id: classroomId },
    UpdateExpression: 'SET book_count = book_count + :increment, updated_at = :updatedAt',
    ExpressionAttributeValues: {
      ':increment': 1,
      ':updatedAt': timestamp
    }
  };
  
  await dynamoDB.update(updateParams).promise();
  
  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Book added to classroom successfully',
      book: bookItem
    })
  };
}

/**
 * Remove a book from a classroom
 */
async function removeBookFromClassroom(classroomId, data, userInfo) {
  // Validate required fields
  if (!data.bookId) {
    return errorResponse(400, 'bookId is required');
  }
  
  // Only librarians can remove books from classrooms
  if (userInfo && userInfo.userType !== 'librarian') {
    return errorResponse(403, 'Only librarians can remove books from classrooms');
  }
  
  // Check if classroom exists
  const classroomParams = {
    TableName: CLASSROOM_TABLE,
    Key: { classroom_id: classroomId }
  };
  
  const classroomResult = await dynamoDB.get(classroomParams).promise();
  
  if (!classroomResult.Item) {
    return errorResponse(404, 'Classroom not found');
  }
  
  // Check if book is in the classroom
  const checkParams = {
    TableName: CLASSROOM_BOOK_TABLE,
    Key: { 
      classroom_id: classroomId,
      book_id: data.bookId
    }
  };
  
  const checkResult = await dynamoDB.get(checkParams).promise();
  
  if (!checkResult.Item) {
    return errorResponse(404, 'Book is not assigned to this classroom');
  }
  
  // Remove book from classroom
  const deleteParams = {
    TableName: CLASSROOM_BOOK_TABLE,
    Key: { 
      classroom_id: classroomId,
      book_id: data.bookId
    }
  };
  
  await dynamoDB.delete(deleteParams).promise();
  
  // Update book count in classroom
  const updateParams = {
    TableName: CLASSROOM_TABLE,
    Key: { classroom_id: classroomId },
    UpdateExpression: 'SET book_count = book_count - :decrement, updated_at = :updatedAt',
    ExpressionAttributeValues: {
      ':decrement': 1,
      ':updatedAt': new Date().toISOString()
    },
    ConditionExpression: 'book_count > :zero',
    ExpressionAttributeValues: {
      ':decrement': 1,
      ':updatedAt': new Date().toISOString(),
      ':zero': 0
    }
  };
  
  try {
    await dynamoDB.update(updateParams).promise();
  } catch (error) {
    // If condition fails, set count to 0
    if (error.code === 'ConditionalCheckFailedException') {
      const fixParams = {
        TableName: CLASSROOM_TABLE,
        Key: { classroom_id: classroomId },
        UpdateExpression: 'SET book_count = :zero, updated_at = :updatedAt',
        ExpressionAttributeValues: {
          ':zero': 0,
          ':updatedAt': new Date().toISOString()
        }
      };
      
      await dynamoDB.update(fixParams).promise();
    } else {
      throw error;
    }
  }
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Book removed from classroom successfully',
      classroomId,
      bookId: data.bookId
    })
  };
}

/**
 * Get all books assigned to a classroom
 */
async function getClassroomBooks(classroomId) {
  const books = await getClassroomBooksInternal(classroomId);
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      books,
      count: books.length
    })
  };
}

/**
 * Internal function to get all books assigned to a classroom
 */
async function getClassroomBooksInternal(classroomId) {
  const params = {
    TableName: CLASSROOM_BOOK_TABLE,
    KeyConditionExpression: 'classroom_id = :classroomId',
    ExpressionAttributeValues: {
      ':classroomId': classroomId
    }
  };
  
  const result = await dynamoDB.query(params).promise();
  return result.Items;
}

/**
 * Get a specific student in a classroom
 */
async function getClassroomStudent(classroomId, studentId) {
  const params = {
    TableName: CLASSROOM_STUDENT_TABLE,
    Key: { 
      classroom_id: classroomId,
      student_id: studentId
    }
  };
  
  const result = await dynamoDB.get(params).promise();
  
  if (!result.Item) {
    return errorResponse(404, 'Student not found in this classroom');
  }
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      student: result.Item
    })
  };
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

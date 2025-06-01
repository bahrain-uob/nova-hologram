const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Table names from environment variables
const READING_PROGRESS_TABLE = process.env.READING_PROGRESS_TABLE || 'ReadingProgress';
const READING_SESSION_TABLE = process.env.READING_SESSION_TABLE || 'ReadingSession';
const BOOKS_TABLE = process.env.BOOKS_TABLE || 'Books';
const STUDENT_ASSIGNMENTS_TABLE = process.env.STUDENT_ASSIGNMENTS_TABLE || 'StudentBookAssignments';
const USER_POOL_ID = process.env.USER_POOL_ID || 'me-south-1_X7adr285t';

/**
 * Provides analytics on student reading patterns and performance
 */
exports.handler = async (event) => {
  console.log('Event:', JSON.stringify(event, null, 2));
  
  try {
    // Extract HTTP method and path parameters
    const httpMethod = event.httpMethod;
    const pathParameters = event.pathParameters || {};
    const queryParameters = event.queryStringParameters || {};
    
    // Get user info from Cognito authorizer
    const userInfo = getUserInfoFromEvent(event);
    
    // Route based on HTTP method and path
    switch (httpMethod) {
      case 'GET':
        // Individual student analytics
        if (pathParameters.userId) {
          return await getStudentAnalytics(pathParameters.userId, queryParameters);
        }
        // Class or group analytics
        else if (queryParameters.classId) {
          return await getClassAnalytics(queryParameters.classId, queryParameters);
        }
        // Book analytics
        else if (queryParameters.bookId) {
          return await getBookAnalytics(queryParameters.bookId, queryParameters);
        }
        // Default to overall analytics
        else {
          return await getOverallAnalytics(queryParameters, userInfo);
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
 * Get analytics for an individual student
 */
async function getStudentAnalytics(userId, queryParams) {
  // Validate permissions based on user type
  if (queryParams.requestingUserId && 
      queryParams.requestingUserType !== 'librarian' && 
      queryParams.requestingUserId !== userId) {
    return errorResponse(403, 'You can only view your own analytics');
  }
  
  // Get reading progress for this student
  const progressData = await getStudentReadingProgress(userId);
  
  // Get reading sessions for this student
  const sessionData = await getStudentReadingSessions(userId);
  
  // Get book assignments for this student
  const assignmentData = await getStudentBookAssignments(userId);
  
  // Calculate analytics
  const analytics = calculateStudentAnalytics(progressData, sessionData, assignmentData);
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      userId,
      analytics
    })
  };
}

/**
 * Get analytics for a class or group of students
 */
async function getClassAnalytics(classId, queryParams) {
  // Get all students in this class
  const students = await getStudentsInClass(classId);
  
  if (!students || students.length === 0) {
    return errorResponse(404, 'No students found in this class');
  }
  
  // Get analytics for each student
  const studentAnalytics = await Promise.all(
    students.map(async (student) => {
      const progressData = await getStudentReadingProgress(student.userId);
      const sessionData = await getStudentReadingSessions(student.userId);
      const assignmentData = await getStudentBookAssignments(student.userId);
      
      return {
        userId: student.userId,
        name: student.name,
        analytics: calculateStudentAnalytics(progressData, sessionData, assignmentData)
      };
    })
  );
  
  // Calculate class-level analytics
  const classAnalytics = calculateClassAnalytics(studentAnalytics);
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      classId,
      studentCount: students.length,
      classAnalytics,
      studentAnalytics
    })
  };
}

/**
 * Get analytics for a specific book
 */
async function getBookAnalytics(bookId, queryParams) {
  // Get all progress records for this book
  const progressData = await getBookReadingProgress(bookId);
  
  // Get all sessions for this book
  const sessionData = await getBookReadingSessions(bookId);
  
  // Get all assignments for this book
  const assignmentData = await getBookAssignments(bookId);
  
  // Calculate book-level analytics
  const bookAnalytics = calculateBookAnalytics(progressData, sessionData, assignmentData);
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      bookId,
      bookAnalytics
    })
  };
}

/**
 * Get overall analytics across all books and students
 */
async function getOverallAnalytics(queryParams, userInfo) {
  // Check if user is authorized to view overall analytics
  if (userInfo && userInfo.userType !== 'librarian') {
    return errorResponse(403, 'Only librarians can view overall analytics');
  }
  
  // Get top books by reading time
  const topBooks = await getTopBooksByReadingTime(queryParams.limit || 10);
  
  // Get most active students
  const mostActiveStudents = await getMostActiveStudents(queryParams.limit || 10);
  
  // Get overall reading statistics
  const overallStats = await getOverallReadingStatistics();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      topBooks,
      mostActiveStudents,
      overallStats
    })
  };
}

/**
 * Get reading progress for a student
 */
async function getStudentReadingProgress(userId) {
  const params = {
    TableName: READING_PROGRESS_TABLE,
    FilterExpression: 'user_id = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  };
  
  const result = await dynamoDB.scan(params).promise();
  return result.Items || [];
}

/**
 * Get reading sessions for a student
 */
async function getStudentReadingSessions(userId) {
  const params = {
    TableName: READING_SESSION_TABLE,
    FilterExpression: 'user_id = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  };
  
  const result = await dynamoDB.scan(params).promise();
  return result.Items || [];
}

/**
 * Get book assignments for a student
 */
async function getStudentBookAssignments(userId) {
  const params = {
    TableName: STUDENT_ASSIGNMENTS_TABLE,
    FilterExpression: 'student_id = :userId',
    ExpressionAttributeValues: {
      ':userId': userId
    }
  };
  
  const result = await dynamoDB.scan(params).promise();
  return result.Items || [];
}

/**
 * Get all progress records for a book
 */
async function getBookReadingProgress(bookId) {
  const params = {
    TableName: READING_PROGRESS_TABLE,
    FilterExpression: 'book_id = :bookId',
    ExpressionAttributeValues: {
      ':bookId': bookId
    }
  };
  
  const result = await dynamoDB.scan(params).promise();
  return result.Items || [];
}

/**
 * Get all reading sessions for a book
 */
async function getBookReadingSessions(bookId) {
  const params = {
    TableName: READING_SESSION_TABLE,
    FilterExpression: 'book_id = :bookId',
    ExpressionAttributeValues: {
      ':bookId': bookId
    }
  };
  
  const result = await dynamoDB.scan(params).promise();
  return result.Items || [];
}

/**
 * Get all assignments for a book
 */
async function getBookAssignments(bookId) {
  const params = {
    TableName: STUDENT_ASSIGNMENTS_TABLE,
    FilterExpression: 'book_id = :bookId',
    ExpressionAttributeValues: {
      ':bookId': bookId
    }
  };
  
  const result = await dynamoDB.scan(params).promise();
  return result.Items || [];
}

/**
 * Get top books by reading time
 */
async function getTopBooksByReadingTime(limit) {
  // Get all reading progress
  const params = {
    TableName: READING_PROGRESS_TABLE
  };
  
  const result = await dynamoDB.scan(params).promise();
  const progressItems = result.Items || [];
  
  // Aggregate reading time by book
  const bookReadingTime = {};
  
  progressItems.forEach(item => {
    const bookId = item.book_id;
    const readingTime = item.total_reading_time || 0;
    
    if (!bookReadingTime[bookId]) {
      bookReadingTime[bookId] = 0;
    }
    
    bookReadingTime[bookId] += readingTime;
  });
  
  // Convert to array and sort
  const sortedBooks = Object.entries(bookReadingTime)
    .map(([bookId, totalTime]) => ({ bookId, totalTime }))
    .sort((a, b) => b.totalTime - a.totalTime)
    .slice(0, limit);
  
  // Enrich with book details
  return await Promise.all(
    sortedBooks.map(async (book) => {
      const bookDetails = await getBookDetails(book.bookId);
      return {
        ...book,
        title: bookDetails.book_title || 'Unknown Book',
        author: bookDetails.author || 'Unknown Author',
        totalTimeMinutes: book.totalTime
      };
    })
  );
}

/**
 * Get most active students
 */
async function getMostActiveStudents(limit) {
  // Get all reading sessions
  const params = {
    TableName: READING_SESSION_TABLE
  };
  
  const result = await dynamoDB.scan(params).promise();
  const sessionItems = result.Items || [];
  
  // Calculate total reading time per student
  const studentReadingTime = {};
  
  sessionItems.forEach(session => {
    const userId = session.user_id;
    
    if (!session.start_date || !session.end_date) {
      return;
    }
    
    const startTime = new Date(session.start_date);
    const endTime = new Date(session.end_date);
    const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
    
    if (!studentReadingTime[userId]) {
      studentReadingTime[userId] = {
        totalTime: 0,
        sessionCount: 0,
        lastSession: null
      };
    }
    
    studentReadingTime[userId].totalTime += durationMinutes;
    studentReadingTime[userId].sessionCount += 1;
    
    // Track most recent session
    if (!studentReadingTime[userId].lastSession || 
        new Date(session.start_date) > new Date(studentReadingTime[userId].lastSession)) {
      studentReadingTime[userId].lastSession = session.start_date;
    }
  });
  
  // Convert to array and sort
  const sortedStudents = Object.entries(studentReadingTime)
    .map(([userId, data]) => ({ 
      userId, 
      totalTimeMinutes: data.totalTime,
      sessionCount: data.sessionCount,
      lastSession: data.lastSession
    }))
    .sort((a, b) => b.totalTimeMinutes - a.totalTimeMinutes)
    .slice(0, limit);
  
  return sortedStudents;
}

/**
 * Get overall reading statistics
 */
async function getOverallReadingStatistics() {
  // Get all reading sessions
  const sessionParams = {
    TableName: READING_SESSION_TABLE
  };
  
  const sessionResult = await dynamoDB.scan(sessionParams).promise();
  const sessions = sessionResult.Items || [];
  
  // Get all progress records
  const progressParams = {
    TableName: READING_PROGRESS_TABLE
  };
  
  const progressResult = await dynamoDB.scan(progressParams).promise();
  const progress = progressResult.Items || [];
  
  // Calculate statistics
  const totalSessions = sessions.length;
  let totalReadingTimeMinutes = 0;
  let completedBooks = 0;
  
  // Calculate total reading time
  sessions.forEach(session => {
    if (session.start_date && session.end_date) {
      const startTime = new Date(session.start_date);
      const endTime = new Date(session.end_date);
      const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
      
      totalReadingTimeMinutes += durationMinutes;
    }
  });
  
  // Count completed books
  progress.forEach(item => {
    if (item.progress_percentage >= 100) {
      completedBooks += 1;
    }
  });
  
  // Count unique users and books
  const uniqueUsers = new Set(sessions.map(session => session.user_id)).size;
  const uniqueBooks = new Set(sessions.map(session => session.book_id)).size;
  
  return {
    totalSessions,
    totalReadingTimeMinutes,
    totalReadingTimeHours: Math.round(totalReadingTimeMinutes / 60 * 10) / 10,
    completedBooks,
    uniqueUsers,
    uniqueBooks,
    averageSessionLengthMinutes: totalSessions > 0 ? Math.round(totalReadingTimeMinutes / totalSessions) : 0,
    averageCompletionRate: progress.length > 0 ? 
      Math.round(progress.reduce((sum, item) => sum + (item.progress_percentage || 0), 0) / progress.length) : 0
  };
}

/**
 * Get students in a class
 */
async function getStudentsInClass(classId) {
  // This would typically query a class/student mapping table
  // For now, we'll return a mock implementation
  return [
    { userId: 'student1', name: 'Student 1' },
    { userId: 'student2', name: 'Student 2' }
  ];
}

/**
 * Calculate analytics for an individual student
 */
function calculateStudentAnalytics(progressData, sessionData, assignmentData) {
  // Total reading time
  let totalReadingTimeMinutes = 0;
  sessionData.forEach(session => {
    if (session.start_date && session.end_date) {
      const startTime = new Date(session.start_date);
      const endTime = new Date(session.end_date);
      const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
      
      totalReadingTimeMinutes += durationMinutes;
    }
  });
  
  // Books started, in progress, and completed
  const bookStatus = {};
  progressData.forEach(progress => {
    const bookId = progress.book_id;
    const percentage = progress.progress_percentage || 0;
    
    bookStatus[bookId] = percentage;
  });
  
  const booksStarted = Object.keys(bookStatus).length;
  const booksCompleted = Object.values(bookStatus).filter(percentage => percentage >= 100).length;
  const booksInProgress = booksStarted - booksCompleted;
  
  // Average reading time per session
  const averageSessionTime = sessionData.length > 0 ? 
    Math.round(totalReadingTimeMinutes / sessionData.length) : 0;
  
  // Assignment completion rate
  const assignmentsCompleted = assignmentData.filter(assignment => 
    assignment.status === 'completed').length;
  const assignmentCompletionRate = assignmentData.length > 0 ? 
    Math.round((assignmentsCompleted / assignmentData.length) * 100) : 0;
  
  // Reading frequency (sessions per week)
  const sessionsWithDates = sessionData.filter(session => session.start_date);
  let readingFrequency = 0;
  
  if (sessionsWithDates.length > 0) {
    const oldestSession = new Date(Math.min(...sessionsWithDates.map(s => new Date(s.start_date))));
    const newestSession = new Date(Math.max(...sessionsWithDates.map(s => new Date(s.start_date))));
    
    const weeksDiff = Math.max(1, Math.round((newestSession - oldestSession) / (7 * 24 * 60 * 60 * 1000)));
    readingFrequency = Math.round((sessionsWithDates.length / weeksDiff) * 10) / 10;
  }
  
  return {
    totalReadingTimeMinutes,
    totalReadingTimeHours: Math.round(totalReadingTimeMinutes / 60 * 10) / 10,
    booksStarted,
    booksInProgress,
    booksCompleted,
    totalSessions: sessionData.length,
    averageSessionTimeMinutes: averageSessionTime,
    assignmentsTotal: assignmentData.length,
    assignmentsCompleted,
    assignmentCompletionRate,
    readingFrequencyPerWeek: readingFrequency
  };
}

/**
 * Calculate analytics for a class
 */
function calculateClassAnalytics(studentAnalytics) {
  if (!studentAnalytics || studentAnalytics.length === 0) {
    return {
      averageReadingTimeMinutes: 0,
      averageBooksCompleted: 0,
      averageCompletionRate: 0
    };
  }
  
  const totalStudents = studentAnalytics.length;
  
  // Calculate averages
  const totalReadingTime = studentAnalytics.reduce((sum, student) => 
    sum + student.analytics.totalReadingTimeMinutes, 0);
  
  const totalBooksCompleted = studentAnalytics.reduce((sum, student) => 
    sum + student.analytics.booksCompleted, 0);
  
  const totalCompletionRates = studentAnalytics.reduce((sum, student) => 
    sum + student.analytics.assignmentCompletionRate, 0);
  
  return {
    averageReadingTimeMinutes: Math.round(totalReadingTime / totalStudents),
    averageReadingTimeHours: Math.round((totalReadingTime / totalStudents) / 60 * 10) / 10,
    averageBooksCompleted: Math.round(totalBooksCompleted / totalStudents * 10) / 10,
    averageCompletionRate: Math.round(totalCompletionRates / totalStudents),
    totalBooksCompleted,
    totalReadingTimeMinutes: totalReadingTime,
    totalReadingTimeHours: Math.round(totalReadingTime / 60 * 10) / 10
  };
}

/**
 * Calculate analytics for a book
 */
function calculateBookAnalytics(progressData, sessionData, assignmentData) {
  // Total readers
  const uniqueReaders = new Set(progressData.map(progress => progress.user_id)).size;
  
  // Completion rate
  const completedReaders = progressData.filter(progress => 
    (progress.progress_percentage || 0) >= 100).length;
  
  const completionRate = uniqueReaders > 0 ? 
    Math.round((completedReaders / uniqueReaders) * 100) : 0;
  
  // Average reading time
  let totalReadingTimeMinutes = 0;
  sessionData.forEach(session => {
    if (session.start_date && session.end_date) {
      const startTime = new Date(session.start_date);
      const endTime = new Date(session.end_date);
      const durationMinutes = Math.round((endTime - startTime) / (1000 * 60));
      
      totalReadingTimeMinutes += durationMinutes;
    }
  });
  
  const averageReadingTime = uniqueReaders > 0 ? 
    Math.round(totalReadingTimeMinutes / uniqueReaders) : 0;
  
  // Assignment statistics
  const totalAssignments = assignmentData.length;
  const completedAssignments = assignmentData.filter(assignment => 
    assignment.status === 'completed').length;
  
  return {
    uniqueReaders,
    completedReaders,
    completionRate,
    totalReadingTimeMinutes,
    totalReadingTimeHours: Math.round(totalReadingTimeMinutes / 60 * 10) / 10,
    averageReadingTimePerReaderMinutes: averageReadingTime,
    averageReadingTimePerReaderHours: Math.round(averageReadingTime / 60 * 10) / 10,
    totalSessions: sessionData.length,
    totalAssignments,
    completedAssignments,
    assignmentCompletionRate: totalAssignments > 0 ? 
      Math.round((completedAssignments / totalAssignments) * 100) : 0
  };
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

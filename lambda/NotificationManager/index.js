const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sns = new AWS.SNS();
const ses = new AWS.SES();

// Table names from environment variables
const NOTIFICATIONS_TABLE = process.env.NOTIFICATIONS_TABLE || 'Notifications';
const USER_POOL_ID = process.env.USER_POOL_ID || 'me-south-1_X7adr285t';
const SNS_TOPIC_ARN = process.env.SNS_TOPIC_ARN || '';
const FROM_EMAIL = process.env.FROM_EMAIL || 'notifications@example.com';

/**
 * Manages notifications for the reading platform
 * Handles creating, retrieving, and marking notifications as read
 * Supports email delivery and real-time notifications
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
        if (queryParameters.unreadCount === 'true') {
          // Get unread notification count
          return await getUnreadNotificationCount(userInfo);
        } else {
          // List notifications
          return await listNotifications(queryParameters, userInfo);
        }
        
      case 'POST':
        if (requestBody.action === 'markAsRead') {
          // Mark notification as read
          return await markNotificationAsRead(requestBody.notificationId, userInfo);
        } else if (requestBody.action === 'markAllAsRead') {
          // Mark all notifications as read
          return await markAllNotificationsAsRead(userInfo);
        } else if (requestBody.action === 'sendBatch') {
          // Send batch notifications (admin/librarian only)
          return await sendBatchNotifications(requestBody, userInfo);
        } else {
          // Create a new notification
          return await createNotification(requestBody, userInfo);
        }
        
      case 'DELETE':
        // Delete a notification
        if (!pathParameters.notificationId) {
          return errorResponse(400, 'Missing notificationId parameter');
        }
        return await deleteNotification(pathParameters.notificationId, userInfo);
        
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
 * Create a new notification
 */
async function createNotification(data, userInfo) {
  // Validate required fields
  if (!data.recipientId || !data.message) {
    return errorResponse(400, 'recipientId and message are required');
  }
  
  // Check if sender has permission to send notifications
  if (userInfo && userInfo.userType !== 'librarian' && userInfo.userId !== data.recipientId) {
    return errorResponse(403, 'You can only send notifications to yourself unless you are a librarian');
  }
  
  // Generate a unique ID for the notification
  const notificationId = `notification-${Date.now()}`;
  const timestamp = new Date().toISOString();
  
  // Create notification item
  const notificationItem = {
    notification_id: notificationId,
    recipient_id: data.recipientId,
    sender_id: userInfo ? userInfo.userId : data.senderId || 'system',
    message: data.message,
    title: data.title || 'Notification',
    type: data.type || 'info',
    related_resource: data.relatedResource || null,
    is_read: false,
    created_at: timestamp,
    updated_at: timestamp
  };
  
  // Save to DynamoDB
  const params = {
    TableName: NOTIFICATIONS_TABLE,
    Item: notificationItem
  };
  
  await dynamoDB.put(params).promise();
  
  // Send email notification if requested
  if (data.sendEmail && data.recipientEmail) {
    await sendEmailNotification(
      data.recipientEmail,
      data.title || 'New Notification',
      data.message
    );
  }
  
  // Send to SNS topic for real-time notifications if configured
  if (SNS_TOPIC_ARN) {
    await sns.publish({
      TopicArn: SNS_TOPIC_ARN,
      Message: JSON.stringify(notificationItem),
      MessageAttributes: {
        recipientId: {
          DataType: 'String',
          StringValue: data.recipientId
        },
        notificationType: {
          DataType: 'String',
          StringValue: data.type || 'info'
        }
      }
    }).promise();
  }
  
  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Notification created successfully',
      notificationId,
      notification: notificationItem
    })
  };
}

/**
 * List notifications for a user
 */
async function listNotifications(queryParams, userInfo) {
  // Ensure user is authenticated
  if (!userInfo || !userInfo.userId) {
    return errorResponse(401, 'Authentication required');
  }
  
  const userId = queryParams.userId || userInfo.userId;
  
  // Only librarians can view other users' notifications
  if (userInfo.userType !== 'librarian' && userId !== userInfo.userId) {
    return errorResponse(403, 'You can only view your own notifications');
  }
  
  // Query parameters
  const limit = queryParams.limit ? parseInt(queryParams.limit, 10) : 20;
  const unreadOnly = queryParams.unreadOnly === 'true';
  
  // Query notifications
  let params = {
    TableName: NOTIFICATIONS_TABLE,
    IndexName: 'RecipientIndex',
    KeyConditionExpression: 'recipient_id = :recipientId',
    ExpressionAttributeValues: {
      ':recipientId': userId
    },
    Limit: limit,
    ScanIndexForward: false // Sort by most recent first
  };
  
  // Add filter for unread notifications if requested
  if (unreadOnly) {
    params.FilterExpression = 'is_read = :isRead';
    params.ExpressionAttributeValues[':isRead'] = false;
  }
  
  const result = await dynamoDB.query(params).promise();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      notifications: result.Items,
      count: result.Items.length,
      lastEvaluatedKey: result.LastEvaluatedKey
    })
  };
}

/**
 * Get count of unread notifications
 */
async function getUnreadNotificationCount(userInfo) {
  // Ensure user is authenticated
  if (!userInfo || !userInfo.userId) {
    return errorResponse(401, 'Authentication required');
  }
  
  // Query unread notifications
  const params = {
    TableName: NOTIFICATIONS_TABLE,
    IndexName: 'RecipientIndex',
    KeyConditionExpression: 'recipient_id = :recipientId',
    FilterExpression: 'is_read = :isRead',
    ExpressionAttributeValues: {
      ':recipientId': userInfo.userId,
      ':isRead': false
    }
  };
  
  const result = await dynamoDB.query(params).promise();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      count: result.Items.length
    })
  };
}

/**
 * Mark a notification as read
 */
async function markNotificationAsRead(notificationId, userInfo) {
  // Ensure user is authenticated
  if (!userInfo || !userInfo.userId) {
    return errorResponse(401, 'Authentication required');
  }
  
  // Get the notification
  const getParams = {
    TableName: NOTIFICATIONS_TABLE,
    Key: { notification_id: notificationId }
  };
  
  const result = await dynamoDB.get(getParams).promise();
  
  if (!result.Item) {
    return errorResponse(404, 'Notification not found');
  }
  
  // Check if user has permission to mark this notification as read
  if (result.Item.recipient_id !== userInfo.userId && userInfo.userType !== 'librarian') {
    return errorResponse(403, 'You can only mark your own notifications as read');
  }
  
  // Update the notification
  const updateParams = {
    TableName: NOTIFICATIONS_TABLE,
    Key: { notification_id: notificationId },
    UpdateExpression: 'SET is_read = :isRead, updated_at = :updatedAt',
    ExpressionAttributeValues: {
      ':isRead': true,
      ':updatedAt': new Date().toISOString()
    },
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
      message: 'Notification marked as read',
      notification: updateResult.Attributes
    })
  };
}

/**
 * Mark all notifications as read for a user
 */
async function markAllNotificationsAsRead(userInfo) {
  // Ensure user is authenticated
  if (!userInfo || !userInfo.userId) {
    return errorResponse(401, 'Authentication required');
  }
  
  // Query all unread notifications for the user
  const queryParams = {
    TableName: NOTIFICATIONS_TABLE,
    IndexName: 'RecipientIndex',
    KeyConditionExpression: 'recipient_id = :recipientId',
    FilterExpression: 'is_read = :isRead',
    ExpressionAttributeValues: {
      ':recipientId': userInfo.userId,
      ':isRead': false
    }
  };
  
  const result = await dynamoDB.query(queryParams).promise();
  
  // Update each notification
  const updatePromises = result.Items.map(notification => {
    const updateParams = {
      TableName: NOTIFICATIONS_TABLE,
      Key: { notification_id: notification.notification_id },
      UpdateExpression: 'SET is_read = :isRead, updated_at = :updatedAt',
      ExpressionAttributeValues: {
        ':isRead': true,
        ':updatedAt': new Date().toISOString()
      }
    };
    
    return dynamoDB.update(updateParams).promise();
  });
  
  await Promise.all(updatePromises);
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'All notifications marked as read',
      count: result.Items.length
    })
  };
}

/**
 * Delete a notification
 */
async function deleteNotification(notificationId, userInfo) {
  // Ensure user is authenticated
  if (!userInfo || !userInfo.userId) {
    return errorResponse(401, 'Authentication required');
  }
  
  // Get the notification
  const getParams = {
    TableName: NOTIFICATIONS_TABLE,
    Key: { notification_id: notificationId }
  };
  
  const result = await dynamoDB.get(getParams).promise();
  
  if (!result.Item) {
    return errorResponse(404, 'Notification not found');
  }
  
  // Check if user has permission to delete this notification
  if (result.Item.recipient_id !== userInfo.userId && userInfo.userType !== 'librarian') {
    return errorResponse(403, 'You can only delete your own notifications');
  }
  
  // Delete the notification
  const deleteParams = {
    TableName: NOTIFICATIONS_TABLE,
    Key: { notification_id: notificationId }
  };
  
  await dynamoDB.delete(deleteParams).promise();
  
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Notification deleted successfully',
      notificationId
    })
  };
}

/**
 * Send batch notifications to multiple users
 */
async function sendBatchNotifications(data, userInfo) {
  // Ensure user is authenticated and has librarian privileges
  if (!userInfo || userInfo.userType !== 'librarian') {
    return errorResponse(403, 'Only librarians can send batch notifications');
  }
  
  // Validate required fields
  if (!data.message || !data.recipients || !Array.isArray(data.recipients) || data.recipients.length === 0) {
    return errorResponse(400, 'message and recipients array are required');
  }
  
  const timestamp = new Date().toISOString();
  const notificationPromises = [];
  const createdNotifications = [];
  
  // Create notifications for each recipient
  for (const recipientId of data.recipients) {
    const notificationId = `notification-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    
    const notificationItem = {
      notification_id: notificationId,
      recipient_id: recipientId,
      sender_id: userInfo.userId,
      message: data.message,
      title: data.title || 'Notification',
      type: data.type || 'info',
      related_resource: data.relatedResource || null,
      is_read: false,
      created_at: timestamp,
      updated_at: timestamp
    };
    
    // Save to DynamoDB
    const params = {
      TableName: NOTIFICATIONS_TABLE,
      Item: notificationItem
    };
    
    notificationPromises.push(dynamoDB.put(params).promise());
    createdNotifications.push(notificationItem);
    
    // Send to SNS topic for real-time notifications if configured
    if (SNS_TOPIC_ARN) {
      notificationPromises.push(
        sns.publish({
          TopicArn: SNS_TOPIC_ARN,
          Message: JSON.stringify(notificationItem),
          MessageAttributes: {
            recipientId: {
              DataType: 'String',
              StringValue: recipientId
            },
            notificationType: {
              DataType: 'String',
              StringValue: data.type || 'info'
            }
          }
        }).promise()
      );
    }
  }
  
  await Promise.all(notificationPromises);
  
  return {
    statusCode: 201,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({
      message: 'Batch notifications sent successfully',
      count: data.recipients.length,
      notifications: createdNotifications
    })
  };
}

/**
 * Send an email notification
 */
async function sendEmailNotification(recipientEmail, subject, message) {
  try {
    const params = {
      Source: FROM_EMAIL,
      Destination: {
        ToAddresses: [recipientEmail]
      },
      Message: {
        Subject: {
          Data: subject
        },
        Body: {
          Html: {
            Data: `
              <html>
                <body>
                  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #4a5568;">${subject}</h2>
                    <p style="color: #2d3748; line-height: 1.5;">${message}</p>
                    <div style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #e2e8f0; color: #718096; font-size: 12px;">
                      <p>This is an automated message from the Reading Platform. Please do not reply to this email.</p>
                    </div>
                  </div>
                </body>
              </html>
            `
          },
          Text: {
            Data: message
          }
        }
      }
    };
    
    await ses.sendEmail(params).promise();
    return true;
  } catch (error) {
    console.error('Error sending email notification:', error);
    return false;
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

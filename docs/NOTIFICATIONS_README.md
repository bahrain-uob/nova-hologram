# Notification and Classroom Management System

This document provides an overview of the notification and classroom management system implemented in the Nova Hologram reading platform.

## Architecture

The system consists of the following components:

1. **Backend Infrastructure (AWS CDK)**
   - EventNotificationsStack: Creates DynamoDB tables, SNS topic, and Lambda functions
   - LexStack: Integrates with Amazon Lex for chatbot capabilities
   - API Gateway: Exposes REST endpoints for frontend integration

2. **Lambda Functions**
   - NotificationManager: Handles CRUD operations for notifications
   - ClassroomManager: Manages classrooms, students, and book assignments
   - LexFulfillment: Processes Lex chatbot intents and SNS notifications

3. **Database Tables**
   - Notifications: Stores all user notifications
   - Classrooms: Stores classroom information
   - ClassroomStudents: Maps students to classrooms
   - ClassroomBooks: Maps books to classrooms

4. **Messaging**
   - SNS Topic: Enables real-time notifications
   - Email via SES: Sends email notifications

## API Endpoints

### Notifications API

Base URL: `https://{api-id}.execute-api.{region}.amazonaws.com/dev/notifications`

| Method | Description | Request Body | Response |
|--------|-------------|--------------|----------|
| GET | List notifications for the authenticated user | N/A | Array of notification objects |
| POST | Create a new notification | `{ "recipient_id": "string", "type": "string", "title": "string", "message": "string", "priority": "string" }` | Created notification object |
| PUT | Mark notification as read | `{ "notification_id": "string" }` | Updated notification object |
| DELETE | Delete a notification | `{ "notification_id": "string" }` | Success message |

### Classrooms API

Base URL: `https://{api-id}.execute-api.{region}.amazonaws.com/dev/classrooms`

| Method | Description | Request Body | Response |
|--------|-------------|--------------|----------|
| GET | List classrooms for the authenticated user | N/A | Array of classroom objects |
| POST | Create a new classroom | `{ "name": "string", "description": "string", "teacher_id": "string" }` | Created classroom object |
| PUT | Update a classroom | `{ "classroom_id": "string", "name": "string", "description": "string" }` | Updated classroom object |
| DELETE | Delete a classroom | `{ "classroom_id": "string" }` | Success message |

## Authentication

All API endpoints require authentication using Amazon Cognito. Include the JWT token in the Authorization header:

```
Authorization: Bearer {cognito-jwt-token}
```

User Pool ID: `me-south-1_X7adr285t`

## Role-Based Access Control

The system enforces role-based access control based on the Cognito JWT claims:

- **Librarians/Teachers**: Can create classrooms and send notifications to multiple recipients
- **Readers/Students**: Can view their own notifications and classrooms they belong to

## Chatbot Integration

The system integrates with Amazon Lex to provide conversational capabilities:

- Check notifications: "Show me my notifications"
- Get classroom info: "What books are assigned to my classroom?"
- Generate holograms: "Create a hologram for [book title]"
- Search books: "Find books about [topic]"

## Environment Variables

### NotificationManager Lambda
- `NOTIFICATIONS_TABLE`: DynamoDB table for notifications
- `SNS_TOPIC_ARN`: ARN for the SNS topic
- `FROM_EMAIL`: Email address for sending notifications
- `USER_POOL_ID`: Cognito user pool ID

### ClassroomManager Lambda
- `CLASSROOM_TABLE`: DynamoDB table for classrooms
- `CLASSROOM_STUDENT_TABLE`: DynamoDB table for classroom-student mappings
- `CLASSROOM_BOOK_TABLE`: DynamoDB table for classroom-book mappings
- `USER_POOL_ID`: Cognito user pool ID

### LexFulfillment Lambda
- `NOTIFICATIONS_TABLE`: DynamoDB table for notifications
- `CLASSROOM_TABLE`: DynamoDB table for classrooms
- `CLASSROOM_STUDENT_TABLE`: DynamoDB table for classroom-student mappings
- `CLASSROOM_BOOK_TABLE`: DynamoDB table for classroom-book mappings
- `BOOKS_TABLE`: DynamoDB table for books
- `CHAPTERS_TABLE`: DynamoDB table for chapters
- `USERS_TABLE`: DynamoDB table for users
- `READING_MATERIALS_BUCKET`: S3 bucket for reading materials
- `USER_POOL_ID`: Cognito user pool ID

## Deployment

The system is deployed as part of the CDK deployment process:

```bash
npm run build
cdk deploy --all
```

This will deploy all stacks including EventNotificationsStack and LexStack.

## Frontend Integration

The frontend can integrate with these APIs using standard HTTP requests. Example using fetch:

```javascript
// Get notifications for the current user
async function getNotifications() {
  const token = await getAuthToken(); // Get token from Cognito
  
  const response = await fetch('https://api-endpoint/notifications', {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    }
  });
  
  return response.json();
}
```

## Real-time Notifications

For real-time notifications, the frontend can implement:

1. Polling: Periodically check for new notifications
2. WebSockets: For future implementation to receive push notifications
3. Chatbot: Use the Lex chatbot to check for notifications

## Troubleshooting

Common issues:

1. **Authentication errors**: Ensure the Cognito token is valid and not expired
2. **Permission denied**: Check that the user has the correct role in Cognito
3. **Lambda errors**: Check CloudWatch logs for detailed error messages

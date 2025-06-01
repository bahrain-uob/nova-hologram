# API Gateway Endpoints Documentation

This document provides information about the API Gateway endpoints available in the Nova Hologram Reading Platform.

## Authentication

All API endpoints are secured with AWS Cognito authentication. Include the JWT token in the `Authorization` header of your requests.

```
Authorization: Bearer <your-jwt-token>
```

## Base URL

The base URL for all API endpoints is provided as CloudFormation outputs after deployment.

## Available Endpoints

### Notifications API

Endpoints for managing user notifications.

- **GET /notifications** - Get all notifications for the authenticated user
- **POST /notifications** - Create a new notification
- **PUT /notifications/{id}** - Update a notification
- **DELETE /notifications/{id}** - Delete a notification

### Classrooms API

Endpoints for classroom management.

- **GET /classrooms** - Get all classrooms for the authenticated user
- **POST /classrooms** - Create a new classroom
- **PUT /classrooms/{id}** - Update a classroom
- **DELETE /classrooms/{id}** - Delete a classroom

### Book Recommendations API

Endpoints for personalized book recommendations.

- **GET /recommendations** - Get personalized book recommendations
- **POST /recommendations** - Update user preferences for recommendations

### Reading Progress API

Endpoints for tracking reading progress.

- **GET /progress** - Get reading progress for the authenticated user
- **POST /progress** - Create or update reading progress

### User Highlights API

Endpoints for managing user highlights.

- **GET /highlights** - Get all highlights for the authenticated user
- **POST /highlights** - Create a new highlight
- **PUT /highlights/{id}** - Update a highlight
- **DELETE /highlights/{id}** - Delete a highlight

### Vocabulary Management API

Endpoints for managing vocabulary items.

- **GET /vocabulary** - Get vocabulary items for the authenticated user
- **POST /vocabulary** - Add a new vocabulary item
- **PUT /vocabulary/{id}** - Update a vocabulary item
- **DELETE /vocabulary/{id}** - Delete a vocabulary item

### Quiz Assessment API

Endpoints for quiz assessments.

- **GET /quizzes** - Get quizzes for the authenticated user
- **POST /quizzes** - Create or submit a quiz

### Student Analytics API

Endpoints for student analytics.

- **GET /analytics** - Get analytics for the authenticated user

## Request and Response Formats

All endpoints accept and return JSON data. Here are some examples:

### Notifications

```json
{
  "notificationId": "123",
  "userId": "user-123",
  "message": "New book recommendation available",
  "type": "RECOMMENDATION",
  "read": false,
  "createdAt": "2025-06-01T20:27:01Z"
}
```

### Classrooms

```json
{
  "classroomId": "class-123",
  "name": "English Literature",
  "teacherId": "teacher-123",
  "students": ["student-1", "student-2"],
  "books": ["book-1", "book-2"],
  "createdAt": "2025-06-01T20:27:01Z"
}
```

### Book Recommendations

```json
{
  "recommendationId": "rec-123",
  "userId": "user-123",
  "bookId": "book-123",
  "title": "The Great Gatsby",
  "author": "F. Scott Fitzgerald",
  "genre": "Classic",
  "confidence": 0.85,
  "rationale": "Based on your interest in American literature"
}
```

### Reading Progress

```json
{
  "progressId": "prog-123",
  "userId": "user-123",
  "bookId": "book-123",
  "chapterId": "chapter-1",
  "pageNumber": 42,
  "percentage": 0.25,
  "lastReadAt": "2025-06-01T20:27:01Z"
}
```

## Error Handling

All API endpoints return standard HTTP status codes:

- **200 OK** - The request was successful
- **400 Bad Request** - The request was invalid
- **401 Unauthorized** - Authentication is required
- **403 Forbidden** - The user does not have permission
- **404 Not Found** - The resource was not found
- **500 Internal Server Error** - An error occurred on the server

Error responses include a JSON body with more details:

```json
{
  "error": "ResourceNotFound",
  "message": "The requested resource was not found",
  "requestId": "123abc456def"
}
```

## CORS Support

All API endpoints support CORS (Cross-Origin Resource Sharing) with the following headers:

- Access-Control-Allow-Origin: '*'
- Access-Control-Allow-Headers: 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token'
- Access-Control-Allow-Methods: 'GET,POST,PUT,DELETE,OPTIONS'

## Deployment

The API endpoints are deployed as part of the CDK stack. After deployment, the API Gateway URLs are available as CloudFormation outputs.

```bash
cdk deploy --all
```

## Integration with Frontend

The frontend can access these APIs using the AWS Amplify library or standard fetch/axios requests with the appropriate authentication headers.

# Authentication System

The Nova Hologram platform uses AWS Cognito for user authentication and management. This document explains how to use the authentication system in the application.

## Configuration

The authentication system is configured in `src/config/aws-config.ts` with the following AWS Cognito settings:

```typescript
// AWS Cognito Configuration
cognito: {
  userPoolId: process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || '',
  clientId: process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '',
  region: process.env.NEXT_PUBLIC_COGNITO_REGION || 'us-east-1',
}
```

## User Pool Details

The application uses the following Cognito User Pool:

- **User Pool ID**: us-east-1_U0iB4Rowp
- **Client ID**: 509b3p7mb73l7rfi2h16mef65v
- **Region**: us-east-1
- **Token signing key URL**: https://cognito-idp.us-east-1.amazonaws.com/us-east-1_U0iB4Rowp/.well-known/jwks.json
- **ARN**: arn:aws:cognito-idp:us-east-1:672461264983:userpool/us-east-1_U0iB4Rowp

## Authentication Functions

The authentication functionality is implemented in `src/lib/auth.ts` and provides the following functions:

### Sign In

```typescript
signIn({ email, password }): Promise<any>
```

Authenticates a user with their email and password. Returns a promise that resolves with the user's session information.

### Sign Up

```typescript
signUp({ email, password, name, userType }): Promise<any>
```

Registers a new user with the provided information. The `userType` can be either 'reader' or 'librarian'.

### Verify Account

```typescript
verifyAccount({ username, code }): Promise<any>
```

Verifies a user's account with the verification code sent to their email.

### Sign Out

```typescript
signOut(): void
```

Signs out the current user.

### Get Current User

```typescript
getCurrentUser(): Promise<any>
```

Retrieves the current authenticated user's information.

## Authentication Context

The application uses a React context (`src/context/auth-context.tsx`) to manage authentication state across the application. This context provides:

- `user`: The current authenticated user object
- `isAuthenticated`: Boolean indicating if a user is authenticated
- `isLoading`: Boolean indicating if authentication is in progress
- `error`: Any authentication error that occurred
- `login`: Function to log in a user
- `register`: Function to register a new user
- `verify`: Function to verify a user's account
- `logout`: Function to log out the current user

## Usage Example

```typescript
import { useAuth } from '@/context/auth-context';

function MyComponent() {
  const { user, isAuthenticated, login, logout } = useAuth();

  const handleLogin = async () => {
    try {
      await login('user@example.com', 'password');
      // Login successful
    } catch (error) {
      // Handle login error
    }
  };

  return (
    <div>
      {isAuthenticated ? (
        <>
          <p>Welcome, {user.attributes.name}!</p>
          <button onClick={logout}>Logout</button>
        </>
      ) : (
        <button onClick={handleLogin}>Login</button>
      )}
    </div>
  );
}
```

## User Types

The system supports two types of users:

1. **Readers**: Regular users who can access and read materials
2. **Librarians**: Administrative users who can manage reading materials

User type is stored as a custom attribute (`custom:userType`) in Cognito and is used to determine which dashboard the user is redirected to after login.

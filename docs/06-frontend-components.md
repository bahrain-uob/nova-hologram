# Frontend Components

The Nova Hologram frontend is built with Next.js and React, organized into reusable components. This document explains how to use the various components in the application.

## Component Structure

Components are organized in the `src/components` directory with the following structure:

- **addbook/**: Components for adding new books
- **auth/**: Authentication-related components
- **dashboard/**: Dashboard UI components
- **examples/**: Example components for reference
- **layout/**: Layout components (headers, footers, etc.)
- **ui/**: Reusable UI components

## Dashboard Components

### TopBooks

The `TopBooks` component displays a list of top-rated books with their covers, titles, authors, and ratings.

**Location**: `src/components/dashboard/TopBooks.tsx`

**Usage**:
```tsx
import { TopBooks } from "@/components/dashboard/TopBooks";

function Dashboard() {
  return (
    <div className="dashboard-container">
      <TopBooks />
    </div>
  );
}
```

**Props**: None - The component uses internal static data.

## UI Components

The UI components are based on a custom design system and include:

- **Card**: Container component with header, content, and footer sections
- **Button**: Styled button components with various states
- **Input**: Form input components
- **Modal**: Dialog component for displaying content in a modal

**Example Usage**:
```tsx
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

function MyComponent() {
  return (
    <Card className="bg-white shadow-sm">
      <CardHeader>
        <CardTitle>My Card Title</CardTitle>
      </CardHeader>
      <CardContent>
        <p>Card content goes here</p>
      </CardContent>
    </Card>
  );
}
```

## Layout Components

Layout components provide consistent structure across pages:

- **Header**: Top navigation bar
- **Sidebar**: Side navigation menu
- **Footer**: Page footer

## Authentication Components

Authentication components handle user login, registration, and account management:

- **LoginForm**: User login form
- **SignupForm**: User registration form
- **VerificationForm**: Account verification form

## Adding New Components

To add a new component:

1. Create a new file in the appropriate subdirectory under `src/components`
2. Export your component from the file
3. Import and use the component in your pages or other components

**Example**:
```tsx
// src/components/ui/MyNewComponent.tsx
import React from 'react';

interface MyNewComponentProps {
  title: string;
  description?: string;
}

export function MyNewComponent({ title, description }: MyNewComponentProps) {
  return (
    <div className="my-new-component">
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
```

## Component Best Practices

1. Use TypeScript interfaces to define component props
2. Keep components focused on a single responsibility
3. Use composition to build complex components from simpler ones
4. Implement proper error handling and loading states
5. Use the `useAuth` hook for authentication-related functionality

# Page Routing

The Nova Hologram platform uses Next.js App Router for page routing. This document explains how to navigate the application's page structure and how to create new pages.

## Page Structure

Pages are organized in the `src/app` directory following Next.js App Router conventions:

- **actions/**: Server actions for form submissions
- **addbook/**: Add book page
- **bookdetail-librarian/**: Book detail page for librarians
- **bookdetail-reader/**: Book detail page for readers
- **dashboard/**: Librarian dashboard
- **fPassword/**: Forgot password page
- **login/**: Login page
- **manage-reader/**: Reader management page
- **reader-dashboard/**: Reader dashboard
- **signup/**: Signup page
- **verification/**: Account verification page
- **videosGenerated/**: Generated videos page

## How to Access Pages

### Authentication Pages

- **Login**: `/login`
- **Signup**: `/signup`
- **Verification**: `/verification`
- **Forgot Password**: `/fPassword`

### Librarian Pages

- **Dashboard**: `/dashboard`
- **Add Book**: `/addbook`
- **Book Detail**: `/bookdetail-librarian?id=[book-id]`
- **Manage Readers**: `/manage-reader`

### Reader Pages

- **Dashboard**: `/reader-dashboard`
- **Book Detail**: `/bookdetail-reader?id=[book-id]`
- **Generated Videos**: `/videosGenerated`

## Creating New Pages

To create a new page in the application:

1. Create a new directory in `src/app` with the desired route name
2. Create a `page.tsx` file inside the directory
3. Export a default component from the file

**Example**:
```tsx
// src/app/my-new-page/page.tsx
"use client";

import React from 'react';
import { useAuth } from '@/context/auth-context';

export default function MyNewPage() {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return null;
  }

  return (
    <div className="my-new-page">
      <h1>My New Page</h1>
      <p>Welcome, {user?.attributes?.name}!</p>
      {/* Page content */}
    </div>
  );
}
```

4. The page will be accessible at `/my-new-page`

## Page Metadata

You can add metadata to your pages using the Next.js metadata API:

```tsx
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'My Page Title',
  description: 'Description of my page',
};
```

## Route Parameters

For dynamic routes, create a directory with square brackets:

```
src/app/book/[id]/page.tsx
```

This creates a dynamic route at `/book/:id` where `:id` is a parameter.

Access the parameter in your component:

```tsx
// src/app/book/[id]/page.tsx
export default function BookPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return <div>Book ID: {id}</div>;
}
```

## Route Groups

You can create route groups by using parentheses in the directory name:

```
src/app/(auth)/login/page.tsx
src/app/(auth)/signup/page.tsx
```

This groups related routes without affecting the URL structure.

## Layouts

You can create layouts for groups of pages:

```tsx
// src/app/(auth)/layout.tsx
export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="auth-layout">
      <div className="auth-container">{children}</div>
    </div>
  );
}
```

## Navigation

Use the Next.js `useRouter` hook for programmatic navigation:

```tsx
"use client";

import { useRouter } from 'next/navigation';

export default function MyComponent() {
  const router = useRouter();

  const handleClick = () => {
    router.push('/destination');
  };

  return <button onClick={handleClick}>Go to Destination</button>;
}
```

Use the Next.js `Link` component for declarative navigation:

```tsx
import Link from 'next/link';

export default function MyComponent() {
  return (
    <Link href="/destination">
      Go to Destination
    </Link>
  );
}
```

## Protected Routes

To protect routes based on authentication or user role:

1. Check authentication status in the page component
2. Redirect unauthenticated users to the login page
3. Check user role for role-specific pages

**Example**:
```tsx
"use client";

import { useAuth } from '@/context/auth-context';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function ProtectedPage() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    } else if (!isLoading && isAuthenticated) {
      const userType = user?.attributes?.['custom:userType'];
      if (userType !== 'librarian') {
        router.push('/unauthorized');
      }
    }
  }, [isLoading, isAuthenticated, user, router]);

  if (isLoading || !isAuthenticated) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <h1>Protected Page</h1>
      {/* Page content */}
    </div>
  );
}
```

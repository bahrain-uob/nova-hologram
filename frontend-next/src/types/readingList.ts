// Reading list related interfaces

// Main reading list interface
export interface ReadingList {
  id: string;
  name: string;
  userId: string;
  books: string[];
  createdAt: string;
  updatedAt: string;
}

// Reading list with book details
export interface ReadingListWithBooks extends ReadingList {
  bookDetails?: {
    id: string;
    title: string;
    author: string;
    coverImage?: string;
  }[];
}

// Reading list creation parameters
export interface ReadingListCreateParams {
  name: string;
  userId?: string;
  books?: string[];
}

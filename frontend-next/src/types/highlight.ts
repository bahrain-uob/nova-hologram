// Highlight-related interfaces

// Highlight interface for text highlights in books
export interface Highlight {
  id: string;
  userId: string;
  bookId: string;
  chapterId?: string;
  pageNumber: number;
  text: string;
  color: string;
  note?: string;
  createdAt: string;
  
  // Additional fields for enhanced functionality
  updatedAt?: string;
  position?: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  tags?: string[];
  isShared?: boolean;
  sharedWith?: string[];
}

// Highlight collection interface
export interface HighlightCollection {
  id: string;
  userId: string;
  title: string;
  description?: string;
  highlights: Highlight[];
  createdAt: string;
  updatedAt?: string;
  isPublic?: boolean;
}

// Highlight export format
export interface HighlightExport {
  book: {
    id: string;
    title: string;
    author: string;
  };
  highlights: Highlight[];
  exportedAt: string;
  exportFormat: 'pdf' | 'markdown' | 'text' | 'json';
}

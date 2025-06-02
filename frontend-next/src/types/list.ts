// This file defines TypeScript interfaces for book lists and list books.
export interface BookList {
  list_id: string;
  list_name: string;
  user_id: string;
  created_at?: Date;
}

export interface ListBook {
  list_book_id: string;
  list_id: string;
  book_id: string;
  added_date?: Date;
  isRead?: boolean;
}

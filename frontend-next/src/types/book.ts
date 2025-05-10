export type BookData = {
    title?: string;
    authors?: string[];
    publisher?: string;
    publishedDate?: string;
    description?: string;
    maturityRating?: string;
    imageLinks?: {
      thumbnail?: string;
    };
  };

  export interface Book {
    id: number;
    title: string;
    author: string;
    cover: string;
    genres: string[];
    language: string;
  }  
  
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

  export interface BookPreview {
    id: number;
    title: string;
    author: string;
    cover: string;
    genres: string[];
    language: string;
  }  
  
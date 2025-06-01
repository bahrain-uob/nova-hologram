// API service for the frontend
// This file provides backward compatibility with existing components
// while leveraging our new API services

import * as BooksService from './booksService';
import * as ReadingProgressService from './readingProgressService';
import * as RecommendationsService from './recommendationsService';
import { LegacyBook as Book, LegacyInProgressBook as InProgressBook, LegacyFavorite as Favorite } from '@/types';

// Re-export types for backward compatibility
export type { Book, InProgressBook, Favorite };

// Mock data
const mockBooks: Book[] = [
  {
    id: "1",
    title: "The Silent Echo",
    author: "Nora Winters",
    coverImage: "/img.png",
    genre: "Mystery",
    rating: 4.5,
    description:
      "A thrilling journey through the mind of a detective on the edge.",
  },
  {
    id: "2",
    title: "Winds of the Desert",
    author: "Salem Al-Harbi",
    coverImage: "/image.png",
    genre: "Adventure",
    rating: 4.2,
    description:
      "A time-travel adventure that questions the very fabric of reality.",
  },
  {
    id: "3",
    title: "Beyond the Horizon",
    author: "Maya Greene",
    coverImage: "/img-2.png",
    genre: "Sci-Fi",
    rating: 4.8,
    description: "A fantasy epic about crossing boundaries between worlds.",
  },
  {
    id: "4",
    title: "Tales of the Future",
    author: "A.M. Tariq",
    coverImage: "/img-3.png",
    genre: "Fiction",
    rating: 4.3,
    description:
      "An adventure across uncharted territories and unknown dangers.",
  },
  {
    id: "5",
    title: "The Red Pathways",
    author: "Eliza Morgan",
    coverImage: "/img-4.png",
    genre: "Thriller",
    rating: 4.6,
    description:
      "A mysterious garden that only appears at midnight holds secrets beyond imagination.",
  },
  {
    id: "6",
    title: "Hidden Truths",
    author: "James Wilson",
    coverImage: "/img-5.png",
    genre: "Mystery",
    rating: 4.1,
    description: "A detective story with unexpected twists and turns.",
  },
];

const mockInProgressBooks: InProgressBook[] = [
  {
    id: "5",
    title: "The Red Pathways",
    coverImage: "/img-4.png",
    progress: 68,
  },
  {
    id: "6",
    title: "Hidden Truths",
    coverImage: "/img-5.png",
    progress: 42,
  },
];

const mockFavorites: Favorite[] = [
  {
    id: "1",
    title: "The Voice of the River",
    quote:
      "The river whispered secrets that only the ancient trees could understand...",
    bookId: "3",
  },
  {
    id: "2",
    title: "A Journey Within",
    quote:
      "As the sun set behind the mountains, she realized the journey had only begun...",
    bookId: "2",
  },
];

// API functions
export async function fetchTopPicks(): Promise<Book[]> {
  try {
    // Use our real API service
    const books = await RecommendationsService.fetchTrendingBooks();
    
    // Map to the expected format if needed
    return books.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      coverImage: book.coverImage,
      genre: Array.isArray(book.genre) ? book.genre[0] : book.genre,
      rating: book.rating,
      description: book.description
    }));
  } catch (error) {
    console.error('Error fetching top picks:', error);
    // Fallback to empty array
    return [];
  }
}

export async function fetchLibrarianPicks(): Promise<Book[]> {
  try {
    // Use our real API service
    const books = await RecommendationsService.fetchCuratedRecommendations();
    
    // Map to the expected format if needed
    return books.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      coverImage: book.coverImage,
      genre: Array.isArray(book.genre) ? book.genre[0] : book.genre,
      rating: book.rating,
      description: book.description
    }));
  } catch (error) {
    console.error('Error fetching librarian picks:', error);
    // Fallback to empty array
    return [];
  }
}

export async function fetchBecauseYouLiked(bookId: string): Promise<Book[]> {
  try {
    // Use our real API service
    const books = await BooksService.fetchSimilarBooks(bookId);
    
    // Map to the expected format if needed
    return books.map(book => ({
      id: book.id,
      title: book.title,
      author: book.author,
      coverImage: book.coverImage,
      genre: Array.isArray(book.genre) ? book.genre[0] : book.genre,
      rating: book.rating,
      description: book.summary
    }));
  } catch (error) {
    console.error('Error fetching similar books:', error);
    // Fallback to empty array
    return [];
  }
}

export async function fetchInProgress(): Promise<InProgressBook[]> {
  try {
    // Use our real API service
    const booksInProgress = await ReadingProgressService.getAllBooksInProgress();
    
    // Map to the expected format
    return booksInProgress.map(book => ({
      id: book.bookId,
      title: book.bookId, // We would need to fetch book details to get the title
      coverImage: '', // We would need to fetch book details to get the cover image
      progress: book.percentage
    }));
    
    // In a real implementation, we would fetch the book details for each book in progress
    // to get the title and cover image
  } catch (error) {
    console.error('Error fetching in-progress books:', error);
    // Fallback to empty array
    return [];
  }
}

export async function fetchFavorites(): Promise<Favorite[]> {
  try {
    // Use our real API service
    const readingLists = await BooksService.fetchReadingLists();
    
    // Find the favorites list, or use the first list
    const favoritesList = readingLists.find(list => list.name.toLowerCase() === 'favorites') || readingLists[0];
    
    if (!favoritesList) {
      return [];
    }
    
    // We would need to fetch book details for each book in the list
    // This is a simplified implementation
    const favorites: Favorite[] = [];
    
    for (const bookId of favoritesList.books) {
      const book = await BooksService.fetchBookById(bookId);
      if (book) {
        favorites.push({
          id: book.id,
          title: book.title,
          author: book.author,
          coverImage: book.coverImage
        });
      }
    }
    
    return favorites;
  } catch (error) {
    console.error('Error fetching favorites:', error);
    // Fallback to empty array
    return [];
  }
}

export async function addToReadingList(
  bookId: string
): Promise<{ success: boolean }> {
  try {
    // Get the user's reading lists
    const readingLists = await BooksService.fetchReadingLists();
    
    // Find the default reading list, or create one if it doesn't exist
    let defaultList = readingLists.find(list => list.name === 'My Reading List');
    
    if (!defaultList) {
      defaultList = await BooksService.createReadingList('My Reading List');
      if (!defaultList) {
        throw new Error('Failed to create reading list');
      }
    }
    
    // Add the book to the reading list
    const success = await BooksService.addBookToReadingList(defaultList.id, bookId);
    
    return { success };
  } catch (error) {
    console.error('Error adding book to reading list:', error);
    return { success: false };
  }
}

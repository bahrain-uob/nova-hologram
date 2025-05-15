// This is a mock API service for demonstration purposes

export interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  genre: string;
  rating?: number;
  description?: string;
}

export interface InProgressBook {
  id: string;
  title: string;
  coverImage: string;
  progress: number; // percentage
}

export interface Favorite {
  id: string;
  title: string;
  quote: string;
  bookId: string;
}

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
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 800));

  // Return mock data
  return mockBooks;
}

export async function fetchLibrarianPicks(): Promise<Book[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  // Return mock data (a subset of mockBooks for demonstration)
  return mockBooks.slice(0, 3);
}

export async function fetchBecauseYouLiked(bookId: string): Promise<Book[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 700));

  // Find the book that was liked
  const likedBook = mockBooks.find((book) => book.id === bookId);

  if (!likedBook) {
    return []; // Return empty array if book not found
  }

  // Return books with the same genre (excluding the liked book itself)
  return mockBooks.filter(
    (book) => book.genre === likedBook.genre && book.id !== likedBook.id
  );
}

export async function fetchInProgress(): Promise<InProgressBook[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Return mock data
  return mockInProgressBooks;
}

export async function fetchFavorites(): Promise<Favorite[]> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 700));

  // Return mock data
  return mockFavorites;
}

export async function addToReadingList(
  bookId: string
): Promise<{ success: boolean }> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 600));

  // Simulate success
  return { success: true };
}

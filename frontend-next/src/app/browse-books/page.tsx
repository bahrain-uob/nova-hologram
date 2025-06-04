"use client";

import type React from "react";
import { useState, useEffect } from "react";
import MainLayout from "@/components/layout/readerLayout"; // Page layout component
import { Badge } from "@/components/ui/badge"; // Badge UI component for genres
import withRoleProtection from "@/components/auth/withRoleProtection"; // Role-based access control
import Link from "next/link"; // Link component for navigation

// Define Book interface based on the API response
interface Book {
  book_id: string;
  book_title: string;
  authors: string[];
  book_cover: string;
  genre: string[];
  reading_level: string;
  publication_year: string;
  isbn?: string;
  language?: string;
  publisher?: {
    name: string;
  };
  book_summary?: string;
}

interface BooksResponse {
  books?: Book[];
  error?: string;
}

// Updated fetchBooks function to use the API
const fetchBooks = async (): Promise<BooksResponse> => {
  try {
    const response = await fetch(
      "https://k63byt45a5.execute-api.us-east-1.amazonaws.com/books"
    );

    if (!response.ok) {
      return { error: `API error: ${response.status}` };
    }

    const data = await response.json();

    if (data.error) {
      return { error: data.error };
    }

    // Make sure it's an array
    if (!Array.isArray(data)) {
      return { error: "Invalid data format" };
    }

    return { books: data };
  } catch (error) {
    console.error("Error fetching books:", error);
    return { error: "Failed to fetch books" };
  }
};

// ---------- Main Component ----------
const BrowseBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [genreFilter, setGenreFilter] = useState<string[]>([]);
  const [languageFilter, setLanguageFilter] = useState<string>("");
  const [authorFilter, setAuthorFilter] = useState<string>("");
  const [sortOrder, setSortOrder] = useState<string>("a-z");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        const response = await fetchBooks();

        if (response.error) {
          setError(response.error);
          setBooks([]);
        } else {
          setBooks(response.books || []);
          setError(null);
        }
      } catch (err) {
        setError("Failed to load books from database");
        setBooks([]);
      } finally {
        setLoading(false);
      }
    };

    loadBooks();
  }, []);

  // Extract all unique genres from books
  const allGenres = Array.from(
    new Set(books.flatMap((book) => book.genre || []))
  );

  // Extract all unique languages from books
  const allLanguages = Array.from(
    new Set(books.map((book) => book.language || "Unknown").filter(Boolean))
  );

  let filteredBooks = books.filter((book) => {
    const matchesGenre =
      genreFilter.length === 0 ||
      (book.genre &&
        genreFilter.some((genre) =>
          book.genre.some((g) => g.toLowerCase().includes(genre.toLowerCase()))
        ));

    const matchesLanguage = !languageFilter || book.language === languageFilter;

    const matchesAuthor =
      !authorFilter ||
      (Array.isArray(book.authors) &&
        book.authors.some((author) =>
          author.toLowerCase().includes(authorFilter.toLowerCase())
        ));

    return matchesGenre && matchesLanguage && matchesAuthor;
  });

  filteredBooks = filteredBooks.sort((a, b) => {
    return sortOrder === "a-z"
      ? a.book_title.localeCompare(b.book_title)
      : b.book_title.localeCompare(a.book_title);
  });

  return (
    <MainLayout activePage="Browse Books">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold mb-6">Browse Books</h1>

        {/* Loading and error messages */}
        {loading && (
          <p className="text-center text-gray-600">Loading books...</p>
        )}
        {error && <p className="text-center text-red-600">{error}</p>}

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">
          {/* Book Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredBooks.length > 0
              ? filteredBooks.map((book) => (
                  <Link
                    key={book.book_id}
                    href={`bookdetail-reader?bookid=${book.book_id}`}
                    className="block rounded-xl overflow-hidden shadow-md hover:shadow-lg transition-all duration-300 bg-white"
                  >
                    <div className="w-full aspect-[3/4] overflow-hidden">
                      <img
                        src={book.book_cover || "/placeholder-book.jpg"}
                        alt={book.book_title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="p-3">
                      <h3 className="font-medium text-base mb-1">
                        {book.book_title}
                      </h3>
                      <p className="text-sm text-gray-500 mb-2">
                        {Array.isArray(book.authors)
                          ? book.authors.join(", ")
                          : book.authors || "Unknown Author"}
                      </p>
                      <div className="flex gap-1 flex-wrap">
                        {book.genre &&
                          book.genre.map((genre, index) => (
                            <Badge
                              key={index}
                              className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full"
                            >
                              {genre}
                            </Badge>
                          ))}
                      </div>
                    </div>
                  </Link>
                ))
              : !loading && (
                  <p className="col-span-full text-center text-gray-500">
                    No books found for the selected filters.
                  </p>
                )}
          </div>

          {/* Filters Sidebar */}
          <aside className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm self-start space-y-4">
            <h3 className="text-lg font-semibold mb-2">Filter By</h3>
            <div>
              <label className="block text-sm font-medium mb-1">Genres</label>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {allGenres.map((genre, index) => (
                  <div key={index} className="flex items-center">
                    <input
                      type="checkbox"
                      value={genre}
                      checked={genreFilter.includes(genre)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setGenreFilter((prev) =>
                          checked
                            ? [...prev, genre]
                            : prev.filter((g) => g !== genre)
                        );
                      }}
                      className="rounded text-indigo-600 focus:ring-indigo-500"
                    />
                    <span className="ml-2 text-sm">{genre}</span>
                  </div>
                ))}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Language</label>
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm"
              >
                <option value="">All Languages</option>
                {allLanguages.map((language, index) => (
                  <option key={index} value={language}>
                    {language}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Author</label>
              <input
                type="text"
                placeholder="Search authors..."
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Sort By</label>
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm"
              >
                <option value="a-z">A - Z</option>
                <option value="z-a">Z - A</option>
              </select>
            </div>
          </aside>
        </div>
        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-8">
          <button className="w-10 h-10 border border-zinc-200 rounded-lg flex items-center justify-center">
            ←
          </button>
          <button className="w-10 h-10 rounded-lg bg-indigo-600 text-white">
            1
          </button>
          <button className="w-10 h-10 border border-zinc-200 rounded-lg flex items-center justify-center">
            →
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

export default withRoleProtection(BrowseBooks, ["reader"]);

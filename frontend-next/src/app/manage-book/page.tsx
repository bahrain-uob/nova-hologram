"use client";

import type React from "react";
import { useState, useEffect } from "react";
import {
  EditIcon,
  DeleteIcon,
  FilterIcon,
  CloudyIcon as ClearIcon,
} from "lucide-react";
import Image from "next/image";
import MainLayout from "@/components/layout/MainLayout";
import { useRouter } from "next/navigation";
import withRoleProtection from "@/components/auth/withRoleProtection";

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

    // ✅ Make sure it's an array
    if (!Array.isArray(data)) {
      return { error: "Invalid data format" };
    }

    return { books: data };
  } catch (error) {
    console.error("Error fetching books:", error);
    return { error: "Failed to fetch books" };
  }
};

const ManageBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [readingLevel, setReadingLevel] = useState("");
  const [publicationYear, setPublicationYear] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  // Dynamic filter options based on actual data
  const [availableGenres, setAvailableGenres] = useState<string[]>([]);
  const [availableReadingLevels, setAvailableReadingLevels] = useState<
    string[]
  >([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  useEffect(() => {
    const loadBooks = async () => {
      try {
        setLoading(true);
        const response = await fetchBooks();
        console.log("📚 Books from API:", response.books);

        if (response.error) {
          setError(response.error);
          setBooks([]);
        } else {
          const booksData = response.books || [];
          setBooks(booksData);
          setError(null);

          // Extract unique filter options from the actual data
          const genres = new Set<string>();
          const levels = new Set<string>();
          const years = new Set<string>();

          booksData.forEach((book) => {
            // Extract genres
            if (Array.isArray(book.genre)) {
              book.genre.forEach((g) => {
                if (g && g.trim()) genres.add(g.trim());
              });
            }

            // Extract reading levels
            if (book.reading_level && book.reading_level.trim()) {
              levels.add(book.reading_level.trim());
            }

            // Extract publication years
            if (book.publication_year && book.publication_year.trim()) {
              years.add(book.publication_year.trim());
            }
          });

          setAvailableGenres(Array.from(genres).sort());
          setAvailableReadingLevels(Array.from(levels).sort());
          setAvailableYears(
            Array.from(years).sort(
              (a, b) => Number.parseInt(b) - Number.parseInt(a)
            )
          ); // Sort years descending
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

  const handleEditBook = (bookId: string) => {
    // Navigate to the edit book page with the book ID
    router.push(`/bookdetail-librarian?bookId=${bookId}`);
  };

  const handleDeleteBook = async (bookId: string) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this book?"
    );
    if (!confirmed || !bookId) return;

    try {
      setLoading(true);

      const res = await fetch(
        "https://o23wy8otk1.execute-api.us-east-1.amazonaws.com/delete-book",
        {
          method: "POST", // REST API expects POST for deletion
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ bookId }),
        }
      );

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData?.error || "Unknown error");
      }

      // Remove the deleted book from UI
      setBooks((prevBooks) =>
        prevBooks.filter((book) => book.book_id !== bookId)
      );

      alert("Book deleted successfully!");
    } catch (error) {
      console.error("Delete failed:", error);
      alert("Failed to delete book. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const clearAllFilters = () => {
    setSearchQuery("");
    setGenre("");
    setReadingLevel("");
    setPublicationYear("");
  };

  const filteredBooks = Array.isArray(books)
    ? books.filter((book) => {
        // Safe search matching with null checks
        const matchesSearch = !searchQuery
          ? true
          : // Check if book_title exists before calling toLowerCase()
            (book.book_title || "")
              .toLowerCase()
              .includes(searchQuery.toLowerCase()) ||
            // Check if authors array exists and has elements
            (Array.isArray(book.authors) &&
              book.authors.some((author) =>
                (author || "").toLowerCase().includes(searchQuery.toLowerCase())
              ));

        // Fixed genre matching - exact match instead of includes
        const matchesGenre = !genre
          ? true
          : Array.isArray(book.genre) &&
            book.genre.some(
              (g) => (g || "").toLowerCase() === genre.toLowerCase()
            );

        // Safe level matching with null check - exact match
        const matchesLevel = !readingLevel
          ? true
          : (book.reading_level || "").toLowerCase() ===
            readingLevel.toLowerCase();

        // Safe year matching with null check - exact match
        const matchesYear = !publicationYear
          ? true
          : book.publication_year === publicationYear;

        return matchesSearch && matchesGenre && matchesLevel && matchesYear;
      })
    : [];

  const hasActiveFilters =
    searchQuery || genre || readingLevel || publicationYear;

  return (
    <MainLayout activePage="Manage Books">
      <main className="flex-1 bg-gray-50">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Manage Books</h2>
          <button
            onClick={() => {
              router.push("/addbook");
            }}
            className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg gap-2 hover:bg-indigo-700 transition-colors duration-200"
          >
            <span>Add New Book</span>
          </button>
        </div>

        {/* Filters */}
        <div className="bg-white p-4 rounded-xl shadow-sm mb-8">
          <div className="relative flex-1 mb-4">
            <input
              type="text"
              placeholder="Search books, authors, or categories"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-12 py-2 border border-zinc-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="absolute top-2 right-4">
              <FilterIcon className="w-5 h-5 text-gray-500 cursor-pointer" />
            </div>
          </div>

          <div className="flex gap-4 flex-wrap items-center">
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="block w-full sm:w-auto bg-white border border-zinc-300 rounded-lg text-sm text-gray-700 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Genres</option>
              {availableGenres.map((genreOption) => (
                <option key={genreOption} value={genreOption}>
                  {genreOption}
                </option>
              ))}
            </select>

            <select
              value={readingLevel}
              onChange={(e) => setReadingLevel(e.target.value)}
              className="block w-full sm:w-auto bg-white border border-zinc-300 rounded-lg text-sm text-gray-700 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Reading Levels</option>
              {availableReadingLevels.map((level) => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            <select
              value={publicationYear}
              onChange={(e) => setPublicationYear(e.target.value)}
              className="block w-full sm:w-auto bg-white border border-zinc-300 rounded-lg text-sm text-gray-700 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Years</option>
              {availableYears.map((year) => (
                <option key={year} value={year}>
                  {year}
                </option>
              ))}
            </select>

            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="flex items-center gap-2 px-3 py-2 text-sm text-gray-600 hover:text-gray-800 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <ClearIcon className="w-4 h-4" />
                Clear Filters
              </button>
            )}
          </div>

          {/* Active filters display */}
          {hasActiveFilters && (
            <div className="mt-3 flex flex-wrap gap-2">
              {searchQuery && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-indigo-100 text-indigo-800 text-xs rounded-full">
                  Search: "{searchQuery}"
                  <button
                    onClick={() => setSearchQuery("")}
                    className="hover:bg-indigo-200 rounded-full p-0.5"
                  >
                    <ClearIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {genre && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                  Genre: {genre}
                  <button
                    onClick={() => setGenre("")}
                    className="hover:bg-green-200 rounded-full p-0.5"
                  >
                    <ClearIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {readingLevel && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  Level: {readingLevel}
                  <button
                    onClick={() => setReadingLevel("")}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <ClearIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
              {publicationYear && (
                <span className="inline-flex items-center gap-1 px-2 py-1 bg-purple-100 text-purple-800 text-xs rounded-full">
                  Year: {publicationYear}
                  <button
                    onClick={() => setPublicationYear("")}
                    className="hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <ClearIcon className="w-3 h-3" />
                  </button>
                </span>
              )}
            </div>
          )}
        </div>

        {/* Results count */}
        {!loading && !error && (
          <div className="mb-4">
            <p className="text-sm text-gray-600">
              Showing {filteredBooks.length} of {books.length} books
              {hasActiveFilters && " (filtered)"}
            </p>
          </div>
        )}

        {/* Loading and error messages */}
        {loading && (
          <p className="text-center text-gray-600">Loading books...</p>
        )}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading &&
          !error &&
          filteredBooks.length === 0 &&
          books.length > 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                No books match your current filters.
              </p>
              <button
                onClick={clearAllFilters}
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Clear All Filters
              </button>
            </div>
          )}
        {!loading && !error && books.length === 0 && (
          <p className="text-center text-gray-600">
            No books found in the database.
          </p>
        )}

        {/* Book Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
          {filteredBooks.map((book) => (
            <div
              key={book.book_id}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex gap-6"
            >
              <Image
                src={book.book_cover || "/placeholder-book.jpg"}
                alt={book.book_title}
                width={96}
                height={128}
                className="object-cover rounded-lg"
              />

              <div className="flex flex-col justify-between ml-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {book.book_title}
                  </h3>
                  <p className="text-sm text-gray-500">
                    {Array.isArray(book.authors)
                      ? book.authors.join(", ")
                      : book.authors || "Unknown Author"}
                  </p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {book.genre &&
                      book.genre.map((g, index) => (
                        <p
                          key={index}
                          className="text-xs bg-gray-200 text-gray-700 font-medium px-2 py-0.5 rounded"
                        >
                          {g}
                        </p>
                      ))}
                  </div>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  <p>Level: {book.reading_level}</p>
                  <p>Published: {book.publication_year}</p>
                </div>
                <div className="flex gap-4 mt-2">
                  <button
                    onClick={() => handleEditBook(book.book_id)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <EditIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteBook(book.book_id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <DeleteIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination (placeholder) */}
        {filteredBooks.length > 0 && (
          <div className="flex justify-center items-center gap-4">
            <button className="w-10 h-10 border border-zinc-200 rounded-lg flex items-center justify-center hover:bg-gray-50">
              ←
            </button>
            <button className="w-10 h-10 rounded-lg bg-indigo-600 text-white">
              1
            </button>
            <button className="w-10 h-10 border border-zinc-200 rounded-lg flex items-center justify-center hover:bg-gray-50">
              →
            </button>
          </div>
        )}
      </main>
    </MainLayout>
  );
};

export default withRoleProtection(ManageBooks, ["librarian"]);

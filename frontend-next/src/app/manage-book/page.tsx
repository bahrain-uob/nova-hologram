"use client";

import React, { useState, useEffect } from "react";
import {
  Edit as EditIcon,
  Trash2 as DeleteIcon,
  Filter as FilterIcon,
} from "lucide-react";
import Image from "next/image";
import MainLayout from "@/components/layout/MainLayout";
import { useRouter } from "next/navigation";

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
    const response = await fetch("/api/books");

    if (!response.ok) {
      return { error: `API error: ${response.status}` };
    }

    const data = await response.json();

    if (data.error) {
      return { error: data.error };
    }

    return { books: Array.isArray(data) ? data : [] };
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

  const handleEditBook = (bookId: string) => {
    // Navigate to the edit book page with the book ID
    router.push(`/bookdetail-librarian/${bookId}`);
  };

  const handleDeleteBook = async (bookId: string) => {
    if (window.confirm("Are you sure you want to delete this book?")) {
      try {
        setLoading(true);
        console.log(`Deleting book: ${bookId}`);
        
        // Include user ID in the request body
        const response = await fetch(`/api/books/${bookId}`, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId: "c4180458-f091-70b8-58bd-9fc233dcf8bb" // Add the user ID from your curl command
          })
        });
        
        console.log(`Delete response status: ${response.status}`);
        const responseText = await response.text();
        console.log(`Delete response: ${responseText}`);
        
        let result;
        try {
          result = JSON.parse(responseText);
        } catch (e) {
          console.log("Response is not valid JSON");
          result = { message: responseText };
        }
        
        if (!response.ok) {
          throw new Error(result.error || `Failed to delete book: ${response.status}`);
        }
        
        // Remove the deleted book from state
        setBooks(prevBooks => prevBooks.filter(book => book.book_id !== bookId));
        
        // Show success message
        alert("Book deleted successfully");
      } catch (error) {
        console.error("Error deleting book:", error);
        alert(error instanceof Error ? error.message : "Failed to delete book");
      } finally {
        setLoading(false);
      }
    }
  };

  const filteredBooks = Array.isArray(books)
    ? books.filter((book) => {
        // Safe search matching with null checks
        const matchesSearch = !searchQuery ? true : (
          // Check if book_title exists before calling toLowerCase()
          ((book.book_title || "").toLowerCase().includes(searchQuery.toLowerCase())) ||
          // Check if authors array exists and has elements
          (Array.isArray(book.authors) && book.authors.some(author => 
            (author || "").toLowerCase().includes(searchQuery.toLowerCase())
          ))
        );

        // Safe genre matching with null checks
        const matchesGenre = !genre ? true : (
          Array.isArray(book.genre) && book.genre.some(g => 
            (g || "").toLowerCase().includes(genre.toLowerCase())
          )
        );
        
        // Safe level matching with null check
        const matchesLevel = !readingLevel ? true : 
          book.reading_level === readingLevel;
        
        // Safe year matching with null check
        const matchesYear = !publicationYear ? true : 
          book.publication_year === publicationYear;

        return matchesSearch && matchesGenre && matchesLevel && matchesYear;
      })
    : [];

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

          <div className="flex gap-4 flex-wrap">
            <select
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className="block w-full sm:w-auto bg-white border border-zinc-300 rounded-lg text-sm text-gray-700 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">All Genres</option>
              <option value="Fiction">Fiction</option>
              <option value="Romance">Romance</option>
              <option value="Self Help">Self Help</option>
              <option value="Science Fiction">Science Fiction</option>
            </select>

            <select
              value={readingLevel}
              onChange={(e) => setReadingLevel(e.target.value)}
              className="block w-full sm:w-auto bg-white border border-zinc-300 rounded-lg text-sm text-gray-700 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Reading Level</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              value={publicationYear}
              onChange={(e) => setPublicationYear(e.target.value)}
              className="block w-full sm:w-auto bg-white border border-zinc-300 rounded-lg text-sm text-gray-700 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value="">Publication Year</option>
              <option value="2018">2018</option>
              <option value="1960">1960</option>
              <option value="1949">1949</option>
              <option value="1925">1925</option>
            </select>
          </div>
        </div>

        {/* Loading and error messages */}
        {loading && <p className="text-center text-gray-600">Loading books...</p>}
        {error && <p className="text-center text-red-600">{error}</p>}
        {!loading && !error && filteredBooks.length === 0 && (
          <p className="text-center text-gray-600">No books found.</p>
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
                  <h3 className="text-lg font-semibold text-gray-800">{book.book_title}</h3>
                  <p className="text-sm text-gray-500">{book.authors ? book.authors.join(', ') : 'Unknown Author'}</p>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {book.genre && book.genre.map((g, index) => (
                      <p key={index} className="text-xs bg-gray-200 text-gray-700 font-medium px-2 py-0.5 rounded">
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
        <div className="flex justify-center items-center gap-4">
          <button className="w-10 h-10 border border-zinc-200 rounded-lg flex items-center justify-center">
            ←
          </button>
          <button className="w-10 h-10 rounded-lg bg-indigo-600 text-white">1</button>
          <button className="w-10 h-10 border border-zinc-200 rounded-lg flex items-center justify-center">
            →
          </button>
        </div>
      </main>
    </MainLayout>
  );
};

export default ManageBooks;

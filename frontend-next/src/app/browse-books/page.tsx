"use client";

import React, { useState, useEffect } from "react";
import MainLayout from "@/components/layout/readerLayout"; // Page layout component
import { Badge } from "@/components/ui/badge"; // Badge UI component for genres

// ---------- Book Interface (type definition) ----------
interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  genres: string[];
  language: string;
}

// ---------- Sample Books Data (mock data) ----------
const fetchBooks = async (): Promise<Book[]> => [
  {
    id: 1,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    cover: "covers/pride.jpg",
    genres: ["Romance", "Classic"],
    language: "English",
  },
  {
    id: 2,
    title: "Moby-Dick",
    author: "Herman Melville",
    cover: "https://cdn.shopify.com/s/files/1/0625/6679/3413/files/Moby-Dick.jpg?v=1716560355",
    genres: ["Adventure", "Classic"],
    language: "English",
  },
  {
    id: 3,
    title: "War and Peace",
    author: "Leo Tolstoy",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1681127703i/125209426.jpg",
    genres: ["Historical", "Classic"],
    language: "English",
  },
  {
    id: 4,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    cover: "covers/gatsby.jpg",
    genres: ["Fiction", "Classic"],
    language: "English",
  },
  {
    id: 5,
    title: "1984",
    author: "George Orwell",
    cover: "/covers/1984.jpg",
    genres: ["Dystopian", "Science Fiction"],
    language: "English",
  },
  {
    id: 6,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    cover: "/covers/mockingbird.jpg",
    genres: ["Fiction", "Classic"],
    language: "English",
  },
  {
    id: 7,
    title: "Jane Eyre",
    author: "Charlotte Brontë",
    cover: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTTtMQtxKo8qQ0jpHaB-pzdUoaPWXUOh9xzJA&s",
    genres: ["Romance", "Classic"],
    language: "English",
  },
  {
    id: 8,
    title: "Crime and Punishment",
    author: "Fyodor Dostoevsky",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1348523421i/3185003.jpg",
    genres: ["Psychological", "Classic"],
    language: "English",
  },
  {
    id: 9,
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    cover: "https://images-na.ssl-images-amazon.com/images/S/compressed.photo.goodreads.com/books/1398034300i/5107.jpg",
    genres: ["Fiction", "Classic"],
    language: "English",
  },
  {
    id: 10,
    title: "The Odyssey",
    author: "Homer",
    cover: "https://webfiles.ucpress.edu/coverimage/isbn13/9780520293632.jpg",
    genres: ["Epic", "Classic"],
    language: "English",
  },
];

// ---------- Main Component ----------
const BrowseBooks: React.FC = () => {
  // -------- State Variables --------
  const [books, setBooks] = useState<Book[]>([]); // All books data
  const [genreFilter, setGenreFilter] = useState<string[]>([]); // Selected genres
  const [languageFilter, setLanguageFilter] = useState<string>(""); // Selected language
  const [authorFilter, setAuthorFilter] = useState<string>(""); // Author search input
  const [sortOrder, setSortOrder] = useState<string>("a-z"); // Sorting order

  // -------- Load Books Data --------
  useEffect(() => {
    const loadBooks = async () => {
      const booksData = await fetchBooks();
      setBooks(booksData);
    };
    loadBooks();
  }, []);

  // -------- Extract Unique Genres from all books --------
  const allGenres = Array.from(new Set(books.flatMap((book) => book.genres)));

  // -------- Apply Filters --------
  let filteredBooks = books.filter((book) => {
    const matchesGenre =
      genreFilter.length === 0 ||
      genreFilter.some((genre) => book.genres.includes(genre));

    const matchesLanguage =
      !languageFilter || book.language === languageFilter;

    const matchesAuthor =
      !authorFilter ||
      book.author.toLowerCase().includes(authorFilter.toLowerCase());

    return matchesGenre && matchesLanguage && matchesAuthor;
  });

  // -------- Apply Sorting --------
  filteredBooks = filteredBooks.sort((a, b) => {
    if (sortOrder === "a-z") {
      return a.title.localeCompare(b.title);
    } else {
      return b.title.localeCompare(a.title);
    }
  });

  return (
    <MainLayout activePage="Browse Books">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-2xl font-semibold mb-6">Browse Books</h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_280px] gap-8">

          {/* ---------- Books Grid ---------- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredBooks.length > 0 ? (
              filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-white p-3 rounded-xl border border-gray-200 shadow-sm hover:shadow-md transition-shadow flex flex-col"
                >
                  {/* Book Cover */}
                  <div className="w-full h-[240px] rounded-md overflow-hidden mb-2">
                    <img
                      src={book.cover}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Book Title and Author */}
                  <h3 className="font-semibold text-base">{book.title}</h3>
                  <p className="text-sm text-gray-500">{book.author}</p>

                  {/* Genres Badges */}
                  <div className="flex gap-1 flex-wrap mt-1">
                    {book.genres.map((genre) => (
                      <Badge
                        key={genre}
                        className="bg-gray-200 text-gray-700 text-xs px-2 py-0.5 rounded-full"
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                </div>
              ))
            ) : (
              <p className="col-span-full text-center text-gray-500">
                No books found for the selected filters.
              </p>
            )}
          </div>

          {/* ---------- Filters Sidebar ---------- */}
          <aside className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm self-start space-y-4">
            <h3 className="text-lg font-semibold mb-2">Filter By</h3>

            {/* ---- Genres Filter ---- */}
            <div>
              <label className="block text-sm font-medium mb-1">Genres</label>
              <div className="space-y-1">
                {allGenres.map((genre) => (
                  <div key={genre} className="flex items-center">
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
                    />
                    <span className="ml-2 text-sm">{genre}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* ---- Language Filter ---- */}
            <div>
              <label className="block text-sm font-medium mb-1">Language</label>
              <select
                value={languageFilter}
                onChange={(e) => setLanguageFilter(e.target.value)}
                className="w-full border border-gray-300 rounded p-2 text-sm"
              >
                <option value="">All Languages</option>
                <option value="English">English</option>
              </select>
            </div>

            {/* ---- Author Search ---- */}
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

            {/* ---- Sort Order ---- */}
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

        {/* ---------- Pagination Placeholder ---------- */}
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

export default BrowseBooks;
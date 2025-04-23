"use client";

import React, { useState, useEffect } from "react";
import { Edit as EditIcon, Trash2 as DeleteIcon, Filter as FilterIcon } from "lucide-react";
import { ReadersSidebar } from "@/components/dashboard/ReadersSidebar";
import { Top } from "@/components/dashboard/Top";

interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  genre: string;
  readingLevel: "Easy" | "Medium" | "Hard";
  publicationYear: number;
}

// Simulated fetch function for fetching books
const fetchBooks = async (): Promise<Book[]> => [
  { id: 1, title: "The Great Gatsby", author: "F. Scott Fitzgerald", cover: "/covers/gatsby.jpg", genre: "Classic Fiction", readingLevel: "Medium", publicationYear: 1925 },
  { id: 2, title: "To Kill a Mockingbird", author: "Harper Lee", cover: "/covers/mockingbird.jpg", genre: "Literary Fiction", readingLevel: "Medium", publicationYear: 1960 },
  { id: 3, title: "1984", author: "George Orwell", cover: "/covers/1984.jpg", genre: "Science Fiction", readingLevel: "Hard", publicationYear: 1949 },
  { id: 4, title: "Pride and Prejudice", author: "Jane Austen", cover: "/covers/pride.jpg", genre: "Romance", readingLevel: "Medium", publicationYear: 1813 },
  { id: 5, title: "Atomic Habits", author: "James Clear", cover: "/covers/atomichabits.jpg", genre: "Self Help", readingLevel: "Easy", publicationYear: 2018 },
  { id: 6, title: "The Catcher in the Rye", author: "J.D. Salinger", cover: "/covers/catcher.jpg", genre: "Coming-of-Age", readingLevel: "Medium", publicationYear: 1951 },
];

const ManageBooks: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [readingLevel, setReadingLevel] = useState("");
  const [publicationYear, setPublicationYear] = useState("");

  useEffect(() => {
    const loadBooks = async () => {
      const booksData = await fetchBooks();
      setBooks(booksData);
    };
    loadBooks();
  }, []);

  const handleEditBook = (bookId: number) => {
    console.log(`Editing book with id: ${bookId}`);
  };

  const handleDeleteBook = (bookId: number) => {
    console.log(`Deleting book with id: ${bookId}`);
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenre = genre ? book.genre.toLowerCase().includes(genre.toLowerCase()) : true;
    const matchesLevel = readingLevel ? book.readingLevel === readingLevel : true;
    const matchesYear = publicationYear ? book.publicationYear.toString() === publicationYear : true;

    return matchesSearch && matchesGenre && matchesLevel && matchesYear;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col w-full">
        <Top className="w-full fixed top-0 z-10" ellipse="/avatars/user.png" />

        <div className="flex flex-row w-full pt-[61px]">
          <ReadersSidebar
            className="fixed left-0 top-[61px] h-[calc(100vh-61px)]"
            divClassName="bg-gray-100 hover:bg-gray-200"
            divClassNameOverride="text-indigo-600 bg-indigo-50"
          />

          <main className="flex-1 p-8 bg-gray-50 ml-64">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-700">Manage Books</h2>
              <button
                onClick={() => {}}
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

            {/* Book Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              {filteredBooks.map((book) => (
                <div
                  key={book.id}
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex gap-6"
                >
                  <img
                    src={book.cover}
                    alt={book.title}
                    className="w-24 h-32 object-cover rounded-lg"
                  />
                  <div className="flex flex-col justify-between ml-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{book.title}</h3>
                      <p className="text-sm text-gray-500">{book.author}</p>
                      <p className="text-xs bg-gray-200 text-gray-700 font-medium mt-1 px-2 py-0.5 rounded w-fit">
                        {book.genre}
                      </p>
                    </div>
                    <div className="mt-2 text-sm text-gray-600">
                      <p>Level: {book.readingLevel}</p>
                      <p>Published: {book.publicationYear}</p>
                    </div>
                    <div className="flex gap-4 mt-2">
                      <button onClick={() => handleEditBook(book.id)} className="text-indigo-600 hover:text-indigo-800">
                        <EditIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDeleteBook(book.id)} className="text-red-600 hover:text-red-800">
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
        </div>
      </div>
    </div>
  );
};

export default ManageBooks;

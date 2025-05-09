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
  {
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    cover: "/covers/gatsby.jpg",
    genre: "Classic Fiction",
    readingLevel: "Medium",
    publicationYear: 1925,
  },
  {
    id: 2,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    cover: "/covers/mockingbird.jpg",
    genre: "Literary Fiction",
    readingLevel: "Medium",
    publicationYear: 1960,
  },
  {
    id: 3,
    title: "1984",
    author: "George Orwell",
    cover: "/covers/1984.jpg",
    genre: "Science Fiction",
    readingLevel: "Hard",
    publicationYear: 1949,
  },
  {
    id: 4,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    cover: "/covers/pride.jpg",
    genre: "Romance",
    readingLevel: "Medium",
    publicationYear: 1813,
  },
  {
    id: 5,
    title: "Atomic Habits",
    author: "James Clear",
    cover: "/covers/atomichabits.jpg",
    genre: "Self Help",
    readingLevel: "Easy",
    publicationYear: 2018,
  },
  {
    id: 6,
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    cover: "/covers/catcher.jpg",
    genre: "Coming-of-Age",
    readingLevel: "Medium",
    publicationYear: 1951,
  },
];

const InteractivePage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [readingLevel, setReadingLevel] = useState("");
  const [publicationYear, setPublicationYear] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadBooks = async () => {
      const booksData = await fetchBooks();
      setBooks(booksData);
    };
    loadBooks();
  }, []);

  const handleEditBook = (bookId: number) => {
    router.push(`/bookdetail-librarian`);
    console.log(`Editing book with id: ${bookId}`);
  };

  const handleDeleteBook = (bookId: number) => {
    console.log(`Deleting book with id: ${bookId}`);
  };

  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenre = genre
      ? book.genre.toLowerCase().includes(genre.toLowerCase())
      : true;
    const matchesLevel = readingLevel
      ? book.readingLevel === readingLevel
      : true;
    const matchesYear = publicationYear
      ? book.publicationYear.toString() === publicationYear
      : true;

    return matchesSearch && matchesGenre && matchesLevel && matchesYear;
  });

  return (
    <MainLayout activePage="Manage Books">
      <main className="flex flex-row bg-gray-50 min-h-screen">
        {/* Left Column - Book Details */}
        <div className="flex-1 p-8">
          <h2 className="text-2xl font-semibold text-gray-700 mb-4">Chapter 1: The Beginning</h2>

          <div className="flex flex-col gap-4">
            <div className="relative mb-6">
              <video
                width="100%"
                controls
                className="rounded-lg shadow-lg"
              >
                <source src="video.mp4" type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>

          </div>
        </div>

        {/* Right Column - Chat Panel */}
        <div className="w-96 bg-white shadow-lg p-6 flex flex-col justify-between">
          {/* Princess Elena's greeting message */}
          <div className="bg-gray-100 p-4 rounded-lg shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-gray-700">Princess Elena</h3>
            <div className="text-sm text-gray-500">
              <p>Greetings, brave reader! I am Princess Elena. What would you like to know about my quest?</p>
            </div>
          </div>

          {/* Chat messages */}
          <div className="flex flex-col gap-6 overflow-y-auto flex-1">
            <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700">Talk to Character</h3>
              <div className="text-sm text-gray-500">
                <p>What's your mission in this story?</p>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700">Talk to Character</h3>
              <div className="text-sm text-gray-500">
                <p>What's the forest's secret?</p>
              </div>
            </div>

            <div className="bg-gray-100 p-4 rounded-lg shadow-sm">
              <h3 className="text-lg font-semibold text-gray-700">Talk to Character</h3>
              <div className="text-sm text-gray-500">
                <p>Who is your biggest enemy?</p>
              </div>
            </div>
          </div>

          {/* Chat Input */}
          <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-sm">
            <textarea
              className="w-full p-2 text-sm text-gray-700 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Type your message..."
              rows={2}
            ></textarea>
            <div className="flex justify-end mt-2">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Send
              </button>
            </div>
          </div>
        </div>
      </main>
    </MainLayout>
  );
};

export default InteractivePage;

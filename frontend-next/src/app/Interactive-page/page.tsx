"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Edit as EditIcon,
  Trash2 as DeleteIcon,
  Filter as FilterIcon,
} from "lucide-react";
import Image from "next/image";
import MainLayout from "@/components/layout/MainLayout";
import { useRouter } from "next/navigation";
import "./styles.css";

interface Book {
  id: number;
  title: string;
  author: string;
  cover: string;
  genre: string;
  readingLevel: "Easy" | "Medium" | "Hard";
  publicationYear: number;
}

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

const chapters = [
  { id: 1, title: "Chapter 1: The Beginning" },
  { id: 2, title: "Chapter 2: Into the Forest" },
  { id: 3, title: "Chapter 3: The Hidden Village" },
];

const InteractivePage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [genre, setGenre] = useState("");
  const [readingLevel, setReadingLevel] = useState("");
  const [publicationYear, setPublicationYear] = useState("");
  const [selectedChapter, setSelectedChapter] = useState(chapters[0]);
  const [showHologram, setShowHologram] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const router = useRouter();

  useEffect(() => {
    const loadBooks = async () => {
      const booksData = await fetchBooks();
      setBooks(booksData);
    };

    loadBooks();
  }, []);

  useEffect(() => {
    if (showHologram) {
      const videoUrl = "https://bedrock-video-generation-us-east-1-qvk1dv.s3.amazonaws.com/output.mp4";
      
      videoRefs.current.forEach(video => {
        if (video) {
          video.src = videoUrl;
          video.loop = true;
          video.muted = true;
          video.play().catch(e => console.error("Video play error:", e));
        }
      });
    }
  }, [showHologram]);

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
    <MainLayout activePage="Interactive Book">
      {/* Hologram Modal */}
      {showHologram && (
        <div className="fixed inset-0 z-50 bg-black">
          <div className="absolute top-4 right-4 z-10">
            <button
              onClick={() => setShowHologram(false)}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
            >
              Close Hologram
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 ml-2" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>

          <div id="rotated-video-layout">
            <video 
              ref={(el) => { videoRefs.current[0] = el; }}
              className="rotated-video left"
            />
            <video 
              ref={(el) => { videoRefs.current[1] = el; }}
              className="rotated-video center"
            />
            <video 
              ref={(el) => { videoRefs.current[2] = el; }}
              className="rotated-video right"
            />
          </div>
        </div>
      )}

      <main className={`flex flex-col bg-gray-50 min-h-screen ${showHologram ? "opacity-0 h-0 overflow-hidden" : ""}`}>
        <div className="flex-1 p-8">
          <div className="mb-4">
            <label htmlFor="chapter-select" className="block text-sm font-medium text-gray-700 mb-1">
              Select Chapter:
            </label>
            <select
              id="chapter-select"
              className="w-full md:w-64 p-2 border border-gray-300 rounded-lg shadow-sm text-sm"
            >
              {chapters.map((chapter) => (
                <option key={chapter.id} value={chapter.id}>
                  {chapter.title}
                </option>
              ))}
            </select>
          </div>

          <div className="relative mb-6">
            <video 
              className="w-full rounded-lg shadow-lg"
              src="https://bedrock-video-generation-us-east-1-qvk1dv.s3.amazonaws.com/output.mp4"
              controls
            />

            <div className="flex justify-start mt-4">
              <button
                className="bg-indigo-600 text-white px-6 py-3 rounded-lg hover:bg-indigo-700 hover:scale-105 hover:shadow-lg active:scale-95 active:bg-indigo-800 cursor-pointer transition-all duration-200 font-semibold shadow-md"
                onClick={() => setShowHologram(true)}
              >
                View Hologram
              </button>
            </div>
          </div>
        </div>

        {/* Chat Panel */}
        <div className="w-full md:w-96 bg-white shadow-lg p-6 flex flex-col justify-between fixed bottom-0 right-0 h-[400px]">
          <div className="flex-1 overflow-y-auto mb-4">
            <div className="message assistant">
              <div className="role-label">Assistant</div>
              <div className="message-content">
                Hello! How can I help you today?
              </div>
            </div>
          </div>

          <div className="mt-4">
            <textarea
              className="w-full p-2 text-sm text-gray-700 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Type your message..."
              rows={2}
            />
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
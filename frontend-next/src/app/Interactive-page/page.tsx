"use client";

import React, { useState, useEffect } from "react";
// import {
//   Edit as EditIcon,
//   Trash2 as DeleteIcon,
//   Filter as FilterIcon,
// } from "lucide-react";
// import Image from "next/image";
import MainLayout from "@/components/layout/MainLayout";
import { useRouter } from "next/navigation";
import { API_ENDPOINTS } from "@/config/api-config";

import { Book, BookChapter } from '@/types/book';

// Remove local Book/Chapter interfaces and fallback mockBooks. Use centralized types only.

import { getAllBooks, getBookChapters } from '@/services/libraryService';
import { LibraryBook } from '@/types';
import { ChatBot } from '@/components/Chatbot/ChatBot';

const mapLibraryBookToBook = (libBook: LibraryBook): Book => ({
  id: libBook.id || libBook.book_id || '',
  title: libBook.title || libBook.book_title || '',
  author: libBook.author || (libBook.authors && libBook.authors[0]) || '',
  coverImage: libBook.coverImage || libBook.book_cover || '/covers/default.jpg',
  genre: Array.isArray(libBook.genre) ? libBook.genre : (libBook.genre ? [libBook.genre] : []),
  readingLevel: (libBook.readingLevel as Book['readingLevel']) || (libBook.reading_level as Book['readingLevel']) || undefined,
  publicationYear: (typeof libBook.publicationYear === 'number' ? libBook.publicationYear : parseInt(libBook.publication_year as string)) || undefined,
  description: libBook.summary || libBook.book_summary || libBook.description || '',
});

const mapBookChapterToChapter = (ch: BookChapter): BookChapter => ({
  chapter_id: ch.chapter_id,
  book_id: ch.book_id,
  chapter_no: ch.chapter_no,
  title: ch.title || ch.chapter_title || '',
  content: ch.content,
  summary: ch.summary,
  script: ch.script,
  trailer: ch.trailer,
  trailer_status: ch.trailer_status,
  audio_url: ch.audio_url,
  ssml: ch.ssml,
  finalvideo: ch.finalvideo,
});

const InteractivePage: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [chapters, setChapters] = useState<BookChapter[]>([]);
  const [selectedBook, setSelectedBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Search and filter states - will be used in future implementation
  const [searchQuery] = useState("");
  const [genre] = useState("");
  const [readingLevel] = useState("");
  const [publicationYear] = useState("");
  const [selectedChapter, setSelectedChapter] = useState<BookChapter | null>(null);

  const router = useRouter();

  useEffect(() => {
    const loadBooks = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const booksData = await getAllBooks();
        const mappedBooks = booksData.map(mapLibraryBookToBook);
        setBooks(mappedBooks);
        if (mappedBooks.length > 0) {
          setSelectedBook(mappedBooks[0]);
          const chaptersData = await getBookChapters(mappedBooks[0].id);
          const mappedChapters = chaptersData.map(mapBookChapterToChapter);
          setChapters(mappedChapters);
          if (mappedChapters.length > 0) {
            setSelectedChapter(mappedChapters[0]);
          }
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load books');
      } finally {
        setIsLoading(false);
      }
    };

    loadBooks();
  }, []);

  const handleEditBook = (bookId: string) => {
    router.push(`/bookdetail-librarian?id=${bookId}`);
    console.log(`Editing book with id: ${bookId}`);
  };

  const handleDeleteBook = (bookId: string) => {
    console.log(`Deleting book with id: ${bookId}`);
  };
  
  // Load chapters when a book is selected
  const handleBookSelect = async (book: Book) => {
    setSelectedBook(book);
    setSelectedChapter(null);
    setIsLoading(true);
    try {
      const chaptersData = await getBookChapters(book.id);
      const mappedChapters = chaptersData.map(mapBookChapterToChapter);
      setChapters(mappedChapters);
      if (mappedChapters.length > 0) {
        setSelectedChapter(mappedChapters[0]);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load chapters');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredBooks = books.filter((book) => {
    const searchLower = searchQuery.toLowerCase();
    const genreLower = genre ? genre.toLowerCase() : '';
    
    const matchesSearch =
      (book.title || '').toLowerCase().includes(searchLower) ||
      (book.author || '').toLowerCase().includes(searchLower);

    const matchesGenre = !genre || (
      Array.isArray(book.genre)
        ? book.genre.some(g => (g || '').toLowerCase().includes(genreLower))
        : false
    );
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
        {/* Left Column - Chapter Video */}
        <div className="flex-1 p-8">
          {/* Chapter Selector */}
          <div className="mb-4">
            <label
              htmlFor="chapter-select"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Select Chapter:
            </label>
            <select
              id="chapter-select"
              value={selectedChapter?.chapter_id || ""}
              onChange={(e) =>
                setSelectedChapter(
                  chapters.find((ch) => ch.chapter_id === e.target.value) || null
                )
              }
              className="w-full md:w-64 p-2 border border-gray-300 rounded-lg shadow-sm text-sm"
              disabled={isLoading || chapters.length === 0}
            >
              {chapters.map((chapter) => (
                <option key={chapter.chapter_id} value={chapter.chapter_id}>
                  {chapter.title}
                </option>
              ))}
            </select>
          </div>

          <h2 className="text-2xl font-semibold text-gray-700 mb-4">
            {selectedChapter?.title || "No chapter selected"}
          </h2>

          <div className="flex flex-col gap-4">
            <div className="relative mb-6">
              <video width="100%" controls className="rounded-lg shadow-lg">
                <source
                  src={selectedChapter?.trailer || selectedChapter?.finalvideo || "https://bedrock-video-generation-us-east-1-qvk1dv.s3.amazonaws.com/output.mp4"}
                  type="video/mp4"
                />
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        </div>

        {/* Right Column - Chat Panel */}
        <div className="w-96 bg-white shadow-lg p-6 flex flex-col justify-between">
          {/* Live Amazon Lex Chatbot */}
          <ChatBot />
          {/* </div> */}
        </div>
      </main>
    </MainLayout>
  );
};

export default InteractivePage;

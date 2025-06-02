"use client";

import { useEffect, useState } from "react";
//import { ReadersSidebar } from "@/components/dashboard/ReadersSidebar";
import { RecommendationSection } from "@/components/recommendations/recommendation-section";
import { SimilarBookCard } from "@/components/recommendations/similar-book-card";
import withRoleProtection from "@/components/auth/withRoleProtection";

import { Book } from '@/types/book';
import { fetchTrendingBooks, fetchCuratedRecommendations, fetchSimilarBooks } from '@/services/recommendationsService';
import { addBookToReadingList, fetchReadingLists, createReadingList } from '@/services/booksService';
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/readerLayout";
export default function RecommendationsPage() {
  const router = useRouter();

  // State for data from API
  const [topPicks, setTopPicks] = useState<Book[]>([]);
  const [librarianPicks, setLibrarianPicks] = useState<Book[]>([]);
  const [similarBooks, setSimilarBooks] = useState<Book[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState({
    topPicks: true,
    librarianPicks: true,
    similarBooks: true,
  });

  // Error states
  const [errors, setErrors] = useState({
    topPicks: false,
    librarianPicks: false,
    similarBooks: false,
  });

  // Fetch top picks from backend
  useEffect(() => {
    const getTopPicks = async () => {
      try {
        const books = await fetchTrendingBooks(10);
        // Map backend BookRecommendation to Book type for UI
        const mapped = books.map((b: any) => ({
          id: b.id || b.book_id || '',
          title: b.title || b.book_title || '',
          author: b.author || (b.authors && b.authors[0]) || '',
          coverImage: b.coverImage || b.book_cover || '/placeholder-book.jpg',
          genre: Array.isArray(b.genre) ? b.genre : (b.genre ? [b.genre] : []),
          readingLevel: b.readingLevel || b.reading_level,
          publicationYear: b.publicationYear || b.publication_year,
          rating: b.rating,
          description: b.description || b.summary || '',
        }));
        setTopPicks(mapped);
        setIsLoading((prev) => ({ ...prev, topPicks: false }));
      } catch (error) {
        console.error('Error fetching top picks:', error);
        setErrors((prev) => ({ ...prev, topPicks: true }));
        setIsLoading((prev) => ({ ...prev, topPicks: false }));
      }
    };
    getTopPicks();
  }, []);

  // Fetch librarian picks from backend
  useEffect(() => {
    const getLibrarianPicks = async () => {
      try {
        const books = await fetchCuratedRecommendations(10);
        const mapped = books.map((b: any) => ({
          id: b.id || b.book_id || '',
          title: b.title || b.book_title || '',
          author: b.author || (b.authors && b.authors[0]) || '',
          coverImage: b.coverImage || b.book_cover || '/placeholder-book.jpg',
          genre: Array.isArray(b.genre) ? b.genre : (b.genre ? [b.genre] : []),
          readingLevel: b.readingLevel || b.reading_level,
          publicationYear: b.publicationYear || b.publication_year,
          rating: b.rating,
          description: b.description || b.summary || '',
        }));
        setLibrarianPicks(mapped);
        setIsLoading((prev) => ({ ...prev, librarianPicks: false }));
      } catch (error) {
        console.error('Error fetching librarian picks:', error);
        setErrors((prev) => ({ ...prev, librarianPicks: true }));
        setIsLoading((prev) => ({ ...prev, librarianPicks: false }));
      }
    };
    getLibrarianPicks();
  }, []);

  // Fetch similar books from backend
  useEffect(() => {
    const getSimilarBooks = async () => {
      try {
        const bookId = topPicks[0]?.id;
        if (!bookId) return;
        const books = await fetchSimilarBooks(bookId, 5, false);
        const mapped = books.map((b: any) => ({
          id: b.id || b.book_id || '',
          title: b.title || b.book_title || '',
          author: b.author || (b.authors && b.authors[0]) || '',
          coverImage: b.coverImage || b.book_cover || '/placeholder-book.jpg',
          genre: Array.isArray(b.genre) ? b.genre : (b.genre ? [b.genre] : []),
          readingLevel: b.readingLevel || b.reading_level,
          publicationYear: b.publicationYear || b.publication_year,
          rating: b.rating,
          description: b.description || b.summary || '',
        }));
        setSimilarBooks(mapped);
        setIsLoading((prev) => ({ ...prev, similarBooks: false }));
      } catch (error) {
        console.error('Error fetching similar books:', error);
        setErrors((prev) => ({ ...prev, similarBooks: true }));
        setIsLoading((prev) => ({ ...prev, similarBooks: false }));
      }
    };
    if (!isLoading.topPicks && topPicks.length > 0) {
      getSimilarBooks();
    }
  }, [isLoading.topPicks, topPicks]);

  const [defaultListId, setDefaultListId] = useState<string>('');

  // Initialize default reading list
  useEffect(() => {
    const initializeReadingList = async () => {
      try {
        // Try to get existing reading lists
        const lists = await fetchReadingLists();
        if (lists && lists.length > 0) {
          // Use the first list as default
          setDefaultListId(lists[0].id);
        } else {
          // Create a new reading list if none exists
          const newList = await createReadingList('My Reading List');
          if (newList) {
            setDefaultListId(newList.id);
          }
        }
      } catch (error) {
        console.error('Error initializing reading list:', error);
      }
    };
    initializeReadingList();
  }, []);

  const handleAddToList = async (bookId: string) => {
    try {
      if (!defaultListId) {
        console.error("No reading list available");
        return;
      }
      const result = await addBookToReadingList(defaultListId, bookId);
      if (result) {
        setTopPicks((prev) => prev.filter((book) => book.id !== bookId));
      } else {
        console.error("Failed to add book to list");
      }
    } catch (error) {
      console.error("Error adding book to list:", error);
    }
  };

  return (
    <MainLayout activePage="Dashboard">
      <div className="bg-white p-6 rounded-lg shadow">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left Content */}
          <div className="flex-1">
            <h1 className="text-2xl font-medium mb-6">Recommendations</h1>

            <RecommendationSection
              title="Top Picks for You"
              description="Based on your reading list and interests"
              books={topPicks.map((b) => ({
                id: b.id,
                title: b.title,
                author: b.author,
                coverImage: b.coverImage || '/placeholder-book.jpg',
                genre: Array.isArray(b.genre) ? b.genre[0] : (b.genre || ''),
                rating: b.rating,
                description: b.description,
              }))}
              isLoading={isLoading.topPicks}
              error={errors.topPicks}
            />

            <RecommendationSection
              title="Recommended for you by Librarian"
              description="Books selected by librarian"
              books={librarianPicks.map((b) => ({
                id: b.id,
                title: b.title,
                author: b.author,
                coverImage: b.coverImage || '/placeholder-book.jpg',
                genre: Array.isArray(b.genre) ? b.genre[0] : (b.genre || ''),
                rating: b.rating,
                description: b.description,
              }))}
              isLoading={isLoading.librarianPicks}
              error={errors.librarianPicks}
            />
          </div>

          {/* Right Sidebar */}
          <div className="w-full lg:w-64">
            {isLoading.similarBooks ? (
              <div className="animate-pulse">
                <div className="h-5 bg-gray-200 rounded w-40 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="bg-gray-200 rounded-lg h-80 w-full"></div>
              </div>
            ) : errors.similarBooks ? (
              <div className="text-red-500 text-sm">
                Failed to load recommendations.
              </div>
            ) : similarBooks.length > 0 ? (
              <div>
                <h2 className="text-base font-medium mb-1">
                  Because You Liked
                </h2>
                <p className="text-sm text-gray-500 mb-3">&quot;The Red Pathways&quot;</p>

                <SimilarBookCard
                  book={{
                    ...similarBooks[0],
                    coverImage: similarBooks[0].coverImage || '/placeholder-book.jpg',
                    genre: Array.isArray(similarBooks[0].genre) ? similarBooks[0].genre : [similarBooks[0].genre || ''],
                  }}
                  onStartReading={() => router.push(`/bookdetail-reader`)}
                  onAddToList={() => handleAddToList(similarBooks[0].id)}
                />
              </div>
            ) : (
              <div className="text-gray-500 text-sm">
                No similar books found.
              </div>
            )}
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

"use client";

import { useEffect, useState } from "react";
//import { ReadersSidebar } from "@/components/dashboard/ReadersSidebar";
import { RecommendationSection } from "@/components/recommendations/recommendation-section";
import { SimilarBookCard } from "@/components/recommendations/similar-book-card";
import withRoleProtection from "@/components/auth/withRoleProtection";

import {
  fetchTopPicks,
  fetchLibrarianPicks,
  fetchBecauseYouLiked,
  addToReadingList,
  type Book,
} from "@/services/api";
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

  // Fetch top picks
  useEffect(() => {
    const getTopPicks = async () => {
      try {
        const books = await fetchTopPicks();
        setTopPicks(books);
        setIsLoading((prev) => ({ ...prev, topPicks: false }));
      } catch (error) {
        console.error("Error fetching top picks:", error);
        setErrors((prev) => ({ ...prev, topPicks: true }));
        setIsLoading((prev) => ({ ...prev, topPicks: false }));
      }
    };

    getTopPicks();
  }, []);

  // Fetch librarian picks
  useEffect(() => {
    const getLibrarianPicks = async () => {
      try {
        const books = await fetchLibrarianPicks();
        setLibrarianPicks(books);
        setIsLoading((prev) => ({ ...prev, librarianPicks: false }));
      } catch (error) {
        console.error("Error fetching librarian picks:", error);
        setErrors((prev) => ({ ...prev, librarianPicks: true }));
        setIsLoading((prev) => ({ ...prev, librarianPicks: false }));
      }
    };

    getLibrarianPicks();
  }, []);

  // Fetch similar books (based on "The Red Pathways")
  useEffect(() => {
    const getSimilarBooks = async () => {
      try {
        // Hardcoded to "The Red Pathways" for this example
        const books = await fetchBecauseYouLiked("1");
        setSimilarBooks(books);
        setIsLoading((prev) => ({ ...prev, similarBooks: false }));
      } catch (error) {
        console.error("Error fetching similar books:", error);
        setErrors((prev) => ({ ...prev, similarBooks: true }));
        setIsLoading((prev) => ({ ...prev, similarBooks: false }));
      }
    };

    getSimilarBooks();
  }, []);

  //  const handleStartReading = (bookId: string) => {
  //    router.push(`/reader/${bookId}`);
  //  };

  const handleAddToList = async (bookId: string) => {
    try {
      const result = await addToReadingList(bookId);
      if (result.success) {
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
              books={topPicks}
              isLoading={isLoading.topPicks}
              error={errors.topPicks}
            />

            <RecommendationSection
              title="Recommended for you by Librarian"
              description="Books selected by librarian"
              books={librarianPicks}
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
                  book={similarBooks[0]}
                  //onStartReading={() => handleStartReading(similarBooks[0].id)}
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

"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { CircularDeterminateProgressIndicator } from "@/components/dashboard/CircularDeterminateProgressIndicator";
import withRoleProtection from "@/components/auth/withRoleProtection";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MainLayout from "@/components/layout/readerLayout";
import { BookOpen, ChevronRight, ChevronLeft } from "lucide-react";
import { Book, InProgressBook } from '@/types/book';
import { fetchTrendingBooks } from '@/services/recommendationsService';
import { fetchRecommendedBooks, fetchReadingLists } from '@/services/booksService';

const ReaderDashboard: React.FC = () => {
  const [userName, setUserName] = useState("Reader");
  const router = useRouter();

  // State for API data
  const [topPicks, setTopPicks] = useState<Book[]>([]);
  const [inProgressBooks, setInProgressBooks] = useState<InProgressBook[]>([]);
  const [favorites, setFavorites] = useState<Book[]>([]);

  // Loading states
  const [isLoading, setIsLoading] = useState({
    topPicks: true,
    inProgress: true,
    favorites: true,
  });

  // Scroll state for book carousel
  const [scrollPosition, setScrollPosition] = useState(0);
  const scrollAmount = 300; // pixels to scroll

  useEffect(() => {
    // Get user data from Cognito
    const fetchUserData = async () => {
      try {
        const { getCurrentUser } = await import('@/lib/auth');
        const currentUser = await getCurrentUser();
        
        if (currentUser && currentUser.user) {
          const userAttributes = currentUser.user.attributes || {};
          
          // Use the name attribute if available, otherwise fall back to email
          if (userAttributes.name) {
            setUserName(userAttributes.name);
          } else if (userAttributes.email) {
            // Fallback to email if name is not available
            const name = userAttributes.email.split("@")[0];
            setUserName(name.charAt(0).toUpperCase() + name.slice(1));
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();

    // Fetch data from API
    const fetchData = async () => {
      try {
        const books = await fetchTrendingBooks(10);
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
        setIsLoading((prev) => ({ ...prev, topPicks: false }));
      }

      try {
        // In-progress: Use recommended books for demo (replace with real progress logic if available)
        const inProgress = await fetchRecommendedBooks(10);
        const mappedInProgress = inProgress.map((b: any) => ({
          id: b.id || b.book_id || '',
          title: b.title || b.book_title || '',
          author: b.author || (b.authors && b.authors[0]) || '',
          coverImage: b.coverImage || b.book_cover || '/placeholder-book.jpg',
          genre: Array.isArray(b.genre) ? b.genre : (b.genre ? [b.genre] : []),
          readingLevel: b.readingLevel || b.reading_level,
          publicationYear: b.publicationYear || b.publication_year,
          rating: b.rating,
          description: b.description || b.summary || '',
          progress: 0,
        }));
        setInProgressBooks(mappedInProgress);
        setIsLoading((prev) => ({ ...prev, inProgress: false }));
      } catch (error) {
        console.error('Error fetching in-progress books:', error);
        setIsLoading((prev) => ({ ...prev, inProgress: false }));
      }

      try {
        // Favorites: Use reading lists (flatten books from all lists)
        const lists = await fetchReadingLists();
        const allBooks = lists.flatMap(list => list.books || []);
        const mappedFavorites = allBooks.map((b: any) => ({
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
        setFavorites(mappedFavorites);
        setIsLoading((prev) => ({ ...prev, favorites: false }));
      } catch (error) {
        console.error('Error fetching favorites:', error);
        setIsLoading((prev) => ({ ...prev, favorites: false }));
      }
    };

    fetchData();
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    const container = document.getElementById("book-carousel");
    if (container) {
      const newPosition =
        direction === "left"
          ? Math.max(0, scrollPosition - scrollAmount)
          : scrollPosition + scrollAmount;

      container.scrollTo({
        left: newPosition,
        behavior: "smooth",
      });

      setScrollPosition(newPosition);
    }
  };

  const today = new Date();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = today.getMonth();

  return (
    <MainLayout activePage="Dashboard">
      <div className="bg-white p-6 rounded-lg shadow">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium mb-1">
            Happy Reading, {userName}!
          </h1>
          <p className="text-sm text-gray-600">
            Immerse yourself in your personal reading space and pick up where
            you left off.
          </p>
          <button
            className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition-colors duration-200"
            onClick={() => router.push("/topPicks")}
          >
            View Books
          </button>
        </div>

        {/* Top Picks section */}
        <div className="w-full mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Top Picks for You</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handleScroll("left")}
                className="p-1 rounded-full hover:bg-gray-100"
                aria-label="Scroll left"
              >
                <ChevronLeft className="h-5 w-5 text-gray-500" />
              </button>
              <button
                onClick={() => handleScroll("right")}
                className="p-1 rounded-full hover:bg-gray-100"
                aria-label="Scroll right"
              >
                <ChevronRight className="h-5 w-5 text-gray-500" />
              </button>
              <button
                className="text-gray-500 hover:text-gray-700 flex items-center ml-2"
                onClick={() => router.push("/topPicks")}
              >
                <span className="text-sm mr-1">View All</span>
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* Book carousel */}
          {isLoading.topPicks ? (
            <div className="flex gap-4 overflow-hidden">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex-shrink-0 w-36 animate-pulse">
                  <div className="aspect-[3/4] w-full bg-gray-200 rounded-md mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-24 mb-1"></div>
                  <div className="h-2 bg-gray-200 rounded w-20 mb-2"></div>
                  <div className="h-2 bg-gray-200 rounded w-16 mb-2"></div>
                  <div className="h-6 bg-gray-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div
              id="book-carousel"
              className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide"
              style={{ scrollBehavior: "smooth" }}
            >
              {topPicks.map((book) => (
                <div
                  key={book.id}
                  className="flex-shrink-0 w-50 bg-white rounded-md shadow-sm hover:shadow transition-shadow duration-200 overflow-hidden flex flex-col h-full"
                >
                  <div className="aspect-[3/4] w-full relative">
                    <Image
                      src={
                        book.coverImage ||
                        "/placeholder.svg?height=150&width=112"
                      }
                      width={150}
                      height={200}
                      alt={book.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-2 flex flex-col flex-grow">
                    <h3 className="font-medium text-xs mb-0.5 line-clamp-1">
                      {book.title}
                    </h3>
                    <p className="text-xs mb-1 text-gray-600 line-clamp-1">
                      {book.author}
                    </p>
                    <div className="flex items-center mb-2">
                      <span className="bg-gray-100 text-gray-700 text-[10px] px-1.5 py-0.5 rounded-full">
                        {book.genre}
                      </span>
                    </div>
                    <div className="mt-auto">
                      <button
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] rounded transition-colors duration-200"
                        onClick={() => router.push(`/reader/${book.id}` as any)}
                      >
                        Start Reading
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-8">
          {/* Continue Reading Section > My Picks */}
          <div className="lg:col-span-1 bg-white rounded-md shadow-sm p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-medium">Continue Reading</h2>
              <button className="text-gray-500 hover:text-gray-700">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              {isLoading.inProgress ? (
                <>
                  <div className="bg-gray-50 rounded p-2 flex items-start animate-pulse">
                    <div className="w-10 h-14 bg-gray-200 rounded"></div>
                    <div className="ml-2 flex-grow">
                      <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="w-full h-1 bg-gray-200 rounded-full mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                  <div className="bg-gray-50 rounded p-2 flex items-start animate-pulse">
                    <div className="w-10 h-14 bg-gray-200 rounded"></div>
                    <div className="ml-2 flex-grow">
                      <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                      <div className="w-full h-1 bg-gray-200 rounded-full mb-1"></div>
                      <div className="h-2 bg-gray-200 rounded w-16"></div>
                    </div>
                  </div>
                </>
              ) : inProgressBooks.length > 0 ? (
                inProgressBooks.map((book) => (
                  <div
                    key={book.id}
                    className="bg-gray-50 rounded p-2 flex items-start"
                  >
                    <div className="w-10 h-14 rounded overflow-hidden">
                      <Image
                        src={
                          book.coverImage ||
                          "/placeholder.svg?height=56&width=40"
                        }
                        width={40}
                        height={56}
                        alt={book.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <div className="ml-2 flex-grow">
                      <h3 className="text-xs font-medium mb-1">{book.title}</h3>
                      <div className="w-full h-1 bg-gray-200 rounded-full mb-1">
                        <div
                          className="h-1 bg-indigo-600 rounded-full"
                          style={{ width: `${book.progress}%` }}
                        />
                      </div>
                      <p className="text-xs text-gray-600">
                        {book.progress}% complete
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-sm text-gray-500">
                  No books in progress
                </div>
              )}
            </div>
          </div>

          {/* Bookmarks Section > Favorites*/}
          <div className="lg:col-span-1 bg-white rounded-md shadow-sm p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-medium">Bookmarks</h2>
              <button className="text-gray-500 hover:text-gray-700">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              {isLoading.favorites ? (
                <>
                  <div className="bg-gray-50 rounded p-2 animate-pulse">
                    <div className="h-3 bg-gray-200 rounded w-32 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4 mt-1"></div>
                  </div>
                  <div className="bg-gray-50 rounded p-2 animate-pulse">
                    <div className="h-3 bg-gray-200 rounded w-28 mb-2"></div>
                    <div className="h-2 bg-gray-200 rounded w-full"></div>
                    <div className="h-2 bg-gray-200 rounded w-2/3 mt-1"></div>
                  </div>
                </>
              ) : favorites.length > 0 ? (
                favorites.map((favorite) => (
                  <div key={favorite.id} className="bg-gray-50 rounded p-2">
                    <h3 className="text-xs font-medium mb-1">
                      {favorite.title}
                    </h3>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-sm text-gray-500">
                  No favorites yet
                </div>
              )}
            </div>
          </div>

          {/* Reading Goal Section > Discovery Goal */}
          <div className="lg:col-span-1 bg-white rounded-md shadow-sm p-4">
            <h2 className="text-base font-medium mb-3">
              {monthNames[month]} Reading Goal
            </h2>
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base font-medium">70%</span>
                </div>
                <CircularDeterminateProgressIndicator className="w-full h-full text-indigo-600" />
              </div>

              <div className="flex justify-between w-full">
                <div className="text-center">
                  <div className="text-sm font-medium">18</div>
                  <div className="text-xs text-gray-600">Books Viewed</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">8</div>
                  <div className="text-xs text-gray-600">Books Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">2</div>
                  <div className="text-xs text-gray-600">New Genres</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons at the bottom */}
        <div className="flex justify-end gap-4 mt-8">
          <button
            className="px-4 py-2 border border-[#E4E4E7] hover:bg-[#F4F4F5] text-gray-700 rounded"
            onClick={() => router.push("/browse-books")}
          >
            Browse More
          </button>
          <button
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded flex items-center gap-2"
            onClick={() => {
              if (inProgressBooks.length > 0) {
                router.push(`/reader/${inProgressBooks[0].id}` as any);
              }
            }}
          >
            <BookOpen className="h-4 w-4" />
            Continue Reading
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

// Protect this route - only readers can access it
export default withRoleProtection(ReaderDashboard, ["reader"]);

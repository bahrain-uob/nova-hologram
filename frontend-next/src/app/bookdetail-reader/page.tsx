"use client";

import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/readerLayout";
import withRoleProtection from "@/components/auth/withRoleProtection";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { PlayIcon, StarIcon } from "lucide-react";
import { API_ENDPOINTS } from "@/config/api-config";
import { Book } from "@/types/book";

// Extended BookDetails interface with all required properties
interface BookDetails extends Omit<Book, 'genre'> {
  summary: string;
  learningObjectives: string[];
  rating: number;
  reviews: number;
  language: string;
  cover: string;
  genres: string[];
  genre: string[];
  publisher: { name: string };
  publicationDate: string;
  pages: number;
  isbn: string;
  description: string;
}

const BookDetailPageReader: React.FC = () => {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('id');
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [bookDetails, setBookDetails] = useState<BookDetails | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!bookId) return;
      
      setIsLoading(true);
      setError(null);
      
      try {
        const response = await fetch(API_ENDPOINTS.getBook(bookId));
        
        if (!response.ok) {
          throw new Error(`Failed to fetch book: ${response.status}`);
        }
        
        const data = await response.json();
        setBookDetails(data);
      } catch (err) {
        console.error('Error fetching book details:', err);
        setError('Failed to load book details. Please try again later.');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBookDetails();
  }, [bookId]);
  
  const reviews = [
    {
      id: 1,
      name: "Michael Chen",
      avatar: "https://c.animaapp.com/m9wqaqhuGF8Qd0/img/img.png",
      rating: 5,
      text: "A magical journey that captivated me from start to finish. The world-building is simply extraordinary!",
    },
    {
      id: 2,
      name: "Sarah Williams",
      avatar: "https://c.animaapp.com/m9wqaqhuGF8Qd0/img/img-1.png",
      rating: 4,
      text: "Perfect introduction to the wizarding world. The characters are so well developed!",
    },
  ];

  const [userRating, setUserRating] = useState(0);
  const [showListModal, setShowListModal] = useState(false);
  const [bookLists, setBookLists] = useState(["2025 Books", "2024 Books"]);
  const [selectedList, setSelectedList] = useState("");
  const [creatingNewList, setCreatingNewList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [showDropdownIndex, setShowDropdownIndex] = useState<number | null>(null);
  const [showTrailer, setShowTrailer] = useState(false);

  if (isLoading) {
    return (
      <MainLayout activePage="Book Detail">
        <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
          <p className="text-lg">Loading book details...</p>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout activePage="Book Detail">
        <div className="min-h-screen bg-gray-50 py-8 flex flex-col items-center justify-center">
          <p className="text-lg text-red-500">{error}</p>
          <Button 
            onClick={() => router.push('/browse-books')} 
            className="mt-4 bg-[#4f46e5] hover:bg-[#4338ca] text-white"
          >
            Return to Browse Books
          </Button>
        </div>
      </MainLayout>
    );
  }

  // Fallback book details if API fails
  const fallbackBookDetails: BookDetails = {
    id: "1",
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    cover: "https://c.animaapp.com/m9wqaqhuGF8Qd0/img/img-2.png",
    summary: "Harry Potter has never been the star of a Quidditch team, scoring points while riding a broom far above the ground. He knows no spells, has never helped to hatch a dragon, and has never worn a cloak of invisibility. All he knows is a miserable life with the Dursleys, his horrible aunt and uncle, and their abominable son, Dudley — a great big swollen spoiled bully.",
    learningObjectives: [
      "Understand the hero's journey narrative structure",
      "Explore themes of friendship, courage, and self-discovery",
      "Analyze character development throughout the story",
      "Identify elements of fantasy literature and world-building"
    ],
    genres: ["Fantasy", "Young Adult", "Adventure"],
    genre: ["Fantasy", "Young Adult", "Adventure"],
    rating: 4.8,
    reviews: 2384,
    language: "English",
    description: "The first book in the Harry Potter series",
    publicationDate: "1997-06-26",
    publisher: { name: "Scholastic" },
    isbn: "9780590353427",
    pages: 309
  };
  
  const displayData = bookDetails || fallbackBookDetails;

  return (
    <MainLayout activePage="Book Detail">
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-6">
              <div className="flex flex-col md:flex-row gap-8">
                <div className="flex flex-col items-center space-y-4">
                  <div className="w-[300px] h-[450px] rounded-lg overflow-hidden shadow-lg">
                    <img
                      src={displayData.cover}
                      alt={displayData.title}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex flex-col gap-3 mt-3">
                    <Button className="w-full h-[45px] bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded">
                      Start Reading
                    </Button>

                    <Button
                      className="w-full h-[45px] bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded"
                      onClick={() => {
                        router.push("/Interactive-page");
                      }}
                    >
                      Chat with the Book
                    </Button>

                    <Button className="w-full h-[45px] bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded">
                      Characters Chat
                    </Button>

                    <Button
                      variant="outline"
                      onClick={() => setShowListModal(true)}
                      className="w-full h-[47px] text-[#4f46e5] border border-[#4f46e5] rounded hover:bg-[#4f46e5]/10"
                    >
                      Add to List
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col w-full md:w-[494px]">
                  <h1 className="text-2xl font-medium text-gray-800 mb-6">
                    {displayData.title}
                  </h1>
                  <div className="flex items-center mb-4">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map((_, index) => (
                        <StarIcon 
                          key={index} 
                          className="w-5 h-5 fill-yellow-400 text-yellow-400" 
                        />
                      ))}
                    </div>
                    <span className="ml-2 text-zinc-400 text-sm">
                      {displayData.rating} ({displayData.reviews} reviews)
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {displayData.genres.map((genre, index) => (
                      <Badge 
                        key={index} 
                        variant="secondary" 
                        className="bg-zinc-200 text-black rounded-full px-3 py-1 text-sm"
                      >
                        {genre}
                      </Badge>
                    ))}
                  </div>
                  <div className="mb-6 space-y-4">
                    <div className="flex items-center">
                      <span className="text-zinc-400 w-20">Author:</span>
                      <span className="text-black">{displayData.author}</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-zinc-400 w-24">Language:</span>
                      <span className="text-black">{displayData.language}</span>
                    </div>
                  </div>
                  <div className="mb-6">
                    <h2 className="text-lg font-medium text-gray-900 mb-3">Summary</h2>
                    <p className="text-zinc-700 text-sm">{displayData.summary}</p>
                  </div>
                  <div className="mb-10">
                    <h2 className="text-lg font-medium text-gray-900 mb-3">Learning Objectives</h2>
                    <ul className="space-y-3">
                      {displayData.learningObjectives.map((objective, index) => (
                        <li key={index} className="flex items-start">
                          <span className="text-zinc-700 text-sm">• {objective}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  {/* Trailer Section */}
                  <div className="mt-0">
                    <h2 className="text-lg font-medium text-gray-900 mb-3">Watch Book Trailer</h2>
                    <div className="relative w-full h-[202px] rounded overflow-hidden">
                      <div
                        className="w-full h-full bg-cover bg-center cursor-pointer"
                        style={{ backgroundImage: "url(https://c.animaapp.com/m9wqaqhuGF8Qd0/img/img-3.png)" }}
                        onClick={() => setShowTrailer(true)}
                      >
                        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center">
                          <PlayIcon className="w-5 h-5 ml-0.5" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Reviews Card */}
          <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-none mt-8">
            <CardContent className="p-6">
              <h2 className="text-lg font-medium text-gray-900 mb-4">Reviews</h2>
              <div className="flex items-center mb-2">
                <span className="text-2xl text-yellow-400">4.2</span>
                <div className="flex ml-2">
                  {[1, 2, 3, 4].map((i) => (
                    <StarIcon key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                  <StarIcon className="w-5 h-5 text-yellow-400 fill-none stroke-current" />
                </div>
              </div>
              <p className="text-sm text-zinc-400 mb-4">Based on 2,384 reviews</p>
              
              {/* Write a Review Section */}
              <div className="mb-8">
                <h3 className="text-base font-medium mb-3">Write a Review</h3>

                {/* Star Rating */}
                <div className="flex gap-1 mb-3 cursor-pointer">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <StarIcon
                      key={i}
                      className={`w-6 h-6 ${
                        i <= userRating
                          ? "text-yellow-400 fill-yellow-400"
                          : "text-gray-300 fill-none stroke-current"
                      }`}
                      onClick={() => setUserRating(i)}
                    />
                  ))}
                </div>

                {/* Review Text Area */}
                <textarea
                  className="w-full p-3 border border-[#E5E7EB] rounded-md text-sm mb-3"
                  rows={4}
                  placeholder="Write your review here..."
                ></textarea>

                <Button className="bg-[#4f46e5] hover:bg-[#4338ca] text-white">
                  Submit Review
                </Button>
              </div>

              {/* Existing Reviews */}
              <h3 className="text-base font-medium mb-3">Reader Reviews</h3>
              <ScrollArea className="h-[300px] pr-4">
                {reviews.map((review, index) => (
                  <div key={review.id} className="mb-4">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar>
                        <AvatarImage src={review.avatar} alt={review.name} />
                        <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{review.name}</p>
                        <div className="flex">
                          {[1, 2, 3, 4, 5].map((i) => (
                            <StarIcon
                              key={i}
                              className={`w-4 h-4 ${
                                i <= review.rating
                                  ? "text-yellow-400 fill-yellow-400"
                                  : "text-gray-300"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-zinc-700">{review.text}</p>
                    <br />
                    {index < reviews.length - 1 && (
                      <Separator className="my-4 border-t border-[#E5E7EB]" />
                    )}
                  </div>
                ))}
                <ScrollBar orientation="vertical" />
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Modal for Adding to List */}
      {showListModal && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center">
          <div className="bg-white w-[400px] rounded-xl p-6 shadow-lg relative">
            <button
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
              onClick={() => setShowListModal(false)}
            >
              ✕
            </button>

            <h2 className="text-lg font-semibold mb-4">Add to Your List</h2>
            <div className="space-y-3 mb-4">
              {bookLists.map((name, index) => (
                <div
                  key={index}
                  className="relative border border-[#E5E7EB] px-4 py-3 rounded-md flex items-center justify-between"
                >
                  <label className="flex items-center gap-3 w-full">
                    <input
                      type="radio"
                      name="booklist"
                      value={name}
                      checked={selectedList === name}
                      onChange={() => setSelectedList(name)}
                      className="accent-[#4f46e5]"
                    />
                    <span>{name}</span>
                  </label>
                  <div className="relative">
                    <button
                      onClick={() =>
                        setShowDropdownIndex(
                          showDropdownIndex === index ? null : index
                        )
                      }
                      className="text-gray-400 hover:text-gray-600"
                    >
                      •••
                    </button>
                    {showDropdownIndex === index && (
                      <div className="absolute right-0 top-full mt-1 bg-white border border-[#E5E7EB] rounded-md shadow-lg z-10 w-[120px]">
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100">
                          Rename
                        </button>
                        <button className="w-full text-left px-3 py-2 text-sm hover:bg-gray-100 text-red-500">
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mb-6">
              <button
                onClick={() => setCreatingNewList(true)}
                className="text-[#4f46e5] text-sm flex items-center gap-1"
              >
                + Create a new list
              </button>

              {creatingNewList && (
                <div className="mt-3">
                  <input
                    type="text"
                    value={newListName}
                    onChange={(e) => setNewListName(e.target.value)}
                    placeholder="Enter list name"
                    className="w-full p-2 border border-[#E5E7EB] rounded-md text-sm mb-2"
                  />
                </div>
              )}
            </div>

            <div className="flex gap-3">
              <Button
                className="flex-1 bg-[#4f46e5] hover:bg-[#4338ca] text-white"
                onClick={() => {
                  if (creatingNewList && newListName.trim() === "") {
                    alert("List name can't be empty.");
                    return;
                  }
                  if (creatingNewList && newListName.trim() !== "") {
                    setBookLists([...bookLists, newListName.trim()]);
                    setSelectedList(newListName.trim());
                  }
                  setCreatingNewList(false);
                  setNewListName("");
                  setShowListModal(false);
                  alert("Book added to list: " + (selectedList || newListName));
                }}
              >
                Confirm
              </Button>
              <Button
                variant="outline"
                className="flex-1 border border-[#E5E7EB]"
                onClick={() => setShowListModal(false)}
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Modal for Trailer */}
      {showTrailer && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl overflow-hidden shadow-lg w-full max-w-3xl relative">
            {/* Close button */}
            <button
              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
              onClick={() => setShowTrailer(false)}
            >
              ✕
            </button>

            {/* Title */}
            <div className="px-6 py-4">
              <h3 className="text-xl font-semibold mb-1">Harry Potter and the Sorcerer Stone – Book Trailer</h3>
              <p className="text-gray-500 text-sm">Experience the magic in 1 minutes</p>
            </div>

            {/* Video */}
            <video
              src="https://storagestack-genvideosb3836295-cgsm7lv3g2uy.s3.us-east-1.amazonaws.com/upload/3yzf547ib4ed/output.mp4"
              controls
              className="w-full h-[400px] object-cover"
              autoPlay
            ></video>
          </div>
        </div>
      )}
    </MainLayout>
  );
};

// Protect this route - only readers and librarians can access it
export default withRoleProtection(BookDetailPageReader, ["reader", "librarian"]);

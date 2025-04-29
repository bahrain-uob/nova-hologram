"use client";

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

function BookDetailPageReader() {
  const searchParams = useSearchParams();
  const bookId = searchParams.get('id');
  
  // In a real app, you would fetch book details based on bookId
  // For now, we'll use mock data
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    if (bookId) {
      // Here you would fetch the book details using the bookId
      console.log(`Fetching details for book ID: ${bookId}`);
      // setIsLoading(true);
      // fetchBookDetails(bookId).then(data => {
      //   setBookDetails(data);
      //   setIsLoading(false);
      // });
    }
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

  const bookDetails = {
    title: "Harry Potter and the Sorcerer's Stone",
    rating: 4.9,
    reviews: "2.3k",
    author: "J.K. Rowling",
    language: "English",
    genres: ["Fantasy", "Adventure", "Magic", "Coming-of-Age"],
    summary:
      "Harry Potter's life changes forever when he receives a letter that tells him the truth about himself: he's a wizard. Now he must forge his way through the magical world, learning spells, making friends, and ultimately confronting the dark wizard who killed his parents.",
    learningObjectives: [
      "Explore character development and growth",
      "Understand themes of friendship and bravery",
      "Analyze the hero's journey narrative structure",
      "Examine the role of choice and destiny",
    ],

  };
  const [userRating, setUserRating] = React.useState(0);
  const [showListModal, setShowListModal] = React.useState(false);
  const [bookLists, setBookLists] = React.useState(["2025 Books", "2024 Books"]);
  const [selectedList, setSelectedList] = React.useState("");
  const [creatingNewList, setCreatingNewList] = React.useState(false);
  const [newListName, setNewListName] = React.useState("");
  const [showDropdownIndex, setShowDropdownIndex] = React.useState<number | null>(null);
  const [showTrailer, setShowTrailer] = React.useState(false);


  return (
    <MainLayout activePage="Browse Books">
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
          <div>
            <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-none">
              <CardContent className="p-8">
                <div className="flex flex-col md:flex-row gap-8">
                  <div className="flex flex-col w-full md:w-[273px] gap-3">
                    <div
                      className="w-full h-[409px] rounded-md bg-cover bg-center"
                      style={{ backgroundImage: "url(https://c.animaapp.com/m9wqaqhuGF8Qd0/img/img-2.png)" }}
                    />
                    <div className="flex flex-col gap-3 mt-3">
                      <Button className="w-full h-[45px] bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded">
                        Start Reading
                      </Button>

                      <Button className="w-full h-[45px] bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded">
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
                      {bookDetails.title}
                    </h1>
                    <div className="flex items-center mb-4">
                      <div className="flex">
                        {[1, 2, 3, 4].map((_, index) => (
                          <StarIcon key={index} className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                        ))}
                        <StarIcon className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                      </div>
                      <span className="ml-2 text-zinc-400 text-sm">
                        {bookDetails.rating} ({bookDetails.reviews} reviews)
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {bookDetails.genres.map((genre, index) => (
                        <Badge key={index} variant="secondary" className="bg-zinc-200 text-black rounded-full px-3 py-1 text-sm">
                          {genre}
                        </Badge>
                      ))}
                    </div>
                    <div className="mb-6 space-y-4">
                      <div className="flex items-center">
                        <span className="text-zinc-400 w-20">Author:</span>
                        <span className="text-black">{bookDetails.author}</span>
                      </div>
                      <div className="flex items-center">
                        <span className="text-zinc-400 w-24">Language:</span>
                        <span className="text-black">{bookDetails.language}</span>
                      </div>
                    </div>
                    <div className="mb-6">
                      <h2 className="text-lg font-medium text-gray-900 mb-3">Summary</h2>
                      <p className="text-zinc-700 text-sm">{bookDetails.summary}</p>
                    </div>
                    <div className="mb-10">
                      <h2 className="text-lg font-medium text-gray-900 mb-3">Learning Objectives</h2>
                      <ul className="space-y-3">
                        {bookDetails.learningObjectives.map((objective, index) => (
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
                          onClick={() => setShowTrailer(true)} // 👈 open the trailer modal
                        >
                          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white/80 rounded-full flex items-center justify-center">
                            <PlayIcon className="w-5 h-5 ml-0.5" />
                          </div>
                        </div>
                      </div>
                    </div>

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
                            autoPlay
                            className="w-full h-[400px] object-cover"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="h-full">
            <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-none h-full flex flex-col">

              <CardContent className="p-6 flex flex-col h-full">
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
                <br></br>
                {/* Write a Review Section */}
                <div className="mb-8">
                  <h3 className="text-base font-medium mb-3">Write a Review</h3>

                  {/* Star Rating (static for now) */}
                  <div className="flex gap-1 mb-3 cursor-pointer">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <StarIcon
                        key={i}
                        onClick={() => setUserRating(i)}
                        className={`w-6 h-6 ${i <= userRating ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                          } transition-colors duration-150`}
                      />
                    ))}
                  </div>


                  {/* Text Area */}
                  <textarea
                    className="w-full min-h-[120px] p-3 border border-gray-300 rounded-md text-sm placeholder:text-[#adaebc] focus:outline-none focus:ring focus:ring-indigo-200"
                    placeholder="Share your thoughts..."
                  />

                  {/* Submit Button */}
                  <Button className="w-full mt-3 bg-[#4f46e5] hover:bg-[#4338ca] text-white">
                    Submit Review
                  </Button>
                </div>

                <ScrollArea className="flex-1 pr-4">
                  {reviews.map((review, index) => (
                    <div key={review.id} className="mb-6">
                      <div className="flex items-start mb-3">
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={review.avatar} alt={review.name} />
                          <AvatarFallback>{review.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div className="ml-4">
                          <p className="text-sm font-medium text-gray-800">{review.name}</p>
                          <div className="flex mt-1">
                            {[...Array(5)].map((_, i) => (
                              <StarIcon
                                key={i}
                                className={`w-4 h-4 ${i < review.rating
                                    ? "text-yellow-400 fill-yellow-400"
                                    : "text-gray-300"
                                  }`}
                              />
                            ))}
                          </div>
                        </div>
                      </div>
                      <p className="text-sm text-zinc-700">{review.text}</p>
                      <br></br>
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
      </div>
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
                        setShowDropdownIndex((prev) => (prev === index ? null : index))
                      }
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <circle cx="5" cy="12" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="19" cy="12" r="1.5" />
                      </svg>
                    </button>
                    {showDropdownIndex === index && (
                      <div className="absolute right-0 mt-2 w-24 bg-white border border-gray-200 shadow rounded z-50">
                        <button
                          onClick={() => {
                            const updated = bookLists.filter((_, i) => i !== index);
                            setBookLists(updated);
                            if (selectedList === name) setSelectedList("");
                            setShowDropdownIndex(null);
                          }}
                          className="w-full text-left px-3 py-2 text-sm text-red-500 hover:bg-red-50"
                        >
                          Delete
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}


              {creatingNewList && (
                <input
                  type="text"
                  value={newListName}
                  onChange={(e) => setNewListName(e.target.value)}
                  placeholder="New list name"
                  className="w-full px-4 py-3 border border-[#E5E7EB] rounded-md focus:outline-none focus:ring text-sm"
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && newListName.trim()) {
                      e.preventDefault();
                      setBookLists((prev) => [...prev, newListName.trim()]);
                      setSelectedList(newListName.trim());
                      setNewListName("");
                      setCreatingNewList(false);
                    }
                    if (e.key === "Escape" || (e.key === "Enter" && newListName.trim() === "")) {
                      setNewListName("");
                      setCreatingNewList(false);
                    }
                  }}
                  onBlur={() => {
                    if (newListName.trim()) {
                      setBookLists((prev) => [...prev, newListName.trim()]);
                      setSelectedList(newListName.trim());
                    }
                    setNewListName("");
                    setCreatingNewList(false);
                  }}
                />
              )}

              <button
                className="w-full border border-[#E5E7EB] text-[#4f46e5] px-4 py-3 rounded-md flex items-center justify-center gap-2"
                onClick={() => setCreatingNewList(true)}
              >
                <span className="text-lg font-semibold">+</span> Create New List
              </button>


            </div>

            <div className="flex gap-2">
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


    </MainLayout>
  );
}

// Protect this route - only readers can access it
export default withRoleProtection(BookDetailPageReader, ["reader"]);

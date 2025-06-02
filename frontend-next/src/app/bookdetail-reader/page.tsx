"use client";

import { useRouter } from "next/navigation";
import type React from "react";
import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import MainLayout from "@/components/layout/readerLayout";
import withRoleProtection from "@/components/auth/withRoleProtection";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { PlayIcon } from "lucide-react";
import type { Book, BookTrailer } from "@/types/book";
import ReviewSection from "@/components/ReviewSection";

const BookDetailPageReader: React.FC = () => {
  const searchParams = useSearchParams();
  const bookId = searchParams.get("bookid");
  const router = useRouter();

  const [book, setBook] = useState<Book | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [trailer, setTrailer] = useState<BookTrailer | null>(null);
  const [showListModal, setShowListModal] = useState(false);
  const [bookLists, setBookLists] = useState(["2025 Books", "2024 Books"]);
  const [selectedList, setSelectedList] = useState("");
  const [creatingNewList, setCreatingNewList] = useState(false);
  const [newListName, setNewListName] = useState("");
  const [showDropdownIndex, setShowDropdownIndex] = useState<number | null>(
    null
  );
  const [showTrailer, setShowTrailer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // User info - in a real app, this would come from authentication context
  const currentUserId = "user123"; // Replace with actual user ID from auth
  const currentUserName = "John Doe"; // Replace with actual user name from auth

  useEffect(() => {
    if (bookId) {
      const fetchBookDetails = async () => {
        setIsLoading(true);
        try {
          const response = await fetch(`/api/books/${bookId}`);
          const data = await response.json();

          if (response.ok) {
            setBook(data.book);
            setSummary(data.book.summary || "");
            setTrailer({
              trailer_id: data.book.trailer_id ?? "",
              book_id: data.book.book_id ?? "",
              video_path: data.book.trailer ?? "",
            });
          } else {
            console.error("Failed to fetch book:", data.error);
          }
        } catch (error) {
          console.error("Error fetching book details:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchBookDetails();
    }
  }, [bookId]);

  return (
    <MainLayout activePage="Browse Books">
      {isLoading && (
        <div className="flex flex-col items-center justify-center h-screen gap-3">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-500 border-t-transparent" />
          <p className="text-gray-500">Loading book details...</p>
        </div>
      )}

      {!isLoading && !book && (
        <div className="flex items-center justify-center h-screen">
          <p className="text-gray-500">Book not found.</p>
        </div>
      )}

      {!isLoading && book && (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 xl:grid-cols-[1fr_400px] gap-6">
            <div>
              <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-none">
                <CardContent className="p-8">
                  <div className="flex flex-col md:flex-row gap-8">
                    <div className="flex flex-col w-full md:w-[273px] gap-3">
                      <div
                        className="w-full h-[409px] rounded-md bg-cover bg-center"
                        style={{ backgroundImage: `url(${book?.cover})` }}
                      />
                      <div className="flex flex-col gap-3 mt-3">
                        <Button className="w-full h-[45px] bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded">
                          Start Reading
                        </Button>

                        <Button
                          className="w-full h-[45px] bg-[#4f46e5] hover:bg-[#4338ca] text-white rounded"
                          onClick={() => {
                            router.push(`/Interactive-page?bookid=${bookId}`);
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
                        {book?.title}
                      </h1>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {(Array.isArray(book?.genre)
                          ? book?.genre
                          : typeof book?.genre === "string"
                          ? [book?.genre]
                          : []
                        ).map((genre, index) => (
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
                          <span className="text-black">
                            {Array.isArray(book?.authors)
                              ? book.authors[0]
                              : typeof book?.authors === "string"
                              ? book.authors
                              : ""}
                          </span>
                        </div>
                        <div className="flex items-center">
                          <span className="text-zinc-400 w-24">Language:</span>
                          <span className="text-black">{book?.language}</span>
                        </div>
                      </div>

                      <div className="mb-6">
                        <h2 className="text-lg font-medium text-gray-900 mb-3">
                          Summary
                        </h2>
                        <p className="text-zinc-700 text-sm">{summary}</p>
                      </div>

                      <div className="mb-10">
                        <h2 className="text-lg font-medium text-gray-900 mb-3">
                          Learning Objectives
                        </h2>
                        <ul className="space-y-3">
                          {book?.objectives?.map((obj, index) => (
                            <li key={index} className="flex items-start">
                              <span className="text-zinc-700 text-sm">
                                • {obj.text}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Trailer Section */}
                      <div className="mt-0">
                        <h2 className="text-lg font-medium text-gray-900 mb-3">
                          Watch Book Trailer
                        </h2>
                        <div className="relative w-full h-[202px] rounded overflow-hidden">
                          <div
                            className="w-full h-full bg-cover bg-center cursor-pointer"
                            style={{ backgroundImage: `url(${book?.cover})` }}
                            onClick={() => setShowTrailer(true)}
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
                            <button
                              className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
                              onClick={() => setShowTrailer(false)}
                            >
                              ✕
                            </button>

                            <div className="px-6 py-4">
                              <h3 className="text-xl font-semibold mb-1">
                                {book?.title} – Book Trailer
                              </h3>
                              <p className="text-gray-500 text-sm">
                                Experience the magic in 1 minutes
                              </p>
                            </div>

                            {trailer?.video_path ? (
                              <video
                                src={trailer.video_path}
                                controls
                                autoPlay
                                className="w-full h-[400px] object-cover"
                              />
                            ) : (
                              <div className="p-4 text-center text-zinc-500 text-sm">
                                No trailer available for this book.
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Reviews Section - Updated to use new ReviewSection component */}
            <div className="h-full">
              <Card className="bg-white border border-[#E5E7EB] rounded-xl shadow-none h-full flex flex-col">
                <CardContent className="p-6 flex flex-col h-full">
                  {bookId && <ReviewSection bookId={bookId} />}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}

      {/* Add to List Modal - keeping your existing modal code */}
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
                        setShowDropdownIndex((prev) =>
                          prev === index ? null : index
                        )
                      }
                      className="p-1 rounded hover:bg-gray-100"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <circle cx="5" cy="12" r="1.5" />
                        <circle cx="12" cy="12" r="1.5" />
                        <circle cx="19" cy="12" r="1.5" />
                      </svg>
                    </button>
                    {showDropdownIndex === index && (
                      <div className="absolute right-0 mt-2 w-24 bg-white border border-gray-200 shadow rounded z-50">
                        <button
                          onClick={() => {
                            const updated = bookLists.filter(
                              (_, i) => i !== index
                            );
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
                    if (
                      e.key === "Escape" ||
                      (e.key === "Enter" && newListName.trim() === "")
                    ) {
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
};

export default withRoleProtection(BookDetailPageReader, ["reader"]);

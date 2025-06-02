"use client";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import React, { Suspense, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

// Client component that uses useSearchParams
function VideosGeneratedContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get("bookId");

  const [loading, setLoading] = useState(true);
  const [bookData, setBookData] = useState(null);

  useEffect(() => {
    if (!bookId) return;

    const fetchData = async () => {
      try {
        if (!bookId) return;
        const data = await import('@/services/libraryService').then(mod => mod.getBookById(bookId));
        setBookData(data);
      } catch (err) {
        console.error("Error fetching book data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [bookId]);

  const isAddBookEnabled = !loading &&
    (
      (bookData?.book?.trailer_status === "completed" && bookData?.book?.trailer) ||
      bookData?.book?.trailer_status === "failed"
    ) &&
    (
      !bookData?.chapters?.length ||
      bookData.chapters.every(ch =>
        (ch.trailer_status === "completed" && ch.trailer) || ch.trailer_status === "failed"
      )
    );


  const Spinner = ({ text = "Generating..." }) => (
    <div className="flex items-center gap-2 text-gray-500 text-sm">
      {text}
      <svg
        className="animate-spin h-4 w-4 text-gray-500"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v8z"
        />
      </svg>
    </div>

  );



  return (
    <MainLayout activePage="Manage Books">
      <div className="flex-1 overflow-auto p-6 bg-[#FAFAFB]">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Book Summary & Trailer */}
          <Card className="shadow-none border border-gray-200 rounded-xl bg-white">
            <CardContent className="p-0 space-y-6">
              <div className="flex justify-between items-center p-5 pb-0">
                <h2 className="text-lg font-medium">Book Summary</h2>
              </div>

              <div className="px-5">
                <div className="border border-gray-200 rounded-md min-h-24 p-4 bg-white text-sm">
                  {loading || !bookData?.book?.summary
                    ? <Spinner text="Generating summary..." />
                    : bookData.book.summary}
                </div>

              </div>

              <div className="flex justify-between items-center px-5 pt-4">
                <h2 className="text-lg font-medium">Book Trailer</h2>
              </div>

              <div className="px-5 pb-5">
                <div className="flex items-center justify-center">
                  {loading ? (
                    <Spinner text="Generating trailer..." />
                  ) : bookData?.book?.trailer_status === "completed" ? (
                    bookData.book.trailer ? (
                      <video controls className="rounded-md w-full max-w-4xl aspect-video">
                        <source src={bookData.book.trailer} type="video/mp4" />
                      </video>
                    ) : (
                      <Spinner text="Final video being prepared..." />
                    )
                  ) : bookData?.book?.trailer_status === "failed" ? (
                    <p className="text-red-500">Trailer generation failed.</p>
                  ) : (
                    <Spinner text="Generating trailer..." />
                  )}


                </div>
              </div>
            </CardContent>
          </Card>

          {/* Chapter-wise */}
          <Card className="shadow-none border border-gray-200 rounded-xl bg-white">
            <CardContent className="p-0">
              <div className="px-5 pt-5">
                <h2 className="text-lg font-semibold">Chapter-wise</h2>
              </div>

              {loading ? (
                <p className="text-sm px-5 py-5">Loading chapters...</p>
              ) : bookData?.chapters?.length ? (
                [...bookData.chapters]
                  .sort((a, b) => a.chapter_no - b.chapter_no)
                  .map((chapter, index) => {
                    const trailerStatus = chapter.trailer_status;
                    return (
                      <div
                        key={chapter.chapter_id}
                        className="px-5 mt-12 pb-8 space-y-4"
                      >
                        <h3 className="text-base font-medium">Ch{chapter.chapter_no} Summary</h3>

                        <div className="border border-gray-200 rounded-md min-h-24 p-4 bg-white text-sm">
                          {chapter.summary?.length > 0
                            ? chapter.summary
                            : "Generating summary..."}
                        </div>

                        <h3 className="text-base font-medium pt-4">Ch{chapter.chapter_no} Trailer</h3>

                        <div className="flex items-center justify-center">
                          {trailerStatus === "completed" ? (
                            chapter.trailer ? (
                              <video
                                controls
                                className="rounded-md w-full max-w-4xl aspect-video"
                              >
                                <source src={chapter.trailer} type="video/mp4" />
                              </video>
                            ) : (
                              <Spinner text="Final video being prepared..." />
                            )
                          ) : trailerStatus === "failed" ? (
                            <p className="text-red-500">Trailer failed to generate.</p>
                          ) : (
                            <Spinner text="Generating trailer..." />
                          )}

                        </div>
                      </div>
                    );
                  })
              ) : (
                <p className="text-sm px-5 pb-5">No chapters available.</p>
              )}
            </CardContent>
          </Card>

          {/* Bottom Buttons */}
          <div className="flex justify-end gap-3 pt-6">
            <Button
              variant="outline"
              disabled={!isAddBookEnabled}
              className="rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors disabled:opacity-50"
              onClick={async () => {
                const confirmed = confirm("Are you sure you want to delete this book?");
                if (!confirmed || !bookId) return;

                try {
                  const res = await fetch("https://0wx717uz2c.execute-api.us-east-1.amazonaws.com/delete-book", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ bookId }),
                  });

                  if (!res.ok) {
                    const errData = await res.json();
                    throw new Error(errData?.error || "Unknown error");
                  }

                  alert("Book deleted successfully.");
                  router.push("/manage-book");
                } catch (err) {
                  console.error("Delete failed:", err);
                  alert("Failed to delete book. Please try again.");
                }
              }}
            >
              Cancel
            </Button>


            <Button
              disabled={!isAddBookEnabled}
              className={`rounded-lg text-white ${isAddBookEnabled
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-gray-300 cursor-not-allowed"
                }`}
              onClick={() => {
                if (isAddBookEnabled) {
                  router.push("/manage-book");
                }
              }}
            >
              Add Book
            </Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

// Wrapper component with Suspense boundary
export default function VideosGeneratedPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VideosGeneratedContent />
    </Suspense>
  );
}
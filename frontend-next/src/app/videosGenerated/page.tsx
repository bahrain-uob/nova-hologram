"use client";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";

export default function VideosGeneratedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get("bookId");

  const [loading, setLoading] = useState(true);
  const [bookData, setBookData] = useState(null);

  useEffect(() => {
    if (!bookId) return;

    const fetchData = async () => {
      try {
        const res = await fetch(
          `https://1rvx3jdou7.execute-api.us-east-1.amazonaws.com/get-book/${bookId}`
        );
        const data = await res.json();
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

  // ✅ Logic to check if Add Book button should be enabled
  const isAddBookEnabled = !loading && (
    // Case 1: No chapters — still allow
    !bookData?.chapters?.length ||
  
    // Case 2: Chapters exist and all are in final state
    bookData.chapters.every((ch) =>
      ch.trailer_status === "completed" || ch.trailer_status === "failed"
    )
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
                  {loading
                    ? "Generating summary..."
                    : bookData?.book?.summary || "Generating summary..."}
                </div>
              </div>

              <div className="flex justify-between items-center px-5 pt-4">
                <h2 className="text-lg font-medium">Book Trailer</h2>
              </div>

              <div className="px-5 pb-5">
                <div className="flex items-center justify-center">
                  {loading ? (
                    <p className="text-gray-400">Generating trailer...</p>
                  ) : bookData?.book?.trailer_status === "completed" ? (
                    <video
                      controls
                      className="rounded-md w-full max-w-4xl aspect-video"
                    >
                      <source src={bookData.book.trailer} type="video/mp4" />
                    </video>
                  ) : bookData?.book?.trailer_status === "failed" ? (
                    <p className="text-red-500">Trailer generation failed.</p>
                  ) : (
                    <p className="text-gray-400">Generating trailer...</p>
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
                bookData.chapters.map((chapter, index) => {
                  const trailerStatus = chapter.trailer_status;
                  return (
                    <div
                      key={chapter.chapter_id}
                      className="px-5 mt-12 pb-8 space-y-4"
                    >
                      <h3 className="text-base font-medium">Ch{index + 1} Summary</h3>

                      <div className="border border-gray-200 rounded-md min-h-24 p-4 bg-white text-sm">
                        {chapter.summary?.length > 0
                          ? chapter.summary
                          : "Generating summary..."}
                      </div>

                      <h3 className="text-base font-medium pt-4">Ch{index + 1} Trailer</h3>

                      <div className="flex items-center justify-center">
                        {trailerStatus === "completed" && chapter.trailer ? (
                          <video
                            controls
                            className="rounded-md w-full max-w-4xl aspect-video"
                          >
                            <source src={chapter.trailer} type="video/mp4" />
                          </video>
                        ) : trailerStatus === "failed" ? (
                          <p className="text-red-500">Trailer failed to generate.</p>
                        ) : (
                          <p className="text-gray-400">Generating trailer...</p>
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
              className="rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
              onClick={() => router.push("/addbook")}
            >
              Cancel
            </Button>
            <Button
              disabled={!isAddBookEnabled}
              className={`rounded-lg text-white ${
                isAddBookEnabled
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

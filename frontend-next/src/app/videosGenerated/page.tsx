"use client";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import { getBookById } from "@/services/libraryService";
import { getBookVideoStatus, generateBookVideo, BookVideoStatus } from "@/services/videoService";

// Spinner component for loading states
const Spinner = ({ text = "Loading..." }: { text?: string }) => (
  <div className="flex items-center justify-center space-x-2">
    <div className="animate-spin h-5 w-5 border-2 border-primary border-t-transparent rounded-full"></div>
    <span>{text}</span>
  </div>
);

function VideosGeneratedPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const bookId = searchParams.get("bookId");

  const [loading, setLoading] = useState(true);
  const [book, setBook] = useState<any>(null);
  const [videoStatus, setVideoStatus] = useState<BookVideoStatus | null>(null);

  // Check if all videos are ready or failed, enabling the "Add to Library" button
  const isAddBookEnabled = !loading &&
    videoStatus !== null &&
    ((videoStatus.book.trailer_status === "completed" && videoStatus.book.trailer) ||
      videoStatus.book.trailer_status === "failed") &&
    (!videoStatus.chapters?.length ||
      videoStatus.chapters.every(ch =>
        (ch.trailer_status === "completed" && ch.trailer) || ch.trailer_status === "failed"
      ));

  // Handler for regenerating videos
  const handleRegenerateVideos = async () => {
    if (!bookId) return;
    
    try {
      const success = await generateBookVideo(bookId);
      if (success) {
        // Refresh the data after triggering regeneration
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      }
    } catch (err) {
      console.error("Error regenerating videos:", err);
    }
  };

  // Fetch book data and video status
  useEffect(() => {
    if (!bookId) return;

    const fetchData = async () => {
      try {
        // Fetch book details
        const bookData = await getBookById(bookId);
        if (bookData) {
          setBook(bookData);
        }
        
        // Fetch video generation status
        const status = await getBookVideoStatus(bookId);
        if (status) {
          setVideoStatus(status);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    // Poll for updates every 10 seconds
    const interval = setInterval(fetchData, 10000);
    return () => clearInterval(interval);
  }, [bookId]);

  return (
    <MainLayout activePage="Manage Books">
      <div className="container mx-auto py-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {loading ? (
            <div className="text-center py-10">
              <div className="animate-spin h-10 w-10 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
              <p>Loading book data...</p>
            </div>
          ) : book ? (
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-2xl font-bold mb-4">{book.book_title}</h2>
                  <p className="text-gray-600 mb-2">
                    <span className="font-semibold">Author:</span>{" "}
                    {Array.isArray(book.authors)
                      ? book.authors.join(", ")
                      : book.authors}
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="mb-6">
                    <h3 className="text-xl font-semibold mb-4">Book Trailer</h3>
                    {!videoStatus ? (
                      <Spinner text="Loading video status..." />
                    ) : videoStatus.book.trailer_status === "pending" ? (
                      <div className="bg-yellow-50 p-4 rounded-md">
                        <p>Trailer generation is pending. Please check back later.</p>
                      </div>
                    ) : videoStatus.book.trailer_status === "processing" ? (
                      <div className="bg-blue-50 p-4 rounded-md">
                        <div className="flex items-center">
                          <div className="animate-spin h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                          <p>Trailer is being generated. This may take a few minutes.</p>
                        </div>
                      </div>
                    ) : videoStatus.book.trailer_status === "completed" && videoStatus.book.trailer ? (
                      <div className="bg-green-50 p-4 rounded-md">
                        <p className="mb-2 text-green-700">Trailer generated successfully!</p>
                        <div className="aspect-video rounded-lg overflow-hidden bg-black">
                          <video
                            controls
                            className="w-full h-full"
                            src={videoStatus.book.trailer}
                          ></video>
                        </div>
                      </div>
                    ) : (
                      <div className="bg-red-50 p-4 rounded-md">
                        <p className="text-red-700 mb-2">
                          Trailer generation failed. You can try regenerating the videos.
                        </p>
                        <Button 
                          variant="secondary" 
                          onClick={handleRegenerateVideos}
                          className="mt-2"
                        >
                          Regenerate Videos
                        </Button>
                      </div>
                    )}
                  </div>

                  {videoStatus?.chapters && videoStatus.chapters.length > 0 && (
                    <div className="mt-8">
                      <h3 className="text-xl font-semibold mb-4">Chapter Trailers</h3>
                      <div className="space-y-6">
                        {videoStatus.chapters.map((chapter, index) => (
                          <div key={chapter.chapter_id} className="border rounded-lg p-4">
                            <h4 className="font-semibold mb-2">{chapter.title || `Chapter ${index + 1}`}</h4>
                            
                            {chapter.trailer_status === "pending" ? (
                              <div className="bg-yellow-50 p-3 rounded-md">
                                <p>Trailer generation is pending.</p>
                              </div>
                            ) : chapter.trailer_status === "processing" ? (
                              <div className="bg-blue-50 p-3 rounded-md">
                                <div className="flex items-center">
                                  <div className="animate-spin h-4 w-4 border-2 border-blue-500 border-t-transparent rounded-full mr-2"></div>
                                  <p>Trailer is being generated.</p>
                                </div>
                              </div>
                            ) : chapter.trailer_status === "completed" && chapter.trailer ? (
                              <div className="bg-green-50 p-3 rounded-md">
                                <p className="mb-2 text-green-700 text-sm">
                                  Trailer generated successfully!
                                </p>
                                <div className="aspect-video rounded-lg overflow-hidden bg-black">
                                  <video
                                    controls
                                    className="w-full h-full"
                                    src={chapter.trailer}
                                  ></video>
                                </div>
                              </div>
                            ) : (
                              <div className="bg-red-50 p-3 rounded-md">
                                <p className="text-red-700 text-sm">
                                  Trailer generation failed.
                                </p>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between mt-8">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/manage-book")}
                    >
                      Back to Book Management
                    </Button>
                    <div className="space-x-2">
                      <Button
                        variant="destructive"
                        onClick={handleRegenerateVideos}
                        disabled={!book}
                      >
                        Regenerate Videos
                      </Button>
                      <Button
                        onClick={() => router.push("/dashboard")}
                        disabled={!isAddBookEnabled}
                      >
                        Add Book to Library
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : (
            <div className="text-center py-10">
              <p>No book data found. Please check the book ID and try again.</p>
              <Button 
                variant="outline" 
                onClick={() => router.push("/manage-book")} 
                className="mt-4"
              >
                Back to Book Management
              </Button>
            </div>
          )}
        </div>
      </div>
    </MainLayout>
  );
}

export default VideosGeneratedPage;

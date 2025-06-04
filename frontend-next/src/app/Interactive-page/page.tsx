"use client";

import React, { useState, useEffect, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import ReaderLayout from "@/components/layout/readerLayout";
import withRoleProtection from "@/components/auth/withRoleProtection";
import { Book, BookChapter } from "@/types/book";

const InteractivePage: React.FC = () => {
  const searchParams = useSearchParams();
  const bookId = searchParams.get("bookid");
  const router = useRouter();

  const [book, setBook] = useState<Book | null>(null);
  const [chapters, setChapters] = useState<BookChapter[]>([]);
  const [selectedChapter, setSelectedChapter] = useState<BookChapter | null>(null);
  const [loading, setLoading] = useState(true);
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<{ sender: "user" | "ai"; text: string }[]>([]);

  const videoRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchBookDetails = async () => {
      if (!bookId) return;
      try {
        const res = await fetch(`/api/books/${bookId}`);
        const data = await res.json();
        setBook(data.book);
        setChapters(data.chapters || []);
        setSelectedChapter(data.chapters?.[0] || null);
      } catch (error) {
        console.error("Failed to fetch:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBookDetails();
  }, [bookId]);

  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [selectedChapter]);

  const handleChapterChange = (direction: "next" | "prev") => {
    if (!selectedChapter || !chapters.length) return;
    const index = chapters.findIndex(ch => ch.chapter_id === selectedChapter.chapter_id);
    const newIndex = direction === "next" ? index + 1 : index - 1;
    if (newIndex >= 0 && newIndex < chapters.length) {
      setSelectedChapter(chapters[newIndex]);
      if (videoRef.current) {
        videoRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;

    const userMessage = { sender: "user" as const, text: chatInput.trim() };
    let aiResponseText = "I'm here to help you explore The Little Match Girl.";
    const input = chatInput.toLowerCase();

    if (input.includes("who is the girl")) {
      aiResponseText = "She is a poor little girl trying to sell matches on a cold New Year's Eve.";
    } else if (input.includes("barefoot")) {
      aiResponseText = "She lost her slippers while running across the street to avoid carriages.";
    } else if (input.includes("what did she see")) {
      aiResponseText = "She saw beautiful visions like a warm stove, a feast, a Christmas tree, and finally her grandmother.";
    } else if (input.includes("why did she light") || input.includes("light the matches")) {
      aiResponseText = "She lit the matches to stay warm and to see comforting visions.";
    } else if (input.includes("how does it end") || input.includes("what happened")) {
      aiResponseText = "In the end, she freezes to death, but her soul is taken to heaven by her grandmother.";
    } else if (input.includes("theme") || input.includes("message")) {
      aiResponseText = "The story highlights poverty, hope, and the contrast between material neglect and spiritual warmth.";
    }

    const aiResponse = { sender: "ai" as const, text: aiResponseText };
    setChatMessages(prev => [...prev, userMessage, aiResponse]);
    setChatInput("");
  };

  return (
    <ReaderLayout activePage="Interactive Page">
      <main className="flex flex-row bg-[#FAFAFA] min-h-screen font-['Plus_Jakarta_Sans'] text-[#3F3F46]">
        <div className="flex-1 p-8">
          <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row md:items-center gap-3">
              <label className="text-sm font-medium">Select Chapter:</label>
              <select
                value={selectedChapter?.chapter_id || ""}
                onChange={(e) => {
                  const selected = chapters.find(ch => ch.chapter_id === e.target.value);
                  if (selected) setSelectedChapter(selected);
                }}
                className="w-64 p-2 rounded-xl text-sm border border-gray-300 shadow-sm bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {chapters.map((ch) => (
                  <option key={ch.chapter_id} value={ch.chapter_id}>
                    Chapter {ch.chapter_no}
                  </option>
                ))}
              </select>
            </div>
            <button
              onClick={() => router.push(`/bookdetail-reader?bookid=${bookId}`)}
              className="px-4 py-2 rounded-xl text-sm font-medium bg-gray-100 text-[#3F3F46] hover:bg-[#4F46E5] hover:text-white transition"
            >
              ← Back to Book Details
            </button>
          </div>

          {selectedChapter ? (
            <>
              <h2 className="text-2xl font-semibold mb-4">
                Chapter {selectedChapter.chapter_no}
              </h2>

              {chapters.length > 0 && selectedChapter && (
                <div className="mb-4">
                  <div className="text-sm text-gray-700 mb-1">
                    Progress: {Math.floor((selectedChapter.chapter_no / chapters.length) * 100)}%
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-indigo-600 transition-all duration-300"
                      style={{ width: `${(selectedChapter.chapter_no / chapters.length) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div ref={videoRef}>
                {selectedChapter.trailer ? (
                  <div className="mb-6 rounded-xl overflow-hidden shadow-md">
                    <video
                      key={selectedChapter.trailer}
                      width="100%"
                      controls
                      className="rounded-xl"
                    >
                      <source src={selectedChapter.trailer} type="video/mp4" />
                      Your browser does not support the video tag.
                    </video>
                  </div>
                ) : (
                  <p className="text-sm text-gray-500 mb-4">No trailer available for this chapter.</p>
                )}
              </div>

              {selectedChapter.summary && (
                <div className="bg-white rounded-xl shadow p-5 mb-8">
                  <h3 className="text-lg font-semibold mb-2">Chapter Summary</h3>
                  <p className="text-sm text-gray-700 whitespace-pre-line">
                    {selectedChapter.summary}
                  </p>
                </div>
              )}

              <div className="flex justify-center gap-4 mt-4">
                {chapters.findIndex(ch => ch.chapter_id === selectedChapter.chapter_id) > 0 && (
                  <button
                    onClick={() => handleChapterChange("prev")}
                    className="px-6 py-2 rounded-xl text-sm font-medium bg-gray-100 text-[#3F3F46] hover:bg-[#4F46E5] hover:text-white transition"
                  >
                    Previous
                  </button>
                )}
                {chapters.findIndex(ch => ch.chapter_id === selectedChapter.chapter_id) < chapters.length - 1 && (
                  <button
                    onClick={() => handleChapterChange("next")}
                    className="px-6 py-2 rounded-xl text-sm font-medium bg-gray-100 text-[#3F3F46] hover:bg-[#4F46E5] hover:text-white transition"
                  >
                    Next
                  </button>
                )}
              </div>
            </>
          ) : (
            <p className="text-gray-500">Loading Chapters</p>
          )}
        </div>

        {/* Right Side: Chat Assistant */}
        <div className="w-96 h-[700px] bg-white border border-gray-200 p-5 flex flex-col rounded-xl shadow-sm">
          <div className="mb-3">
            <h3 className="text-base font-semibold mb-2 text-[#3F3F46]">Chat with the Book</h3>
          </div>

          <div className="flex flex-col gap-3 overflow-y-auto flex-1 mb-4 pr-1 border-y border-gray-200 py-3">
            <div className="bg-gray-100 rounded-xl px-4 py-3 text-sm text-gray-800 max-w-[85%] shadow">
              I'm here to help you explore <strong>The Little Match Girl</strong>.
            </div>

            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`max-w-[85%] p-3 rounded-xl text-sm ${
                  msg.sender === "user"
                    ? "self-end bg-indigo-100 text-right"
                    : "self-start bg-gray-100"
                }`}
              >
                <p className="text-gray-800 whitespace-pre-line">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Input Area with Enter key support */}
          <div>
            <textarea
              className="w-full p-3 text-sm text-gray-800 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Ask about the book..."
              rows={2}
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendMessage();
                }
              }}
            />
            <div className="flex justify-end mt-2">
              <button
                onClick={handleSendMessage}
                className="bg-[#4F46E5] text-white px-4 py-2 rounded-xl hover:bg-indigo-700 transition"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      </main>
    </ReaderLayout>
  );
};

export default withRoleProtection(InteractivePage, ["reader"]);

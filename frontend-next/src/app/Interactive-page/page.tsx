"use client";

import React, { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import ReaderLayout from "@/components/layout/readerLayout";

interface Character {
  name: string;
  role: string;
  intro: string;
  image?: string;
}

interface Template {
  id: number;
  title: string;
  video: string;
  video_status: string;
  characters?: Character[]
}

const InteractivePage: React.FC = () => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [loading, setLoading] = useState(true);

  const searchParams = useSearchParams();
  const bookId = searchParams.get("bookId");

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!bookId) return;
      setLoading(true);
      try {
        const res = await fetch(
          `https://1rvx3jdou7.execute-api.us-east-1.amazonaws.com/get-book/${bookId}`
        );
        const data = await res.json();

        const loadedTemplates = (data?.chapters || []).map((tpl: any, index: number) => ({
          id: index + 1,
          title: `Template ${index + 1}: ${tpl?.chapter_title || tpl?.title || "Untitled"}`,
          video: tpl.trailer,
          video_status: tpl.trailer_status,
        }));

        setTemplates(loadedTemplates);
        setSelectedTemplate(loadedTemplates[0]);
      } catch (err) {
        console.error("Error fetching templates:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [bookId]);

  return (
    <ReaderLayout activePage="Browse Books">
      <div className="flex flex-col md:flex-row bg-gray-50 min-h-screen w-full">
        {/* Left Panel */}
        <div className="flex-1 p-6">
          <div className="space-y-6">
            {/* Template Selection */}
            <div>
              <label
                htmlFor="template-select"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Select Template:
              </label>
              <select
                id="template-select"
                value={selectedTemplate?.id}
                onChange={(e) =>
                  setSelectedTemplate(
                    templates.find((tpl) => tpl.id === Number(e.target.value))!
                  )
                }
                className="w-full max-w-sm p-2 border border-gray-300 rounded-lg shadow-sm text-sm"
              >
                {templates.map((tpl) => (
                  <option key={tpl.id} value={tpl.id}>
                    {tpl.title}
                  </option>
                ))}
              </select>
            </div>

            {/* Template Title */}
            <h2 className="text-xl font-semibold text-gray-800">
              {selectedTemplate?.title}
            </h2>

            {/* Video Display */}
            <div className="w-full rounded-lg overflow-hidden border border-gray-300 shadow-sm bg-white p-4">
              {loading ? (
                <p className="text-sm text-gray-500">Loading template video...</p>
              ) : selectedTemplate?.video_status === "completed" ? (
                selectedTemplate?.video ? (
                  <video
                    controls
                    className="rounded-lg w-full max-w-full aspect-video"
                    key={selectedTemplate.video} // force video reload
                  >
                    <source src={selectedTemplate.video} type="video/mp4" />
                  </video>
                ) : (
                  <p className="text-sm text-gray-500">Final video is being prepared...</p>
                )
              ) : selectedTemplate?.video_status === "failed" ? (
                <p className="text-red-500">Video generation failed.</p>
              ) : (
                <p className="text-sm text-gray-500">Generating video...</p>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Chat */}
        <div className="w-full md:w-96 bg-white shadow-md border-l p-6 flex flex-col justify-between">
          <div className="bg-gray-100 p-4 rounded-lg shadow-sm mb-6">
            <h3 className="text-lg font-semibold text-gray-700">Princess Elena</h3>
            <p className="text-sm text-gray-600 mt-2">
              Greetings, brave reader! I am Princess Elena. What would you like to know about my quest?
            </p>
          </div>

          <div className="flex flex-col gap-4 overflow-y-auto flex-1">
            {[
              "What inspired this story?",
              "How do you feel in this scene?",
              "What’s the biggest challenge here?",
            ].map((q, idx) => (
              <div key={idx} className="bg-gray-100 p-4 rounded-lg shadow-sm">
                <h4 className="text-sm font-medium text-gray-700 mb-1">Talk to Character</h4>
                <p className="text-sm text-gray-500">{q}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 p-4 bg-gray-100 rounded-lg shadow-sm">
            <textarea
              className="w-full p-2 text-sm text-gray-700 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              placeholder="Type your message..."
              rows={2}
            ></textarea>
            <div className="flex justify-end mt-2">
              <button className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors">
                Send
              </button>
            </div>
          </div>
        </div>
      </div>
    </ReaderLayout>
  );
};

export default InteractivePage;

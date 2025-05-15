"use client";

import type React from "react";
import type { Book } from "@/services/api";

interface SimilarBookCardProps {
  book: Book;
  onStartReading: () => void;
  onAddToList: () => void;
}

export const SimilarBookCard: React.FC<SimilarBookCardProps> = ({
  book,
  onStartReading,
  onAddToList,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-base font-medium mb-1">{book.title}</h3>
      <p className="text-sm text-gray-600 mb-3">by {book.author}</p>

      <div className="flex justify-center mb-4">
        <div className="h-44 w-32 rounded-md overflow-hidden">
          <img
            src={book.coverImage || "/placeholder.svg?height=176&width=128"}
            alt={book.title}
            className="w-full h-full object-cover"
          />
        </div>
      </div>

      <div className="space-y-2">
        <button
          onClick={onStartReading}
          className="w-full py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition-colors duration-200"
        >
          Start Reading
        </button>

        <button
          onClick={onAddToList}
          className="w-full py-2 bg-white hover:bg-gray-50 text-indigo-600 text-sm border border-indigo-600 rounded transition-colors duration-200"
        >
          Add to List
        </button>
      </div>
    </div>
  );
};

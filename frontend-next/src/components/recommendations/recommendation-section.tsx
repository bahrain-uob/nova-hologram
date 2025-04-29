"use client";
import Image from "next/image";
import { Star } from "lucide-react";
import type { Book } from "@/services/api";

interface RecommendationSectionProps {
  title: string;
  description: string;
  books: Book[];
  isLoading: boolean;
  error: boolean;
}

export function RecommendationSection({
  title,
  description,
  books,
  isLoading,
  error,
}: RecommendationSectionProps) {
  if (isLoading) {
    return (
      <div className="mb-10">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-48 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-64 mb-6"></div>
          <div className="flex gap-6 overflow-x-auto pb-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex-shrink-0 w-36">
                <div className="bg-gray-200 rounded-md h-48 w-36 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-28 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-20 mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-16 mb-1"></div>
                <div className="flex mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <div
                      key={star}
                      className="h-3 w-3 bg-gray-200 rounded-full mr-1"
                    ></div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mb-10">
        <h2 className="text-xl font-medium mb-1">{title}</h2>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        <div className="bg-red-50 text-red-500 p-4 rounded-md">
          Failed to load recommendations. Please try again later.
        </div>
      </div>
    );
  }

  if (books.length === 0) {
    return (
      <div className="mb-10">
        <h2 className="text-xl font-medium mb-1">{title}</h2>
        <p className="text-sm text-gray-500 mb-4">{description}</p>
        <div className="bg-gray-50 text-gray-500 p-4 rounded-md">
          No recommendations available at this time.
        </div>
      </div>
    );
  }

  return (
    <div className="mb-10">
      <h2 className="text-xl font-medium mb-1">{title}</h2>
      <p className="text-sm text-gray-500 mb-4">{description}</p>

      <div className="flex gap-6 overflow-x-auto pb-4">
        {books.map((book) => (
          <div key={book.id} className="flex-shrink-0 w-36">
            <div className="aspect-[3/4] w-full relative mb-2">
              <Image
                src={book.coverImage || "/placeholder.svg?height=192&width=144"}
                width={144}
                height={192}
                alt={book.title}
                className="w-full h-full object-cover rounded-md shadow-sm"
              />
            </div>
            <h3 className="font-medium text-sm mb-0.5 line-clamp-1">
              {book.title}
            </h3>
            <p className="text-xs text-gray-600 mb-0.5 line-clamp-1">
              {book.author}
            </p>
            <span className="inline-block bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-full">
              {book.genre}
            </span>
            <div className="flex items-center mt-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  className={`h-3 w-3 ${
                    i < Math.floor(book.rating || 0)
                      ? "text-yellow-400 fill-yellow-400"
                      : "text-gray-300"
                  }`}
                />
              ))}
              <span className="text-xs text-gray-500 ml-1">
                {book.rating?.toFixed(1)}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

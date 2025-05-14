"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import MainLayout from "@/components/layout/MainLayout";
import { useRouter } from "next/navigation";
import { Filter as FilterIcon } from "lucide-react";
import { Book } from "@/types/book"; // Importing the Book type

// Fetch Collection Books - Using Book[] Type
const fetchCollection = async (): Promise<Book[]> => [
  {
    id: 1,
    title: "Harry Potter and the Sorcerer's Stone",
    author: "J.K. Rowling",
    cover: "/harry1.jpg",
    genres: ["Fantasy", "Adventure"],
    language: "English",
  },
  {
    id: 2,
    title: "Harry Potter and the Chamber of Secrets",
    author: "J.K. Rowling",
    cover: "/harry2.jpg",
    genres: ["Fantasy", "Adventure"],
    language: "English",
  },
  {
    id: 3,
    title: "Harry Potter and the Prisoner of Azkaban",
    author: "J.K. Rowling",
    cover: "/harry3.jpg",
    genres: ["Fantasy", "Adventure"],
    language: "English",
  },
];

const InsideCollectionLibrarian: React.FC = () => {
  const [books, setBooks] = useState<Book[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const router = useRouter();

  useEffect(() => {
    const loadBooks = async () => {
      try {
        const data = await fetchCollection();
        setBooks(data);
      } catch (error) {
        console.error("Error fetching books:", error);
      }
    };

    loadBooks();
  }, []);

  // Filter books based on search query
  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <MainLayout activePage="Manage Collections">
           <main className="flex-1 bg-gray-50">
        <div className="flex justify-between mb-6">
        
              <h2 className="text-2xl font-semibold text-gray-700">Harry Potter Collection</h2>
        
          <Button
            onClick={() => router.push("/edit-collection")}
            className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Edit Collection
          </Button>
        </div>

        {/* Search and Filter Section */}
        <div className="bg-white p-4 rounded-lg shadow mb-6 flex items-center gap-4">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search books in collection..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <div className="absolute top-2 left-3">
              <FilterIcon className="w-5 h-5 text-gray-500" />
            </div>
          </div>
        </div>

        {/* Book Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6 mb-8">
          {filteredBooks.length > 0 ? (
            filteredBooks.map((book) => (
              <div
                key={book.id}
                className="bg-white p-4 rounded-lg shadow-sm hover:shadow-lg transition-shadow flex flex-col items-center"
              >
                <Image
                  src={book.cover}
                  alt={book.title}
                  width={100}
                  height={150}
                  className="object-cover rounded-lg mb-2"
                />
                <h3 className="font-semibold text-lg text-center">{book.title}</h3>
                <p className="text-sm text-gray-600 text-center mt-1">{book.author}</p>
              </div>
            ))
          ) : (
            <p className="text-gray-500">No books found in this collection.</p>
          )}
        </div>

        {/* Pagination */}
        <div className="flex justify-center mt-8">
          <button className="border px-4 py-2 rounded-l-lg">←</button>
          <button className="border px-4 py-2 bg-indigo-600 text-white">1</button>
          <button className="border px-4 py-2 rounded-r-lg">→</button>
        </div>
    
      </main>
    </MainLayout>
  );
};

export default InsideCollectionLibrarian;


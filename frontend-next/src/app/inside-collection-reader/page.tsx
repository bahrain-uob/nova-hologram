"use client";

import { useState, useEffect } from "react";
import withRoleProtection from "@/components/auth/withRoleProtection";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Book } from "@/types/book";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/readerLayout";
import type React from "react";

// Fetch collection with necessary properties
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

const InsideCollection: React.FC = () => {
  const router = useRouter();
  const [books, setBooks] = useState<Book[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    const loadBooks = async () => {
      const data = await fetchCollection();
      setBooks(data);
    };
    loadBooks();
  }, []);

  const filteredBooks = books.filter((book) =>
    book.title.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <MainLayout activePage="Harry Potter Collection">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold mb-6">Harry Potter Collection</h1>

        <div className="flex items-center mb-6 gap-3">
          <Input
            type="text"
            placeholder="Search books in collection..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full max-w-md"
          />
          <Button variant="outline">Filter</Button>
          <Button
            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition-colors duration-200"
            onClick={() => router.push("/my-list")}
          >
            Add To My List
          </Button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {filteredBooks.map((book) => (
            <div
              key={book.id}
              className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-all duration-300"
            >
              <div className="w-full h-48 overflow-hidden mb-4">
                <Image
                  src={book.cover}
                  alt={book.title}
                  width={160}
                  height={240}
                  className="object-cover w-full h-full rounded"
                />
              </div>
              <h3 className="font-semibold text-lg text-center">{book.title}</h3>
              <p className="text-sm text-gray-600 text-center mt-1">
                {book.author}
              </p>
            </div>
          ))}
        </div>
      </div>
    </MainLayout>
  );
};

export default withRoleProtection(InsideCollection, ["reader"]);

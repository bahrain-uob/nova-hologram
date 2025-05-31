"use client";

import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import MainLayout from "@/components/layout/MainLayout";
import { useRouter } from "next/navigation";

interface Book {
  book_id: string;
  book_title: string;
}

const CreateCollection: React.FC = () => {
  const router = useRouter();

  const [collectionName, setCollectionName] = useState("");
  const [genre, setGenre] = useState("");
  const [author, setAuthor] = useState("");
  const [language, setLanguage] = useState("");
  const [selectedBooks, setSelectedBooks] = useState("");
  const [bookList, setBookList] = useState<Book[]>([]);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        const res = await fetch("https://your-api-id.execute-api.region.amazonaws.com/dev/books");
        const data = await res.json();
        setBookList(data);
      } catch (err) {
        console.error("Failed to fetch books:", err);
      }
    };

    fetchBooks();
  }, []);

  const handleCreateCollection = () => {
    console.log({
      collectionName,
      genre,
      author,
      language,
      selectedBooks,
    });
    router.push("/manage-collections");
  };

  const handleClearFilters = () => {
    setGenre("");
    setAuthor("");
    setLanguage("");
    setSelectedBooks("");
  };

  return (
    <MainLayout activePage="Manage Collections">
      <main className="flex-1 bg-gray-50">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">Create Collection</h2>
        </div>

        {/* Collection Name Input */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <label className="block text-gray-700 mb-2">Collection</label>
          <input
            type="text"
            placeholder="Enter collection name"
            value={collectionName}
            onChange={(e) => setCollectionName(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* Filters Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <div className="flex gap-4">
            {/* Genre Filter */}
            <div className="flex-1">
              <label className="block text-gray-700 mb-2">Genre</label>
              <select
                value={genre}
                onChange={(e) => setGenre(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">All Genre</option>
                <option value="Fantasy">Fantasy</option>
                <option value="Adventure">Adventure</option>
                <option value="Science Fiction">Science Fiction</option>
                <option value="Romance">Romance</option>
                <option value="Mystery">Mystery</option>
              </select>
            </div>

            {/* Author Filter */}
            <div className="flex-1">
              <label className="block text-gray-700 mb-2">Author</label>
              <input
                type="text"
                placeholder="Select Author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            {/* Language Filter */}
            <div className="flex-1">
              <label className="block text-gray-700 mb-2">Language</label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Select Language</option>
                <option value="English">English</option>
                <option value="Spanish">Arabic</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Chinese">Chinese</option>
              </select>
            </div>

            {/* Clear Filters */}
            <div className="flex items-end">
              <button
                onClick={handleClearFilters}
                className="text-indigo-600 text-sm hover:underline"
              >
                Clear Filters
              </button>
            </div>
          </div>
        </div>

        {/* Add Books Section */}
        <div className="bg-white p-6 rounded-lg shadow mb-6">
          <label className="block text-gray-700 mb-2">Add Books</label>
          <select
            value={selectedBooks}
            onChange={(e) => setSelectedBooks(e.target.value)}
            className="w-full border border-gray-300 p-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Select books to add</option>
            {bookList.map((book) => (
              <option key={book.book_id} value={book.book_id}>
                {book.book_title}
              </option>
            ))}
          </select>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-4">
          <button
            onClick={() => router.push("/manage-collections")}
            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg hover:bg-gray-300"
          >
            Cancel
          </button>
          <Button
            onClick={handleCreateCollection}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
          >
            Create
          </Button>
        </div>
      </main>
    </MainLayout>
  );
};

export default CreateCollection;

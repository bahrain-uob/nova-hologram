"use client";

import React, { useState, useEffect } from "react";
import {
Edit as EditIcon,
Trash2 as DeleteIcon,
Filter as FilterIcon,
} from "lucide-react";
import Image from "next/image";
import MainLayout from "@/components/layout/MainLayout";
import { useRouter } from "next/navigation";

interface Book {
id: number;
title: string;
author: string;
cover: string;
genre: string;
readingLevel: "Easy" | "Medium" | "Hard";
publicationYear: number;
}

const fetchBooks = async (): Promise<Book[]> => [
{
    id: 1,
    title: "The Great Gatsby",
    author: "F. Scott Fitzgerald",
    cover: "/covers/gatsby.jpg",
    genre: "Classic Fiction",
    readingLevel: "Medium",
    publicationYear: 1925,
},
{
    id: 2,
    title: "To Kill a Mockingbird",
    author: "Harper Lee",
    cover: "/covers/mockingbird.jpg",
    genre: "Literary Fiction",
    readingLevel: "Medium",
    publicationYear: 1960,
},
{
    id: 3,
    title: "1984",
    author: "George Orwell",
    cover: "/covers/1984.jpg",
    genre: "Science Fiction",
    readingLevel: "Hard",
    publicationYear: 1949,
},
{
    id: 4,
    title: "Pride and Prejudice",
    author: "Jane Austen",
    cover: "/covers/pride.jpg",
    genre: "Romance",
    readingLevel: "Medium",
    publicationYear: 1813,
},
{
    id: 5,
    title: "Atomic Habits",
    author: "James Clear",
    cover: "/covers/atomichabits.jpg",
    genre: "Self Help",
    readingLevel: "Easy",
    publicationYear: 2018,
},
{
    id: 6,
    title: "The Catcher in the Rye",
    author: "J.D. Salinger",
    cover: "/covers/catcher.jpg",
    genre: "Coming-of-Age",
    readingLevel: "Medium",
    publicationYear: 1951,
},
];

const LibrarianRecommendation: React.FC = () => {
const [books, setBooks] = useState<Book[]>([]);
const [recommendedBooks, setRecommendedBooks] = useState<number[]>([]);
const [searchQuery, setSearchQuery] = useState("");
const [genre, setGenre] = useState("");
const [readingLevel, setReadingLevel] = useState("");
const [publicationYear, setPublicationYear] = useState("");
const router = useRouter();

useEffect(() => {
    const loadBooks = async () => {
    const booksData = await fetchBooks();
    setBooks(booksData);
    };
    loadBooks();
}, []);

const toggleRecommendation = (bookId: number) => {
    setRecommendedBooks((prev) =>
    prev.includes(bookId)
        ? prev.filter((id) => id !== bookId)
        : [...prev, bookId]
    );
};

const filteredBooks = books.filter((book) => {
    const matchesSearch =
    book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    book.author.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenre = genre
    ? book.genre.toLowerCase().includes(genre.toLowerCase())
    : true;
    const matchesLevel = readingLevel
    ? book.readingLevel === readingLevel
    : true;
    const matchesYear = publicationYear
    ? book.publicationYear.toString() === publicationYear
    : true;

    return matchesSearch && matchesGenre && matchesLevel && matchesYear;
});

return (
    <MainLayout activePage="Manage Books">
    <main className="flex-1 p-6 bg-gray-50 min-h-screen">
        <h2 className="text-2xl font-semibold text-gray-800 mb-6">
        Recommendations for <span className="font-bold">James Escobar</span>
        </h2>

        <div className="flex flex-col-reverse lg:flex-row gap-6">
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {filteredBooks.map((book) => (
            <div
                key={book.id}
                className="bg-white p-4 rounded-xl shadow-md hover:shadow-lg transition-shadow flex flex-col"
            >
                <Image
                src={book.cover}
                alt={book.title}
                width={200}
                height={280}
                className="object-cover w-[200px] h-[280px] rounded-lg mx-auto"
                />
                <div className="mt-4">
                <div className="flex flex-wrap gap-2 mb-1">
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {book.genre}
                    </span>
                    <span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded">
                    {book.readingLevel}
                    </span>
                </div>
                <h3 className="text-md font-semibold text-gray-800">
                    {book.title}
                </h3>
                <p className="text-sm text-gray-500">by {book.author}</p>
                <button
                    className={`mt-3 w-full py-2 text-white text-sm font-medium rounded-lg transition-colors duration-200 ${
                    recommendedBooks.includes(book.id)
                        ? "bg-green-100 text-green-700 border border-green-300"
                        : "bg-indigo-600 hover:bg-indigo-700"
                    }`}
                    onClick={() => toggleRecommendation(book.id)}
                >
                    {recommendedBooks.includes(book.id)
                    ? "Recommended"
                    : "Recommend"}
                </button>
                </div>
            </div>
            ))}
        </div>

        <aside className="w-full lg:w-72 bg-white p-4 rounded-xl shadow-sm">
            <h4 className="font-semibold text-gray-700 mb-4">Filter By</h4>
            <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
                Genres
            </label>
            <div className="flex flex-col gap-1">
                <label className="text-sm">
                <input type="checkbox" className="mr-2" />Fiction
                </label>
                <label className="text-sm">
                <input type="checkbox" className="mr-2" />Non-Fiction
                </label>
                <label className="text-sm">
                <input type="checkbox" className="mr-2" />Mystery
                </label>
            </div>
            </div>

            <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
                Language
            </label>
            <select className="w-full border border-gray-300 rounded-md p-2 text-sm">
                <option>English</option>
                <option>Arabic</option>
            </select>
            </div>

            <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600 mb-1">
                Author
            </label>
            <input
                type="text"
                placeholder="Search authors..."
                className="w-full border border-gray-300 rounded-md p-2 text-sm"
            />
            </div>

            <div>
            <label className="block text-sm font-medium text-gray-600 mb-1">
                Sort By
            </label>
            <select className="w-full border border-gray-300 rounded-md p-2 text-sm">
                <option>A - Z</option>
                <option>a - z</option>
                <option>0..9</option>
            </select>
            </div>
        </aside>
        </div>
    </main>
    </MainLayout>
);
};

export default LibrarianRecommendation;

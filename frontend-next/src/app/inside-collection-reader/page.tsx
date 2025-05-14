"use client";

import { useState, useEffect } from "react";
import { ReadersSidebar } from "@/components/dashboard/ReadersSidebar";
import { Top } from "@/components/dashboard/Top";
import withRoleProtection from "@/components/auth/withRoleProtection";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import type React from "react";

const InsideCollection: React.FC = () => {
    const [userName, setUserName] = useState("Reader");
    const [searchTerm, setSearchTerm] = useState("");
    const router = useRouter();

    useEffect(() => {
        try {
            const userSessionStr = localStorage.getItem("userSession");
            if (userSessionStr) {
                const userSession = JSON.parse(userSessionStr);
                if (userSession.attributes && userSession.attributes.name) {
                    setUserName(userSession.attributes.name);
                } else if (userSession.email) {
                    const name = userSession.email.split("@")[0];
                    setUserName(name.charAt(0).toUpperCase() + name.slice(1));
                }
            }
        } catch (error) {
            console.error("Error getting user session:", error);
        }
    }, []);

    const books = [
        {
            title: "Harry Potter and the Sorcerer's Stone",
            author: "J.K. Rowling",
            image: "/harry1.jpg",
        },
        {
            title: "Harry Potter and the Chamber of Secrets",
            author: "J.K. Rowling",
            image: "/harry2.jpg",
        },
        {
            title: "Harry Potter and the Prisoner of Azkaban",
            author: "J.K. Rowling",
            image: "/harry3.jpg",
        },
    ];

    const filteredBooks = books.filter((book) =>
        book.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="flex min-h-screen bg-gray-50">
            <ReadersSidebar
                className="fixed left-0 top-0 h-full"
                divClassName="bg-gray-100 hover:bg-gray-200"
                divClassNameOverride="text-indigo-600 bg-indigo-50"
            />

            <div className="flex-1 ml-[260px] flex flex-col">
                <Top className="w-full fixed top-0 z-10" ellipse="/avatars/user.png" />

                <div className="mt-[70px] p-6">
                    <h1 className="text-2xl font-semibold mb-6">
                        Harry Potter Collection
                    </h1>

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
                            onClick={() => router.push("")}
                        >
                            Add To My List
                        </Button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                        {filteredBooks.map((book, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-lg shadow p-4 hover:shadow-md transition-shadow"
                            >
                                <Image
                                    src={book.image}
                                    alt={book.title}
                                    width={160}
                                    height={240}
                                    className="rounded mx-auto mb-4"
                                />
                                <h3 className="font-semibold text-lg text-center">
                                    {book.title}
                                </h3>
                                <p className="text-sm text-gray-600 text-center mt-1">
                                    {book.author}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default withRoleProtection(InsideCollection, ["reader"]);

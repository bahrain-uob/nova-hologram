"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import MainLayout from "@/components/layout/MainLayout";
import { useRouter } from "next/navigation";
import { collections } from "@/types/book"; // Correct Import for Collections Type
import { Filter as FilterIcon } from "lucide-react"; // Import Filter Icon

// Simulated Data Fetching Function
const fetchCollections = async (): Promise<collections[]> => [
    {
        id: 1,
        title: "Harry Potter",
        bookCount: 9,
        images: ["/harry1.jpg", "/harry2.jpg", "/harry3.jpg"],
    },
    {
        id: 2,
        title: "Modern Fiction",
        bookCount: 98,
        images: ["/fiction1.jpg", "/fiction2.jpg", "/fiction3.jpg"],
    },
    {
        id: 3,
        title: "Science & Technology",
        bookCount: 156,
        images: ["/science1.jpg", "/science2.jpg", "/science3.jpg"],
    },
];

const ManageCollections: React.FC = () => {
    const [collectionsData, setCollectionsData] = useState<collections[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const router = useRouter();

    useEffect(() => {
        const loadCollections = async () => {
            try {
                const data = await fetchCollections();
                setCollectionsData(data);
            } catch (error) {
                console.error("Error fetching collections:", error);
            }
        };

        loadCollections();
    }, []);

    // Filtered Collections based on search query
    const filteredCollections = collectionsData.filter((collection) =>
        collection.title.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <MainLayout activePage="Manage Collections">
           <main className="flex-1 bg-gray-50">
        <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-700">Manage Collections</h2>
                    <Button
                        onClick={() => router.push("/create-collection")}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                    >
                        + Create Collection
                    </Button>
                </div>

                {/* Search and Filter Section */}
                <div className="bg-white p-4 rounded-lg shadow mb-6 flex gap-4">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder="Search collections..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <div className="absolute top-2 right-4">
                            <FilterIcon className="w-5 h-5 text-gray-500 cursor-pointer" />
                        </div>
                    </div>
                </div>

                {/* Collections Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {filteredCollections.length > 0 ? (
                        filteredCollections.map((collection) => (
                            <div
                                key={collection.id}
                                className="bg-white rounded-lg shadow p-4 hover:shadow-lg transition-shadow"
                            >
                                {/* Title and Book Count */}
                                <h3 className="font-bold text-lg mb-2">{collection.title}</h3>
                                <p className="text-sm text-gray-600 mb-4">
                                    {collection.bookCount} books
                                </p>

                                {/* Images Section */}
                                <div className="flex overflow-hidden gap-2 mb-4">
                                    {collection.images.slice(0, 3).map((src, index) => (
                                        <Image
                                            key={index}
                                            src={src}
                                            alt={`${collection.title} Image ${index + 1}`}
                                            width={60}
                                            height={90}
                                            className="rounded-lg object-cover"
                                        />
                                    ))}
                                </div>

                                {/* View All Link */}
                                <div
                                    onClick={() => router.push("/inside-collection-librarian")}
                                    className="mt-4 text-indigo-600 text-sm cursor-pointer hover:underline"
                                >
                                    View All
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-gray-500">No collections found.</p>
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

export default ManageCollections;

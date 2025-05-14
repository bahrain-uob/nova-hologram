"use client";

import type React from "react";
import { useEffect, useState } from "react";
import withRoleProtection from "@/components/auth/withRoleProtection";
import Image from "next/image";
import { useRouter } from "next/navigation";
import MainLayout from "@/components/layout/readerLayout";
import { collections } from "@/types/book";

const fetchCollection = async (): Promise<collections[]> => [
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

const BrowseBooks: React.FC = () => {
  const router = useRouter();
  const [collectionsData, setCollectionsData] = useState<collections[]>([]);

  useEffect(() => {
    const loadCollections = async () => {
      const data = await fetchCollection();
      setCollectionsData(data);
    };
    loadCollections();
  }, []);

  return (
    <MainLayout activePage="Collections">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-2xl font-semibold mb-6">Browse Collections</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {collectionsData.map((collection) => (
            <div key={collection.id} className="bg-white rounded-lg shadow p-4">
              <h3 className="font-bold text-lg mb-2">{collection.title}</h3>
              <p className="text-sm text-gray-600 mb-4">{collection.bookCount} books</p>
              <div className="flex overflow-hidden gap-2">
                {collection.images.map((src, index) => (
                  <Image
                    key={index}
                    src={src}
                    alt={`${collection.title} ${index + 1}`}
                    width={60}
                    height={90}
                    className="rounded"
                  />
                ))}
              </div>
              <div
                onClick={() => router.push("/inside-collection-reader")}
                className="mt-4 text-indigo-600 text-sm cursor-pointer hover:underline"
              >
                View All
              </div>
            </div>
          ))}
        </div>
      </div>
       {/* Pagination */}
        <div className="flex justify-center mt-8">
          <button className="border px-4 py-2 rounded-l-lg">←</button>
          <button className="border px-4 py-2 bg-indigo-600 text-white">1</button>
          <button className="border px-4 py-2 rounded-r-lg">→</button>
        </div>
    </MainLayout>
  );
};

export default withRoleProtection(BrowseBooks, ["reader"]);

"use client";

import React, { useState, useEffect } from "react";
import { Edit as EditIcon, Trash2 as DeleteIcon, Filter as FilterIcon } from "lucide-react";
import { ReadersSidebar } from "@/components/dashboard/ReadersSidebar";
import { Top } from "@/components/dashboard/Top";
import Image from "next/image";

interface Reader {
  id: number;
  name: string;
  avatar: string;
  grade: string;
  readingLevel: "Beginner" | "Intermediate" | "Advanced";
}

// Simulated fetch function
const fetchReaders = async (): Promise<Reader[]> => [
  { id: 1, name: "Alice Johnson", avatar: "/avatars/alice.jpg", grade: "3rd Grade", readingLevel: "Beginner" },
  { id: 2, name: "Bob Smith", avatar: "/avatars/bob.jpg", grade: "4th Grade", readingLevel: "Intermediate" },
  { id: 3, name: "Charlie Brown", avatar: "/avatars/charlie.jpg", grade: "5th Grade", readingLevel: "Advanced" },
];

const ManageReaders: React.FC = () => {
  const [readers, setReaders] = useState<Reader[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [grade, setGrade] = useState("");
  const [readingLevel, setReadingLevel] = useState("");

  useEffect(() => {
    const loadReaders = async () => {
      const readersData = await fetchReaders();
      setReaders(readersData);
    };
    loadReaders();
  }, []);

  const handleEditReader = (readerId: number) => {
    console.log(`Editing reader with id: ${readerId}`);
  };

  const handleDeleteReader = (readerId: number) => {
    console.log(`Deleting reader with id: ${readerId}`);
  };

  const filteredReaders = readers.filter((reader) => {
    const matchesSearch = reader.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesGrade = grade ? reader.grade === grade : true;
    const matchesLevel = readingLevel ? reader.readingLevel === readingLevel : true;
    return matchesSearch && matchesGrade && matchesLevel;
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="flex flex-col w-full">
        {/* Top Bar */}
        <Top className="w-full fixed top-0 z-10" ellipse="/avatars/user.png" />

        <div className="flex flex-row w-full pt-[61px]">
          {/* Sidebar */}
          <ReadersSidebar
            className="fixed left-0 top-[61px] h-[calc(100vh-61px)]"
            divClassName="bg-gray-100 hover:bg-gray-200"
            divClassNameOverride="text-indigo-600 bg-indigo-50"
          />

          {/* Main Content */}
          <main className="flex-1 p-8 bg-gray-50 ml-64">
            <div className="flex justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-700">Manage Readers</h2>
              <button
                onClick={() => { }}
                className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg gap-2 hover:bg-indigo-700 transition-colors duration-200"
              >
                <span>Add New Reader</span>
              </button>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm mb-8">
              <div className="relative flex-1 mb-4">
                <input
                  type="text"
                  placeholder="Search readers"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-12 py-2 border border-zinc-200 rounded-lg text-sm text-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <div className="absolute top-2 right-4">
                  <FilterIcon className="w-5 h-5 text-gray-500 cursor-pointer" />
                </div>
              </div>

              <div className="flex gap-4 flex-wrap">
                <select
                  value={grade}
                  onChange={(e) => setGrade(e.target.value)}
                  className="block w-full sm:w-auto bg-white border border-zinc-300 rounded-lg text-sm text-gray-700 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">All Grades</option>
                  <option value="3rd Grade">3rd Grade</option>
                  <option value="4th Grade">4th Grade</option>
                  <option value="5th Grade">5th Grade</option>
                </select>

                <select
                  value={readingLevel}
                  onChange={(e) => setReadingLevel(e.target.value)}
                  className="block w-full sm:w-auto bg-white border border-zinc-300 rounded-lg text-sm text-gray-700 p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="">Reading Level</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Reader Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8">
              {filteredReaders.map((reader) => (
                <div
                  key={reader.id}
                  className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex gap-6"
                >
                  <Image
                    src={reader.avatar}
                    alt={reader.name}
                    width={96}
                    height={96}
                    className="object-cover rounded-full"
                  />

                  <div className="flex flex-col justify-between ml-2">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-800">{reader.name}</h3>
                      <p className="text-sm text-gray-500">{reader.grade}</p>
                      <p className="text-xs bg-gray-200 text-gray-700 font-medium mt-1 px-2 py-0.5 rounded w-fit">
                        {reader.readingLevel}
                      </p>
                    </div>

                    <div className="flex gap-4 mt-2">
                      <button onClick={() => handleEditReader(reader.id)} className="text-indigo-600 hover:text-indigo-800">
                        <EditIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => handleDeleteReader(reader.id)} className="text-red-600 hover:text-red-800">
                        <DeleteIcon className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination (placeholder) */}
            <div className="flex justify-center items-center gap-4">
              <button className="w-10 h-10 border border-zinc-200 rounded-lg flex items-center justify-center">
                ←
              </button>
              <button className="w-10 h-10 rounded-lg bg-indigo-600 text-white">1</button>
              <button className="w-10 h-10 border border-zinc-200 rounded-lg flex items-center justify-center">
                →
              </button>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default ManageReaders;

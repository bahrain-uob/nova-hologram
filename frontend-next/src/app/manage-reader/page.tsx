"use client";

import React, { useState, useEffect } from "react";
import {
  Edit as EditIcon,
  Trash2 as DeleteIcon,
  Filter as FilterIcon,
} from "lucide-react";
import Image from "next/image";
import MainLayout from "@/components/layout/MainLayout";

interface User {
  user_id: string;
  email: string;
  first_name?: string;
  last_name?: string;
  grade?: string;
  readingLevel?: "Beginner" | "Intermediate" | "Advanced";
  avatar?: string;
}

const API_URL = "https://your-api-url.execute-api.region.amazonaws.com/prod/readers";

const ManageReaders: React.FC = () => {
  const [readers, setReaders] = useState<User[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [grade, setGrade] = useState("");
  const [readingLevel, setReadingLevel] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadReaders = async () => {
      try {
        const response = await fetch(API_URL);
        if (!response.ok) throw new Error('Failed to fetch readers');
        const data = await response.json();
        setReaders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch readers');
      } finally {
        setLoading(false);
      }
    };
    loadReaders();
  }, []);

  const handleEditReader = (userId: string) => {
    console.log(`Editing user with id: ${userId}`);
    // Add your edit logic here
  };

  const handleDeleteReader = (userId: string) => {
    console.log(`Deleting user with id: ${userId}`);
    // Add your delete logic here
  };

  const filteredReaders = readers.filter((user) => {
    const fullName = `${user.first_name || ''} ${user.last_name || ''}`.toLowerCase();
    const matchesSearch = fullName.includes(searchQuery.toLowerCase());
    const matchesGrade = grade ? user.grade === grade : true;
    const matchesLevel = readingLevel ? user.readingLevel === readingLevel : true;
    return matchesSearch && matchesGrade && matchesLevel;
  });

  if (loading) {
    return (
      <MainLayout activePage="Manage Readers">
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      </MainLayout>
    );
  }

  if (error) {
    return (
      <MainLayout activePage="Manage Readers">
        <div className="text-center py-8 text-red-600">{error}</div>
      </MainLayout>
    );
  }

  return (
    <MainLayout activePage="Manage Readers">
      <main className="flex-1 bg-gray-50">
        <div className="flex justify-between mb-6">
          <h2 className="text-2xl font-semibold text-gray-700">
            Manage Readers
          </h2>
          <button
            onClick={() => {}}
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
          {filteredReaders.map((user) => (
            <div
              key={user.user_id}
              className="bg-white p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow flex gap-6"
            >
              <Image
                src={user.avatar || '/default-avatar.png'}
                alt={`${user.first_name} ${user.last_name}`}
                width={96}
                height={96}
                className="object-cover rounded-full"
              />

              <div className="flex flex-col justify-between ml-2">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {user.first_name} {user.last_name}
                  </h3>
                  <p className="text-sm text-gray-500">{user.email}</p>
                  {user.grade && (
                    <p className="text-sm text-gray-500 mt-1">{user.grade}</p>
                  )}
                  {user.readingLevel && (
                    <p className="text-xs bg-gray-200 text-gray-700 font-medium mt-1 px-2 py-0.5 rounded w-fit">
                      {user.readingLevel}
                    </p>
                  )}
                </div>

                <div className="flex gap-4 mt-2">
                  <button
                    onClick={() => handleEditReader(user.user_id)}
                    className="text-indigo-600 hover:text-indigo-800"
                  >
                    <EditIcon className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => handleDeleteReader(user.user_id)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <DeleteIcon className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex justify-center items-center gap-4">
          <button className="w-10 h-10 border border-zinc-200 rounded-lg flex items-center justify-center">
            ←
          </button>
          <button className="w-10 h-10 rounded-lg bg-indigo-600 text-white">
            1
          </button>
          <button className="w-10 h-10 border border-zinc-200 rounded-lg flex items-center justify-center">
            →
          </button>
        </div>
      </main>
    </MainLayout>
  );
};

export default ManageReaders;
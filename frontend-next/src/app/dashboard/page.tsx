"use client";

import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Library, Search, Bell } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import withRoleProtection from "@/components/auth/withRoleProtection";
import { Skeleton } from "@/components/ui/skeleton";

// Sidebar and top bar layout
const ManageReader: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Simulate a data fetch
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load data');
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b">
          <div className="flex h-16 items-center px-4">
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-6" />
              <Skeleton className="h-6 w-24" />
            </div>
            <div className="flex-1 ml-16">
              <Skeleton className="h-10 w-full max-w-2xl" />
            </div>
            <div className="ml-auto">
              <Skeleton className="h-10 w-10 rounded-full" />
            </div>
          </div>
        </header>

        <div className="flex">
          <aside className="w-64 border-r min-h-[calc(100vh-4rem)]">
            <div className="space-y-4 py-4 px-3">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </aside>

          <main className="flex-1 p-8">
            <div className="space-y-2 mb-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>

            <div className="grid gap-4 md:grid-cols-3 mb-8">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24" />
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="w-[420px] bg-red-500 text-white p-4 rounded-lg">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-2 text-primary">
            <Library className="h-6 w-6" />
            <span className="font-semibold">ClarityUI</span>
          </div>

          {/* Search */}
          <div className="flex items-center ml-4 md:ml-10 lg:ml-16 space-x-4 flex-1">
            <form className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search books, authors, or categories"
                  className="pl-8 bg-background w-full"
                />
              </div>
            </form>
          </div>

          {/* Profile and Notifications */}
          <div className="ml-auto flex items-center space-x-4">
            {/* Notification Bell */}
            <div className="relative">
              <Bell className="h-5 w-5 text-muted-foreground" />
              <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-red-500" />
            </div>
            {/* Avatar */}
            <Avatar>
              <AvatarImage src="/avatars/user.png" alt="User" />
              <AvatarFallback>S</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r min-h-[calc(100vh-4rem)] bg-white">
          <nav className="space-y-2 py-4">
            <div className="px-3">
              <Button variant="secondary" className="w-full justify-start bg-primary/10 text-primary hover:bg-primary/20">
                <Users className="mr-2 h-4 w-4" />
                Dashboard
              </Button>
            </div>
            <div className="px-3">
              <Button variant="ghost" className="w-full justify-start hover:bg-primary/5">
                <BookOpen className="mr-2 h-4 w-4" />
                Manage Books
              </Button>
            </div>
            <div className="px-3">
              <Button variant="ghost" className="w-full justify-start hover:bg-primary/5">
                <Library className="mr-2 h-4 w-4" />
                Manage Collections
              </Button>
            </div>
            <div className="px-3">
              <Button variant="ghost" className="w-full justify-start hover:bg-primary/5">
                <Users className="mr-2 h-4 w-4" />
                Manage Readers
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-8 bg-gray-50">
          <div className="flex justify-between mb-6">
            <h2 className="text-2xl font-semibold text-gray-700">Manage Readers</h2>
            <button className="flex items-center px-4 py-2 bg-indigo-600 text-white rounded-lg gap-2">
              <span>Add New Reader</span>
            </button>
          </div>

          {/* Reader Cards */}
          <div className="grid grid-cols-3 gap-6 mb-8">
            {/* Cards for readers would go here */}
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center gap-4">
            <button className="w-10 h-10 border border-zinc-200 rounded-lg flex items-center justify-center">
              {/* Pagination arrow icon */}
            </button>
            <button className="w-10 h-10 rounded-lg bg-indigo-600 text-white">1</button>
            <button className="w-10 h-10 border border-zinc-200 rounded-lg flex items-center justify-center">
              {/* Pagination arrow icon */}
            </button>
          </div>
        </main>
      </div>
    </div>
  );
};

// Protect this route - only librarians can access it
export default withRoleProtection(ManageReader, ['librarian']);

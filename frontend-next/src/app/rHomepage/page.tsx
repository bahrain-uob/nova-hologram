"use client";

import { useState, useEffect } from "react";
import {
  Home,
  BookOpen,
  Library,
  Mic,
  Bookmark,
  BarChart2,
  Settings,
  LogOut,
  Search,
} from "lucide-react";
import Image from "next/image";

// Import UI components
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { ChevronRight } from "lucide-react";

import "./rHomepage.css";

export default function ReadingApp() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

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
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="h-10 w-full" />
              ))}
            </div>
          </aside>

          <main className="flex-1 p-8">
            <div className="space-y-2 mb-4">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-64" />
            </div>

            <Skeleton className="h-10 w-32 mb-8" />

            <div className="grid gap-4 md:grid-cols-4 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Skeleton className="h-[300px]" />
              <Skeleton className="h-[300px]" />
              <Skeleton className="h-[300px]" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center gap-2">
            <div className="text-primary">
              <BookOpen className="h-6 w-6" />
            </div>
            <span className="font-semibold">ClarityUI</span>
          </div>

          {/* Search */}
          <div className="flex items-center ml-4 md:ml-10 lg:ml-16 space-x-4 flex-1">
            <form className="flex-1 max-w-2xl">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Type to search"
                  className="pl-8 bg-background w-full"
                />
              </div>
            </form>
          </div>

          {/* Profile */}
          <div className="ml-auto">
            <Avatar>
              <AvatarImage
                src="/placeholder.svg?height=40&width=40"
                alt="Harvey"
              />
              <AvatarFallback>H</AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r min-h-[calc(100vh-4rem)] bg-white">
          <nav className="space-y-2 py-4">
            <div className="px-3">
              <Button
                variant="secondary"
                className="w-full justify-start bg-primary/10 text-primary hover:bg-primary/20"
              >
                <Home className="mr-2 h-4 w-4" />
                Home
              </Button>
            </div>
            <div className="px-3">
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-primary/5"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Browse Books
              </Button>
            </div>
            <div className="px-3">
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-primary/5"
              >
                <Library className="mr-2 h-4 w-4" />
                Collections
              </Button>
            </div>
            <div className="px-3">
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-primary/5"
              >
                <Mic className="mr-2 h-4 w-4" />
                Pronunciation Practice
              </Button>
            </div>
            <div className="px-3">
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-primary/5"
              >
                <Bookmark className="mr-2 h-4 w-4" />
                Reading List
              </Button>
            </div>
            <div className="px-3">
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-primary/5"
              >
                <BarChart2 className="mr-2 h-4 w-4" />
                Progress
              </Button>
            </div>
            <div className="mt-auto px-3 pt-4">
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-primary/5"
              >
                <Settings className="mr-2 h-4 w-4" />
                Settings
              </Button>
            </div>
            <div className="px-3">
              <Button
                variant="ghost"
                className="w-full justify-start hover:bg-primary/5"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </nav>
        </aside>

        {/* Main content */}
        <main className="flex-1 p-8 bg-gray-50">
          <div className="flex flex-col gap-2 mb-6">
            <h1 className="text-2xl font-semibold">Happy Reading, Harvey!</h1>
            <p className="text-muted-foreground">
              Immerse yourself personal reading space and pick up where you left
              off.
            </p>
          </div>

          {/* View Books Button */}
          <Button className="mb-8 bg-indigo-600 hover:bg-indigo-700">
            View Books
          </Button>

          {/* Top Picks */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Top Picks for You</h2>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              <BookCard
                title="The Silent Echo"
                author="Nora Winters"
                genre="Mystery"
                coverUrl="/placeholder.svg?height=300&width=200"
              />
              <BookCard
                title="Winds of the Desert"
                author="Salem Al-Harbi"
                genre="Adventure"
                coverUrl="/placeholder.svg?height=300&width=200"
              />
              <BookCard
                title="Beyond the Horizon"
                author="Maya Greene"
                genre="Sci-Fi"
                coverUrl="/placeholder.svg?height=300&width=200"
              />
              <BookCard
                title="Tales of the Future"
                author="A.M. Tariq"
                genre="Fiction"
                coverUrl="/placeholder.svg?height=300&width=200"
              />
            </div>
          </div>

          {/* Bottom Sections */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Continue Reading */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-medium">Continue Reading</h3>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Image
                      src="/placeholder.svg?height=100&width=70"
                      alt="The Red Pathways"
                      width={70}
                      height={100}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">The Red Pathways</h4>
                      <div className="mt-2">
                        <Progress value={60} className="h-2 mb-1" />
                        <span className="text-xs text-gray-500">
                          60% complete
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-4">
                    <Image
                      src="/placeholder.svg?height=100&width=70"
                      alt="Hidden Truths"
                      width={70}
                      height={100}
                      className="rounded"
                    />
                    <div className="flex-1">
                      <h4 className="font-medium">Hidden Truths</h4>
                      <div className="mt-2">
                        <Progress value={42} className="h-2 mb-1" />
                        <span className="text-xs text-gray-500">
                          42% complete
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Bookmarks */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-medium">Bookmarks</h3>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">The Voice of the River</h4>
                    <p className="text-sm text-gray-600 italic">
                      "The river whispered secrets that only the ancient trees
                      could understand..."
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium mb-2">A Journey Within</h4>
                    <p className="text-sm text-gray-600 italic">
                      "As the sun set behind the mountains, she realized the
                      journey had only begun..."
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Reading Goal */}
            <Card className="bg-white shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-medium">April Reading Goal</h3>
                </div>

                <div className="flex flex-col items-center">
                  <div className="relative w-32 h-32 mb-6">
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="10"
                      />
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        fill="none"
                        stroke="#6366f1"
                        strokeWidth="10"
                        strokeDasharray="251.2"
                        strokeDashoffset={251.2 * (1 - 0.7)}
                        transform="rotate(-90 50 50)"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-2xl font-bold">70%</span>
                    </div>
                  </div>

                  <div className="flex justify-between w-full">
                    <div className="text-center">
                      <div className="font-bold">18</div>
                      <div className="text-xs text-gray-500">BOOKS</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">8</div>
                      <div className="text-xs text-gray-500">HOURS</div>
                    </div>
                    <div className="text-center">
                      <div className="font-bold">871</div>
                      <div className="text-xs text-gray-500">PAGES</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}

function BookCard({
  title,
  author,
  genre,
  coverUrl,
}: {
  title: string;
  author: string;
  genre: string;
  coverUrl: string;
}) {
  return (
    <div className="book-card">
      <div className="book-cover">
        <Image
          src={coverUrl || "/placeholder.svg"}
          alt={title}
          fill
          className="object-cover"
        />
      </div>
      <h3 className="book-title">{title}</h3>
      <p className="book-author">{author}</p>
      <p className="book-genre">{genre}</p>
      <Button className="start-reading-btn" size="sm">
        Start Reading
      </Button>
    </div>
  );
}

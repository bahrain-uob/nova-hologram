"use client";

import React, { useState, useEffect } from 'react';
import { Users, BookOpen, Library, Search } from 'lucide-react';
import withRoleProtection from "@/components/auth/withRoleProtection";

// Import UI components
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";

// Import dashboard components
import { StatsCard } from "@/components/dashboard/StatsCard";
import { ActivityChart } from "@/components/dashboard/ActivityChart";
import { GenreChart } from "@/components/dashboard/GenreChart";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { TopBooks } from "@/components/dashboard/TopBooks";

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // In a real app, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      setLoading(false);
    } catch (err) {
      console.error('Error:', err);
      setError('Failed to load dashboard data');
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

            <div className="grid gap-4 md:grid-cols-7 mb-8">
              <Skeleton className="col-span-4 h-[300px]" />
              <Skeleton className="col-span-3 h-[300px]" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Skeleton className="h-[400px]" />
              <Skeleton className="h-[400px]" />
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Alert variant="destructive" className="w-[420px]">
          <AlertDescription>
            {error}
          </AlertDescription>
        </Alert>
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
              <Library className="h-6 w-6" />
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

        {/* Main content */}
        <main className="flex-1 p-8 bg-gray-50">
          <div className="flex flex-col gap-2 mb-6">
            <h1 className="text-2xl font-semibold">Dashboard Overview</h1>
            <p className="text-muted-foreground">Welcome back, Sarah!</p>
          </div>

          {/* Stats */}
          <div className="grid gap-6 grid-cols-3 mb-8">
            <StatsCard title="Readers" value="245" icon={Users} />
            <StatsCard title="Books" value="180" icon={BookOpen} />
            <StatsCard title="Collections" value="23" icon={Library} />
          </div>

          {/* Charts */}
          <div className="grid gap-6 grid-cols-2 mb-8">
            <div className="col-span-1 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-base font-medium mb-4">Reading Activity</h3>
              <ActivityChart />
            </div>
            <div className="col-span-1 bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-base font-medium mb-4">Popular Genre</h3>
              <GenreChart />
            </div>
          </div>

          {/* Activity and Books */}
          <div className="grid gap-6 grid-cols-2">
            <RecentActivity />
            <TopBooks />
          </div>
        </main>
      </div>
    </div>
  );
};

// Protect this route - only librarians can access it
export default withRoleProtection(Dashboard, ['librarian']);
"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { BookOpen, Library, Users } from "lucide-react";
import { API_ENDPOINTS } from "@/config/api-config";
import withRoleProtection from "@/components/auth/withRoleProtection";
import MainLayout from "@/components/layout/MainLayout";
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
  const [userName, setUserName] = useState("Librarian");
  // Analytics state
  const [stats, setStats] = useState<{readers: number, books: number, collections: number}>({readers: 0, books: 0, collections: 0});
  const [activityData, setActivityData] = useState<any[]>([]);
  const [genreData, setGenreData] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [topBooks, setTopBooks] = useState<any[]>([]);

  useEffect(() => {
    fetchData();

    // Get user data from Cognito
    const fetchUserData = async () => {
      try {
        const { getCurrentUser } = await import('@/lib/auth');
        const currentUser = await getCurrentUser();
        
        if (currentUser && currentUser.user) {
          const userAttributes = currentUser.user.attributes || {};
          
          // Use the name attribute if available, otherwise fall back to email
          if (userAttributes.name) {
            setUserName(userAttributes.name);
          } else if (userAttributes.email) {
            // Fallback to email if name is not available
            const name = userAttributes.email.split("@")[0];
            setUserName(name.charAt(0).toUpperCase() + name.slice(1));
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };
    
    fetchUserData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch all analytics in parallel
      const [statsRes, activityRes, genreRes, recentRes, topBooksRes] = await Promise.all([
        fetch(API_ENDPOINTS.analyticsStats),
        fetch(API_ENDPOINTS.analyticsActivity),
        fetch(API_ENDPOINTS.analyticsGenre),
        fetch(API_ENDPOINTS.analyticsRecent),
        fetch(API_ENDPOINTS.analyticsTopBooks),
      ]);
      if (!statsRes.ok || !activityRes.ok || !genreRes.ok || !recentRes.ok || !topBooksRes.ok) {
        throw new Error("One or more analytics endpoints failed");
      }
      const statsData = await statsRes.json();
      const activityData = await activityRes.json();
      const genreData = await genreRes.json();
      const recentData = await recentRes.json();
      const topBooksData = await topBooksRes.json();

      setStats({
        readers: statsData.readers ?? 0,
        books: statsData.books ?? 0,
        collections: statsData.collections ?? 0,
      });
      setActivityData(activityData || []);
      setGenreData(genreData || []);
      setRecentActivity(recentData || []);
      setTopBooks(topBooksData || []);
      setLoading(false);
    } catch (err) {
      console.error("Error:", err);
      setError("Failed to load dashboard data");
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
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <MainLayout activePage="Dashboard">
      <div className="bg-white p-6 rounded-lg shadow">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium mb-1">Dashboard Overview</h1>
          <p className="text-sm text-gray-600">Welcome back, {userName}!</p>
        </div>

        {/* Stats */}
        <div className="grid gap-6 grid-cols-1 md:grid-cols-3 mb-8">
          <StatsCard title="Readers" value={stats.readers} icon={Users} />
          <StatsCard title="Books" value={stats.books} icon={BookOpen} />
          <StatsCard title="Collections" value={stats.collections} icon={Library} />
        </div>

        {/* Charts */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2 mb-8">
          <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4">
            <h3 className="text-base font-medium mb-4">Reading Activity</h3>
            <ActivityChart data={activityData} />
          </div>
          <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4">
            <h3 className="text-base font-medium mb-4">Popular Genre</h3>
            <GenreChart data={genreData} />
          </div>
        </div>

        {/* Activity and Books */}
        <div className="grid gap-6 grid-cols-1 lg:grid-cols-2">
          <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4">
            <h3 className="text-base font-medium mb-4">Recent Activity</h3>
            <RecentActivity activities={recentActivity} />
          </div>
          <div className="bg-white border border-gray-200 rounded-md shadow-sm p-4">
            <h3 className="text-base font-medium">Top Books</h3>
            <TopBooks books={topBooks} />
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

// Protect this route - only librarians can access it
export default withRoleProtection(Dashboard, ["librarian"]);

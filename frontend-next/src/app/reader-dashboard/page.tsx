"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { CircularDeterminateProgressIndicator } from "@/components/dashboard/CircularDeterminateProgressIndicator";
import { ReadersSidebar } from "@/components/dashboard/ReadersSidebar";
import { Top } from "@/components/dashboard/Top";
import withRoleProtection from "@/components/auth/withRoleProtection";
import { useRouter } from "next/navigation";
import Image from "next/image";
import MainLayout from "@/components/layout/readerLayout";
import { BookOpen, ChevronRight } from "lucide-react";

const ReaderDashboard: React.FC = () => {
  const [userName, setUserName] = useState("Reader");
  const router = useRouter();

  useEffect(() => {
    // Get user data from session
    try {
      const userSessionStr = localStorage.getItem("userSession");
      if (userSessionStr) {
        const userSession = JSON.parse(userSessionStr);
        // Use the name attribute if available, otherwise fall back to email
        if (userSession.attributes && userSession.attributes.name) {
          setUserName(userSession.attributes.name);
        } else if (userSession.email) {
          // Fallback to email if name is not available
          const name = userSession.email.split("@")[0];
          setUserName(name.charAt(0).toUpperCase() + name.slice(1));
        }
      }
    } catch (error) {
      console.error("Error getting user session:", error);
    }
  }, []);

  const today = new Date();
  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];
  const month = today.getMonth();

  return (
    <MainLayout activePage="Dashboard">
      <div className="bg-white p-6 rounded-lg shadow">
        {/* Welcome section */}
        <div className="mb-8">
          <h1 className="text-2xl font-medium mb-1">
            Happy Reading, {userName}!
          </h1>
          <p className="text-sm text-gray-600">
            Immerse yourself in your personal reading space and pick up where
            you left off.
          </p>
          <button
            className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition-colors duration-200"
            onClick={() => router.push("/browse-books")}
          >
            View Books
          </button>
        </div>

        {/* Top Picks section */}
        <div className="w-full mb-10">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-medium">Top Picks for You</h2>
            <button className="text-gray-500 hover:text-gray-700 flex items-center">
              <span className="text-sm mr-1">View All</span>
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>

          {/* Book grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {/* Book 1 */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm hover:shadow transition-shadow duration-200 overflow-hidden flex flex-col h-full">
              <div className="aspect-[3/4] w-full relative">
                <Image
                  src="/img.png"
                  width={150}
                  height={200}
                  alt="The Silent Echo"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-2 flex flex-col flex-grow">
                <h3 className="font-medium text-xs mb-0.5 line-clamp-1">
                  The Silent Echo
                </h3>
                <p className="text-xs mb-1 text-gray-600 line-clamp-1">
                  Nora Winters
                </p>
                <div className="flex items-center mb-2">
                  <span className="bg-gray-100 text-gray-700 text-[10px] px-1.5 py-0.5 rounded-full">
                    Mystery
                  </span>
                </div>
                <div className="mt-auto">
                  <button className="w-full py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] rounded transition-colors duration-200">
                    View Details
                  </button>
                </div>
              </div>
            </div>

            {/* Book 2 */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm hover:shadow transition-shadow duration-200 overflow-hidden flex flex-col h-full">
              <div className="aspect-[3/4] w-full relative">
                <Image
                  src="/image.png"
                  width={150}
                  height={200}
                  alt="Winds of the Desert"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-2 flex flex-col flex-grow">
                <h3 className="font-medium text-xs mb-0.5 line-clamp-1">
                  Winds of the Desert
                </h3>
                <p className="text-xs mb-1 text-gray-600 line-clamp-1">
                  Salem Al-Harbi
                </p>
                <div className="flex items-center mb-2">
                  <span className="bg-gray-100 text-gray-700 text-[10px] px-1.5 py-0.5 rounded-full">
                    Adventure
                  </span>
                </div>
                <div className="mt-auto">
                  <button className="w-full py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] rounded transition-colors duration-200">
                    Start Reading
                  </button>
                </div>
              </div>
            </div>

            {/* Book 3 */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm hover:shadow transition-shadow duration-200 overflow-hidden flex flex-col h-full">
              <div className="aspect-[3/4] w-full relative">
                <Image
                  src="/img-2.png"
                  width={150}
                  height={200}
                  alt="Beyond the Horizon"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-2 flex flex-col flex-grow">
                <h3 className="font-medium text-xs mb-0.5 line-clamp-1">
                  Beyond the Horizon
                </h3>
                <p className="text-xs mb-1 text-gray-600 line-clamp-1">
                  Maya Greene
                </p>
                <div className="flex items-center mb-2">
                  <span className="bg-gray-100 text-gray-700 text-[10px] px-1.5 py-0.5 rounded-full">
                    Sci-Fi
                  </span>
                </div>
                <div className="mt-auto">
                  <button className="w-full py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] rounded transition-colors duration-200">
                    Start Reading
                  </button>
                </div>
              </div>
            </div>

            {/* Book 4 */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm hover:shadow transition-shadow duration-200 overflow-hidden flex flex-col h-full">
              <div className="aspect-[3/4] w-full relative">
                <Image
                  src="/img-3.png"
                  width={150}
                  height={200}
                  alt="Tales of the Future"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-2 flex flex-col flex-grow">
                <h3 className="font-medium text-xs mb-0.5 line-clamp-1">
                  Tales of the Future
                </h3>
                <p className="text-xs mb-1 text-gray-600 line-clamp-1">
                  A.M. Tariq
                </p>
                <div className="flex items-center mb-2">
                  <span className="bg-gray-100 text-gray-700 text-[10px] px-1.5 py-0.5 rounded-full">
                    Fiction
                  </span>
                </div>
                <div className="mt-auto">
                  <button className="w-full py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] rounded transition-colors duration-200">
                    Start Reading
                  </button>
                </div>
              </div>
            </div>

            {/* Book 5 */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm hover:shadow transition-shadow duration-200 overflow-hidden flex flex-col h-full">
              <div className="aspect-[3/4] w-full relative">
                <Image
                  src="/img-4.png"
                  width={150}
                  height={200}
                  alt="The Red Pathways"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-2 flex flex-col flex-grow">
                <h3 className="font-medium text-xs mb-0.5 line-clamp-1">
                  The Red Pathways
                </h3>
                <p className="text-xs mb-1 text-gray-600 line-clamp-1">
                  Eliza Morgan
                </p>
                <div className="flex items-center mb-2">
                  <span className="bg-gray-100 text-gray-700 text-[10px] px-1.5 py-0.5 rounded-full">
                    Thriller
                  </span>
                </div>
                <div className="mt-auto">
                  <button className="w-full py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] rounded transition-colors duration-200">
                    Start Reading
                  </button>
                </div>
              </div>
            </div>

            {/* Book 6 */}
            <div className="bg-white border border-gray-200 rounded-md shadow-sm hover:shadow transition-shadow duration-200 overflow-hidden flex flex-col h-full">
              <div className="aspect-[3/4] w-full relative">
                <Image
                  src="/img-5.png"
                  width={150}
                  height={200}
                  alt="Hidden Truths"
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-2 flex flex-col flex-grow">
                <h3 className="font-medium text-xs mb-0.5 line-clamp-1">
                  Hidden Truths
                </h3>
                <p className="text-xs mb-1 text-gray-600 line-clamp-1">
                  James Wilson
                </p>
                <div className="flex items-center mb-2">
                  <span className="bg-gray-100 text-gray-700 text-[10px] px-1.5 py-0.5 rounded-full">
                    Mystery
                  </span>
                </div>
                <div className="mt-auto">
                  <button className="w-full py-1 bg-indigo-600 hover:bg-indigo-700 text-white text-[12px] rounded transition-colors duration-200">
                    Start Reading
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-8">
          {/* Continue Reading Section > My Picks */}
          <div className="lg:col-span-1 bg-white border border-gray-200 rounded-md shadow-sm p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-medium">My Picks</h2>
              <button className="text-gray-500 hover:text-gray-700">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded p-2 flex items-start">
                <div className="w-10 h-14 rounded overflow-hidden">
                  <Image
                    src="/img-4.png"
                    width={150}
                    height={200}
                    alt="The Red Pathways"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-2 flex-grow">
                  <h3 className="text-xs font-medium mb-1">The Red Pathways</h3>
                  <div className="w-full h-1 bg-gray-200 rounded-full mb-1">
                    <div
                      className="h-1 bg-indigo-600 rounded-full"
                      style={{ width: "68%" }}
                    />
                  </div>
                  <p className="text-xs text-gray-600">68% complete</p>
                </div>
              </div>

              <div className="bg-gray-50 rounded p-2 flex items-start">
                <div className="w-10 h-14 rounded overflow-hidden">
                  <Image
                    src="/img-5.png"
                    width={150}
                    height={200}
                    alt="Hidden Truths"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="ml-2 flex-grow">
                  <h3 className="text-xs font-medium mb-1">Hidden Truths</h3>
                  <div className="w-full h-1 bg-gray-200 rounded-full mb-1">
                    <div
                      className="h-1 bg-indigo-600 rounded-full"
                      style={{ width: "42%" }}
                    />
                  </div>
                  <p className="text-xs text-gray-600">42% complete</p>
                </div>
              </div>
            </div>
          </div>

          {/* Bookmarks Section > Favorites*/}
          <div className="lg:col-span-1 bg-white border border-gray-200 rounded-md shadow-sm p-4">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-base font-medium">Favorites</h2>
              <button className="text-gray-500 hover:text-gray-700">
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
            <div className="space-y-3">
              <div className="bg-gray-50 rounded p-2">
                <h3 className="text-xs font-medium mb-1">
                  The Voice of the River
                </h3>
                <p className="text-xs text-gray-600 italic">
                  &quot;The river whispered secrets that only the ancient trees
                  could understand...&quot;
                </p>
              </div>

              <div className="bg-gray-50 rounded p-2">
                <h3 className="text-xs font-medium mb-1">A Journey Within</h3>
                <p className="text-xs text-gray-600 italic">
                  &quot;As the sun set behind the mountains, she realized the
                  journey had only begun...&quot;
                </p>
              </div>
            </div>
          </div>

          {/* Reading Goal Section > Discovery Goal */}
          <div className="lg:col-span-1 bg-white border border-gray-200 rounded-md shadow-sm p-4">
            <h2 className="text-base font-medium mb-3">
              {monthNames[month]} Discovery Goal
            </h2>
            <div className="flex flex-col items-center">
              <div className="relative w-20 h-20 mb-4">
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-base font-medium">70%</span>
                </div>
                <CircularDeterminateProgressIndicator className="w-full h-full text-indigo-600" />
              </div>

              <div className="flex justify-between w-full">
                <div className="text-center">
                  <div className="text-sm font-medium">18</div>
                  <div className="text-xs text-gray-600">Books Viewed</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">8</div>
                  <div className="text-xs text-gray-600">Books Saved</div>
                </div>
                <div className="text-center">
                  <div className="text-sm font-medium">2</div>
                  <div className="text-xs text-gray-600">New Genres</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action buttons at the bottom - matching add-book-page */}
        <div className="flex justify-end gap-4 mt-8">
          <button className="px-4 py-2 border border-[#E4E4E7] hover:bg-[#F4F4F5] text-gray-700 rounded">
            Browse More
          </button>
          <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Continue Reading
          </button>
        </div>
      </div>
    </MainLayout>
  );
};

// Protect this route - only readers can access it
export default withRoleProtection(ReaderDashboard, ["reader"]);

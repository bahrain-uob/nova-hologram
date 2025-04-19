"use client";

import React, { useEffect, useState } from "react";
import { CircularDeterminateProgressIndicator } from "@/components/dashboard/CircularDeterminateProgressIndicator";
import { ReadersSidebar } from "@/components/dashboard/ReadersSidebar";
import { Top } from "@/components/dashboard/Top";
import withRoleProtection from "@/components/auth/withRoleProtection";
import { useRouter } from "next/navigation";

const ReaderDashboard: React.FC = () => {
  const [userName, setUserName] = useState("Reader");
  const router = useRouter();
  
  useEffect(() => {
    // Get user data from session
    try {
      const userSessionStr = localStorage.getItem('userSession');
      if (userSessionStr) {
        const userSession = JSON.parse(userSessionStr);
        // Use email as username if name is not available
        if (userSession.email) {
          // Extract name from email (everything before @)
          const name = userSession.email.split('@')[0];
          setUserName(name.charAt(0).toUpperCase() + name.slice(1));
        }
      }
    } catch (error) {
      console.error('Error getting user session:', error);
    }
  }, []);
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex flex-col w-full">
          <Top
            className="w-full fixed top-0 z-10"
            ellipse="/avatars/user.png"
          />
          <div className="flex flex-row w-full pt-[61px]">
            <ReadersSidebar
              className="fixed left-0 top-[61px] h-[calc(100vh-61px)]"
              divClassName="bg-gray-100 hover:bg-gray-200"
              divClassNameOverride="text-indigo-600 bg-indigo-50"
            />
            <div className="flex-1 ml-[260px] p-6 md:p-8">
              <div className="w-full max-w-6xl mx-auto">
            <div className="mb-8">
              <h1 className="text-title text-2xl font-medium mb-1">
                Happy Reading, {userName}!
              </h1>
              <p className="text-subtitle text-sm">
                Immerse yourself in your personal reading space and pick up where you left off.
              </p>
              <button 
                className="mt-4 px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm rounded transition-colors duration-200"
                onClick={() => router.push('/browse-books')}
              >
                View Books
              </button>
            </div>
              </div>
            <div className="w-full mb-10 relative">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-title text-xl font-medium">Top Picks for You</h2>
                <button className="text-gray-500 hover:text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  <div className="bg-white rounded-md shadow-sm hover:shadow transition-shadow duration-200 overflow-hidden flex flex-col h-full">
                    <div className="aspect-[3/4] w-full relative">
                      <img src="/img.png" alt="The Silent Echo" className="w-full h-full object-cover" />
                    </div>

                    <div className="p-3 flex flex-col flex-grow">
                      <h3 className="text-book-title font-medium text-sm mb-0.5">The Silent Echo</h3>
                      <p className="text-book-author text-xs mb-1.5">Nora Winters</p>
                      <div className="flex items-center mb-3">
                        <span className="bg-gray-100 text-zinc-700 text-xs px-2 py-0.5 rounded-full">Mystery</span>
                      </div>
                      <div className="mt-auto">
                        <button className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded transition-colors duration-200">
                          Start Reading
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-md shadow-sm hover:shadow transition-shadow duration-200 overflow-hidden flex flex-col h-full">
                    <div className="aspect-[3/4] w-full relative">
                      <img src="/image.png" alt="Winds of the Desert" className="w-full h-full object-cover" />
                    </div>

                    <div className="p-3 flex flex-col flex-grow">
                      <h3 className="text-book-title font-medium text-sm mb-0.5">Winds of the Desert</h3>
                      <p className="text-book-author text-xs mb-1.5">Salem Al-Harbi</p>
                      <div className="flex items-center mb-3">
                        <span className="bg-gray-100 text-zinc-700 text-xs px-2 py-0.5 rounded-full">Adventure</span>
                      </div>
                      <div className="mt-auto">
                        <button className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded transition-colors duration-200">
                          Start Reading
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-md shadow-sm hover:shadow transition-shadow duration-200 overflow-hidden flex flex-col h-full">
                    <div className="aspect-[3/4] w-full relative">
                      <img src="/img-2.png" alt="Beyond the Horizon" className="w-full h-full object-cover" />
                    </div>

                    <div className="p-3 flex flex-col flex-grow">
                      <h3 className="text-book-title font-medium text-sm mb-0.5">Beyond the Horizon</h3>
                      <p className="text-book-author text-xs mb-1.5">Maya Greene</p>
                      <div className="flex items-center mb-3">
                        <span className="bg-gray-100 text-zinc-700 text-xs px-2 py-0.5 rounded-full">Sci-Fi</span>
                      </div>
                      <div className="mt-auto">
                        <button className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded transition-colors duration-200">
                          Start Reading
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="bg-white rounded-md shadow-sm hover:shadow transition-shadow duration-200 overflow-hidden flex flex-col h-full">
                    <div className="aspect-[3/4] w-full relative">
                      <img src="/img-3.png" alt="Tales of the Future" className="w-full h-full object-cover" />
                    </div>

                    <div className="p-3 flex flex-col flex-grow">
                      <h3 className="text-book-title font-medium text-sm mb-0.5">Tales of the Future</h3>
                      <p className="text-book-author text-xs mb-1.5">A.M. Tariq</p>
                      <div className="flex items-center mb-3">
                        <span className="bg-gray-100 text-zinc-700 text-xs px-2 py-0.5 rounded-full">Fiction</span>
                      </div>
                      <div className="mt-auto">
                        <button className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs rounded transition-colors duration-200">
                          Start Reading
                        </button>
                      </div>
                    </div>
                  </div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mt-8">
              {/* Continue Reading Section */}
              <div className="lg:col-span-1 bg-white rounded-md shadow-sm p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-title text-base font-medium">Continue Reading</h2>
                  <button className="text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded p-2 flex items-start">
                    <div className="w-10 h-14 rounded bg-red-500 flex-shrink-0 overflow-hidden">
                      <img src="/img-4.png" alt="The Red Pathways" className="w-full h-full object-cover" />
                    </div>
                    <div className="ml-2 flex-grow">
                      <h3 className="text-book-title text-xs font-medium mb-1">The Red Pathways</h3>
                      <div className="w-full h-1 bg-gray-200 rounded-full mb-1">
                        <div className="h-1 bg-indigo-600 rounded-full" style={{ width: '68%' }} />
                      </div>
                      <p className="text-subtitle text-xs">68% complete</p>
                    </div>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-2 flex items-start">
                    <div className="w-10 h-14 rounded bg-gray-500 flex-shrink-0 overflow-hidden">
                      <img src="/img-5.png" alt="Hidden Truths" className="w-full h-full object-cover" />
                    </div>
                    <div className="ml-2 flex-grow">
                      <h3 className="text-book-title text-xs font-medium mb-1">Hidden Truths</h3>
                      <div className="w-full h-1 bg-gray-200 rounded-full mb-1">
                        <div className="h-1 bg-indigo-600 rounded-full" style={{ width: '42%' }} />
                      </div>
                      <p className="text-subtitle text-xs">42% complete</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Bookmarks Section */}
              <div className="lg:col-span-1 bg-white rounded-md shadow-sm p-4">
                <div className="flex justify-between items-center mb-3">
                  <h2 className="text-title text-base font-medium">Bookmarks</h2>
                  <button className="text-gray-500 hover:text-gray-700">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
                <div className="space-y-3">
                  <div className="bg-gray-50 rounded p-2">
                    <h3 className="text-book-title text-xs font-medium mb-1">The Voice of the River</h3>
                    <p className="text-subtitle text-xs italic">
                      &quot;The river whispered secrets that only the ancient trees could understand...&quot;
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-2">
                    <h3 className="text-book-title text-xs font-medium mb-1">A Journey Within</h3>
                    <p className="text-subtitle text-xs italic">
                      &quot;As the sun set behind the mountains, she realized the journey had only begun...&quot;
                    </p>
                  </div>
                </div>
              </div>
              
              {/* Reading Goal Section */}
              <div className="lg:col-span-1 bg-white rounded-md shadow-sm p-4">
                <h2 className="text-title text-base font-medium mb-3">April Reading Goal</h2>
                <div className="flex flex-col items-center">
                  <div className="relative w-20 h-20 mb-4">
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-base font-medium">70%</span>
                    </div>
                    <CircularDeterminateProgressIndicator className="w-full h-full text-indigo-600" />
                  </div>
                  
                  <div className="flex justify-between w-full">
                    <div className="text-center">
                      <div className="text-sm font-medium">18k</div>
                      <div className="text-subtitle text-xs">words</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">8</div>
                      <div className="text-subtitle text-xs">books</div>
                    </div>
                    <div className="text-center">
                      <div className="text-sm font-medium">871</div>
                      <div className="text-subtitle text-xs">pages</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* <div className="absolute w-[380px] h-[600px] top-[221px] left-[886px] border-0 border-none">
              <div className="relative w-16 h-16 top-[536px] left-[316px] border-0 border-none">
                <div className="h-16 bg-[#5249e5] rounded-[9832.57px] border border-solid border-[#e1e3e7]">
                  <div className="relative w-[30px] h-6 top-5 left-[17px] border-0 border-none">
                    <div className="flex w-[30px] h-6 items-center justify-center relative">
                      <svg width="30" height="24" viewBox="0 0 30 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M17.5 12H2.5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M22.5 7L27.5 12L22.5 17" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div> */}
          </div>
        </div>
      </div>
    </div>
  );
}

// Protect this route - only readers can access it
export default withRoleProtection(ReaderDashboard, ['reader']);

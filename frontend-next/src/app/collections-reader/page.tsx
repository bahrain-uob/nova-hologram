"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { ReadersSidebar } from "@/components/dashboard/ReadersSidebar";
import { Top } from "@/components/dashboard/Top";
import withRoleProtection from "@/components/auth/withRoleProtection";
import { useRouter } from "next/navigation";
import Image from "next/image";

const CollectionReader: React.FC = () => {
  const [userName, setUserName] = useState("Reader");
  const router = useRouter();

  useEffect(() => {
    try {
      const userSessionStr = localStorage.getItem("userSession");
      if (userSessionStr) {
        const userSession = JSON.parse(userSessionStr);
        if (userSession.attributes && userSession.attributes.name) {
          setUserName(userSession.attributes.name);
        } else if (userSession.email) {
          const name = userSession.email.split("@")[0];
          setUserName(name.charAt(0).toUpperCase() + name.slice(1));
        }
      }
    } catch (error) {
      console.error("Error getting user session:", error);
    }
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      <div className="flex flex-col w-full">
        <Top className="w-full fixed top-0 z-10" ellipse="/avatars/user.png" />
        <div className="flex flex-row w-full pt-[61px]">
          <ReadersSidebar
            className="fixed left-0 top-[61px] h-[calc(100vh-61px)]"
            divClassName="bg-gray-100 hover:bg-gray-200"
            divClassNameOverride="text-indigo-600 bg-indigo-50"
          />

          <div className="flex-1 ml-[260px] p-6 md:p-8">
            <div className="mb-8">
              <h1 className="text-title text-2xl font-medium mb-1">Collections</h1>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">

              {/*collection 1*/}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-bold text-lg mb-2">Harry Potter</h3>
                <p className="text-sm text-gray-600 mb-4">9 books</p>
                <div className="flex overflow-hidden">
                  <Image src="/harry1.jpg" alt="Harry Potter 1" width={60} height={90} className="rounded" />
                  <Image src="/harry2.jpg" alt="Harry Potter 2" width={60} height={90} className="rounded" />
                  <Image src="/harry3.jpg" alt="Harry Potter 3" width={60} height={90} className="rounded" />
                </div>
                {/*click to view all the harry potter collection books*/} 
                <div
                  onClick={() => router.push("/inside-collection-reader")}
                  className="mt-4 text-indigo-600 text-sm cursor-pointer hover:underline"
                >
                  View All
                </div>
              </div>

              {/*collection 2*/}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-bold text-lg mb-2">Modern Fiction</h3>
                <p className="text-sm text-gray-600 mb-4">98 books</p>
                <div className="flex overflow-hidden">
                  <Image src="/fiction1.jpg" alt="Fiction 1" width={60} height={90} className="rounded" />
                  <Image src="/fiction2.jpg" alt="Fiction 2" width={60} height={90} className="rounded" />
                  <Image src="/fiction3.jpg" alt="Fiction 3" width={60} height={90} className="rounded" />
                </div>
                <div className="mt-4 text-indigo-600 text-sm cursor-pointer">View All</div>
              </div>

              {/*collection 1*/}
              <div className="bg-white rounded-lg shadow p-4">
                <h3 className="font-bold text-lg mb-2">Science & Technology</h3>
                <p className="text-sm text-gray-600 mb-4">156 books</p>
                <div className="flex overflow-hidden">
                  <Image src="/science1.jpg" alt="Science 1" width={60} height={90} className="rounded" />
                  <Image src="/science2.jpg" alt="Science 2" width={60} height={90} className="rounded" />
                  <Image src="/science3.jpg" alt="Science 3" width={60} height={90} className="rounded" />
                </div>
                <div className="mt-4 text-indigo-600 text-sm cursor-pointer">View All</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default withRoleProtection(CollectionReader, ["reader"]);

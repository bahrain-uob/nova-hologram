"use client";
import MainLayout from "@/components/layout/MainLayout";
import { Card, CardContent } from "@/components/ui/card";
import { PlayCircleIcon, RotateCwIcon } from "lucide-react";
import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";

export default function VideosGeneratedPage() {
  const router = useRouter();

  return (
    <MainLayout activePage="Manage Books">
      <div className="flex-1 overflow-auto p-6 bg-[#FAFAFB]">
        <div className="max-w-4xl mx-auto space-y-6">

          {/* AI-Generated Book Cover */}
          <Card className="shadow-none border border-gray-200 rounded-xl bg-white">
            <CardContent className="p-0">
              <div className="flex justify-between items-center px-5 pt-5">
                <h2 className="text-lg font-medium">AI-Generated Book Cover</h2>
                <div className="flex items-center gap-2">
                  <Input
                    className="w-64 text-sm border border-gray-200"
                    placeholder="Write a prompt to guide the AI..."
                  />
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <RotateCwIcon className="h-4 w-4 mr-2 text-white" />
                    Regenerate
                  </Button>
                </div>
              </div>
              <div className="px-5 pt-6 pb-10">
                <div className="flex items-center justify-center bg-gray-50 rounded-md p-8 min-h-[220px]">
                  <div className="text-center text-gray-400 text-sm">
                    <svg
                      className="mx-auto h-8 w-8 text-gray-400 mb-1"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M12 20h9"></path>
                      <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                    </svg>
                    <p>AI-generated cover will appear here.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Combined Book Summary + Trailer */}
          <Card className="shadow-none border border-gray-200 rounded-xl bg-white">
            <CardContent className="p-0 space-y-6">

              {/* Book Summary Section */}
              <div className="flex justify-between items-center p-5">
                <h2 className="text-lg font-medium">Book Summary</h2>
                <div className="flex items-center gap-2">
                  <Input
                    className="w-64 text-sm border border-gray-200"
                    placeholder="Write a prompt to generate summary..."
                  />
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <RotateCwIcon className="h-4 w-4 mr-2 text-white" />
                    Regenerate
                  </Button>
                </div>
              </div>
              <div className="px-5">
                <div className="border border-gray-200 rounded-md h-24 p-4 bg-white" />
              </div>

              {/* Book Trailer Section */}
              <div className="flex justify-between items-center p-5 pt-2">
                <h2 className="text-lg font-medium">Book Trailer</h2>
                <div className="flex items-center gap-2">
                  <Input
                    className="w-64 text-sm border border-gray-200"
                    placeholder="Write a prompt to generate trailer..."
                  />
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <RotateCwIcon className="h-4 w-4 mr-2 text-white" />
                    Regenerate
                  </Button>
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="bg-gray-50 rounded-md p-6">
                  <div className="h-40 flex items-center justify-center">
                    <div className="rounded-full bg-white/80 p-3">
                      <PlayCircleIcon className="h-10 w-10 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Chapter-wise Section */}
          <Card className="shadow-none border border-gray-200 rounded-xl bg-white">
            <CardContent className="p-0 space-y-6">

              <div className="px-5 pt-5">
                <h2 className="text-lg font-semibold">Chapter-wise</h2>
              </div>

              {/* Chapter 1 Summary */}
              <div className="flex justify-between items-center px-5 pt-4">
                <h3 className="text-base font-medium">Ch1 Summary</h3>
                <div className="flex items-center gap-2">
                  <Input
                    className="w-64 text-sm border border-gray-200"
                    placeholder="Write a prompt to guide the AI..."
                  />
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <RotateCwIcon className="h-4 w-4 mr-2 text-white" />
                    Regenerate
                  </Button>
                </div>
              </div>
              <div className="px-5">
                <div className="border border-gray-200 rounded-md h-24 p-4 bg-white" />
              </div>

              {/* Chapter 1 Trailer */}
              <div className="flex justify-between items-center px-5 pt-2">
                <h3 className="text-base font-medium">Ch1 Trailer</h3>
                <div className="flex items-center gap-2">
                  <Input
                    className="w-64 text-sm border border-gray-200"
                    placeholder="Write a prompt to guide the AI..."
                  />
                  <Button className="bg-indigo-600 hover:bg-indigo-700 text-white">
                    <RotateCwIcon className="h-4 w-4 mr-2 text-white" />
                    Regenerate
                  </Button>
                </div>
              </div>
              <div className="px-5 pb-5">
                <div className="bg-gray-50 rounded-md p-6">
                  <div className="h-40 flex items-center justify-center">
                    <div className="rounded-full bg-white/80 p-3">
                      <PlayCircleIcon className="h-10 w-10 text-gray-400" />
                    </div>
                  </div>
                </div>
              </div>

            </CardContent>
          </Card>

          {/* Bottom Buttons */}
          <div className="flex justify-end gap-3 pt-4">
          <Button
  variant="outline"
  className="rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-100 hover:text-black transition-colors"
  onClick={() => router.push("/addbook")}
>
  Back
</Button>


            <Button className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg">
              Add Book
            </Button>
          </div>

        </div>
      </div>
    </MainLayout>
  );
}

import React from "react";
import { Home, BookOpen, Bookmark, BarChart } from "lucide-react";
import { SignOutButton } from "@/components/SignOutButton";

interface ReadersSidebarProps {
  className?: string;
  divClassName?: string;
  divClassNameOverride?: string;
  book?: string;
  books?: string;
  frame?: string;
  frame1?: string;
  frame2?: string;
  img?: string;
}

export const ReadersSidebar: React.FC<ReadersSidebarProps> = ({
  className = "",
  divClassName = "",
  divClassNameOverride = "",
}) => {
  return (
    <div className={`w-[260px] h-[1030px] bg-white ${className}`}>
      <div className="flex flex-col space-y-2 py-4">
        <div className="px-3">
          <div
            className={`flex items-center w-full p-3 rounded-lg ${divClassNameOverride}`}
          >
            <Home className="mr-3 h-5 w-5" />
            <div className="text-base font-medium">Home</div>
          </div>
        </div>

        <div className="px-3">
          <div
            className={`flex items-center w-full p-3 rounded-lg ${divClassName}`}
          >
            <BookOpen className="mr-3 h-5 w-5" />
            <div className="text-base font-medium">Browse Books</div>
          </div>
        </div>

        <div className="px-3">
          <div
            className={`flex items-center w-full p-3 rounded-lg ${divClassName}`}
          >
            <Bookmark className="mr-3 h-5 w-5" />
            <div className="text-base font-medium">Reading List</div>
          </div>
        </div>

        <div className="px-3">
          <div
            className={`flex items-center w-full p-3 rounded-lg ${divClassName}`}
          >
            <BarChart className="mr-3 h-5 w-5" />
            <div className="text-base font-medium">Progress</div>
          </div>
        </div>

        <div
          className={`absolute inset-x-0 bottom-0 h-16 flex items-center w-40 p-2 rounded-lg m-12 ${divClassName}`}
        >
          <SignOutButton className="text-base font-medium" />
        </div>
      </div>
    </div>
  );
};

import React from "react";
import { Search, Bell } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface TopProps {
  className?: string;
  ellipse?: string;
  mailClassName?: string;
}

export const Top: React.FC<TopProps> = ({
  className = "",
  ellipse = "",
  mailClassName = "",
}) => {
  return (
    <div className={`w-full h-[61px] bg-white flex items-center justify-between px-6 border-b ${className}`}>
      <div className="flex items-center gap-2">
        <div className="text-indigo-600 font-semibold text-xl">ClarityUI</div>
      </div>
      
      <div className="flex-1 max-w-2xl ml-16">
        <div className="relative">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="search"
            placeholder="Search..."
            className="pl-8 pr-4 py-2 bg-gray-50 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
          />
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <div className={`relative ${mailClassName}`}>
          <Bell className="h-5 w-5 text-gray-600" />
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
            3
          </span>
        </div>
        
        <Avatar>
          <AvatarImage src={ellipse || "/avatars/user.png"} alt="User" />
          <AvatarFallback>H</AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
};

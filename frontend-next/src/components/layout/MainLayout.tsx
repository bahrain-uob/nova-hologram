"use client";
import React from "react";
import {
  BookOpenIcon,
  LayoutDashboardIcon,
  LibraryIcon,
  LogOutIcon,
  SettingsIcon,
  UsersIcon,
  SearchIcon,
} from "lucide-react";
import { Input } from "../addbook/input";

export default function MainLayout({
  children,
  activePage = "Manage Books",
}: {
  children: React.ReactNode;
  activePage?: string;
}) {
  const navItems = [
    { label: "Dashboard", icon: <LayoutDashboardIcon className="h-5 w-5" /> },
    { label: "Manage Books", icon: <BookOpenIcon className="h-5 w-5" /> },
    { label: "Manage Collections", icon: <LibraryIcon className="h-5 w-5" /> },
    { label: "Manage Readers", icon: <UsersIcon className="h-5 w-5" /> },
  ];

  const footerNav = [
    { label: "Settings", icon: <SettingsIcon className="h-5 w-5" /> },
    { label: "Log out", icon: <LogOutIcon className="h-5 w-5" /> },
  ];

  return (
    <div className="bg-[#FAFAFB]">
      {/* Fixed Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-[#E4E4E7] z-10 flex items-center justify-between px-6">
        <div className="text-2xl font-bold text-indigo-600">ClarityUI</div>
        <div className="relative flex-1 max-w-2xl mx-auto">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="Type to search"
            className="pl-10 pr-4 py-1.5 w-full bg-gray-100 rounded-full"
          />
        </div>
      </header>

      {/* Sidebar + Main */}
      <div className="flex pt-16 min-h-screen">
        {/* Sidebar BELOW header */}
        <aside className="w-64 fixed top-16 left-0 bottom-0 bg-white border-r border-[#E4E4E7] p-4 flex flex-col justify-between">
        <nav className="space-y-1">
  {navItems.map((item, i) => {
    const isActive = item.label === activePage;
    return (
      <a
        href="#"
        key={i}
        className={`flex items-center gap-2 p-2 rounded-md ${
          isActive
            ? "bg-[#F0F1F3] text-[#4F46E5] font-medium"
            : "text-gray-600 hover:text-gray-900"
        }`}
      >
        {React.cloneElement(item.icon, {
          className: "h-5 w-5",
          color: isActive ? "#4F46E5" : undefined,
        })}
        <span className="text-sm">{item.label}</span>
      </a>
    );
  })}
</nav>


          <div className="mt-auto space-y-1">
            {footerNav.map((item, i) => (
              <a
                href="#"
                key={i}
                className="flex items-center gap-2 p-2 text-gray-500 hover:text-gray-800"
              >
                {item.icon}
                <span className="text-sm font-medium">{item.label}</span>
              </a>
            ))}
          </div>
        </aside>

        {/* Main Page Content */}
        <main className="flex-1 p-6 bg-[#FAFAFB] ml-64">{children}</main>
      </div>
    </div>
  );
}

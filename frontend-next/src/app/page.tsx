"use client";

import { useState } from "react";
import Link from "next/link";
import path from "path";

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const pages = [
    {
      name: "Dashboard",
      path: "/dashboard",
      description: "View your dashboard and analytics",
    },
    { name: "Login", path: "/login", description: "Sign in to your account" },
    { name: "Signup", path: "/signup", description: "Create a new account" },
    {
      name: "Verification",
      path: "/verification",
      description: "Verify your account",
    },
    {
      name: "Forgot Password",
      path: "/fPassword",
      description: "Retrieve your password",
    },
    {
      name: "Reader Home Page",
      path: "/reader-dashboard",
      description: "Reader home page",
    },
    {
      name: "Manage books(Librarian)",
      path: "/manage-book",
      description: "Manage books",
    },
    {
      name: "manage reader (Librarian)",
      path: "/manage-reader",
      description: "manage readers",
    },

    {
      name: "Recommendation (Librarian)",
      path: "/recomndation-librarian",
      description: "recommendation books",
    },
    

  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl font-bold text-center mb-2 text-white">
          Welcome to Your App
        </h1>
        <p className="text-center mb-12 text-gray-600 dark:text-gray-300">
          Navigate to any page in your application
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pages.map((page) => (
            <div
              key={page.name}
              className={`bg-white dark:bg-gray-800 rounded-lg shadow p-6 transition-all duration-200 ${
                hoveredCard === page.name
                  ? "shadow-lg transform -translate-y-1"
                  : "shadow"
              }`}
              onMouseEnter={() => setHoveredCard(page.name)}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-white">{page.name}</h2>
                <p className="text-gray-500 dark:text-gray-400">
                  {page.description}
                </p>
              </div>
              <div>
                <Link
                  href={page.path}
                  className="inline-block w-full px-4 py-2 text-center text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Go to {page.name}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

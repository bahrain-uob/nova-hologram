"use client";

import { useState } from "react";
import Link from "next/link";

export default function Home() {
  const [hoveredCard, setHoveredCard] = useState(null);

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
  ];

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-6 bg-gradient-to-b from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl font-bold text-center mb-2">
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
                <h2 className="text-xl font-semibold">{page.name}</h2>
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

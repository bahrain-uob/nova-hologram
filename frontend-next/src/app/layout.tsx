import type { Metadata } from "next";
import "./globals.css";
import { Plus_Jakarta_Sans, Inter } from "next/font/google";
import { AuthProvider } from "../context/auth-context";
import { Toaster } from "sonner";

// ✅ حمل الخطوط من Google وربطهم بالـ variables اللي نستخدمها
const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--semi-bold-13px-font-family",
  weight: ["400", "500", "700"],
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--semi-bold-16px-font-family",
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "Nova Hologram",
  description: "AI-powered reading materials platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${jakarta.variable} ${inter.variable}`}>
      <body className="antialiased">
        <AuthProvider>
          {children}
          <Toaster position="top-right" />
        </AuthProvider>
      </body>
    </html>
  );
}

"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Poppins } from "next/font/google";
import "./globals.css";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [userId, setUserId] = useState<string | null>(null);

  useEffect((): void => {
    const storedUserId: string | null = localStorage.getItem("userId");
    setUserId(storedUserId);
  }, []); 

  return (
    <html lang="en">
      <body
        className={`${poppins.className} min-h-screen bg-[#F7F9FA] text-[#333333] flex flex-col antialiased`}
      >
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#A1D99B]">
          <nav className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
            <Link href="/" className="text-2xl font-semibold text-[#2C6E49]">
              Complaint Portal
            </Link>

            <ul className="flex gap-2 items-center">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about.html">About</Link></li>
              <li><Link href="/contact-us.html">Contact us</Link></li>
              <li><Link href="/complaint.html">Complaint portal</Link></li>

            
              {userId === null && (
                <li>
                  <Link
                    href="/login.html"
                    className="px-3 py-2 text-sm font-medium text-[#2C6E49]"
                  >
                    Login
                  </Link>
                </li>
              )}
            </ul>
          </nav>
        </header>

        <main className="flex-1 px-4 py-10">
          {children}
        </main>

        <footer className="border-t py-6 text-center text-sm">
          © {new Date().getFullYear()} Complaint Portal
        </footer>
      </body>
    </html>
  );
}

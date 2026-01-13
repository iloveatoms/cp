"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { Poppins } from "next/font/google";
import "./globals.css";
import {ToastContainer} from "react-toastify";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {

  const [userId, setUserId] = useState<number>(-1);
  const [userProfileUrl, setUserProfileUrl] = useState("/uploads/user.jpg");
  useEffect(()=> {
    setUserId(Number(localStorage.getItem("userid") || "-1"));
    setUserProfileUrl(localStorage.getItem("profileUrl") || "/uploads/user.jpg");
  }, []);

  return (
    <html lang="en">
      <body
        className={`${poppins.className} min-h-screen dark flex flex-col antialiased`}
      >
        <header className="sticky top-0 z-50 bg-dark/95 backdrop-blur border-b border-[#A1D99B]">
        <ToastContainer />
          <nav className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
            <Link href="/" className="text-2xl font-semibold text-[#2C6E49]">
              Complaint Portal
            </Link>

            <ul className="flex gap-2 items-center">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/about">About</Link></li>
              <li><Link href="/contact-us">Contact us</Link></li>
              <li><Link href="/complaint">Complaint portal</Link></li>


              {
              (userId == -1)
              ? (
                <li>
                  <Link
                    href="/login"
                    className="px-3 py-2 text-sm font-medium text-[#2C6E49]"
                  >
                    Login
                  </Link>
                </li>
              )
              : (
                <li>
                   <Link
                   href="/profile">
                  <img
                    src={userProfileUrl}
                    style={{marginLeft : "30px"}}
                    className="w-10 h-10 rounded-full mr-3"/>
                    </Link>
                </li>
              )
              }
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

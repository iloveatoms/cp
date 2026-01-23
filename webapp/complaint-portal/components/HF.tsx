"use client";

import Link from "next/link";
import { useAuthContext } from "@/lib/context/auth";


export function Header(){
  const { userProfile } = useAuthContext();
  const userID = userProfile.userid;

  return(
    <header className="sticky top-0 z-50 bg-dark/95 backdrop-blur border-b border-[#A1D99B]">
      <nav className="max-w-6xl mx-auto px-4 h-16 flex justify-between items-center">
        <Link href="/" className="text-2xl font-semibold text-[#2C6E49]">
          Complaint Portal
        </Link>

        <ul className="flex gap-2 items-center">
          <li><Link href="/">Home</Link></li>
          <li><Link href="/complaint">Complaint</Link></li>
          <li><Link href="/map">Live Map</Link></li>
          <li><Link href="/about">About</Link></li>
          <li><Link href="/contact-us">Contact us</Link></li>
          {
          (userID == -1)
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
                src={userProfile.profileUrl}
                style={{marginLeft : "30px"}}
                className="w-10 h-10 rounded-full mr-3"/>
                </Link>
            </li>
          )
          }
        </ul>
      </nav>
    </header>
  );
}


export function Footer(){
  return (
    <footer className="border-t pt-0.5 text-center text-sm">
      © {new Date().getFullYear()} Complaint Portal
    </footer>
  )
}

"use client";

import "./globals.css";
import { poppins } from "@/app/fonts/poppins";
import {Header, Footer} from "@/components/HF";
import { ToastContainer, Zoom } from "react-toastify";
import { AuthProvider } from "@/lib/context/auth";


export default function RootLayout({ children }: {children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <title>Complaint Portal</title>
      </head>
      <body className={`${poppins.className} min-h-screen dark flex flex-col antialiased`} >
      <ToastContainer position="top-center" autoClose={2600} hideProgressBar closeOnClick pauseOnHover={false} draggable theme="dark" transition={Zoom}/>
        <AuthProvider>
          <Header/>
            <main className="flex-1 px-4">
              {children}
            </main>
          <Footer/>
        </AuthProvider>
      </body>
    </html>
  );
}

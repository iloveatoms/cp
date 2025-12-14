import React from 'react'
import Link from 'next/link'
import { Poppins } from 'next/font/google'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
})

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body
        className={`${poppins.className} min-h-screen bg-[#F7F9FA] text-[#333333] flex flex-col antialiased`}
      >
        <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-[#A1D99B] shadow-[0_4px_30px_rgba(0,0,0,0.07)]">
          <nav className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <Link
                href="/"
                className="text-2xl font-semibold text-[#2C6E49] tracking-tight"
              >
                Complaint Portal
              </Link>
              <ul className="flex items-center gap-2">
                {[
                  { href: '/', label: 'Home' },
                  { href: '/about', label: 'About' },
                  { href: '/contact-us', label: 'Contact Us' },
                  { href: '/complaint', label: 'Complaint' },
                  { href: '/login', label: 'Login' },
                ].map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className="px-3 py-2 text-sm font-medium text-[#2C6E49] rounded-full border border-transparent hover:border-[#A1D99B] hover:bg-[#F0FBF4] transition-colors"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
        </header>

        <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 py-10">
          <section className="max-w-6xl mx-auto bg-white rounded-2xl border border-[#E1F1E4] shadow-[0_25px_60px_rgba(44,110,73,0.08)] p-6 sm:p-10">
            {children}
          </section>
        </main>

        <footer className="bg-white border-t border-[#E1F1E4]">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 text-sm text-[#4D4D4D]">
            © {new Date().getFullYear()} Complaint Portal. All rights reserved.
          </div>
        </footer>
      </body>
    </html>
  )
}

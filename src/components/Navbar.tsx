"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";

export default function Navbar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Listen to scroll to toggle background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (pathname?.startsWith("/admin")) {
    return null;
  }

  // Navbar is in "light mode" (white background, black text)
  // if scrolled down OR if the mobile menu overlay is open.
  const isLightMode = isScrolled || isMobileMenuOpen;

  return (
    <>
      <nav
        className={`w-full z-50 fixed top-0 left-0 right-0 transition-all duration-500 ${
          isLightMode
            ? "bg-white border-b-4 border-gray-900 shadow-sm py-2"
            : "bg-transparent py-4 md:py-6"
        }`}
      >
        <div className="flex items-center justify-between px-6 md:px-10 max-w-[1440px] mx-auto w-full">
          {/* Logo */}
          <Link
            href="/"
            className="flex items-center gap-1 group z-[60] hover:scale-105 transition-transform duration-300"
          >
            <div
              className={`${!isLightMode ? "bg-white text-black" : "bg-black text-white"} font-black tracking-tight text-xs md:text-sm px-3 py-1.5 rounded-2xl rounded-bl-sm relative shadow-sm transition-colors`}
            >
              TWIBBON
              <div
                className={`absolute -bottom-1.5 left-0 w-3 h-3 ${!isLightMode ? "bg-white" : "bg-black"} transition-colors`}
                style={{ clipPath: "polygon(0 0, 100% 0, 0 100%)" }}
              />
            </div>
            <div
              className={`bg-[#CCFF00] text-black font-black text-xs md:text-sm px-3 py-1.5 rounded-full border-[2px] ${!isLightMode ? "border-transparent" : "border-gray-900"} group-hover:shadow-[4px_4px_0px_rgba(0,0,0,0.2)] transition-all`}
            >
              BEM UNSOED
            </div>
          </Link>

          {/* Right Section: Desktop CTA + Mobile Toggle */}
          <div className="flex items-center gap-4 z-[60]">
            <Link
              href="/admin/login"
              className={`hidden md:block px-6 py-2.5 rounded-full border-2 text-xs md:text-sm font-black uppercase tracking-wider transition-all duration-300 ${
                !isLightMode
                  ? "border-white text-white hover:bg-[#CCFF00] hover:text-black hover:border-[#CCFF00] hover:shadow-[0_0_20px_rgba(204,255,0,0.4)] hover:-translate-y-0.5"
                  : "border-gray-900 text-gray-900 hover:bg-[#CCFF00] hover:shadow-[4px_4px_0px_#111827] hover:-translate-y-1"
              }`}
            >
              Buat Twibbon
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              className={`md:hidden p-2 rounded-lg border-2 transition-all duration-300 ${
                !isLightMode
                  ? "border-white text-white hover:bg-white hover:text-[#0038FF]"
                  : "border-gray-900 text-gray-900 bg-white hover:bg-[#CCFF00] hover:shadow-[3px_3px_0px_#111827] hover:-translate-y-0.5"
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                {isMobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="3"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-[45] bg-white pt-28 px-6 md:hidden flex flex-col h-screen border-b-4 border-gray-900">
          <div className="flex flex-col gap-6 text-center">
            <Link
              href="/twibbons"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-black text-gray-900 uppercase tracking-widest border-b-4 border-transparent hover:border-[#CCFF00] inline-block mx-auto pb-2 transition-colors"
            >
              Katalog Twibbon
            </Link>

            <Link
              href="/admin/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-8 bg-[#CCFF00] border-4 border-gray-900 p-4 rounded-full text-xl font-black text-gray-900 uppercase tracking-widest shadow-[6px_6px_0px_#0038FF] active:translate-y-1 active:shadow-[2px_2px_0px_#0038FF] transition-all"
            >
              BUAT TWIBBON
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

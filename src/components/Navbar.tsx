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

  const linkClass = !isLightMode 
    ? "border-white/30 text-white hover:bg-white/10" 
    : "border-gray-200 text-gray-900 hover:bg-gray-100";

  return (
    <>
      <nav 
        className={`w-full z-50 fixed top-0 left-0 right-0 transition-all duration-300 ${
          isLightMode ? "bg-white border-b-4 border-gray-900 shadow-sm" : "bg-transparent py-2"
        }`}
      >
        <div className="flex items-center justify-between px-6 md:px-10 max-w-[1440px] mx-auto w-full py-4 md:py-6">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-1 group z-[60]">
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
              className={`bg-[#CCFF00] text-black font-black text-xs md:text-sm px-3 py-1.5 rounded-full border-[1.5px] ${!isLightMode ? "border-white" : "border-transparent"} shadow-sm transition-colors`}
            >
              BEM UNSOED
            </div>
          </Link>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center space-x-2">
            <Link href="/twibbons" className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-colors ${linkClass}`}>
              Twibbon
            </Link>
            <Link href="#" className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-colors ${linkClass}`}>
              Cara Pakai
            </Link>
            <Link href="#" className={`px-4 py-1.5 rounded-full border text-xs font-semibold transition-colors ${linkClass}`}>
              Tentang
            </Link>
          </div>

          {/* Right Section: Desktop CTA + Mobile Toggle */}
          <div className="flex items-center gap-4 z-[60]">
            <Link
              href="/admin/login"
              className={`hidden md:block px-6 py-2 rounded-full border-2 text-xs md:text-sm font-black uppercase tracking-wider transition-colors ${
                !isLightMode
                  ? "border-white text-white hover:bg-white hover:text-[#0038FF]" 
                  : "border-gray-900 text-gray-900 hover:bg-gray-900 hover:text-white"
              }`}
            >
              Buat Twibbon
            </Link>
            
            {/* Mobile Hamburger Toggle */}
            <button 
              className={`md:hidden p-2 rounded-lg border-2 transition-colors ${
                !isLightMode 
                  ? "border-white text-white hover:bg-white/10" 
                  : "border-gray-900 text-gray-900 bg-white hover:bg-gray-100"
              }`}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 6h16M4 12h16m-7 6h7" />
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
              href="#" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-black text-gray-900 uppercase tracking-widest border-b-4 border-transparent hover:border-[#CCFF00] inline-block mx-auto pb-2 transition-colors"
            >
              Cara Pakai
            </Link>
            <Link 
              href="#" 
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-black text-gray-900 uppercase tracking-widest border-b-4 border-transparent hover:border-[#CCFF00] inline-block mx-auto pb-2 transition-colors"
            >
              Tentang
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

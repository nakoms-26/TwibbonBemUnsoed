"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Plus, Menu, X } from "lucide-react";

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

  return (
    <>
      <nav
        className="w-full z-50 fixed top-0 left-0 right-0 transition-all duration-300 py-4 md:py-6"
        style={{
          background: isScrolled || isMobileMenuOpen ? "rgba(30, 10, 74, 0.85)" : "transparent",
          backdropFilter: isScrolled || isMobileMenuOpen ? "blur(20px)" : "none",
          WebkitBackdropFilter: isScrolled || isMobileMenuOpen ? "blur(20px)" : "none",
          borderBottom: isScrolled || isMobileMenuOpen ? "1px solid rgba(255, 255, 255, 0.1)" : "1px solid transparent",
          boxShadow: isScrolled || isMobileMenuOpen ? "0 4px 24px rgba(0, 0, 0, 0.2)" : "none",
        }}
      >
        <div className="flex items-center justify-between px-6 md:px-10 max-w-[1440px] mx-auto w-full">
          {/* Logo Pills (Original Structure) */}
          <Link
            href="/"
            className="flex items-center gap-1 group z-[60] hover:scale-105 transition-transform duration-300"
          >
            <div
              className="font-black tracking-tight text-xs md:text-sm px-3.5 py-1.5 rounded-2xl rounded-bl-sm relative shadow-sm text-black transition-colors"
              style={{ background: "#ffffff" }}
            >
              TWIBBON
              <div
                className="absolute -bottom-1.5 left-0 w-3 h-3 transition-colors"
                style={{
                  background: "#ffffff",
                  clipPath: "polygon(0 0, 100% 0, 0 100%)",
                }}
              />
            </div>
            <div
              className="font-black text-xs md:text-sm px-3.5 py-1.5 rounded-full shadow-sm text-black transition-all"
              style={{ background: "#FDB927" }}
            >
              BEM UNSOED
            </div>
          </Link>

          {/* Right Section: Desktop CTA + Mobile Toggle */}
          <div className="flex items-center gap-4 z-[60]">
            <Link
              href="/admin/login"
              className="hidden md:flex items-center gap-2 px-6 py-2.5 rounded-full text-xs md:text-sm font-black uppercase tracking-wider text-black transition-all duration-300 hover:scale-105 shadow-md"
              style={{
                background: "#FDB927",
                boxShadow: "0 4px 16px rgba(253, 185, 39, 0.2)",
              }}
            >
              <Plus size={16} strokeWidth={3} />
              <span>Buat Twibbon</span>
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              className="md:hidden p-2 rounded-xl border transition-all duration-300"
              style={{
                background: "rgba(255, 255, 255, 0.1)",
                borderColor: "rgba(255, 255, 255, 0.2)",
                color: "white",
              }}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay (Original Structure) */}
      {isMobileMenuOpen && (
        <div
          className="fixed inset-0 z-[45] pt-28 px-6 md:hidden flex flex-col h-screen border-b"
          style={{
            background: "rgba(22, 8, 55, 0.96)",
            backdropFilter: "blur(24px)",
            WebkitBackdropFilter: "blur(24px)",
            borderColor: "rgba(255, 255, 255, 0.08)",
          }}
        >
          <div className="flex flex-col gap-6 text-center max-w-md mx-auto w-full">
            <Link
              href="/twibbons"
              onClick={() => setIsMobileMenuOpen(false)}
              className="text-2xl font-black uppercase tracking-widest py-3 border-b transition-colors"
              style={{
                color: "#ffffff",
                borderColor: "rgba(255, 255, 255, 0.1)",
              }}
            >
              Katalog Twibbon
            </Link>

            <Link
              href="/admin/login"
              onClick={() => setIsMobileMenuOpen(false)}
              className="mt-8 p-4 rounded-full text-xl font-black uppercase tracking-widest text-black shadow-md transition-all active:scale-95"
              style={{
                background: "#FDB927",
                boxShadow: "0 4px 16px rgba(253, 185, 39, 0.2)",
              }}
            >
              BUAT TWIBBON
            </Link>
          </div>
        </div>
      )}
    </>
  );
}

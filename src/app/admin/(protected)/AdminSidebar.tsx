"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

export default function AdminSidebar({ userName }: { userName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/admin/dashboard", label: "Dashboard" },
    { href: "/admin/twibbons", label: "Kelola Twibbon" },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex items-center justify-between bg-[#0038FF] p-4 text-white relative z-50 shadow-md">
        <span className="text-xl font-black tracking-tighter uppercase">DASHBOARD</span>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 bg-white/10 rounded-lg hover:bg-white/20 transition-colors"
        >
          {isOpen ? (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed md:relative top-0 left-0 h-full w-3/4 max-w-sm md:w-72 bg-[#0038FF] border-r border-[#0038FF] flex flex-col shadow-[20px_0_50px_rgba(0,0,0,0.1)] z-50 md:z-20 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
      >
        <div className="h-20 flex items-center px-8 border-b border-white/20 shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-xl font-black text-white tracking-tighter uppercase">
              DASHBOARD
            </span>
          </div>
        </div>
        
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className={`block px-5 py-3 text-sm uppercase tracking-wider rounded-xl transition-all ${
                  isActive
                    ? "font-black text-black bg-[#CCFF00] shadow-md transform hover:scale-[1.02]"
                    : "font-bold text-white hover:bg-white/10 border-2 border-transparent hover:border-white/20"
                }`}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t border-white/20 bg-black/10 shrink-0">
          <div className="mb-4 text-xs font-bold text-white/70 uppercase tracking-widest">
            Login Sebagai: <br />
            <span className="font-black text-white text-sm mt-1 block truncate">
              {userName}
            </span>
          </div>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}

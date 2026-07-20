"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";
import { Menu, X, LayoutDashboard, Image as ImageIcon } from "lucide-react";

export default function AdminSidebar({ userName }: { userName: string }) {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  const navLinks = [
    { href: "/admin/dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
    { href: "/admin/twibbons", label: "Kelola Twibbon", icon: <ImageIcon size={18} /> },
  ];

  return (
    <>
      {/* Mobile Top Bar */}
      <div
        className="md:hidden flex items-center justify-between p-4 relative z-50 shadow-sm border-b"
        style={{
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
          borderColor: "rgba(79, 77, 154, 0.12)",
        }}
      >
        <div className="flex items-center space-x-3">
          <div className="relative w-8 h-8">
            <Image src="/logo.png" alt="Logo" fill sizes="32px" className="object-contain" />
          </div>
          <span className="text-lg font-black tracking-tighter uppercase" style={{ color: "#2f2f67" }}>
            DASHBOARD
          </span>
        </div>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-xl transition-colors"
          style={{ background: "rgba(79, 77, 154, 0.08)", color: "#2f2f67" }}
        >
          {isOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Sidebar Overlay for Mobile */}
      {isOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Content */}
      <aside
        className={`fixed md:relative top-0 left-0 h-full w-3/4 max-w-sm md:w-72 border-r flex flex-col z-50 md:z-20 transform transition-transform duration-300 ease-in-out ${
          isOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"
        }`}
        style={{
          background: "rgba(255, 255, 255, 0.75)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderColor: "rgba(79, 77, 154, 0.12)",
          boxShadow: "4px 0 24px rgba(79, 77, 154, 0.06)",
        }}
      >
        <div className="h-20 flex items-center px-8 border-b shrink-0 space-x-3" style={{ borderColor: "rgba(79, 77, 154, 0.1)" }}>
          <div className="relative w-9 h-9">
            <Image src="/logo.png" alt="Logo" fill sizes="36px" className="object-contain" />
          </div>
          <span className="text-xl font-black tracking-tighter uppercase" style={{ color: "#2f2f67" }}>
            DASHBOARD
          </span>
        </div>
        
        <nav className="flex-1 p-6 space-y-3 overflow-y-auto">
          {navLinks.map((link) => {
            const isActive = pathname === link.href || pathname?.startsWith(link.href + "/");
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setIsOpen(false)}
                className="flex items-center space-x-3 px-5 py-3.5 text-xs font-black uppercase tracking-wider rounded-2xl transition-all"
                style={
                  isActive
                    ? {
                        background: "#4f4d9a",
                        color: "#ffffff",
                        boxShadow: "0 4px 16px rgba(79, 77, 154, 0.3)",
                      }
                    : {
                        color: "#2f2f67",
                        background: "transparent",
                      }
                }
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="p-6 border-t shrink-0" style={{ borderColor: "rgba(79, 77, 154, 0.1)", background: "rgba(79, 77, 154, 0.03)" }}>
          <div className="mb-4 text-[10px] font-extrabold uppercase tracking-widest" style={{ color: "#4f4d9a", opacity: 0.8 }}>
            Login Sebagai: <br />
            <span className="font-black text-sm mt-1 block truncate" style={{ color: "#2f2f67" }}>
              {userName}
            </span>
          </div>
          <LogoutButton />
        </div>
      </aside>
    </>
  );
}

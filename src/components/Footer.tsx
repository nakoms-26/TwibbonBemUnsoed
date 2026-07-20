"use client";

import { usePathname } from "next/navigation";

export default function Footer() {
  const pathname = usePathname();
  
  if (pathname?.startsWith("/admin")) {
    return null;
  }

  return (
    <footer
      className="w-full py-8 border-t z-20 relative mt-auto"
      style={{
        background: "rgba(255, 255, 255, 0.70)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderColor: "rgba(79, 77, 154, 0.12)",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 flex flex-col items-center justify-center text-center text-[10px] md:text-xs font-bold uppercase tracking-widest gap-2">
        <p style={{ color: "#2f2f67" }}>© {new Date().getFullYear()} BEM UNSOED.</p>
        <p className="leading-relaxed" style={{ color: "#4f4d9a", opacity: 0.8 }}>
          Dibuat oleh{" "}
          <a
            href="https://www.instagram.com/nakomisme/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline transition-colors"
            style={{ color: "#4f4d9a" }}
          >
            Kementerian Media dan Komunikasi
          </a>
          <br className="md:hidden" />
          <span className="hidden md:inline"> — </span>Direktorat Jenderal Website
        </p>
      </div>
    </footer>
  );
}

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
        background: "#ffffff",
        borderColor: "rgba(45, 27, 105, 0.12)",
      }}
    >
      <div className="max-w-[1440px] mx-auto px-6 md:px-10 flex flex-col items-center justify-center text-center text-[10px] md:text-xs font-bold uppercase tracking-widest gap-2">
        <p style={{ color: "#1e0a4a" }}>© {new Date().getFullYear()} BEM UNSOED.</p>
        <p className="leading-relaxed" style={{ color: "#2d1b69", opacity: 0.8 }}>
          Dibuat oleh{" "}
          <a
            href="https://www.instagram.com/nakomisme/"
            target="_blank"
            rel="noopener noreferrer"
            className="hover:underline transition-colors"
            style={{ color: "#2d1b69" }}
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

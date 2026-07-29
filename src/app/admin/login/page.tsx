"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HeroSection from "@/components/home/HeroSection";
import { Archivo_Black } from "next/font/google";

const archivoBlack = Archivo_Black({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
});

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (res?.error) {
        setError("Username atau password salah.");
      } else {
        router.push("/admin/dashboard");
        router.refresh();
      }
    } catch (err) {
      setError("Terjadi kesalahan. Silakan coba lagi.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="h-[100dvh] flex flex-col md:flex-row font-sans selection:bg-[#FDB927] selection:text-black relative overflow-hidden w-full"
      style={{
        background: "linear-gradient(160deg, #1e0a4a 0%, #2d1b69 40%, #1a0f3d 100%)",
      }}
    >
      {/* Grid Pattern Accent Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
        }}
      />

      {/* Hero Section (Reused, Compact) - Left Side */}
      <div className="w-full md:w-3/5 flex flex-col justify-center overflow-hidden relative z-10">
        <HeroSection compact={true} />
      </div>

      {/* Bottom/Right Login Form Section */}
      <section
        className="rounded-t-[2.5rem] md:rounded-t-none md:rounded-l-[3.5rem] px-6 py-8 md:px-12 relative z-20 mt-auto md:mt-0 w-full md:w-2/5 flex flex-col justify-center flex-1 md:h-full shrink-0"
        style={{
          background: "#ffffff",
          borderLeft: "2px solid #0a031e",
          boxShadow: "-16px 0 40px rgba(0, 0, 0, 0.3)",
        }}
      >
        <div className="max-w-xl mx-auto flex flex-col items-center w-full">
          <div className="text-center mb-8">
            <h2
              className={`text-2xl md:text-4xl uppercase tracking-tight ${archivoBlack.className}`}
              style={{ color: "#1e0a4a" }}
            >
              ADMIN LOGIN
            </h2>
          </div>

          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div
                className="p-4 rounded-2xl text-xs font-bold text-center border"
                style={{
                  background: "rgba(239, 68, 68, 0.08)",
                  color: "#dc2626",
                  borderColor: "rgba(239, 68, 68, 0.2)",
                }}
              >
                {error}
              </div>
            )}

            <div className="space-y-5">
              <div>
                <label
                  htmlFor="username"
                  className="block text-xs font-extrabold uppercase tracking-widest mb-2"
                  style={{ color: "#1e0a4a" }}
                >
                  Username
                </label>
                <input
                  id="username"
                  name="username"
                  type="text"
                  autoComplete="username"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="appearance-none block w-full px-5 py-3.5 border rounded-xl focus:outline-none sm:text-sm font-semibold transition-all shadow-sm"
                  style={{
                    background: "#ffffff",
                    borderColor: "#0a031e",
                    borderWidth: "2px",
                    color: "#0a031e",
                  }}
                  placeholder="Masukkan username"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-xs font-extrabold uppercase tracking-widest mb-2"
                  style={{ color: "#1e0a4a" }}
                >
                  Password
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="appearance-none block w-full px-5 py-3.5 border rounded-xl focus:outline-none sm:text-sm font-semibold transition-all shadow-sm"
                  style={{
                    background: "#ffffff",
                    borderColor: "#0a031e",
                    borderWidth: "2px",
                    color: "#0a031e",
                  }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-4 text-xs font-extrabold uppercase tracking-wider text-black rounded-full transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed border-[3px] border-[#0a031e] shadow-[4px_4px_0px_#1e0a4a] hover:shadow-[8px_8px_0px_#1e0a4a] hover:-translate-y-1 hover:-translate-x-1"
                style={{ background: "#FDB927" }}
              >
                {isLoading ? "Memproses..." : "Masuk ke Dashboard"}
              </button>
            </div>

            <div className="text-center mt-6">
              <Link
                href="/"
                className="inline-block text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-100"
                style={{ color: "#1e0a4a", opacity: 0.9 }}
              >
                ← Kembali ke Beranda
              </Link>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}

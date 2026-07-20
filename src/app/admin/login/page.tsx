"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import HeroSection from "@/components/home/HeroSection";

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
      className="min-h-screen flex flex-col md:flex-row font-sans selection:bg-[#4f4d9a] selection:text-white relative overflow-hidden w-full"
      style={{
        background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd8f8 100%)",
      }}
    >
      {/* Background Radial Ambient Glow */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none blur-3xl opacity-50"
        style={{
          background: "radial-gradient(circle, rgba(142, 168, 234, 0.4) 0%, rgba(245, 243, 255, 0) 70%)",
        }}
      />

      {/* Hero Section (Reused, Compact) - Left Side */}
      <div className="w-full md:w-3/5 flex flex-col justify-center overflow-hidden relative z-10">
        <HeroSection compact={true} />
      </div>

      {/* Bottom/Right Login Form Section */}
      <section
        className="rounded-t-[2.5rem] md:rounded-t-none md:rounded-l-[3.5rem] px-6 py-10 md:px-12 relative z-20 mt-auto md:mt-0 w-full md:w-2/5 flex flex-col justify-center min-h-[50vh] md:min-h-screen shrink-0"
        style={{
          background: "rgba(255, 255, 255, 0.70)",
          backdropFilter: "blur(24px)",
          WebkitBackdropFilter: "blur(24px)",
          borderLeft: "1px solid rgba(79, 77, 154, 0.15)",
          boxShadow: "-16px 0 40px rgba(79, 77, 154, 0.08)",
        }}
      >
        <div className="max-w-xl mx-auto flex flex-col items-center w-full">
          
          <div className="text-center mb-8">
            <p className="text-xs font-bold uppercase tracking-widest mb-1" style={{ color: "#4f4d9a", opacity: 0.8 }}>
              Akses Terbatas
            </p>
            <h2 className="text-2xl md:text-4xl font-extrabold uppercase tracking-tight" style={{ color: "#2f2f67" }}>
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
                <label htmlFor="username" className="block text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: "#2f2f67" }}>
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
                    background: "rgba(255, 255, 255, 0.8)",
                    borderColor: "rgba(79, 77, 154, 0.2)",
                    color: "#2f2f67",
                  }}
                  placeholder="Masukkan username"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-xs font-extrabold uppercase tracking-widest mb-2" style={{ color: "#2f2f67" }}>
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
                    background: "rgba(255, 255, 255, 0.8)",
                    borderColor: "rgba(79, 77, 154, 0.2)",
                    color: "#2f2f67",
                  }}
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 px-4 text-xs font-extrabold uppercase tracking-wider text-white rounded-full transition-all shadow-md hover:scale-[1.02] active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{
                  background: "#4f4d9a",
                  boxShadow: "0 4px 16px rgba(79, 77, 154, 0.3)",
                }}
              >
                {isLoading ? "Memproses..." : "Masuk ke Dashboard"}
              </button>
            </div>
            
            <div className="text-center mt-6">
              <Link
                href="/"
                className="inline-block text-xs font-bold uppercase tracking-wider transition-opacity hover:opacity-100"
                style={{ color: "#4f4d9a", opacity: 0.8 }}
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

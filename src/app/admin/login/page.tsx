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
    <div className="min-h-screen bg-[#0038FF] flex flex-col md:flex-row font-sans selection:bg-[#CCFF00] selection:text-black relative overflow-hidden w-full">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />

      {/* Hero Section (Reused, Compact) - Left Side */}
      <div className="w-full md:w-3/5 flex flex-col justify-center overflow-hidden">
        <HeroSection compact={true} />
      </div>

      {/* Bottom/Right Login Form Section */}
      <section className="bg-white text-black rounded-t-[2.5rem] md:rounded-t-none md:rounded-l-[3.5rem] px-4 py-8 md:px-12 relative z-20 shadow-[0_-20px_50px_rgba(0,0,0,0.2)] md:shadow-[-20px_0_50px_rgba(0,0,0,0.2)] mt-auto md:mt-0 w-full md:w-2/5 flex flex-col justify-center min-h-[50vh] md:min-h-screen shrink-0">
        <div className="max-w-xl mx-auto flex flex-col items-center">
          
          <div className="text-center mb-6">
            <p className="text-[10px] md:text-xs font-bold uppercase tracking-widest text-gray-400 mb-1">
              Akses Terbatas
            </p>
            <h2 className="text-2xl md:text-4xl font-black text-gray-900 leading-tight uppercase tracking-tighter">
              ADMIN LOGIN
            </h2>
          </div>

          <form className="w-full space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className="bg-red-50 text-red-600 p-4 rounded-2xl text-sm border-2 border-red-200 text-center font-bold">
                {error}
              </div>
            )}
            
            <div className="space-y-5">
              <div>
                <label htmlFor="username" className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wide">
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
                  className="appearance-none relative block w-full px-4 py-3 md:py-4 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0038FF]/20 focus:border-[#0038FF] sm:text-base font-bold transition-all shadow-sm"
                  placeholder="Masukkan username"
                />
              </div>
              
              <div>
                <label htmlFor="password" className="block text-sm font-black text-gray-900 mb-2 uppercase tracking-wide">
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
                  className="appearance-none relative block w-full px-4 py-3 md:py-4 border-2 border-gray-200 placeholder-gray-400 text-gray-900 rounded-xl focus:outline-none focus:ring-4 focus:ring-[#0038FF]/20 focus:border-[#0038FF] sm:text-base font-bold transition-all shadow-sm"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={isLoading}
                className="w-full flex justify-center py-4 md:py-5 px-4 border-2 border-transparent text-sm md:text-base font-black rounded-full text-black bg-[#CCFF00] hover:scale-[1.02] focus:outline-none focus:ring-4 focus:ring-[#CCFF00]/50 transition-all shadow-lg disabled:opacity-70 disabled:cursor-not-allowed uppercase tracking-wider"
              >
                {isLoading ? "Memproses..." : "Masuk ke Dashboard"}
              </button>
            </div>
            
            <div className="text-center mt-6">
              <Link href="/" className="inline-block text-sm font-bold text-gray-400 hover:text-[#0038FF] transition-colors">
                &larr; Kembali ke Beranda
              </Link>
            </div>
          </form>
          
        </div>
      </section>
    </div>
  );
}

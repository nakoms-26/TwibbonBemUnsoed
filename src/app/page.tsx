"use client";

import HeroSection from "@/components/home/HeroSection";
import FeaturesSection from "@/components/home/FeaturesSection";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0038FF] flex flex-col font-sans selection:bg-[#CCFF00] selection:text-black relative overflow-hidden w-full">
      {/* Background Grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff15_1px,transparent_1px),linear-gradient(to_bottom,#ffffff15_1px,transparent_1px)] bg-[size:4rem_4rem] pointer-events-none z-0" />

      <HeroSection />
      
      <FeaturesSection />
    </div>
  );
}

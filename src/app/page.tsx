import Navbar from "@/components/Navbar";
import HeroSection from "@/components/home/HeroSection";
import LatestTwibbonsSection from "@/components/home/LatestTwibbonsSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col justify-between relative overflow-hidden w-full font-sans selection:bg-[#4f4d9a] selection:text-white"
      style={{
        background: "linear-gradient(135deg, #f5f3ff 0%, #ede9fe 50%, #ddd8f8 100%)",
      }}
    >
      {/* Ambient Radial Glow */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none blur-3xl opacity-50"
        style={{
          background: "radial-gradient(circle, rgba(142, 168, 234, 0.4) 0%, rgba(245, 243, 255, 0) 70%)",
        }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none blur-3xl opacity-40"
        style={{
          background: "radial-gradient(circle, rgba(79, 77, 154, 0.3) 0%, rgba(245, 243, 255, 0) 70%)",
        }}
      />

      {/* Grid Pattern Accent Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: `radial-gradient(#2f2f67 1.5px, transparent 1.5px)`,
          backgroundSize: "28px 28px",
        }}
      />

      <Navbar />

      <main className="flex-1 w-full flex flex-col justify-between relative z-10">
        <HeroSection />
        <LatestTwibbonsSection />
        <FeaturesSection />
      </main>

      <Footer />
    </div>
  );
}

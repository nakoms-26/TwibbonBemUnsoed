import Navbar from "@/components/Navbar";
import HeroSection from "@/components/home/HeroSection";
import LatestTwibbonsSection from "@/components/home/LatestTwibbonsSection";
import FeaturesSection from "@/components/home/FeaturesSection";
import Footer from "@/components/Footer";

export const revalidate = 0;

export default function Home() {
  return (
    <div
      className="min-h-screen flex flex-col justify-between relative overflow-hidden w-full selection:bg-[#FDB927] selection:text-black"
      style={{
        background: "linear-gradient(160deg, #1e0a4a 0%, #2d1b69 40%, #1a0f3d 100%)",
      }}
    >
      {/* Ambient Radial Glow */}
      <div
        className="absolute top-[-10%] left-[-10%] w-[700px] h-[700px] rounded-full pointer-events-none blur-3xl opacity-30"
        style={{
          background: "radial-gradient(circle, rgba(124, 92, 191, 0.6) 0%, transparent 70%)",
        }}
      />
      <div
        className="absolute bottom-[-10%] right-[-10%] w-[700px] h-[700px] rounded-full pointer-events-none blur-3xl opacity-25"
        style={{
          background: "radial-gradient(circle, rgba(167, 139, 250, 0.4) 0%, transparent 70%)",
        }}
      />

      {/* Grid Pattern Accent Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-[0.07]"
        style={{
          backgroundImage: `radial-gradient(rgba(255,255,255,0.4) 1px, transparent 1px)`,
          backgroundSize: "32px 32px",
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

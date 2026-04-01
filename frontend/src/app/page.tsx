import Navbar from "@/components/Navbar";
import SentinelBackground from "@/components/SentinelBackground";
import SentinelHero from "@/components/SentinelHero";

export default function Home() {
  return (
    <main className="min-h-screen text-[#171717] selection:bg-[#FACC15]/30 selection:text-[#171717]">
      <Navbar />
      <SentinelBackground />
      <SentinelHero />
      
      {/* Footer / Secondary sections */}
      <footer className="relative py-12 px-6 border-t border-white/5 bg-black/50 backdrop-blur-sm text-center">
        <p className="text-white/30 text-sm">
          Built on <span className="text-[#F78132] font-semibold tracking-wide">NOSANA</span> & <span className="text-[#F78132] font-semibold tracking-wide">SOLANA</span> for the AI Agent Challenge 2026.
        </p>
      </footer>
    </main>
  );
}

import Navbar from "@/components/navbar";
import Hero from "@/components/hero";
import FeaturesGrid from "@/components/features-grid";

export default function Dashboard() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <Navbar />
      <Hero />
      <FeaturesGrid />
    </div>
  );
}

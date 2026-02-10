import dynamic from "next/dynamic";
import { HeroSection } from "@/components/landing/HeroSection";

const FeaturesSection = dynamic(() => import("@/components/landing/FeaturesSection").then((mod) => mod.FeaturesSection));
const ProblemSolutionSection = dynamic(() => import("@/components/landing/ProblemSolutionSection").then((mod) => mod.ProblemSolutionSection));
const TrustSection = dynamic(() => import("@/components/landing/TrustSection").then((mod) => mod.TrustSection));
const OakSignalSection = dynamic(() => import("@/components/landing/OakSignalSection").then((mod) => mod.OakSignalSection));
const CTASection = dynamic(() => import("@/components/landing/CTASection").then((mod) => mod.CTASection));

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-between">
      <HeroSection />
      <div id="how-it-works">
        <FeaturesSection />
      </div>
      <ProblemSolutionSection />
      <TrustSection />
      <OakSignalSection />
      <CTASection />
    </main>
  );
}

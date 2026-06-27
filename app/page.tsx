import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/data/queries";
import HeroSection from "@/components/landing/HeroSection";
import TrustBar from "@/components/landing/TrustBar";
import FamilyRecognitionSection from "@/components/landing/FamilyRecognitionSection";
import WhySection from "@/components/landing/WhySection";
import ParentDebriefShowcase from "@/components/landing/ParentDebriefShowcase";
import ChildCompassShowcase from "@/components/landing/ChildCompassShowcase";
import EverythingYouReceive from "@/components/landing/EverythingYouReceive";
import RealLifeSupport from "@/components/landing/RealLifeSupport";
import ProductShowcase from "@/components/landing/ProductShowcase";
import HowItWorks from "@/components/landing/HowItWorks";
import TrustSection from "@/components/landing/TrustSection";
import TestimonialSection from "@/components/landing/TestimonialSection";
import ChildTimeline from "@/components/landing/ChildTimeline";
import PricingSection from "@/components/landing/PricingSection";
import FinalCTA from "@/components/landing/FinalCTA";
import ResourcesSection from "@/components/landing/ResourcesSection";
import Footer from "@/components/landing/Footer";

export default async function Home() {
  const user = await getSessionUser();
  if (user) redirect("/today");

  return (
    <main className="bg-[#FAF8F4]">
      <HeroSection />
      <TrustBar />
      <FamilyRecognitionSection />
      <WhySection />
      <ParentDebriefShowcase />
      <ChildCompassShowcase />
      <EverythingYouReceive />
      <RealLifeSupport />
      <ProductShowcase />
      <HowItWorks />
      <TrustSection />
      <TestimonialSection />
      <ChildTimeline />
      <PricingSection />
      <FinalCTA />
      <ResourcesSection />
      <Footer />
    </main>
  );
}

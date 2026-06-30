import { redirect } from "next/navigation";
import { getSessionUser } from "@/lib/data/queries";
import HeroSection from "@/components/landing/HeroSection";
import {
  BuiltForFamiliesSection,
  CorePillarsSection,
  LandingCallToActionSection,
  WhyFamiliesChooseSection,
} from "@/components/landing/BrandRefreshSections";
import Footer from "@/components/landing/Footer";

export default async function Home() {
  const user = await getSessionUser();
  if (user) redirect("/today");

  return (
    <main className="bg-[#F8FAFC]">
      <HeroSection />
      <WhyFamiliesChooseSection />
      <CorePillarsSection />
      <BuiltForFamiliesSection />
      <LandingCallToActionSection />
      <Footer />
    </main>
  );
}

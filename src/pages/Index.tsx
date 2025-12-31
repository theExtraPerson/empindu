import { Layout } from "@/components/layout/Layout";
import { HeroSection } from "@/components/sections/HeroSection";
import { FeaturedArtisans } from "@/components/sections/FeaturedArtisans";
import { CraftCategories } from "@/components/sections/CraftCategories";
import { ImpactDashboard } from "@/components/sections/ImpactDashboard";
import { ExhibitionCTA } from "@/components/sections/ExhibitionCTA";
import { Testimonials } from "@/components/sections/Testimonials";
import { Partners } from "@/components/sections/Partners";

const Index = () => {
  return (
    <Layout>
      <HeroSection />
      <Partners />
      <FeaturedArtisans />
      <CraftCategories />
      <ImpactDashboard />
      <ExhibitionCTA />
      <Testimonials />
    </Layout>
  );
};

export default Index;

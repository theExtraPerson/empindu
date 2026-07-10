import { HeroSection } from '@/components/sections/HeroSection';
import { FeaturedArtisans } from '@/components/sections/FeaturedArtisans';
import { LazyTestimonials } from '@/components/sections/LazyTestimonials';
import { MarketPlace } from '@/components/sections/MarketPlace';

export default function Page() {
  return (
    <>
      <HeroSection />
      <MarketPlace />
      <FeaturedArtisans />
      <LazyTestimonials />
    </>
  );
}

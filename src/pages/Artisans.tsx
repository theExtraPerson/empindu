import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  Loader2, 
  ArrowRight, 
  CheckCircle,
  Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import artisanPortrait from "@/assets/artisan-portrait.jpg";

// Interface matches public_profiles view (excludes sensitive PII like phone, bio)
interface Artisan {
  user_id: string;
  full_name: string | null;
  craft_specialty: string | null;
  location: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
  years_experience: number | null;
  portfolio_url: string | null;
  productCount?: number;
}

const craftTypes = [
  "ALL CRAFTS",
  "BASKETRY",
  "BARKCLOTH",
  "WOODCARVING",
  "POTTERY",
  "JEWELRY",
  "TEXTILES",
];

const Artisans = () => {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCraft, setSelectedCraft] = useState('ALL CRAFTS');

  useEffect(() => {
    fetchArtisans();
  }, []);

  const fetchArtisans = async () => {
    setLoading(true);
    try {
      // Fetch profiles of users who have the artisan role
      const { data: artisanRoles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id')
        .eq('role', 'artisan');

      if (rolesError) throw rolesError;

      if (!artisanRoles || artisanRoles.length === 0) {
        setArtisans([]);
        setLoading(false);
        return;
      }

      const artisanUserIds = artisanRoles.map(r => r.user_id);

      // Fetch profiles for these artisans using public_profiles view (excludes PII like phone)
      const { data: profiles, error: profilesError } = await supabase
        .from('public_profiles')
        .select('*')
        .in('user_id', artisanUserIds);

      if (profilesError) throw profilesError;

      // Fetch product counts for each artisan
      const { data: productCounts, error: productsError } = await supabase
        .from('products')
        .select('artisan_id')
        .in('artisan_id', artisanUserIds);

      if (productsError) throw productsError;

      // Count products per artisan
      const countMap: Record<string, number> = {};
      productCounts?.forEach(p => {
        countMap[p.artisan_id] = (countMap[p.artisan_id] || 0) + 1;
      });

      const artisansWithCounts = (profiles || []).map(profile => ({
        ...profile,
        productCount: countMap[profile.user_id] || 0,
      }));

      setArtisans(artisansWithCounts);
    } catch (error) {
      console.error('Error fetching artisans:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredArtisans = artisans.filter(artisan => {
    const matchesSearch = 
      artisan.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisan.craft_specialty?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      artisan.location?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCraft = 
      selectedCraft === 'ALL CRAFTS' || 
      artisan.craft_specialty?.toLowerCase().includes(selectedCraft.toLowerCase());
    
    return matchesSearch && matchesCraft;
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative bg-foreground pt-32 pb-20 overflow-hidden border-b-2 border-foreground">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0 pattern-mudcloth" />
        </div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.1 }}
              className="inline-block px-4 py-2 border-2 border-background/30 text-background font-display text-xs tracking-widest mb-6"
            >
              MASTER CRAFTSPEOPLE OF UGANDA
            </motion.span>
            <h1 className="font-display text-5xl md:text-6xl lg:text-8xl font-bold text-background tracking-tight leading-[0.9] mb-6">
              MEET OUR
              <br />
              <span className="text-secondary">ARTISANS</span>
            </h1>
            <p className="text-background/70 text-lg md:text-xl mb-10 max-w-2xl mx-auto font-body">
              Connect with skilled craftspeople from across Uganda. 
              Each artisan brings generations of expertise and unique cultural heritage.
            </p>
            
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-background/50" />
                <Input
                  placeholder="Search artisans by name, craft, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-14 bg-background/10 border-2 border-background/30 text-background placeholder:text-background/50 font-body text-lg focus:border-background"
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Decorative corner */}
        <div className="absolute bottom-0 right-0 w-32 h-32 border-l-4 border-t-4 border-secondary hidden lg:block" />
      </section>

      {/* Craft Type Filter */}
      <section className="py-6 border-b-2 border-foreground bg-background sticky top-16 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {craftTypes.map((type, index) => (
              <motion.button
                key={type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedCraft(type)}
                className={`px-5 py-2.5 font-display text-xs tracking-widest whitespace-nowrap transition-all border-2 ${
                  selectedCraft === type
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-transparent text-foreground border-foreground hover:bg-primary hover:text-primary-foreground hover:border-primary"
                }`}
              >
                {type}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Artisans Grid */}
      <section className="py-16 md:py-24 bg-muted">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10 pb-6 border-b-2 border-foreground">
            <p className="text-muted-foreground font-body">
              {loading ? 'Loading...' : (
                <>Showing <span className="font-semibold text-foreground">{filteredArtisans.length}</span> artisans</>
              )}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </div>
          ) : filteredArtisans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-24 border-2 border-dashed border-foreground/30"
            >
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display text-2xl font-bold text-foreground mb-2 tracking-wider">
                NO ARTISANS FOUND
              </h3>
              <p className="text-muted-foreground font-body">
                {searchTerm || selectedCraft !== 'ALL CRAFTS'
                  ? 'Try adjusting your search or filters'
                  : 'Check back soon for new artisans'
                }
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredArtisans.map((artisan, index) => (
                <motion.div
                  key={artisan.user_id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Link to={`/artisans/${artisan.user_id}`}>
                    <div className="bg-background border-2 border-foreground overflow-hidden transition-all duration-500 hover:-translate-y-2 shadow-brutal hover:shadow-brutal-lg">
                      {/* Image */}
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img
                          src={artisan.avatar_url || artisanPortrait}
                          alt={artisan.full_name || 'Artisan'}
                          className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 group-hover:scale-105"
                        />
                        {artisan.is_verified && (
                          <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 bg-primary text-primary-foreground font-display text-xs tracking-wider border-2 border-foreground">
                            <CheckCircle className="h-3 w-3" />
                            VERIFIED
                          </div>
                        )}
                        {artisan.years_experience && (
                          <div className="absolute bottom-4 right-4 px-3 py-1 bg-background text-foreground font-display text-xs tracking-wider border-2 border-foreground">
                            {artisan.years_experience}+ YEARS
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-6 border-t-2 border-foreground">
                        <div className="mb-4">
                          <h3 className="font-display text-xl font-bold text-foreground tracking-wider group-hover:text-primary transition-colors uppercase">
                            {artisan.full_name || 'Unknown Artisan'}
                          </h3>
                          {artisan.craft_specialty && (
                            <span className="inline-block px-3 py-1 bg-muted text-foreground font-display text-xs tracking-wider mt-2 border border-foreground">
                              {artisan.craft_specialty.toUpperCase()}
                            </span>
                          )}
                        </div>

                        {artisan.location && (
                          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4 font-body">
                            <MapPin className="h-4 w-4" />
                            {artisan.location}
                          </div>
                        )}

                        <div className="flex items-center justify-between pt-4 border-t border-foreground/20">
                          <span className="text-muted-foreground text-sm font-body">
                            {artisan.productCount} products
                          </span>
                          <span className="flex items-center gap-1 text-primary font-display text-xs tracking-wider group-hover:gap-2 transition-all">
                            VIEW PROFILE
                            <ArrowRight className="h-4 w-4" />
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
};

export default Artisans;

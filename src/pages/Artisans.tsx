import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link } from "react-router-dom";
import { 
  Search, 
  MapPin, 
  Loader2, 
  ArrowRight, 
  Star,
  CheckCircle,
  Users
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import artisanPortrait from "@/assets/artisan-portrait.jpg";

interface Artisan {
  id: string;
  user_id: string;
  full_name: string | null;
  craft_specialty: string | null;
  location: string | null;
  avatar_url: string | null;
  is_verified: boolean | null;
  years_experience: number | null;
  bio: string | null;
  productCount?: number;
}

const craftTypes = [
  "All Crafts",
  "Basketry",
  "Barkcloth",
  "Woodcarving",
  "Pottery",
  "Jewelry",
  "Textiles",
];

const Artisans = () => {
  const [artisans, setArtisans] = useState<Artisan[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCraft, setSelectedCraft] = useState('All Crafts');

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

      // Fetch profiles for these artisans
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
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
      selectedCraft === 'All Crafts' || 
      artisan.craft_specialty?.toLowerCase().includes(selectedCraft.toLowerCase());
    
    return matchesSearch && matchesCraft;
  });

  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-earth pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 pattern-mudcloth opacity-5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-warm-cream mb-6">
              Meet Our <span className="text-secondary">Artisans</span>
            </h1>
            <p className="text-warm-cream/80 text-lg mb-8">
              Connect with skilled craftspeople from across Uganda. 
              Each artisan brings generations of expertise and unique cultural heritage.
            </p>
            
            {/* Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  placeholder="Search artisans by name, craft, or location..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-12 h-12 bg-warm-cream/10 border-warm-cream/20 text-warm-cream placeholder:text-warm-cream/50"
                />
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Craft Type Filter */}
      <section className="py-6 border-b border-border bg-card sticky top-16 z-30">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {craftTypes.map((type, index) => (
              <motion.button
                key={type}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedCraft(type)}
                className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
                  selectedCraft === type
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                {type}
              </motion.button>
            ))}
          </div>
        </div>
      </section>

      {/* Artisans Grid */}
      <section className="section-padding bg-background pattern-weave">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <p className="text-muted-foreground">
              {loading ? 'Loading...' : (
                <>Showing <span className="font-semibold text-foreground">{filteredArtisans.length}</span> artisans</>
              )}
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
          ) : filteredArtisans.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-20"
            >
              <Users className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="font-display text-xl font-bold text-foreground mb-2">
                No artisans found
              </h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedCraft !== 'All Crafts'
                  ? 'Try adjusting your search or filters'
                  : 'Check back soon for new artisans'
                }
              </p>
            </motion.div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredArtisans.map((artisan, index) => (
                <motion.div
                  key={artisan.id}
                  initial={{ opacity: 0, y: 30 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                  className="group"
                >
                  <Link to={`/artisans/${artisan.user_id}`}>
                    <div className="bg-card rounded-2xl overflow-hidden shadow-soft hover:shadow-medium transition-all duration-500 hover:-translate-y-2 border border-border">
                      {/* Image */}
                      <div className="aspect-[4/3] overflow-hidden relative">
                        <img
                          src={artisan.avatar_url || artisanPortrait}
                          alt={artisan.full_name || 'Artisan'}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                        {artisan.is_verified && (
                          <div className="absolute top-4 left-4 flex items-center gap-1 px-3 py-1 rounded-full bg-accent text-accent-foreground text-xs font-semibold">
                            <CheckCircle className="h-3 w-3" />
                            Verified
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-display text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                              {artisan.full_name || 'Unknown Artisan'}
                            </h3>
                            {artisan.craft_specialty && (
                              <span className="inline-block px-2 py-0.5 rounded bg-primary/10 text-primary text-xs font-medium mt-1">
                                {artisan.craft_specialty}
                              </span>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                          {artisan.location && (
                            <>
                              <MapPin className="h-4 w-4" />
                              {artisan.location}
                            </>
                          )}
                          {artisan.years_experience && (
                            <>
                              <span className="text-border">•</span>
                              {artisan.years_experience}+ years
                            </>
                          )}
                        </div>

                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <span className="text-muted-foreground text-sm">
                            {artisan.productCount} products
                          </span>
                          <span className="flex items-center gap-1 text-primary font-medium text-sm group-hover:gap-2 transition-all">
                            View Profile
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
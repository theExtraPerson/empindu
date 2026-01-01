import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, User, Settings, Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ArtisanProductsManager } from '@/components/products/ArtisanProductsManager';

const Dashboard = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && user && role !== 'artisan' && role !== 'admin') {
      navigate('/profile');
    }
  }, [user, role, loading, navigate]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user || (role !== 'artisan' && role !== 'admin')) {
    return null;
  }

  return (
    <Layout>
      <section className="bg-gradient-sunset pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 pattern-kente opacity-10" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-3xl mx-auto"
          >
            <h1 className="font-display text-4xl md:text-5xl font-bold text-warm-cream mb-4">
              Artisan <span className="text-secondary">Dashboard</span>
            </h1>
            <p className="text-warm-cream/80 text-lg">
              Manage your products, track sales, and grow your craft business.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="section-padding bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="products" className="space-y-8">
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Products</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Settings</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products">
              <ArtisanProductsManager />
            </TabsContent>

            <TabsContent value="profile">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-8 border border-border"
              >
                <h3 className="font-display text-xl font-bold mb-4">
                  Profile Settings
                </h3>
                <p className="text-muted-foreground">
                  Manage your artisan profile from the{' '}
                  <a href="/profile" className="text-primary hover:underline">
                    Profile page
                  </a>
                  .
                </p>
              </motion.div>
            </TabsContent>

            <TabsContent value="settings">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-card rounded-2xl p-8 border border-border"
              >
                <h3 className="font-display text-xl font-bold mb-4">
                  Account Settings
                </h3>
                <p className="text-muted-foreground">
                  Additional settings coming soon. Contact support for assistance.
                </p>
              </motion.div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Dashboard;

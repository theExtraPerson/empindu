import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Package, User, Settings, Loader2, Building2, ShoppingCart, BarChart3 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { ArtisanProductsManager } from '@/components/products/ArtisanProductsManager';
import { BusinessRegistration } from '@/components/business/BusinessRegistration';
import { ArtisanOrdersView } from '@/components/business/ArtisanOrdersView';
import { ArtisanAnalytics } from '@/components/business/ArtisanAnalytics';

const Dashboard = () => {
  const { user, role, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate('/auth');
  }, [user, loading, navigate]);

  useEffect(() => {
    if (!loading && user && role !== 'artisan' && role !== 'admin') navigate('/profile');
  }, [user, role, loading, navigate]);

  if (loading) {
    return <Layout><div className="min-h-screen flex items-center justify-center"><Loader2 className="h-10 w-10 animate-spin text-primary" /></div></Layout>;
  }

  if (!user || (role !== 'artisan' && role !== 'admin')) return null;

  return (
    <Layout>
      <section className="bg-foreground pt-32 pb-16 relative overflow-hidden">
        <div className="absolute inset-0 pattern-mudcloth opacity-5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="font-display text-4xl md:text-5xl font-bold text-background mb-4">
              ARTISAN <span className="text-secondary">DASHBOARD</span>
            </h1>
            <p className="text-background/70 text-lg font-body">Manage your products, orders, business, and grow your craft.</p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="products" className="space-y-8">
            <TabsList className="flex flex-wrap border-2 border-foreground bg-transparent p-0 h-auto">
              <TabsTrigger value="products" className="font-display text-xs tracking-widest data-[state=active]:bg-foreground data-[state=active]:text-background px-4 py-3 rounded-none gap-2">
                <Package className="h-4 w-4" /><span className="hidden sm:inline">PRODUCTS</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="font-display text-xs tracking-widest data-[state=active]:bg-foreground data-[state=active]:text-background px-4 py-3 rounded-none gap-2">
                <ShoppingCart className="h-4 w-4" /><span className="hidden sm:inline">ORDERS</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="font-display text-xs tracking-widest data-[state=active]:bg-foreground data-[state=active]:text-background px-4 py-3 rounded-none gap-2">
                <BarChart3 className="h-4 w-4" /><span className="hidden sm:inline">ANALYTICS</span>
              </TabsTrigger>
              <TabsTrigger value="business" className="font-display text-xs tracking-widest data-[state=active]:bg-foreground data-[state=active]:text-background px-4 py-3 rounded-none gap-2">
                <Building2 className="h-4 w-4" /><span className="hidden sm:inline">BUSINESS</span>
              </TabsTrigger>
              <TabsTrigger value="profile" className="font-display text-xs tracking-widest data-[state=active]:bg-foreground data-[state=active]:text-background px-4 py-3 rounded-none gap-2">
                <User className="h-4 w-4" /><span className="hidden sm:inline">PROFILE</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="products"><ArtisanProductsManager /></TabsContent>
            <TabsContent value="orders"><ArtisanOrdersView /></TabsContent>
            <TabsContent value="analytics"><ArtisanAnalytics /></TabsContent>
            <TabsContent value="business"><BusinessRegistration /></TabsContent>
            <TabsContent value="profile">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="border-2 border-foreground p-8">
                <h3 className="font-display text-xl font-bold mb-4">PROFILE SETTINGS</h3>
                <p className="text-muted-foreground font-body">
                  Manage your artisan profile from the{' '}
                  <a href="/profile" className="text-primary hover:underline font-medium">Profile page</a>.
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

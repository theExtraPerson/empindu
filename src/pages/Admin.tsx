import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, Users, Package, BarChart3, Shield, ShoppingBag, RotateCcw, MapPin, UserCog } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { useAdminData } from '@/hooks/useAdminData';
import { ArtisansManager } from '@/components/admin/ArtisansManager';
import { ProductsManager } from '@/components/admin/ProductsManager';
import { AnalyticsDashboard } from '@/components/admin/AnalyticsDashboard';
import { OrdersManager } from '@/components/admin/OrdersManager';
import { ReturnsManager } from '@/components/admin/ReturnsManager';
import { PickupLocationsManager } from '@/components/admin/PickupLocationsManager';
import { UsersManager } from '@/components/admin/UsersManager';

const Admin = () => {
  const { user, role, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const {
    artisans,
    products,
    stats,
    loading: dataLoading,
    verifyArtisan,
    toggleProductAvailability,
    deleteProduct
  } = useAdminData();

  useEffect(() => {
    if (!authLoading && !user) {
      navigate('/auth');
    }
  }, [user, authLoading, navigate]);

  useEffect(() => {
    if (!authLoading && user && role !== 'admin') {
      navigate('/');
    }
  }, [user, role, authLoading, navigate]);

  if (authLoading || dataLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </Layout>
    );
  }

  if (!user || role !== 'admin') {
    return null;
  }

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative py-16 bg-gradient-to-b from-primary/5 to-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <span className="text-sm font-medium text-primary">Administrator</span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
              Admin Dashboard
            </h1>
            <p className="text-lg text-muted-foreground">
              Manage orders, returns, artisans, products, and pickup locations
            </p>
          </motion.div>
        </div>
      </section>

      {/* Dashboard Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <Tabs defaultValue="analytics" className="space-y-6">
            <TabsList className="flex flex-wrap gap-1 h-auto p-1">
              <TabsTrigger value="analytics" className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4" />
                <span className="hidden sm:inline">Orders</span>
              </TabsTrigger>
              <TabsTrigger value="returns" className="flex items-center gap-2">
                <RotateCcw className="h-4 w-4" />
                <span className="hidden sm:inline">Returns</span>
              </TabsTrigger>
              <TabsTrigger value="artisans" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                <span className="hidden sm:inline">Artisans</span>
              </TabsTrigger>
              <TabsTrigger value="products" className="flex items-center gap-2">
                <Package className="h-4 w-4" />
                <span className="hidden sm:inline">Products</span>
              </TabsTrigger>
              <TabsTrigger value="locations" className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="hidden sm:inline">Locations</span>
              </TabsTrigger>
              <TabsTrigger value="users" className="flex items-center gap-2">
                <UserCog className="h-4 w-4" />
                <span className="hidden sm:inline">Users</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="analytics">
              <AnalyticsDashboard stats={stats} />
            </TabsContent>

            <TabsContent value="orders">
              <OrdersManager />
            </TabsContent>

            <TabsContent value="returns">
              <ReturnsManager />
            </TabsContent>

            <TabsContent value="artisans">
              <ArtisansManager artisans={artisans} onVerify={verifyArtisan} />
            </TabsContent>

            <TabsContent value="products">
              <ProductsManager
                products={products}
                onToggleAvailability={toggleProductAvailability}
                onDelete={deleteProduct}
              />
            </TabsContent>

            <TabsContent value="locations">
              <PickupLocationsManager />
            </TabsContent>

            <TabsContent value="users">
              <UsersManager />
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
};

export default Admin;

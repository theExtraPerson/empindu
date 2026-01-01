import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Package, ShoppingBag, CheckCircle, TrendingUp, Award } from 'lucide-react';
import { PlatformStats } from '@/hooks/useAdminData';

interface AnalyticsDashboardProps {
  stats: PlatformStats | null;
}

const COLORS = [
  'hsl(var(--primary))',
  'hsl(var(--secondary))',
  'hsl(var(--accent))',
  'hsl(24, 95%, 53%)',
  'hsl(142, 76%, 36%)',
  'hsl(280, 87%, 65%)',
];

export const AnalyticsDashboard = ({ stats }: AnalyticsDashboardProps) => {
  if (!stats) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Loading analytics...</p>
      </div>
    );
  }

  const statCards = [
    {
      title: 'Total Artisans',
      value: stats.totalArtisans,
      icon: Users,
      description: 'Registered artisans',
      color: 'text-primary'
    },
    {
      title: 'Verified Artisans',
      value: stats.verifiedArtisans,
      icon: CheckCircle,
      description: `${stats.totalArtisans > 0 ? Math.round((stats.verifiedArtisans / stats.totalArtisans) * 100) : 0}% verified`,
      color: 'text-green-500'
    },
    {
      title: 'Total Products',
      value: stats.totalProducts,
      icon: Package,
      description: 'Listed products',
      color: 'text-secondary-foreground'
    },
    {
      title: 'Available Products',
      value: stats.availableProducts,
      icon: TrendingUp,
      description: 'Currently for sale',
      color: 'text-accent-foreground'
    },
    {
      title: 'Total Buyers',
      value: stats.totalBuyers,
      icon: ShoppingBag,
      description: 'Registered buyers',
      color: 'text-primary'
    },
    {
      title: 'Categories',
      value: stats.productsByCategory.length,
      icon: Award,
      description: 'Product categories',
      color: 'text-secondary-foreground'
    }
  ];

  const chartConfig = {
    count: {
      label: 'Products',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div>
        <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
        <p className="text-muted-foreground">Platform overview and statistics</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {statCards.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card className="bg-card border-border hover:shadow-lg transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <stat.icon className={`h-5 w-5 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Products by Category</CardTitle>
            <CardDescription>Distribution of products across categories</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.productsByCategory.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <BarChart data={stats.productsByCategory}>
                  <XAxis
                    dataKey="category"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No product data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pie Chart */}
        <Card className="bg-card border-border">
          <CardHeader>
            <CardTitle>Category Distribution</CardTitle>
            <CardDescription>Visual breakdown of product categories</CardDescription>
          </CardHeader>
          <CardContent>
            {stats.productsByCategory.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[300px]">
                <PieChart>
                  <Pie
                    data={stats.productsByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="category"
                    label={({ category, percent }) => 
                      `${category} (${(percent * 100).toFixed(0)}%)`
                    }
                    labelLine={false}
                  >
                    {stats.productsByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Summary */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="text-center md:text-left">
              <h3 className="text-lg font-semibold">Platform Health</h3>
              <p className="text-muted-foreground">
                {stats.totalArtisans} artisans have listed {stats.totalProducts} products across {stats.productsByCategory.length} categories
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {stats.totalArtisans > 0 
                    ? Math.round((stats.verifiedArtisans / stats.totalArtisans) * 100) 
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Verification Rate</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-primary">
                  {stats.totalProducts > 0 
                    ? Math.round((stats.availableProducts / stats.totalProducts) * 100) 
                    : 0}%
                </p>
                <p className="text-xs text-muted-foreground">Availability Rate</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
};

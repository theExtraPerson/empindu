import { motion, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { Users, ShoppingBag, Package, Award, TrendingUp, CheckCircle } from "lucide-react";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { AreaChart, Area, XAxis, YAxis, BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const COLORS = [
  'hsl(15, 80%, 50%)',   // Primary terracotta
  'hsl(38, 92%, 50%)',   // Secondary gold
  'hsl(160, 84%, 30%)',  // Accent green
  'hsl(20, 70%, 45%)',   // Copper
  'hsl(45, 95%, 55%)',   // Kente gold
  'hsl(25, 35%, 40%)',   // Bark brown
];

function AnimatedCounter({ value, prefix = "", suffix = "" }: { value: number; prefix?: string; suffix?: string }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const controls = animate(0, value, {
      duration: 2,
      ease: "easeOut",
      onUpdate: (latest) => {
        setDisplayValue(Math.round(latest));
      },
    });
    return () => controls.stop();
  }, [value]);

  return (
    <span>
      {prefix}{displayValue.toLocaleString()}{suffix}
    </span>
  );
}

export function ImpactDashboard() {
  const { stats, loading } = usePlatformStats();

  // Stat cards configuration
  const statCards = [
    {
      icon: Users,
      value: stats?.totalArtisans || 0,
      suffix: "",
      label: "Registered Artisans",
      description: "Skilled craftspeople on platform",
    },
    {
      icon: CheckCircle,
      value: stats?.verifiedArtisans || 0,
      suffix: "",
      label: "Verified Artisans",
      description: stats?.totalArtisans 
        ? `${Math.round((stats.verifiedArtisans / stats.totalArtisans) * 100)}% verification rate`
        : "Quality assured makers",
    },
    {
      icon: Package,
      value: stats?.totalProducts || 0,
      suffix: "+",
      label: "Products Listed",
      description: "Authentic handcrafted items",
    },
    {
      icon: TrendingUp,
      value: stats?.availableProducts || 0,
      suffix: "",
      label: "Available Now",
      description: stats?.totalProducts
        ? `${Math.round((stats.availableProducts / stats.totalProducts) * 100)}% in stock`
        : "Ready to purchase",
    },
    {
      icon: ShoppingBag,
      value: stats?.totalBuyers || 0,
      suffix: "+",
      label: "Active Buyers",
      description: "Supporting artisan livelihoods",
    },
    {
      icon: Award,
      value: stats?.productsByCategory?.length || 0,
      suffix: "",
      label: "Craft Categories",
      description: "Diverse product range",
    },
  ];

  const chartConfig = {
    count: {
      label: 'Products',
      color: 'hsl(var(--primary))',
    },
    orders: {
      label: 'Orders',
      color: 'hsl(var(--secondary))',
    },
  };

  return (
    <section className="section-padding bg-gradient-earth relative overflow-hidden">
      {/* Decorative Elements */}
      <div className="absolute top-0 left-0 w-full h-full pattern-mudcloth opacity-5" />
      <div className="absolute top-20 right-20 w-72 h-72 bg-primary/10 rounded-full blur-3xl" />
      <div className="absolute bottom-20 left-20 w-96 h-96 bg-secondary/10 rounded-full blur-3xl" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-2xl mx-auto mb-16"
        >
          <span className="text-secondary font-medium uppercase tracking-wider text-sm mb-2 block">
            Live Platform Metrics
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-warm-cream mb-4">
            Our <span className="text-secondary">Impact</span>
          </h2>
          <p className="text-warm-cream/70">
            Real-time data showcasing our collective impact on Uganda's 
            craft ecosystem and artisan livelihoods.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-12">
          {statCards.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.05 }}
              className="group"
            >
              <div className="relative bg-warm-cream/10 border border-warm-cream/20 rounded-xl p-4 hover:bg-warm-cream/15 transition-colors duration-300">
                {/* Icon */}
                <div className="w-10 h-10 rounded-lg bg-primary/80 flex items-center justify-center mb-3">
                  <stat.icon className="h-5 w-5 text-warm-cream" />
                </div>

                {/* Value */}
                <h3 className="font-display text-2xl font-bold text-warm-cream mb-1">
                  {loading ? (
                    <span className="animate-pulse">--</span>
                  ) : (
                    <AnimatedCounter 
                      value={stat.value} 
                      suffix={stat.suffix} 
                    />
                  )}
                </h3>

                {/* Label */}
                <p className="text-secondary font-medium text-sm">
                  {stat.label}
                </p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8">
          {/* Products by Category Bar Chart */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-warm-cream/5 backdrop-blur-sm border border-warm-cream/10 rounded-2xl p-6"
          >
            <h3 className="font-display text-xl font-bold text-warm-cream mb-2">
              Products by Category
            </h3>
            <p className="text-warm-cream/60 text-sm mb-6">
              Distribution across craft categories
            </p>
            
            {loading ? (
              <div className="h-[250px] flex items-center justify-center">
                <div className="animate-pulse text-warm-cream/50">Loading chart...</div>
              </div>
            ) : stats?.productsByCategory && stats.productsByCategory.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <BarChart data={stats.productsByCategory} layout="vertical">
                  <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: 'hsl(40, 40%, 70%)', fontSize: 12 }} />
                  <YAxis 
                    dataKey="category" 
                    type="category" 
                    tickLine={false} 
                    axisLine={false} 
                    tick={{ fill: 'hsl(40, 40%, 70%)', fontSize: 11 }}
                    width={100}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar 
                    dataKey="count" 
                    fill="hsl(38, 92%, 50%)" 
                    radius={[0, 4, 4, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-warm-cream/50">
                No category data available yet
              </div>
            )}
          </motion.div>

          {/* Category Distribution Pie Chart */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="bg-warm-cream/5 backdrop-blur-sm border border-warm-cream/10 rounded-2xl p-6"
          >
            <h3 className="font-display text-xl font-bold text-warm-cream mb-2">
              Category Distribution
            </h3>
            <p className="text-warm-cream/60 text-sm mb-6">
              Visual breakdown of product types
            </p>
            
            {loading ? (
              <div className="h-[250px] flex items-center justify-center">
                <div className="animate-pulse text-warm-cream/50">Loading chart...</div>
              </div>
            ) : stats?.productsByCategory && stats.productsByCategory.length > 0 ? (
              <ChartContainer config={chartConfig} className="h-[250px]">
                <PieChart>
                  <Pie
                    data={stats.productsByCategory}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={2}
                    dataKey="count"
                    nameKey="category"
                  >
                    {stats.productsByCategory.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="h-[250px] flex items-center justify-center text-warm-cream/50">
                No distribution data available yet
              </div>
            )}
            
            {/* Legend */}
            {stats?.productsByCategory && stats.productsByCategory.length > 0 && (
              <div className="flex flex-wrap gap-3 justify-center mt-4">
                {stats.productsByCategory.slice(0, 6).map((item, index) => (
                  <div key={item.category} className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: COLORS[index % COLORS.length] }}
                    />
                    <span className="text-warm-cream/70 text-xs">{item.category}</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </div>

        {/* Platform Health Summary */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mt-8 bg-gradient-to-r from-primary/20 to-secondary/20 backdrop-blur-sm border border-warm-cream/10 rounded-2xl p-6 md:p-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <h3 className="font-display text-xl font-bold text-warm-cream mb-2">
                Platform Health
              </h3>
              <p className="text-warm-cream/70">
                {stats ? (
                  <>
                    {stats.totalArtisans} artisans have listed {stats.totalProducts} products 
                    across {stats.productsByCategory.length} categories
                  </>
                ) : (
                  "Loading platform statistics..."
                )}
              </p>
            </div>
            
            <div className="flex items-center gap-8">
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-secondary">
                  {stats && stats.totalArtisans > 0 
                    ? Math.round((stats.verifiedArtisans / stats.totalArtisans) * 100) 
                    : 0}%
                </p>
                <p className="text-warm-cream/60 text-sm">Verification Rate</p>
              </div>
              <div className="w-px h-12 bg-warm-cream/20" />
              <div className="text-center">
                <p className="font-display text-3xl font-bold text-secondary">
                  {stats && stats.totalProducts > 0 
                    ? Math.round((stats.availableProducts / stats.totalProducts) * 100) 
                    : 0}%
                </p>
                <p className="text-warm-cream/60 text-sm">Availability Rate</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

import { motion, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { Users, ShoppingBag, Package, Award, TrendingUp, CheckCircle, ChevronDown, BarChart3 } from "lucide-react";
import { usePlatformStats } from "@/hooks/usePlatformStats";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell } from "recharts";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const COLORS = [
  'hsl(15, 80%, 50%)',   // Primary terracotta
  'hsl(38, 92%, 50%)',   // Secondary gold
  'hsl(160, 84%, 30%)',  // Accent green
  'hsl(20, 70%, 45%)',   // Copper
  'hsl(45, 95%, 55%)',   // Kente gold
  'hsl(25, 35%, 40%)',   // Bark brown
];

const STAT_COLORS = [
  { bg: "bg-primary", icon: "text-primary-foreground", border: "border-primary" },
  { bg: "bg-secondary", icon: "text-secondary-foreground", border: "border-secondary" },
  { bg: "bg-accent", icon: "text-accent-foreground", border: "border-accent" },
  { bg: "bg-[hsl(15,80%,50%)]", icon: "text-warm-cream", border: "border-[hsl(15,80%,50%)]" },
  { bg: "bg-[hsl(160,84%,30%)]", icon: "text-warm-cream", border: "border-[hsl(160,84%,30%)]" },
  { bg: "bg-[hsl(45,95%,55%)]", icon: "text-mudcloth-black", border: "border-[hsl(45,95%,55%)]" },
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
  const [isOpen, setIsOpen] = useState(false);

  // Stat cards configuration
  const statCards = [
    {
      icon: Users,
      value: stats?.totalArtisans || 0,
      suffix: "",
      label: "ARTISANS",
      description: "Skilled craftspeople",
    },
    {
      icon: CheckCircle,
      value: stats?.verifiedArtisans || 0,
      suffix: "",
      label: "VERIFIED",
      description: stats?.totalArtisans 
        ? `${Math.round((stats.verifiedArtisans / stats.totalArtisans) * 100)}% rate`
        : "Quality assured",
    },
    {
      icon: Package,
      value: stats?.totalProducts || 0,
      suffix: "+",
      label: "PRODUCTS",
      description: "Handcrafted items",
    },
    {
      icon: TrendingUp,
      value: stats?.availableProducts || 0,
      suffix: "",
      label: "IN STOCK",
      description: stats?.totalProducts
        ? `${Math.round((stats.availableProducts / stats.totalProducts) * 100)}% available`
        : "Ready to buy",
    },
    {
      icon: ShoppingBag,
      value: stats?.totalBuyers || 0,
      suffix: "+",
      label: "BUYERS",
      description: "Active customers",
    },
    {
      icon: Award,
      value: stats?.productsByCategory?.length || 0,
      suffix: "",
      label: "CATEGORIES",
      description: "Diverse crafts",
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
    <section className="py-16 md:py-24 bg-muted border-y-2 border-foreground">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brutalist Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center max-w-3xl mx-auto mb-12"
        >
          <span className="font-display text-xs tracking-[0.3em] text-muted-foreground mb-3 block">
            [ REAL-TIME DATA ]
          </span>
          <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-none">
            OUR
            <br />
            <span className="text-primary">IMPACT</span>
          </h2>
          <p className="text-muted-foreground mt-4 font-body text-lg max-w-xl mx-auto">
            Live metrics showcasing our collective impact on Uganda's craft ecosystem.
          </p>
        </motion.div>

        {/* Collapsible Metrics Section */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <CollapsibleTrigger className="w-full group">
              <div className="flex items-center justify-center gap-4 px-8 py-5 bg-foreground text-background border-2 border-foreground hover:bg-primary hover:border-primary transition-all duration-300 shadow-brutal mx-auto max-w-md">
                <BarChart3 className="h-5 w-5" />
                <span className="font-display text-sm tracking-widest">
                  {isOpen ? "HIDE PERFORMANCE METRICS" : "VIEW PERFORMANCE METRICS"}
                </span>
                <ChevronDown className={`h-5 w-5 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
              </div>
            </CollapsibleTrigger>
          </motion.div>

          <CollapsibleContent className="mt-8">
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
            >
              {/* Colorful Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
                {statCards.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20, scale: 0.9 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: index * 0.08 }}
                    className="group"
                  >
                    <div className={`relative bg-background border-2 ${STAT_COLORS[index].border} p-4 hover:-translate-y-1 transition-all duration-300 shadow-brutal hover:shadow-brutal-lg`}>
                      {/* Colored Icon Bar */}
                      <div className={`absolute top-0 left-0 right-0 h-1.5 ${STAT_COLORS[index].bg}`} />
                      
                      {/* Icon */}
                      <div className={`w-10 h-10 ${STAT_COLORS[index].bg} flex items-center justify-center mb-3 border border-foreground`}>
                        <stat.icon className={`h-5 w-5 ${STAT_COLORS[index].icon}`} />
                      </div>

                      {/* Value */}
                      <h3 className="font-display text-2xl md:text-3xl font-bold text-foreground mb-1">
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
                      <p className="font-display text-xs tracking-widest text-foreground font-bold mb-1">
                        {stat.label}
                      </p>
                      <p className="font-body text-[10px] text-muted-foreground">
                        {stat.description}
                      </p>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Charts Section */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Products by Category Bar Chart */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-background border-2 border-foreground p-6 shadow-brutal"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 bg-secondary" />
                    <h3 className="font-display text-lg font-bold text-foreground tracking-wider">
                      PRODUCTS BY CATEGORY
                    </h3>
                  </div>
                  
                  {loading ? (
                    <div className="h-[250px] flex items-center justify-center">
                      <div className="animate-pulse text-muted-foreground font-display text-sm tracking-wider">LOADING...</div>
                    </div>
                  ) : stats?.productsByCategory && stats.productsByCategory.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[250px]">
                      <BarChart data={stats.productsByCategory} layout="vertical">
                        <XAxis type="number" tickLine={false} axisLine={false} tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12, fontFamily: 'Lekton' }} />
                        <YAxis 
                          dataKey="category" 
                          type="category" 
                          tickLine={false} 
                          axisLine={false} 
                          tick={{ fill: 'hsl(var(--foreground))', fontSize: 11, fontFamily: 'Lekton' }}
                          width={100}
                        />
                        <ChartTooltip content={<ChartTooltipContent />} />
                        <Bar 
                          dataKey="count" 
                          fill="hsl(38, 92%, 50%)" 
                          radius={0}
                        />
                      </BarChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-[250px] flex items-center justify-center text-muted-foreground font-display text-sm">
                      NO DATA AVAILABLE
                    </div>
                  )}
                </motion.div>

                {/* Category Distribution Pie Chart */}
                <motion.div
                  initial={{ opacity: 0, x: 30 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-background border-2 border-foreground p-6 shadow-brutal"
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-3 h-3 bg-primary" />
                    <h3 className="font-display text-lg font-bold text-foreground tracking-wider">
                      CATEGORY DISTRIBUTION
                    </h3>
                  </div>
                  
                  {loading ? (
                    <div className="h-[250px] flex items-center justify-center">
                      <div className="animate-pulse text-muted-foreground font-display text-sm tracking-wider">LOADING...</div>
                    </div>
                  ) : stats?.productsByCategory && stats.productsByCategory.length > 0 ? (
                    <ChartContainer config={chartConfig} className="h-[200px]">
                      <PieChart>
                        <Pie
                          data={stats.productsByCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={80}
                          paddingAngle={2}
                          dataKey="count"
                          nameKey="category"
                          stroke="hsl(var(--foreground))"
                          strokeWidth={2}
                        >
                          {stats.productsByCategory.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <ChartTooltip content={<ChartTooltipContent />} />
                      </PieChart>
                    </ChartContainer>
                  ) : (
                    <div className="h-[200px] flex items-center justify-center text-muted-foreground font-display text-sm">
                      NO DATA AVAILABLE
                    </div>
                  )}
                  
                  {/* Legend */}
                  {stats?.productsByCategory && stats.productsByCategory.length > 0 && (
                    <div className="flex flex-wrap gap-3 justify-center mt-4 pt-4 border-t-2 border-muted">
                      {stats.productsByCategory.slice(0, 6).map((item, index) => (
                        <div key={item.category} className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 border border-foreground" 
                            style={{ backgroundColor: COLORS[index % COLORS.length] }}
                          />
                          <span className="font-display text-xs tracking-wider text-foreground">{item.category.toUpperCase()}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </motion.div>
              </div>

              {/* Platform Health Summary */}
              <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="mt-6 bg-gradient-to-r from-primary via-accent to-secondary p-1"
              >
                <div className="bg-background p-6 md:p-8">
                  <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                    <div className="text-center md:text-left">
                      <h3 className="font-display text-xl font-bold text-foreground tracking-wider mb-2">
                        PLATFORM HEALTH
                      </h3>
                      <p className="text-muted-foreground font-body">
                        {stats ? (
                          <>
                            <span className="font-bold text-foreground">{stats.totalArtisans}</span> artisans have listed{" "}
                            <span className="font-bold text-foreground">{stats.totalProducts}</span> products across{" "}
                            <span className="font-bold text-foreground">{stats.productsByCategory.length}</span> categories
                          </>
                        ) : (
                          "Loading platform statistics..."
                        )}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-8">
                      <div className="text-center px-6 py-3 bg-primary/10 border-2 border-primary">
                        <p className="font-display text-3xl font-bold text-primary">
                          {stats && stats.totalArtisans > 0 
                            ? Math.round((stats.verifiedArtisans / stats.totalArtisans) * 100) 
                            : 0}%
                        </p>
                        <p className="font-display text-xs tracking-wider text-foreground">VERIFIED</p>
                      </div>
                      <div className="text-center px-6 py-3 bg-accent/10 border-2 border-accent">
                        <p className="font-display text-3xl font-bold text-accent">
                          {stats && stats.totalProducts > 0 
                            ? Math.round((stats.availableProducts / stats.totalProducts) * 100) 
                            : 0}%
                        </p>
                        <p className="font-display text-xs tracking-wider text-foreground">IN STOCK</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </CollapsibleContent>
        </Collapsible>
      </div>
    </section>
  );
}

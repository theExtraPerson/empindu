import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { useEffect, useState } from "react";
import { Users, ShoppingBag, MapPin, Award, TrendingUp, Globe } from "lucide-react";

const impactStats = [
  {
    icon: Users,
    value: 1247,
    suffix: "+",
    label: "Registered Artisans",
    description: "Skilled craftspeople across Uganda",
  },
  {
    icon: ShoppingBag,
    value: 5420,
    suffix: "+",
    label: "Products Listed",
    description: "Authentic handcrafted items",
  },
  {
    icon: MapPin,
    value: 45,
    suffix: "",
    label: "Districts Covered",
    description: "Nationwide artisan network",
  },
  {
    icon: TrendingUp,
    value: 850,
    suffix: "M",
    prefix: "UGX ",
    label: "Sales Generated",
    description: "Direct income to artisans",
  },
  {
    icon: Award,
    value: 156,
    suffix: "",
    label: "Artisans Trained",
    description: "Skills development programs",
  },
  {
    icon: Globe,
    value: 12,
    suffix: "",
    label: "Countries Reached",
    description: "International export markets",
  },
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
            Our Impact
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-warm-cream mb-4">
            Empowering <span className="text-secondary">Communities</span>
          </h2>
          <p className="text-warm-cream/70">
            Real-time metrics showcasing our collective impact on Uganda's 
            craft ecosystem and artisan livelihoods.
          </p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {impactStats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group"
            >
              <div className="relative bg-warm-cream/5 backdrop-blur-sm border border-warm-cream/10 rounded-2xl p-6 md:p-8 hover:bg-warm-cream/10 transition-all duration-500 hover:-translate-y-1">
                {/* Icon */}
                <div className="w-14 h-14 rounded-xl bg-gradient-hero flex items-center justify-center mb-5 group-hover:scale-110 transition-transform duration-300">
                  <stat.icon className="h-7 w-7 text-warm-cream" />
                </div>

                {/* Value */}
                <h3 className="font-display text-4xl md:text-5xl font-bold text-warm-cream mb-2">
                  <AnimatedCounter 
                    value={stat.value} 
                    prefix={stat.prefix} 
                    suffix={stat.suffix} 
                  />
                </h3>

                {/* Label */}
                <p className="text-secondary font-semibold text-lg mb-1">
                  {stat.label}
                </p>
                <p className="text-warm-cream/60 text-sm">
                  {stat.description}
                </p>

                {/* Decorative line */}
                <div className="absolute bottom-0 left-6 right-6 h-1 bg-gradient-to-r from-transparent via-secondary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

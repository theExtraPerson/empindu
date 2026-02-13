import { motion } from "framer-motion";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Calendar, 
  MapPin, 
  Clock, 
  Users, 
  Ticket, 
  ArrowRight,
  CheckCircle,
  Star,
  Sparkles,
  Music,
  Palette,
  ShoppingBag
} from "lucide-react";
import patternBg from "/enkyeka.jpg";

const events = [
  {
    day: "DAY 1",
    date: "AUG 20",
    title: "GRAND OPENING CEREMONY",
    time: "9:00 AM - 12:00 PM",
    type: "CEREMONY",
    color: "bg-primary",
  },
  {
    day: "DAY 2",
    date: "AUG 21",
    title: "BASKET WEAVING MASTERCLASS",
    time: "10:00 AM - 2:00 PM",
    type: "WORKSHOP",
    color: "bg-secondary",
  },
  {
    day: "DAY 3",
    date: "AUG 22",
    title: "CORPORATE BUYER SUMMIT",
    time: "9:00 AM - 5:00 PM",
    type: "BUSINESS",
    color: "bg-accent",
  },
  {
    day: "DAY 4",
    date: "AUG 23",
    title: "TRADITIONAL CRAFT FASHION SHOW",
    time: "6:00 PM - 9:00 PM",
    type: "PERFORMANCE",
    color: "bg-[hsl(15,80%,50%)]",
  },
];

const highlights = [
  { icon: Palette, label: "LIVE DEMOS", value: "50+" },
  { icon: Users, label: "ARTISANS", value: "250+" },
  { icon: Music, label: "PERFORMANCES", value: "30+" },
  { icon: ShoppingBag, label: "PRODUCTS", value: "5,000+" },
];

const ticketTiers = [
  {
    name: "DAY PASS",
    price: "35,000",
    features: [
      "Single day entry",
      "Access to all exhibitions",
      "Live demonstrations",
      "Product marketplace access",
    ],
    popular: false,
    color: "border-secondary",
  },
  {
    name: "FULL WEEK PASS",
    price: "150,000",
    features: [
      "All 7 days entry",
      "Priority access to workshops",
      "VIP networking events",
      "Exclusive artisan meet & greet",
      "Welcome gift bag",
    ],
    popular: true,
    color: "border-primary",
  },
  {
    name: "CORPORATE PACKAGE",
    price: "500,000",
    features: [
      "10 full week passes",
      "Private B2B sessions",
      "Dedicated sourcing support",
      "Premium booth placement",
      "Brand visibility package",
    ],
    popular: false,
    color: "border-accent",
  },
];

const Exhibition = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={patternBg}
            alt=""
            className="w-full h-full object-fit"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary opacity-95" />
        </div>

        {/* Pattern overlay */}
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 30px,
            rgba(0,0,0,0.1) 30px,
            rgba(0,0,0,0.1) 60px
          )`
        }} />

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-5xl"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-5 py-2 bg-background border-2 border-foreground mb-6 shadow-brutal"
            >
              <Sparkles className="w-4 h-4 text-primary animate-pulse" />
              <span className="font-display text-xs tracking-widest text-foreground">AUGUST 20-27, 2025</span>
            </motion.div>

            <h1 className="font-display text-5xl md:text-7xl lg:text-9xl font-bold text-background tracking-tight leading-[0.85] mb-8">
              EMPINDU
              <br />
              <span className="inline-block bg-background text-foreground px-4 py-2 mt-2">FESTIVAL</span>
              <br />
              <span className="text-secondary">2025</span>
            </h1>

            <p className="text-background/90 text-lg md:text-xl mb-10 max-w-xl font-body leading-relaxed">
              Uganda's premier celebration of traditional craftsmanship. 
              One week of exhibitions, workshops, performances, and direct connection 
              with master artisans from across the nation.
            </p>

            {/* Highlights Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
              {highlights.map((item, index) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.1 }}
                  className="bg-background/10 border border-background/30 backdrop-blur-sm p-4 text-center"
                >
                  <item.icon className="h-6 w-6 text-secondary mx-auto mb-2" />
                  <p className="font-display text-2xl font-bold text-background">{item.value}</p>
                  <p className="font-display text-xs tracking-wider text-background/70">{item.label}</p>
                </motion.div>
              ))}
            </div>

            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" size="xl" className="border-2 border-foreground shadow-brutal">
                <Ticket className="h-5 w-5 mr-2" />
                GET TICKETS NOW
              </Button>
              <Button variant="outline" size="xl" className="border-2 border-background text-background hover:bg-background hover:text-foreground">
                APPLY AS EXHIBITOR
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>

        {/* Decorative elements */}
        <div className="absolute bottom-0 right-0 w-40 h-40 border-l-4 border-t-4 border-background hidden lg:block" />
        <div className="absolute top-32 right-20 w-20 h-20 border-2 border-background/30 hidden lg:block" />
      </section>

      {/* Event Schedule */}
      <section className="py-20 md:py-32 bg-background border-b-2 border-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="font-display text-xs tracking-[0.3em] text-muted-foreground mb-4 block">
              [ 01 — SCHEDULE ]
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-none">
              EVENT
              <br />
              <span className="text-primary">SCHEDULE</span>
            </h2>
            <p className="text-muted-foreground mt-4 font-body text-lg">
              From opening ceremonies to intimate workshops, experience the full 
              spectrum of Ugandan craft culture.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {events.map((event, index) => (
              <motion.div
                key={event.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="group"
              >
                <div className="bg-muted border-2 border-foreground p-6 hover:-translate-y-2 transition-all duration-300 shadow-brutal hover:shadow-brutal-lg h-full">
                  {/* Color bar */}
                  <div className={`w-full h-2 ${event.color} mb-4`} />
                  
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 border-2 border-foreground flex items-center justify-center bg-background">
                      <Calendar className="h-6 w-6 text-foreground" />
                    </div>
                    <div>
                      <p className="font-display text-sm font-bold text-foreground tracking-wider">{event.day}</p>
                      <p className="text-xs text-muted-foreground font-display tracking-wider">{event.date}</p>
                    </div>
                  </div>
                  
                  <h3 className="font-display text-lg font-bold text-foreground tracking-wider mb-3">
                    {event.title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-muted-foreground text-sm mb-4">
                    <Clock className="h-4 w-4" />
                    <span className="font-body">{event.time}</span>
                  </div>
                  
                  <span className={`inline-block px-3 py-1 ${event.color} text-background text-xs font-display tracking-wider border-2 border-foreground`}>
                    {event.type}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="border-2 border-foreground shadow-brutal" asChild>
              <Link to="/exhibition/schedule">
                VIEW FULL SCHEDULE
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Tickets Section */}
      <section className="py-20 md:py-32 bg-muted border-b-2 border-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto mb-16"
          >
            <span className="font-display text-xs tracking-[0.3em] text-muted-foreground mb-4 block">
              [ 02 — TICKETS ]
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight leading-none">
              CHOOSE YOUR
              <br />
              <span className="text-primary">EXPERIENCE</span>
            </h2>
            <p className="text-muted-foreground mt-4 font-body text-lg">
              Early bird pricing available until July 31st. Get your tickets now 
              and save up to 30%.
            </p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {ticketTiers.map((tier, index) => (
              <motion.div
                key={tier.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className={`relative bg-background p-8 border-2 ${tier.color} transition-all duration-300 hover:-translate-y-2 ${
                  tier.popular ? "shadow-brutal-lg" : "shadow-brutal hover:shadow-brutal-lg"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground font-display text-xs tracking-widest border-2 border-foreground">
                    MOST POPULAR
                  </div>
                )}

                {/* Color bar */}
                <div className={`w-full h-2 ${
                  index === 0 ? "bg-secondary" : index === 1 ? "bg-primary" : "bg-accent"
                } mb-6`} />

                <h3 className="font-display text-xl font-bold text-foreground tracking-wider mb-2">
                  {tier.name}
                </h3>
                <div className="mb-6">
                  <span className="font-display text-4xl font-bold text-primary">
                    UGX {tier.price}
                  </span>
                </div>

                <ul className="space-y-3 mb-8">
                  {tier.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-3">
                      <CheckCircle className="h-5 w-5 text-accent shrink-0 mt-0.5" />
                      <span className="text-muted-foreground font-body text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={tier.popular ? "default" : "outline"} 
                  className={`w-full border-2 border-foreground shadow-brutal`}
                  size="lg"
                >
                  GET {tier.name}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 md:py-32 bg-foreground">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-3xl mx-auto"
          >
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-background tracking-tight leading-none mb-6">
              BECOME AN
              <br />
              <span className="text-secondary">EXHIBITOR</span>
            </h2>
            <p className="text-background/70 font-body text-lg mb-8">
              Showcase your craftsmanship to thousands of visitors and connect with 
              buyers from across Uganda and beyond.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button variant="secondary" size="xl" className="border-2 border-background shadow-brutal">
                APPLY NOW
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
              <Button variant="outline" size="xl" className="border-2 border-background text-background hover:bg-background hover:text-foreground">
                EXHIBITOR INFO
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
};

export default Exhibition;

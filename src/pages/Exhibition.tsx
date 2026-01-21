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
  Star
} from "lucide-react";
import patternBg from "@/assets/pattern-bg.jpg";

const events = [
  {
    day: "DAY 1",
    date: "JUNE 15",
    title: "GRAND OPENING CEREMONY",
    time: "9:00 AM - 12:00 PM",
    type: "CEREMONY",
  },
  {
    day: "DAY 2",
    date: "JUNE 16",
    title: "BASKET WEAVING MASTERCLASS",
    time: "10:00 AM - 2:00 PM",
    type: "WORKSHOP",
  },
  {
    day: "DAY 3",
    date: "JUNE 17",
    title: "CORPORATE BUYER SUMMIT",
    time: "9:00 AM - 5:00 PM",
    type: "BUSINESS",
  },
  {
    day: "DAY 4",
    date: "JUNE 18",
    title: "TRADITIONAL CRAFT FASHION SHOW",
    time: "6:00 PM - 9:00 PM",
    type: "PERFORMANCE",
  },
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
  },
];

const Exhibition = () => {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative min-h-[80vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={patternBg}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-foreground/90" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="max-w-4xl"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center gap-2 px-4 py-2 border-2 border-secondary mb-6"
            >
              <span className="w-2 h-2 bg-secondary animate-pulse" />
              <span className="text-secondary font-display text-xs tracking-widest">JUNE 15-22, 2025</span>
            </motion.span>

            <h1 className="font-display text-5xl md:text-7xl lg:text-9xl font-bold text-background tracking-tight leading-[0.85] mb-8">
              UGANDA
              <br />
              CRAFTS
              <br />
              <span className="text-secondary">WEEK 2025</span>
            </h1>

            <p className="text-background/70 text-lg md:text-xl mb-10 max-w-xl font-body">
              Experience Uganda's premier celebration of traditional craftsmanship. 
              One week of exhibitions, workshops, performances, and direct connection 
              with master artisans.
            </p>

            <div className="flex flex-wrap gap-6 mb-10">
              <div className="flex items-center gap-2 text-background/80">
                <MapPin className="h-5 w-5 text-secondary" />
                <span className="font-display text-sm tracking-wider">UGANDA MUSEUM, KAMPALA</span>
              </div>
              <div className="flex items-center gap-2 text-background/80">
                <Users className="h-5 w-5 text-secondary" />
                <span className="font-display text-sm tracking-wider">200+ ARTISANS</span>
              </div>
              <div className="flex items-center gap-2 text-background/80">
                <Star className="h-5 w-5 text-secondary" />
                <span className="font-display text-sm tracking-wider">50+ EVENTS</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" size="xl" className="border-2 border-foreground">
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
        <div className="absolute bottom-0 right-0 w-40 h-40 border-l-4 border-t-4 border-secondary hidden lg:block" />
        <div className="absolute top-32 right-20 w-20 h-20 border-2 border-secondary/30 hidden lg:block" />
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
            <span className="font-display text-xs tracking-widest text-muted-foreground mb-4 block">
              [ 01 — SCHEDULE ]
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
              EVENT<br />
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
                className="group bg-muted p-6 border-2 border-foreground hover:bg-primary hover:border-primary transition-all duration-300 hover:-translate-y-2 shadow-brutal"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 border-2 border-foreground group-hover:border-primary-foreground flex items-center justify-center transition-colors">
                    <Calendar className="h-6 w-6 text-foreground group-hover:text-primary-foreground transition-colors" />
                  </div>
                  <div>
                    <p className="font-display text-sm font-bold text-foreground group-hover:text-primary-foreground tracking-wider transition-colors">{event.day}</p>
                    <p className="text-xs text-muted-foreground group-hover:text-primary-foreground/70 font-display tracking-wider transition-colors">{event.date}</p>
                  </div>
                </div>
                <h3 className="font-display text-lg font-bold text-foreground group-hover:text-primary-foreground tracking-wider mb-3 transition-colors">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground group-hover:text-primary-foreground/80 text-sm mb-4 transition-colors">
                  <Clock className="h-4 w-4" />
                  <span className="font-body">{event.time}</span>
                </div>
                <span className="inline-block px-3 py-1 border-2 border-foreground group-hover:border-primary-foreground text-foreground group-hover:text-primary-foreground text-xs font-display tracking-wider transition-colors">
                  {event.type}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Button variant="outline" size="lg" className="border-2 border-foreground" asChild>
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
            <span className="font-display text-xs tracking-widest text-muted-foreground mb-4 block">
              [ 02 — TICKETS ]
            </span>
            <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-foreground tracking-tight">
              CHOOSE YOUR<br />
              <span className="text-primary">EXPERIENCE</span>
            </h2>
            <p className="text-muted-foreground mt-4 font-body text-lg">
              Early bird pricing available until May 31st. Get your tickets now 
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
                className={`relative bg-background p-8 border-2 transition-all duration-300 hover:-translate-y-2 ${
                  tier.popular 
                    ? "border-primary shadow-brutal-lg" 
                    : "border-foreground shadow-brutal hover:border-primary"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground font-display text-xs tracking-widest border-2 border-foreground">
                    MOST POPULAR
                  </div>
                )}

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
                      <CheckCircle className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                      <span className="text-muted-foreground font-body text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={tier.popular ? "default" : "outline"} 
                  className={`w-full border-2 ${tier.popular ? 'border-foreground' : 'border-foreground'}`}
                  size="lg"
                >
                  GET {tier.name}
                </Button>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Exhibition;

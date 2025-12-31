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
    day: "Day 1",
    date: "June 15",
    title: "Grand Opening Ceremony",
    time: "9:00 AM - 12:00 PM",
    type: "Ceremony",
  },
  {
    day: "Day 2",
    date: "June 16",
    title: "Basket Weaving Masterclass",
    time: "10:00 AM - 2:00 PM",
    type: "Workshop",
  },
  {
    day: "Day 3",
    date: "June 17",
    title: "Corporate Buyer Summit",
    time: "9:00 AM - 5:00 PM",
    type: "Business",
  },
  {
    day: "Day 4",
    date: "June 18",
    title: "Traditional Craft Fashion Show",
    time: "6:00 PM - 9:00 PM",
    type: "Performance",
  },
];

const ticketTiers = [
  {
    name: "Day Pass",
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
    name: "Full Week Pass",
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
    name: "Corporate Package",
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
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={patternBg}
            alt=""
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-mudcloth-black/95 via-mudcloth-black/80 to-mudcloth-black/60" />
        </div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 pt-24">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl"
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-secondary/30 backdrop-blur-sm mb-6">
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              <span className="text-secondary text-sm font-medium">June 15-22, 2025</span>
            </span>

            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-warm-cream mb-6 leading-tight">
              Uganda Crafts Week
              <br />
              <span className="text-secondary">2025 Exhibition</span>
            </h1>

            <p className="text-warm-cream/80 text-lg mb-8 max-w-xl">
              Experience Uganda's premier celebration of traditional craftsmanship. 
              One week of exhibitions, workshops, performances, and direct connection 
              with master artisans.
            </p>

            <div className="flex flex-wrap gap-4 mb-8">
              <div className="flex items-center gap-2 text-warm-cream/80">
                <MapPin className="h-5 w-5 text-secondary" />
                Uganda Museum, Kampala
              </div>
              <div className="flex items-center gap-2 text-warm-cream/80">
                <Users className="h-5 w-5 text-secondary" />
                200+ Artisans
              </div>
              <div className="flex items-center gap-2 text-warm-cream/80">
                <Star className="h-5 w-5 text-secondary" />
                50+ Events
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button variant="hero" size="xl">
                <Ticket className="h-5 w-5 mr-2" />
                Get Tickets Now
              </Button>
              <Button variant="outline-light" size="xl">
                Apply as Exhibitor
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Event Schedule */}
      <section className="section-padding bg-card">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <span className="text-primary font-medium uppercase tracking-wider text-sm mb-2 block">
              What's Happening
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Event <span className="text-primary">Schedule</span>
            </h2>
            <p className="text-muted-foreground">
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
                className="bg-background rounded-2xl p-6 border border-border hover:border-primary/30 hover:shadow-medium transition-all duration-300 hover:-translate-y-1"
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 rounded-xl bg-gradient-hero flex items-center justify-center">
                    <Calendar className="h-6 w-6 text-warm-cream" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">{event.day}</p>
                    <p className="text-sm text-muted-foreground">{event.date}</p>
                  </div>
                </div>
                <h3 className="font-display text-xl font-bold text-foreground mb-2">
                  {event.title}
                </h3>
                <div className="flex items-center gap-2 text-muted-foreground text-sm mb-3">
                  <Clock className="h-4 w-4" />
                  {event.time}
                </div>
                <span className="inline-block px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-semibold">
                  {event.type}
                </span>
              </motion.div>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button variant="outline" asChild>
              <Link to="/exhibition/schedule">
                View Full Schedule
                <ArrowRight className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Tickets Section */}
      <section className="section-padding bg-background pattern-weave">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center max-w-2xl mx-auto mb-12"
          >
            <span className="text-primary font-medium uppercase tracking-wider text-sm mb-2 block">
              Tickets
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-bold text-foreground mb-4">
              Choose Your <span className="text-primary">Experience</span>
            </h2>
            <p className="text-muted-foreground">
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
                className={`relative bg-card rounded-3xl p-8 border-2 transition-all duration-300 hover:-translate-y-2 ${
                  tier.popular 
                    ? "border-primary shadow-glow" 
                    : "border-border hover:border-primary/30"
                }`}
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 bg-primary text-primary-foreground rounded-full text-sm font-semibold">
                    Most Popular
                  </div>
                )}

                <h3 className="font-display text-2xl font-bold text-foreground mb-2">
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
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button 
                  variant={tier.popular ? "hero" : "outline"} 
                  className="w-full"
                  size="lg"
                >
                  Get {tier.name}
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

import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Clock, ArrowRight, Users, Ticket } from "lucide-react";
import { Button } from "@/components/ui/button";
import patternBg from "@/assets/pattern-bg.jpg";

export function ExhibitionCTA() {
  const exhibitionDate = new Date("2025-06-15");
  const today = new Date();
  const diffTime = Math.abs(exhibitionDate.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <section className="section-padding relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={patternBg}
          alt=""
          className="w-full h-full object-cover opacity-20"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary-deep to-bark-brown opacity-95" />
      </div>

      {/* Decorative circles */}
      <div className="absolute -top-20 -right-20 w-96 h-96 border border-warm-cream/10 rounded-full" />
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] border border-warm-cream/10 rounded-full" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <span className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/20 border border-secondary/30 backdrop-blur-sm mb-6">
              <span className="w-2 h-2 bg-secondary rounded-full animate-pulse" />
              <span className="text-secondary text-sm font-medium">Save the Date</span>
            </span>

            <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-warm-cream mb-6 leading-tight">
              Uganda Crafts Week
              <br />
              <span className="text-secondary">2025 Exhibition</span>
            </h2>

            <p className="text-warm-cream/80 text-lg mb-8 max-w-lg">
              Join us for Uganda's premier celebration of traditional craftsmanship. 
              Experience live demonstrations, meet master artisans, and discover 
              unique handcrafted treasures.
            </p>

            {/* Event Details */}
            <div className="space-y-4 mb-8">
              <div className="flex items-center gap-4 text-warm-cream/80">
                <div className="w-10 h-10 rounded-lg bg-warm-cream/10 flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-warm-cream">June 15-22, 2025</p>
                  <p className="text-sm text-warm-cream/60">One week of craft celebration</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-warm-cream/80">
                <div className="w-10 h-10 rounded-lg bg-warm-cream/10 flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-warm-cream">Uganda Museum, Kampala</p>
                  <p className="text-sm text-warm-cream/60">Kira Road, Kamwokya</p>
                </div>
              </div>

              <div className="flex items-center gap-4 text-warm-cream/80">
                <div className="w-10 h-10 rounded-lg bg-warm-cream/10 flex items-center justify-center">
                  <Users className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-semibold text-warm-cream">200+ Exhibiting Artisans</p>
                  <p className="text-sm text-warm-cream/60">From all regions of Uganda</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button variant="gold" size="xl" asChild>
                <Link to="/exhibition">
                  <Ticket className="h-5 w-5 mr-2" />
                  Get Tickets
                </Link>
              </Button>
              <Button variant="outline-light" size="xl" asChild>
                <Link to="/exhibition/exhibitors">
                  Apply as Exhibitor
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Link>
              </Button>
            </div>
          </motion.div>

          {/* Right - Countdown */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="bg-warm-cream/5 backdrop-blur-md border border-warm-cream/10 rounded-3xl p-8 md:p-12">
              <h3 className="font-display text-2xl font-bold text-warm-cream text-center mb-8">
                Countdown to Exhibition
              </h3>

              <div className="grid grid-cols-4 gap-4">
                {[
                  { value: Math.floor(diffDays / 30), label: "Months" },
                  { value: diffDays % 30, label: "Days" },
                  { value: 12, label: "Hours" },
                  { value: 45, label: "Minutes" },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className="bg-gradient-sunset rounded-xl p-4 mb-2">
                      <span className="font-display text-3xl md:text-4xl font-bold text-warm-cream">
                        {item.value}
                      </span>
                    </div>
                    <span className="text-warm-cream/60 text-sm">{item.label}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-warm-cream/10 text-center">
                <p className="text-warm-cream/60 mb-4">Early bird tickets available now</p>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-warm-cream/40 line-through">UGX 50,000</span>
                  <span className="font-display text-2xl font-bold text-secondary">UGX 35,000</span>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, type: "spring" }}
              className="absolute -top-4 -right-4 w-24 h-24 bg-secondary rounded-full flex flex-col items-center justify-center text-secondary-foreground shadow-gold animate-gentle-float"
            >
              <span className="text-xs font-semibold">SAVE</span>
              <span className="font-display text-xl font-bold">30%</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

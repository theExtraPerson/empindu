import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Calendar, MapPin, Users, Ticket, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import patternBg from "@/assets/pattern-bg.jpg";

export function ExhibitionCTA() {
  const festivalDate = new Date("2025-08-20");
  const today = new Date();
  const diffTime = Math.abs(festivalDate.getTime() - today.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return (
    <section className="py-16 md:py-24 relative overflow-hidden border-y-2 border-foreground">
      {/* Background */}
      <div className="absolute inset-0">
        <img
          src={patternBg}
          alt=""
          className="w-full h-full object-cover opacity-10"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary opacity-90" />
      </div>

      {/* Pattern overlay */}
      <div className="absolute inset-0 opacity-10" style={{
        backgroundImage: `repeating-linear-gradient(
          45deg,
          transparent,
          transparent 20px,
          rgba(0,0,0,0.1) 20px,
          rgba(0,0,0,0.1) 40px
        )`
      }} />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 bg-background border-2 border-foreground mb-6"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="font-display text-xs tracking-widest text-foreground">AUGUST 20-27, 2025</span>
            </motion.div>

            <h2 className="font-display text-4xl md:text-5xl lg:text-7xl font-bold text-background tracking-tight leading-[0.9] mb-6">
              EMPINDU
              <br />
              <span className="text-foreground bg-background px-2 inline-block">FESTIVAL</span>
              <br />
              <span className="text-secondary">2025</span>
            </h2>

            <p className="text-background/90 text-lg mb-8 max-w-lg font-body leading-relaxed">
              Uganda's premier celebration of traditional craftsmanship. 
              Experience live demonstrations, meet master artisans, and discover 
              unique handcrafted treasures that tell our story.
            </p>

            {/* Event Details - Brutalist Cards */}
            <div className="space-y-3 mb-8">
              <div className="flex items-center gap-4 p-3 bg-background/10 border border-background/30 backdrop-blur-sm">
                <div className="w-10 h-10 bg-background flex items-center justify-center border-2 border-foreground">
                  <Calendar className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-sm tracking-wider text-background font-bold">AUGUST 20-27, 2025</p>
                  <p className="text-xs text-background/70 font-body">One week of craft celebration</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-background/10 border border-background/30 backdrop-blur-sm">
                <div className="w-10 h-10 bg-background flex items-center justify-center border-2 border-foreground">
                  <MapPin className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-display text-sm tracking-wider text-background font-bold">KAMPALA SERENA HOTEL</p>
                  <p className="text-xs text-background/70 font-body">Kintu Road, Central Division</p>
                </div>
              </div>

              <div className="flex items-center gap-4 p-3 bg-background/10 border border-background/30 backdrop-blur-sm">
                <div className="w-10 h-10 bg-background flex items-center justify-center border-2 border-foreground">
                  <Users className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-display text-sm tracking-wider text-background font-bold">250+ EXHIBITING ARTISANS</p>
                  <p className="text-xs text-background/70 font-body">From all regions of Uganda</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" size="xl" className="border-2 border-foreground shadow-brutal" asChild>
                <Link to="/exhibition">
                  <Ticket className="h-5 w-5 mr-2" />
                  GET TICKETS
                </Link>
              </Button>
              <Button variant="outline" size="xl" className="border-2 border-background text-background hover:bg-background hover:text-foreground" asChild>
                <Link to="/exhibition">
                  LEARN MORE
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
            <div className="bg-background border-2 border-foreground p-8 md:p-12 shadow-brutal-lg">
              <div className="flex items-center gap-3 mb-8">
                <div className="w-3 h-3 bg-primary" />
                <h3 className="font-display text-xl font-bold text-foreground tracking-wider">
                  COUNTDOWN TO FESTIVAL
                </h3>
              </div>

              <div className="grid grid-cols-4 gap-3">
                {[
                  { value: Math.floor(diffDays / 30), label: "MONTHS" },
                  { value: diffDays % 30, label: "DAYS" },
                  { value: 12, label: "HOURS" },
                  { value: 45, label: "MINS" },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className={`p-4 mb-2 border-2 border-foreground ${
                      index === 0 ? "bg-primary text-primary-foreground" :
                      index === 1 ? "bg-secondary text-secondary-foreground" :
                      index === 2 ? "bg-accent text-accent-foreground" :
                      "bg-foreground text-background"
                    }`}>
                      <span className="font-display text-2xl md:text-3xl font-bold">
                        {item.value}
                      </span>
                    </div>
                    <span className="font-display text-[10px] tracking-wider text-muted-foreground">{item.label}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t-2 border-muted">
                <p className="font-display text-xs tracking-widest text-muted-foreground text-center mb-4">
                  EARLY BIRD TICKETS AVAILABLE NOW
                </p>
                <div className="flex items-center justify-center gap-4">
                  <span className="text-muted-foreground line-through font-display">UGX 50,000</span>
                  <span className="font-display text-3xl font-bold text-primary">UGX 35,000</span>
                </div>
              </div>
            </div>

            {/* Floating badge */}
            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: -15 }}
              whileInView={{ opacity: 1, scale: 1, rotate: -12 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, type: "spring" }}
              className="absolute -top-6 -right-6 w-24 h-24 bg-secondary border-2 border-foreground flex flex-col items-center justify-center text-secondary-foreground shadow-brutal"
            >
              <span className="font-display text-xs font-bold">SAVE</span>
              <span className="font-display text-2xl font-bold">30%</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

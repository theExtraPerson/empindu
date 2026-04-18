'use client';

import { motion } from "framer-motion";
import { Link } from "@/lib/router-compat";
import { ArrowRight, Globe2, ShieldCheck, Sparkles, Users } from "lucide-react";
import { Button } from "@/components/ui/button";

const patternBg = "/facemasks.jpg";

export function ExhibitionCTA() {
  return (
    <section className="relative overflow-hidden border-y-2 border-foreground py-16 md:py-24">
      <div className="absolute inset-0">
        <img src={patternBg} alt="" className="h-full w-full object-cover opacity-10" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-accent to-secondary opacity-90" />
      </div>

      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `repeating-linear-gradient(
            45deg,
            transparent,
            transparent 20px,
            rgba(0,0,0,0.1) 20px,
            rgba(0,0,0,0.1) 40px
          )`,
        }}
      />

      <div className="container relative z-10 mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-2">
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
              className="mb-6 inline-flex items-center gap-2 border-2 border-foreground bg-background px-4 py-2"
            >
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="font-display text-xs tracking-widest text-foreground">STORY-FIRST COMMERCE</span>
            </motion.div>

            <h2 className="mb-6 font-display text-4xl font-bold leading-[0.9] tracking-tight text-background md:text-5xl lg:text-7xl">
              EMPINDU
              <br />
              <span className="inline-block bg-background px-2 text-foreground">HERITAGE</span>
              <br />
              <span className="text-secondary">IN MOTION</span>
            </h2>

            <p className="mb-8 max-w-lg font-body text-lg leading-relaxed text-background/90">
              The best Empindu experience helps customers feel the maker, the craft tradition,
              and the social impact before they ever reach the payment step.
            </p>

            <div className="mb-8 space-y-3">
              <div className="flex items-center gap-4 border border-background/30 bg-background/10 p-3 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-background">
                  <Users className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-display text-sm font-bold tracking-wider text-background">ARTISAN STORYTELLING</p>
                  <p className="font-body text-xs text-background/70">Profiles grounded in maker identity, region, and technique.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 border border-background/30 bg-background/10 p-3 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-background">
                  <ShieldCheck className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <p className="font-display text-sm font-bold tracking-wider text-background">TRUST BY DESIGN</p>
                  <p className="font-body text-xs text-background/70">Revenue split, provenance, and fulfillment context made visible.</p>
                </div>
              </div>

              <div className="flex items-center gap-4 border border-background/30 bg-background/10 p-3 backdrop-blur-sm">
                <div className="flex h-10 w-10 items-center justify-center border-2 border-foreground bg-background">
                  <Globe2 className="h-5 w-5 text-secondary" />
                </div>
                <div>
                  <p className="font-display text-sm font-bold tracking-wider text-background">GLOBAL-READY UX</p>
                  <p className="font-body text-xs text-background/70">Built for gifting, mobile trust, and international buyer confidence.</p>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Button variant="secondary" size="xl" className="border-2 border-foreground shadow-brutal" asChild>
                <Link to="/marketplace">START SHOPPING</Link>
              </Button>
              <Button variant="outline" size="xl" className="border-2 border-background text-background hover:bg-background hover:text-foreground" asChild>
                <Link to="/about">
                  READ THE STORY
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="relative"
          >
            <div className="border-2 border-foreground bg-background p-8 shadow-brutal-lg md:p-12">
              <div className="mb-8 flex items-center gap-3">
                <div className="h-3 w-3 bg-primary" />
                <h3 className="font-display text-xl font-bold tracking-wider text-foreground">
                  WHAT BUYERS NEED TO FEEL
                </h3>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "TRUST", label: "VISIBLE" },
                  { value: "CARE", label: "FELT" },
                  { value: "PROOF", label: "CLEAR" },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    className="text-center"
                  >
                    <div className={`mb-2 border-2 border-foreground p-4 ${
                      index === 0
                        ? "bg-primary text-primary-foreground"
                        : index === 1
                          ? "bg-secondary text-secondary-foreground"
                          : "bg-accent text-accent-foreground"
                    }`}>
                      <span className="font-display text-2xl font-bold md:text-3xl">{item.value}</span>
                    </div>
                    <span className="font-display text-[10px] tracking-wider text-muted-foreground">{item.label}</span>
                  </motion.div>
                ))}
              </div>

              <div className="mt-8 border-t-2 border-muted pt-8">
                <p className="mb-4 text-center font-display text-xs tracking-widest text-muted-foreground">
                  CRAFTED FOR CONVERSION WITHOUT LOSING CULTURAL DEPTH
                </p>
                <div className="flex items-center justify-center gap-4">
                  <span className="font-display text-xl text-muted-foreground">Story</span>
                  <span className="font-display text-3xl font-bold text-primary">+</span>
                  <span className="font-display text-xl text-muted-foreground">Commerce</span>
                </div>
              </div>
            </div>

            <motion.div
              initial={{ opacity: 0, scale: 0, rotate: -15 }}
              whileInView={{ opacity: 1, scale: 1, rotate: -12 }}
              viewport={{ once: true }}
              transition={{ delay: 0.6, type: "spring" }}
              className="absolute -top-6 -right-6 flex h-24 w-24 flex-col items-center justify-center border-2 border-foreground bg-secondary text-secondary-foreground shadow-brutal"
            >
              <span className="font-display text-xs font-bold">BUY</span>
              <span className="font-display text-2xl font-bold">WITH</span>
              <span className="font-display text-xs font-bold">MEANING</span>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

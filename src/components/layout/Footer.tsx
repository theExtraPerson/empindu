import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { 
  Facebook, 
  Twitter, 
  Instagram, 
  Youtube, 
  Mail, 
  Phone, 
  MapPin,
  ArrowRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

const footerLinks = {
  discover: [
    { name: "Artisan Directory", href: "/artisans" },
    { name: "Marketplace", href: "/marketplace" },
    { name: "Exhibition 2025", href: "/exhibition" },
    { name: "Craft Categories", href: "/categories" },
  ],
  support: [
    { name: "About Us", href: "/about" },
    { name: "Resources", href: "/resources" },
    { name: "Training Programs", href: "/training" },
    { name: "Partner With Us", href: "/partners" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy" },
    { name: "Terms of Service", href: "/terms" },
    { name: "Cookie Policy", href: "/cookies" },
    { name: "Artisan Guidelines", href: "/guidelines" },
  ],
};

const socialLinks = [
  { name: "Facebook", icon: Facebook, href: "#" },
  { name: "Twitter", icon: Twitter, href: "#" },
  { name: "Instagram", icon: Instagram, href: "#" },
  { name: "YouTube", icon: Youtube, href: "#" },
];

export function Footer() {
  return (
    <footer className="bg-bark-brown text-warm-cream">
      {/* Newsletter Section */}
      <div className="border-b border-warm-cream/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl md:text-4xl font-bold mb-4"
            >
              Join the Craft Revolution
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-warm-cream/70 mb-6 max-w-xl mx-auto"
            >
              Subscribe to receive updates on new artisans, exclusive collections, 
              and upcoming exhibitions.
            </motion.p>
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-warm-cream/10 border-warm-cream/20 text-warm-cream placeholder:text-warm-cream/50 focus:border-secondary"
              />
              <Button variant="gold" className="shrink-0">
                Subscribe
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </motion.form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-flex items-center gap-3 mb-6">
              <div className="w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center">
                <span className="text-primary-foreground font-display font-bold text-xl">C</span>
              </div>
              <div>
                <span className="font-display text-2xl font-bold text-warm-cream">
                  Crafted
                </span>
                <span className="font-display text-2xl font-bold text-secondary">
                  Uganda
                </span>
              </div>
            </Link>
            <p className="text-warm-cream/70 mb-6 max-w-sm">
              Connecting Ugandan artisans with global markets, preserving cultural 
              heritage while driving economic empowerment.
            </p>
            <div className="space-y-3">
              <a 
                href="mailto:hello@crafteduganda.com" 
                className="flex items-center gap-3 text-warm-cream/70 hover:text-secondary transition-colors"
              >
                <Mail className="h-5 w-5" />
                hello@crafteduganda.com
              </a>
              <a 
                href="tel:+256700000000" 
                className="flex items-center gap-3 text-warm-cream/70 hover:text-secondary transition-colors"
              >
                <Phone className="h-5 w-5" />
                +256 700 000 000
              </a>
              <div className="flex items-start gap-3 text-warm-cream/70">
                <MapPin className="h-5 w-5 shrink-0 mt-0.5" />
                <span>Kampala, Uganda<br />Pearl of Africa</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-display text-lg font-bold mb-4">Discover</h4>
            <ul className="space-y-3">
              {footerLinks.discover.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-warm-cream/70 hover:text-secondary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-bold mb-4">Support</h4>
            <ul className="space-y-3">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-warm-cream/70 hover:text-secondary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-lg font-bold mb-4">Legal</h4>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-warm-cream/70 hover:text-secondary transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-warm-cream/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-warm-cream/60 text-sm">
              © {new Date().getFullYear()} CraftedUganda. All rights reserved.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 rounded-full bg-warm-cream/10 flex items-center justify-center text-warm-cream/70 hover:bg-secondary hover:text-secondary-foreground transition-all duration-300"
                  aria-label={social.name}
                >
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

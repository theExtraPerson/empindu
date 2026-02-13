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
import { Input } from "@/components/ui/input";

const footerLinks = {
  discover: [
    { name: "ARTISAN DIRECTORY", href: "/artisans" },
    { name: "MARKETPLACE", href: "/marketplace" },
    { name: "EMPINDU FESTIVAL", href: "/exhibition" },
    { name: "CRAFT CATEGORIES", href: "/categories" },
  ],
  support: [
    { name: "ABOUT US", href: "/about" },
    { name: "RESOURCES", href: "/resources" },
    { name: "TRAINING PROGRAMS", href: "/training" },
    { name: "PARTNER WITH US", href: "/partners" },
  ],
  legal: [
    { name: "PRIVACY POLICY", href: "/privacy" },
    { name: "TERMS OF SERVICE", href: "/terms" },
    { name: "COOKIE POLICY", href: "/cookies" },
    { name: "ARTISAN GUIDELINES", href: "/guidelines" },
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
      <div className="border-b-2 border-warm-cream/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="max-w-4xl mx-auto">
            <motion.h3
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="font-display text-3xl md:text-4xl mb-4"
            >
              JOIN THE CRAFT REVOLUTION
            </motion.h3>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-warm-cream/60 mb-8 max-w-xl font-body"
            >
              Subscribe to receive updates on new artisans, exclusive collections, 
              and upcoming exhibitions.
            </motion.p>
            <motion.form
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-0"
              onSubmit={(e) => e.preventDefault()}
            >
              <Input
                type="email"
                placeholder="Enter your email"
                className="bg-transparent border-2 border-warm-cream/30 text-warm-cream placeholder:text-warm-cream/40 focus:border-warm-cream rounded-none h-14 flex-1"
              />
              <button className="h-14 px-8 bg-secondary text-secondary-foreground font-display text-sm tracking-widest hover:bg-secondary/90 transition-colors flex items-center gap-2 border-2 border-secondary">
                SUBSCRIBE
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.form>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <Link to="/" className="inline-block mb-8">
              <div className="flex flex-col">
                <span className="font-display text-2xl tracking-[0.2em] text-warm-cream">
                  EMPINDU.
                </span>
                <span className="font-display text-xs tracking-[0.4em] text-warm-cream/60 -mt-1">
                  THRIVE WITH NATURE
                </span>
              </div>
            </Link>
            <p className="text-warm-cream/60 mb-8 max-w-sm font-body text-sm leading-relaxed">
              Empowering Ugandan artisans, preserving cultural 
              heritage while protecting the nature upon which we thrive.
            </p>
            <div className="space-y-4">
              <a 
                href="mailto:hello@crafteduganda.com" 
                className="flex items-center gap-3 text-warm-cream/60 hover:text-secondary transition-colors font-body text-sm"
              >
                <Mail className="h-4 w-4" />
                shop@empindu.com
              </a>
              <a 
                href="tel:+256752508000" 
                className="flex items-center gap-3 text-warm-cream/60 hover:text-secondary transition-colors font-body text-sm"
              >
                <Phone className="h-4 w-4" />
                +256 752 508 000
              </a>
              <div className="flex items-start gap-3 text-warm-cream/60 font-body text-sm">
                <MapPin className="h-4 w-4 shrink-0 mt-0.5" />
                <span>Kampala, Uganda<br />Pearl of Africa</span>
              </div>
            </div>
          </div>

          {/* Links Columns */}
          <div>
            <h4 className="font-display text-sm tracking-widest mb-6 text-warm-cream">DISCOVER</h4>
            <ul className="space-y-4">
              {footerLinks.discover.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-warm-cream/60 hover:text-secondary transition-colors font-display text-xs tracking-wider"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm tracking-widest mb-6 text-warm-cream">SUPPORT</h4>
            <ul className="space-y-4">
              {footerLinks.support.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-warm-cream/60 hover:text-secondary transition-colors font-display text-xs tracking-wider"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="font-display text-sm tracking-widest mb-6 text-warm-cream">LEGAL</h4>
            <ul className="space-y-4">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <Link
                    to={link.href}
                    className="text-warm-cream/60 hover:text-secondary transition-colors font-display text-xs tracking-wider"
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
      <div className="border-t-2 border-warm-cream/20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-warm-cream/40 text-xs font-display tracking-wider">
              © {new Date().getFullYear()} EMPINDU. ALL RIGHTS RESERVED.
            </p>
            <div className="flex items-center gap-4">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className="w-10 h-10 border-2 border-warm-cream/20 flex items-center justify-center text-warm-cream/60 hover:bg-secondary hover:text-secondary-foreground hover:border-secondary transition-all duration-300"
                  aria-label={social.name}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}

import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, User, Search, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Home", href: "/" },
  { name: "Artisans", href: "/artisans" },
  { name: "Marketplace", href: "/marketplace" },
  { name: "Exhibition", href: "/exhibition" },
  { name: "About", href: "/about" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500",
        isScrolled
          ? "bg-card/95 backdrop-blur-md shadow-medium py-3"
          : "bg-transparent py-5"
      )}
    >
      <nav className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 bg-gradient-hero rounded-lg flex items-center justify-center shadow-glow group-hover:scale-105 transition-transform duration-300">
                <span className="text-primary-foreground font-display font-bold text-lg">C</span>
              </div>
              <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-secondary rounded-full animate-pulse-glow" />
            </div>
            <div className="hidden sm:block">
              <span className={cn(
                "font-display text-xl font-bold transition-colors duration-300",
                isScrolled ? "text-foreground" : "text-primary-foreground"
              )}>
                Crafted
              </span>
              <span className={cn(
                "font-display text-xl font-bold transition-colors duration-300",
                isScrolled ? "text-primary" : "text-secondary"
              )}>
                Uganda
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            {navigation.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  "px-4 py-2 rounded-lg font-medium text-sm transition-all duration-300",
                  location.pathname === item.href
                    ? isScrolled
                      ? "bg-primary/10 text-primary"
                      : "bg-primary-foreground/20 text-primary-foreground"
                    : isScrolled
                    ? "text-foreground hover:bg-muted hover:text-primary"
                    : "text-primary-foreground/90 hover:bg-primary-foreground/10 hover:text-primary-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <Button
              variant={isScrolled ? "ghost" : "ghost-light"}
              size="icon-sm"
              className="hidden sm:flex"
            >
              <Search className="h-5 w-5" />
            </Button>
            <Button
              variant={isScrolled ? "ghost" : "ghost-light"}
              size="icon-sm"
              className="relative"
            >
              <ShoppingBag className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-foreground rounded-full text-xs flex items-center justify-center font-bold">
                0
              </span>
            </Button>
            <Button
              variant={isScrolled ? "outline" : "outline-light"}
              size="sm"
              className="hidden md:flex"
            >
              <User className="h-4 w-4 mr-2" />
              Sign In
            </Button>
            
            {/* Mobile Menu Button */}
            <Button
              variant={isScrolled ? "ghost" : "ghost-light"}
              size="icon"
              className="lg:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
              className="lg:hidden overflow-hidden"
            >
              <div className="py-4 space-y-1 border-t border-border/50 mt-4">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.href}
                      className={cn(
                        "block px-4 py-3 rounded-lg font-medium transition-all duration-300",
                        location.pathname === item.href
                          ? "bg-primary/10 text-primary"
                          : "text-foreground hover:bg-muted"
                      )}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navigation.length * 0.1 }}
                  className="pt-4"
                >
                  <Button variant="hero" className="w-full">
                    <User className="h-4 w-4 mr-2" />
                    Sign In
                  </Button>
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

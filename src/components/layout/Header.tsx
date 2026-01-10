import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, User, LogOut, Settings, Shield, Palette, Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/useAuth";
import { useCartStore } from "@/stores/cartStore";

const navigation = [
  { name: "Artisans", href: "/artisans" },
  { name: "Marketplace", href: "/marketplace" },
  { name: "Exhibition", href: "/exhibition" },
  { name: "About", href: "/about" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, role, signOut } = useAuth();
  const { openCart, getTotalItems } = useCartStore();
  const cartItemCount = getTotalItems();

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

  const handleSignOut = async () => {
    await signOut();
    navigate('/');
  };

  const getRoleIcon = () => {
    switch (role) {
      case 'admin':
        return <Shield className="w-4 h-4" />;
      case 'artisan':
        return <Palette className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  const getRoleLabel = () => {
    switch (role) {
      case 'admin':
        return 'Administrator';
      case 'artisan':
        return 'Artisan';
      default:
        return 'Buyer';
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-sm border-b-2 border-foreground/10"
          : "bg-transparent"
      )}
    >
      <nav className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Left: Menu Button */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "flex items-center gap-2 font-mono text-xs uppercase tracking-widest transition-colors",
                isScrolled ? "text-foreground" : "text-primary-foreground"
              )}
            >
              <div className="flex flex-col gap-1">
                <span className={cn(
                  "block w-5 h-0.5 transition-all",
                  isScrolled ? "bg-foreground" : "bg-primary-foreground",
                  isMobileMenuOpen && "rotate-45 translate-y-1.5"
                )} />
                <span className={cn(
                  "block w-5 h-0.5 transition-all",
                  isScrolled ? "bg-foreground" : "bg-primary-foreground",
                  isMobileMenuOpen && "opacity-0"
                )} />
                <span className={cn(
                  "block w-5 h-0.5 transition-all",
                  isScrolled ? "bg-foreground" : "bg-primary-foreground",
                  isMobileMenuOpen && "-rotate-45 -translate-y-1.5"
                )} />
              </div>
              <span className="hidden sm:inline">Menu</span>
            </button>

            {/* Desktop Left Nav Item */}
            <Link
              to="/marketplace"
              className={cn(
                "hidden lg:block font-mono text-xs uppercase tracking-widest transition-colors hover:opacity-60",
                isScrolled ? "text-foreground" : "text-primary-foreground"
              )}
            >
              Shop
            </Link>
          </div>

          {/* Center: Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              <span className={cn(
                "font-display text-lg md:text-xl tracking-[0.3em] uppercase transition-colors font-semibold",
                isScrolled ? "text-foreground" : "text-primary-foreground"
              )}>
                Crafted
              </span>
              <span className={cn(
                "font-mono text-[10px] tracking-[0.5em] uppercase transition-colors -mt-1",
                isScrolled ? "text-muted-foreground" : "text-primary-foreground/70"
              )}>
                Uganda
              </span>
            </motion.div>
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center gap-3 md:gap-6">
            {/* Desktop Nav Items */}
            <div className="hidden lg:flex items-center gap-6">
              {navigation.slice(0, 2).map((item) => (
                <Link
                  key={item.name}
                  to={item.href}
                  className={cn(
                    "font-mono text-xs uppercase tracking-widest transition-colors hover:opacity-60",
                    isScrolled ? "text-foreground" : "text-primary-foreground"
                  )}
                >
                  {item.name}
                </Link>
              ))}
            </div>

            {/* Cart */}
            <button
              onClick={openCart}
              className={cn(
                "relative font-mono text-xs uppercase tracking-widest transition-colors hover:opacity-60",
                isScrolled ? "text-foreground" : "text-primary-foreground"
              )}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-4 h-4 bg-secondary text-secondary-foreground rounded-full text-[10px] flex items-center justify-center font-bold">
                  {cartItemCount}
                </span>
              )}
            </button>

            {/* User */}
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button
                    className={cn(
                      "font-mono text-xs uppercase tracking-widest transition-colors hover:opacity-60",
                      isScrolled ? "text-foreground" : "text-primary-foreground"
                    )}
                  >
                    <User className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-none border-2 border-foreground">
                  <div className="px-2 py-2 border-b-2 border-foreground">
                    <p className="font-mono text-xs uppercase tracking-wider truncate">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-primary">
                      {getRoleIcon()}
                      <span className="font-mono uppercase tracking-wider">{getRoleLabel()}</span>
                    </div>
                  </div>
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-none">
                    <Settings className="w-4 h-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  {(role === 'artisan' || role === 'admin') && (
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} className="rounded-none">
                      <Package className="w-4 h-4 mr-2" />
                      Products
                    </DropdownMenuItem>
                  )}
                  {role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="rounded-none">
                      <Shield className="w-4 h-4 mr-2" />
                      Admin
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive rounded-none">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className={cn(
                  "hidden sm:block font-mono text-xs uppercase tracking-widest transition-colors hover:opacity-60",
                  isScrolled ? "text-foreground" : "text-primary-foreground"
                )}
              >
                Sign In
              </button>
            )}
          </div>
        </div>
      </nav>

      {/* Full-Screen Menu Overlay */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 top-16 md:top-20 bg-background z-40"
          >
            <div className="h-full flex flex-col justify-between p-8">
              <div className="space-y-2">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Link
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "block font-display text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight transition-colors hover:text-primary",
                        location.pathname === item.href ? "text-primary" : "text-foreground"
                      )}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
                <motion.div
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: navigation.length * 0.1 }}
                >
                  <Link
                    to="/resources"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="block font-display text-5xl md:text-7xl lg:text-8xl font-bold uppercase tracking-tight transition-colors hover:text-primary text-foreground"
                  >
                    Resources
                  </Link>
                </motion.div>
              </div>

              {/* Bottom section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="border-t-2 border-foreground pt-8"
              >
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Contact</p>
                    <p className="font-mono text-sm">hello@crafteduganda.com</p>
                  </div>
                  <div>
                    <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground mb-2">Location</p>
                    <p className="font-mono text-sm">Kampala, Uganda</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

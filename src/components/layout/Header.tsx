import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ShoppingBag, User, LogOut, Settings, Shield, Palette, Package } from "lucide-react";
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
  { name: "ARTISANS", href: "/artisans" },
  { name: "MARKETPLACE", href: "/marketplace" },
  { name: "EXHIBITION", href: "/exhibition" },
  { name: "ABOUT", href: "/about" },
  { name: "RESOURCES", href: "/resources" },
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
        return 'ADMINISTRATOR';
      case 'artisan':
        return 'ARTISAN';
      default:
        return 'BUYER';
    }
  };

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled
          ? "bg-background border-b-2 border-foreground"
          : "bg-transparent"
      )}
    >
      <nav className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          {/* Left: Menu Button */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className={cn(
                "flex items-center gap-3 font-display text-xs tracking-widest transition-colors",
                isScrolled ? "text-foreground" : "text-background"
              )}
            >
              <div className="flex flex-col gap-1.5">
                <span className={cn(
                  "block w-6 h-0.5 transition-all origin-center",
                  isScrolled ? "bg-foreground" : "bg-background",
                  isMobileMenuOpen && "rotate-45 translate-y-2"
                )} />
                <span className={cn(
                  "block w-6 h-0.5 transition-all",
                  isScrolled ? "bg-foreground" : "bg-background",
                  isMobileMenuOpen && "opacity-0"
                )} />
                <span className={cn(
                  "block w-6 h-0.5 transition-all origin-center",
                  isScrolled ? "bg-foreground" : "bg-background",
                  isMobileMenuOpen && "-rotate-45 -translate-y-2"
                )} />
              </div>
              <span className="hidden sm:inline">MENU</span>
            </button>
          </div>

          {/* Center: Logo */}
          <Link to="/" className="absolute left-1/2 -translate-x-1/2">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="flex flex-col items-center"
            >
              <span className={cn(
                "font-display text-xl md:text-2xl tracking-[0.2em] transition-colors",
                isScrolled ? "text-foreground" : "text-background"
              )}>
                EMPINDU
              </span>
              <span className={cn(
                "font-display text-[10px] tracking-[0.4em] transition-colors -mt-1",
                isScrolled ? "text-muted-foreground" : "text-background/70"
              )}>
                THRIVE WITH NATURE
              </span>
            </motion.div>
          </Link>

          {/* Right: Actions */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Cart */}
            <button
              onClick={openCart}
              className={cn(
                "relative font-display text-xs tracking-widest transition-colors",
                isScrolled ? "text-foreground" : "text-background"
              )}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-2 -right-2 w-5 h-5 bg-accent text-accent-foreground text-[10px] flex items-center justify-center font-bold border-2 border-foreground">
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
                      "font-display text-xs tracking-widest transition-colors",
                      isScrolled ? "text-foreground" : "text-background"
                    )}
                  >
                    <User className="h-5 w-5" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56 rounded-none border-2 border-foreground bg-background">
                  <div className="px-3 py-3 border-b-2 border-foreground">
                    <p className="font-display text-xs tracking-wider truncate">{profile?.full_name || 'USER'}</p>
                    <p className="text-xs text-muted-foreground truncate mt-1">{user.email}</p>
                    <div className="mt-2 flex items-center gap-1 text-xs text-accent">
                      {getRoleIcon()}
                      <span className="font-display tracking-wider">{getRoleLabel()}</span>
                    </div>
                  </div>
                  <DropdownMenuItem onClick={() => navigate('/profile')} className="rounded-none font-display text-xs tracking-wider">
                    <Settings className="w-4 h-4 mr-2" />
                    PROFILE
                  </DropdownMenuItem>
                  {(role === 'artisan' || role === 'admin') && (
                    <DropdownMenuItem onClick={() => navigate('/dashboard')} className="rounded-none font-display text-xs tracking-wider">
                      <Package className="w-4 h-4 mr-2" />
                      PRODUCTS
                    </DropdownMenuItem>
                  )}
                  {role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')} className="rounded-none font-display text-xs tracking-wider">
                      <Shield className="w-4 h-4 mr-2" />
                      ADMIN
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator className="bg-foreground" />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive rounded-none font-display text-xs tracking-wider">
                    <LogOut className="w-4 h-4 mr-2" />
                    SIGN OUT
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <button
                onClick={() => navigate('/auth')}
                className={cn(
                  "hidden sm:block font-display text-xs tracking-widest transition-colors hover:opacity-60",
                  isScrolled ? "text-foreground" : "text-background"
                )}
              >
                SIGN IN
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
            className="fixed inset-0 top-16 md:top-20 bg-background z-40 overflow-auto"
          >
            <div className="min-h-full flex flex-col justify-between p-6 md:p-12">
              {/* Navigation Links */}
              <div className="space-y-0 border-t-2 border-foreground">
                {navigation.map((item, index) => (
                  <motion.div
                    key={item.name}
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.08 }}
                    className="border-b-2 border-foreground"
                  >
                    <Link
                      to={item.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className={cn(
                        "block py-6 md:py-8 font-display text-4xl md:text-6xl lg:text-7xl tracking-tight transition-colors hover:bg-muted hover:pl-4",
                        location.pathname === item.href ? "text-accent" : "text-foreground"
                      )}
                    >
                      {item.name}
                    </Link>
                  </motion.div>
                ))}
              </div>

              {/* Bottom section */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="mt-12 pt-8 border-t-2 border-foreground"
              >
                <div className="grid grid-cols-2 gap-8">
                  <div>
                    <p className="font-display text-xs tracking-widest text-muted-foreground mb-2">CONTACT</p>
                    <p className="font-body text-sm">shop@empindu.com</p>
                  </div>
                  <div>
                    <p className="font-display text-xs tracking-widest text-muted-foreground mb-2">LOCATION</p>
                    <p className="font-body text-sm">Kampala, Pearl of Africa</p>
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

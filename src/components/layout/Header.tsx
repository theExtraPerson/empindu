import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ShoppingBag, User, Search, LogOut, Settings, Shield, Palette, Package } from "lucide-react";
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
  { name: "Home", href: "/" },
  { name: "Artisans", href: "/artisans" },
  { name: "Marketplace", href: "/marketplace" },
  { name: "Resources", href: "/resources" },
  { name: "Exhibition", href: "/exhibition" },
  { name: "About", href: "/about" },
];

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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
            <div className="hidden sm:flex items-center relative">
              <AnimatePresence>
                {isSearchOpen && (
                  <motion.div
                    initial={{ width: 0, opacity: 0 }}
                    animate={{ width: 220, opacity: 1 }}
                    exit={{ width: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: "easeOut" }}
                    className="overflow-hidden"
                  >
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search the talent of Africa's hands..."
                      className={cn(
                        "w-full h-9 px-3 pr-2 text-sm rounded-l-full border-y border-l outline-none transition-colors",
                        isScrolled 
                          ? "bg-background border-border text-foreground placeholder:text-muted-foreground" 
                          : "bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground placeholder:text-primary-foreground/60"
                      )}
                      autoFocus
                      onKeyDown={(e) => {
                        if (e.key === 'Escape') {
                          setIsSearchOpen(false);
                          setSearchQuery("");
                        }
                      }}
                    />
                  </motion.div>
                )}
              </AnimatePresence>
              <Button
                variant={isScrolled ? "ghost" : "ghost-light"}
                size="icon-sm"
                className={cn(
                  "transition-all duration-300",
                  isSearchOpen && "rounded-l-none rounded-r-full"
                )}
                onClick={() => {
                  if (isSearchOpen && searchQuery) {
                    // Handle search - navigate to resources with query
                    navigate(`/resources?search=${encodeURIComponent(searchQuery)}`);
                    setIsSearchOpen(false);
                    setSearchQuery("");
                  } else {
                    setIsSearchOpen(!isSearchOpen);
                    if (isSearchOpen) setSearchQuery("");
                  }
                }}
              >
                <Search className="h-5 w-5" />
              </Button>
            </div>
            <Button
              variant={isScrolled ? "ghost" : "ghost-light"}
              size="icon-sm"
              className="relative"
              onClick={openCart}
            >
              <ShoppingBag className="h-5 w-5" />
              {cartItemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-secondary text-secondary-foreground rounded-full text-xs flex items-center justify-center font-bold">
                  {cartItemCount > 99 ? '99+' : cartItemCount}
                </span>
              )}
            </Button>
            
            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant={isScrolled ? "outline" : "outline-light"}
                    size="sm"
                    className="hidden md:flex gap-2"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                      {profile?.full_name?.charAt(0)?.toUpperCase() || user.email?.charAt(0)?.toUpperCase()}
                    </div>
                    <span className="max-w-[100px] truncate">
                      {profile?.full_name || 'Account'}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <div className="px-2 py-2 border-b">
                    <p className="font-medium truncate">{profile?.full_name || 'User'}</p>
                    <p className="text-xs text-muted-foreground truncate">{user.email}</p>
                    <div className="mt-1 flex items-center gap-1 text-xs text-primary">
                      {getRoleIcon()}
                      {getRoleLabel()}
                    </div>
                  </div>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <Settings className="w-4 h-4 mr-2" />
                    Profile Settings
                  </DropdownMenuItem>
                  {(role === 'artisan' || role === 'admin') && (
                    <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                      <Package className="w-4 h-4 mr-2" />
                      My Products
                    </DropdownMenuItem>
                  )}
                  {role === 'admin' && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Shield className="w-4 h-4 mr-2" />
                      Admin Dashboard
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut} className="text-destructive">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Button
                variant={isScrolled ? "outline" : "outline-light"}
                size="sm"
                className="hidden md:flex"
                onClick={() => navigate('/auth')}
              >
                <User className="h-4 w-4 mr-2" />
                Sign In
              </Button>
            )}
            
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
                  {user ? (
                    <div className="space-y-2">
                      <Button 
                        variant="outline" 
                        className="w-full justify-start"
                        onClick={() => navigate('/profile')}
                      >
                        <Settings className="h-4 w-4 mr-2" />
                        Profile Settings
                      </Button>
                      {(role === 'artisan' || role === 'admin') && (
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => navigate('/dashboard')}
                        >
                          <Package className="h-4 w-4 mr-2" />
                          My Products
                        </Button>
                      )}
                      {role === 'admin' && (
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => navigate('/admin')}
                        >
                          <Shield className="h-4 w-4 mr-2" />
                          Admin Dashboard
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        className="w-full justify-start text-destructive"
                        onClick={handleSignOut}
                      >
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  ) : (
                    <Button 
                      variant="hero" 
                      className="w-full"
                      onClick={() => navigate('/auth')}
                    >
                      <User className="h-4 w-4 mr-2" />
                      Sign In
                    </Button>
                  )}
                </motion.div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </header>
  );
}

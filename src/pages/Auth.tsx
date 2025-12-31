import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, MapPin, Palette, ArrowLeft } from 'lucide-react';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import patternBg from '@/assets/pattern-bg.jpg';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

type AuthMode = 'login' | 'register' | 'artisan-register';
type UserRole = 'buyer' | 'artisan';

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, signIn, signUp } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [craftSpecialty, setCraftSpecialty] = useState('');
  
  // Form errors
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    try {
      emailSchema.parse(email);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.email = e.errors[0].message;
      }
    }
    
    try {
      passwordSchema.parse(password);
    } catch (e) {
      if (e instanceof z.ZodError) {
        newErrors.password = e.errors[0].message;
      }
    }
    
    if (mode !== 'login') {
      try {
        nameSchema.parse(fullName);
      } catch (e) {
        if (e instanceof z.ZodError) {
          newErrors.fullName = e.errors[0].message;
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    
    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) {
          if (error.message.includes('Invalid login credentials')) {
            toast({
              title: 'Login Failed',
              description: 'Invalid email or password. Please try again.',
              variant: 'destructive'
            });
          } else {
            toast({
              title: 'Login Failed',
              description: error.message,
              variant: 'destructive'
            });
          }
        } else {
          toast({
            title: 'Welcome back!',
            description: 'You have successfully logged in.'
          });
          navigate('/');
        }
      } else {
        const role: UserRole = mode === 'artisan-register' ? 'artisan' : 'buyer';
        const { error } = await signUp(email, password, fullName, role);
        
        if (error) {
          if (error.message.includes('already registered')) {
            toast({
              title: 'Account Exists',
              description: 'This email is already registered. Please login instead.',
              variant: 'destructive'
            });
            setMode('login');
          } else {
            toast({
              title: 'Registration Failed',
              description: error.message,
              variant: 'destructive'
            });
          }
        } else {
          toast({
            title: 'Welcome to CraftedUganda!',
            description: `Your ${role === 'artisan' ? 'artisan' : 'buyer'} account has been created.`
          });
          navigate('/');
        }
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-16 bg-background">
        <div className="w-full max-w-md mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate('/')}
            className="mb-8 -ml-4 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-3xl font-display font-bold text-foreground mb-2">
              {mode === 'login' ? 'Welcome Back' : mode === 'artisan-register' ? 'Join as an Artisan' : 'Create Account'}
            </h1>
            <p className="text-muted-foreground mb-8">
              {mode === 'login' 
                ? 'Sign in to access your account' 
                : mode === 'artisan-register'
                ? 'Share your craft with the world'
                : 'Start your journey with CraftedUganda'}
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              <AnimatePresence mode="wait">
                {mode !== 'login' && (
                  <motion.div
                    key="name"
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="fullName"
                        type="text"
                        placeholder="Enter your full name"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        className="pl-11"
                      />
                    </div>
                    {errors.fullName && (
                      <p className="text-sm text-destructive">{errors.fullName}</p>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-11"
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-destructive">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-11 pr-11"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-sm text-destructive">{errors.password}</p>
                )}
              </div>

              <AnimatePresence mode="wait">
                {mode === 'artisan-register' && (
                  <>
                    <motion.div
                      key="location"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="location">Location (Optional)</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="location"
                          type="text"
                          placeholder="e.g., Kampala, Uganda"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          className="pl-11"
                        />
                      </div>
                    </motion.div>
                    
                    <motion.div
                      key="craft"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      className="space-y-2"
                    >
                      <Label htmlFor="craft">Craft Specialty (Optional)</Label>
                      <div className="relative">
                        <Palette className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="craft"
                          type="text"
                          placeholder="e.g., Bark Cloth, Basket Weaving"
                          value={craftSpecialty}
                          onChange={(e) => setCraftSpecialty(e.target.value)}
                          className="pl-11"
                        />
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              <Button
                type="submit"
                variant="hero"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent" />
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </span>
                ) : (
                  mode === 'login' ? 'Sign In' : 'Create Account'
                )}
              </Button>
            </form>

            <div className="mt-8 space-y-4">
              {mode === 'login' ? (
                <>
                  <p className="text-center text-muted-foreground">
                    Don't have an account?{' '}
                    <button
                      onClick={() => setMode('register')}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign up
                    </button>
                  </p>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or</span>
                    </div>
                  </div>
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setMode('artisan-register')}
                  >
                    <Palette className="w-4 h-4 mr-2" />
                    Register as an Artisan
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-center text-muted-foreground">
                    Already have an account?{' '}
                    <button
                      onClick={() => setMode('login')}
                      className="text-primary hover:underline font-medium"
                    >
                      Sign in
                    </button>
                  </p>
                  {mode === 'register' && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setMode('artisan-register')}
                    >
                      <Palette className="w-4 h-4 mr-2" />
                      Register as an Artisan instead
                    </Button>
                  )}
                  {mode === 'artisan-register' && (
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={() => setMode('register')}
                    >
                      <User className="w-4 h-4 mr-2" />
                      Register as a Buyer instead
                    </Button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side - Visual */}
      <div 
        className="hidden lg:flex lg:flex-1 relative overflow-hidden"
        style={{
          backgroundImage: `url(${patternBg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/90 via-primary/70 to-accent/80" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-white text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="mb-8">
              <span className="text-6xl font-display font-bold tracking-tight">
                Crafted<span className="text-accent-foreground/80">Uganda</span>
              </span>
            </div>
            <h2 className="text-2xl font-medium mb-4 max-w-md">
              Connecting Ugandan artisans with the world
            </h2>
            <p className="text-white/80 max-w-sm">
              Join our community of skilled craftspeople preserving traditional techniques while reaching global markets.
            </p>
            
            <div className="mt-12 grid grid-cols-3 gap-6 text-center">
              <div>
                <div className="text-3xl font-bold">500+</div>
                <div className="text-sm text-white/70">Artisans</div>
              </div>
              <div>
                <div className="text-3xl font-bold">2,000+</div>
                <div className="text-sm text-white/70">Products</div>
              </div>
              <div>
                <div className="text-3xl font-bold">50+</div>
                <div className="text-sm text-white/70">Communities</div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

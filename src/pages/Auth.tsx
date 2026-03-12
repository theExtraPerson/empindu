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
import { lovable } from '@/integrations/lovable/index';
import patternBg from '@/assets/pattern-bg.jpg';

const emailSchema = z.string().email('Please enter a valid email address');
const passwordSchema = z.string().min(6, 'Password must be at least 6 characters');
const nameSchema = z.string().min(2, 'Name must be at least 2 characters');

type AuthMode = 'login' | 'register' | 'artisan-register';

export default function Auth() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, loading, signIn, signUp } = useAuth();
  
  const [mode, setMode] = useState<AuthMode>('login');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [googleLoading, setGoogleLoading] = useState<'buyer' | 'artisan' | null>(null);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [location, setLocation] = useState('');
  const [craftSpecialty, setCraftSpecialty] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && user) {
      navigate('/');
    }
  }, [user, loading, navigate]);

  const handleGoogleLogin = async (role: 'buyer' | 'artisan') => {
    setGoogleLoading(role);
    try {
      const { error } = await lovable.auth.signInWithOAuth("google", {
        redirect_uri: window.location.origin,
        extraParams: {
          prompt: "select_account",
        },
      });
      if (error) {
        toast({ title: 'Google Sign-In Failed', description: String(error), variant: 'destructive' });
      }
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to initiate Google sign-in', variant: 'destructive' });
    } finally {
      setGoogleLoading(null);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    try { emailSchema.parse(email); } catch (e) { if (e instanceof z.ZodError) newErrors.email = e.errors[0].message; }
    try { passwordSchema.parse(password); } catch (e) { if (e instanceof z.ZodError) newErrors.password = e.errors[0].message; }
    if (mode !== 'login') {
      try { nameSchema.parse(fullName); } catch (e) { if (e instanceof z.ZodError) newErrors.fullName = e.errors[0].message; }
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
          toast({ title: 'Login Failed', description: error.message.includes('Invalid login credentials') ? 'Invalid email or password.' : error.message, variant: 'destructive' });
        } else {
          toast({ title: 'Welcome back!', description: 'You have successfully logged in.' });
          navigate('/');
        }
      } else {
        const role = mode === 'artisan-register' ? 'artisan' : 'buyer';
        const { error } = await signUp(email, password, fullName, role);
        if (error) {
          if (error.message.includes('already registered')) {
            toast({ title: 'Account Exists', description: 'This email is already registered. Please login instead.', variant: 'destructive' });
            setMode('login');
          } else {
            toast({ title: 'Registration Failed', description: error.message, variant: 'destructive' });
          }
        } else {
          toast({ title: 'Welcome to CraftedUganda!', description: `Your ${role} account has been created.` });
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
        <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex">
      <div className="flex-1 flex flex-col justify-center px-8 py-12 lg:px-16 bg-background">
        <div className="w-full max-w-md mx-auto">
          <Button variant="ghost" onClick={() => navigate('/')} className="mb-8 -ml-4 text-muted-foreground hover:text-foreground font-display text-xs tracking-widest">
            <ArrowLeft className="w-4 h-4 mr-2" />
            BACK TO HOME
          </Button>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight mb-2">
              {mode === 'login' ? 'WELCOME BACK' : mode === 'artisan-register' ? 'JOIN AS ARTISAN' : 'CREATE ACCOUNT'}
            </h1>
            <p className="text-muted-foreground mb-8 font-body">
              {mode === 'login' ? 'Sign in to access your account' : mode === 'artisan-register' ? 'Share your craft with the world' : 'Start your journey with CraftedUganda'}
            </p>

            {/* Google Login Buttons */}
            <div className="space-y-3 mb-6">
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-2 border-foreground font-display text-xs tracking-widest gap-3"
                onClick={() => handleGoogleLogin('buyer')}
                disabled={googleLoading !== null}
              >
                {googleLoading === 'buyer' ? (
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                )}
                CONTINUE AS BUYER WITH GOOGLE
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full h-12 border-2 border-secondary bg-secondary/10 text-foreground font-display text-xs tracking-widest gap-3"
                onClick={() => handleGoogleLogin('artisan')}
                disabled={googleLoading !== null}
              >
                {googleLoading === 'artisan' ? (
                  <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                ) : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    <Palette className="w-4 h-4" />
                  </>
                )}
                CONTINUE AS ARTISAN WITH GOOGLE
              </Button>
            </div>

            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center"><span className="w-full border-t-2 border-foreground/20" /></div>
              <div className="relative flex justify-center"><span className="bg-background px-4 text-xs font-display tracking-widest text-muted-foreground">OR USE EMAIL</span></div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <AnimatePresence mode="wait">
                {mode !== 'login' && (
                  <motion.div key="name" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                    <Label htmlFor="fullName" className="font-display text-xs tracking-widest">FULL NAME</Label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input id="fullName" type="text" placeholder="Enter your full name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-12 h-12 border-2 border-foreground font-body" />
                    </div>
                    {errors.fullName && <p className="text-sm text-destructive font-body">{errors.fullName}</p>}
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-2">
                <Label htmlFor="email" className="font-display text-xs tracking-widest">EMAIL</Label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-12 h-12 border-2 border-foreground font-body" />
                </div>
                {errors.email && <p className="text-sm text-destructive font-body">{errors.email}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="font-display text-xs tracking-widest">PASSWORD</Label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Enter your password" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-12 pr-12 h-12 border-2 border-foreground font-body" />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-sm text-destructive font-body">{errors.password}</p>}
              </div>

              <AnimatePresence mode="wait">
                {mode === 'artisan-register' && (
                  <>
                    <motion.div key="location" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                      <Label htmlFor="location" className="font-display text-xs tracking-widest">LOCATION (OPTIONAL)</Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input id="location" type="text" placeholder="e.g., Kampala, Uganda" value={location} onChange={(e) => setLocation(e.target.value)} className="pl-12 h-12 border-2 border-foreground font-body" />
                      </div>
                    </motion.div>
                    <motion.div key="craft" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="space-y-2">
                      <Label htmlFor="craft" className="font-display text-xs tracking-widest">CRAFT SPECIALTY (OPTIONAL)</Label>
                      <div className="relative">
                        <Palette className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input id="craft" type="text" placeholder="e.g., Bark Cloth, Basket Weaving" value={craftSpecialty} onChange={(e) => setCraftSpecialty(e.target.value)} className="pl-12 h-12 border-2 border-foreground font-body" />
                      </div>
                    </motion.div>
                  </>
                )}
              </AnimatePresence>

              <Button type="submit" className="w-full h-12 font-display text-sm tracking-widest border-2 border-foreground" disabled={isSubmitting}>
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="animate-spin h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                    {mode === 'login' ? 'SIGNING IN...' : 'CREATING ACCOUNT...'}
                  </span>
                ) : (mode === 'login' ? 'SIGN IN' : 'CREATE ACCOUNT')}
              </Button>
            </form>

            <div className="mt-6 space-y-3">
              {mode === 'login' ? (
                <p className="text-center text-muted-foreground font-body">
                  Don't have an account?{' '}
                  <button onClick={() => setMode('register')} className="text-primary hover:underline font-medium">Sign up</button>
                  {' · '}
                  <button onClick={() => setMode('artisan-register')} className="text-secondary hover:underline font-medium">Join as Artisan</button>
                </p>
              ) : (
                <>
                  <p className="text-center text-muted-foreground font-body">
                    Already have an account?{' '}<button onClick={() => setMode('login')} className="text-primary hover:underline font-medium">Sign in</button>
                  </p>
                  {mode === 'register' && (
                    <Button variant="outline" className="w-full h-10 border-2 border-foreground font-display text-xs tracking-widest" onClick={() => setMode('artisan-register')}>
                      <Palette className="w-4 h-4 mr-2" />REGISTER AS AN ARTISAN INSTEAD
                    </Button>
                  )}
                  {mode === 'artisan-register' && (
                    <Button variant="outline" className="w-full h-10 border-2 border-foreground font-display text-xs tracking-widest" onClick={() => setMode('register')}>
                      <User className="w-4 h-4 mr-2" />REGISTER AS A BUYER INSTEAD
                    </Button>
                  )}
                </>
              )}
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Side */}
      <div className="hidden lg:flex lg:flex-1 relative overflow-hidden" style={{ backgroundImage: `url(${patternBg})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-primary/90" />
        <div className="absolute inset-0 pattern-grid opacity-10" />
        <div className="relative z-10 flex flex-col justify-center items-center p-12 text-center">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.8, delay: 0.2 }}>
            <div className="mb-8">
              <span className="font-display text-5xl md:text-6xl font-bold tracking-tight text-primary-foreground">CRAFTED<br /><span className="text-secondary">UGANDA</span></span>
            </div>
            <div className="w-24 h-0.5 bg-secondary mx-auto mb-8" />
            <h2 className="font-display text-xl tracking-wider text-primary-foreground mb-4 max-w-md">CONNECTING UGANDAN ARTISANS WITH THE WORLD</h2>
            <p className="text-primary-foreground/70 max-w-sm font-body">Join our community of skilled craftspeople preserving traditional techniques while reaching global markets.</p>
            <div className="mt-16 grid grid-cols-3 gap-8 text-center">
              <div className="border-2 border-primary-foreground/30 p-4">
                <div className="font-display text-3xl font-bold text-primary-foreground">500+</div>
                <div className="text-xs font-display tracking-widest text-primary-foreground/70 mt-1">ARTISANS</div>
              </div>
              <div className="border-2 border-primary-foreground/30 p-4">
                <div className="font-display text-3xl font-bold text-primary-foreground">2,000+</div>
                <div className="text-xs font-display tracking-widest text-primary-foreground/70 mt-1">PRODUCTS</div>
              </div>
              <div className="border-2 border-primary-foreground/30 p-4">
                <div className="font-display text-3xl font-bold text-primary-foreground">50+</div>
                <div className="text-xs font-display tracking-widest text-primary-foreground/70 mt-1">COMMUNITIES</div>
              </div>
            </div>
          </motion.div>
        </div>
        <div className="absolute bottom-0 right-0 w-40 h-40 border-l-4 border-t-4 border-secondary" />
      </div>
    </div>
  );
}

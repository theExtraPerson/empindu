import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { User, Mail, Phone, MapPin, Palette, Clock, Link2, Save, LogOut, Shield, Package } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { Layout } from '@/components/layout/Layout';
import { OrderHistory } from '@/components/orders/OrderHistory';

export default function Profile() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, profile, role, loading, signOut, updateProfile } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [location, setLocation] = useState('');
  const [bio, setBio] = useState('');
  const [craftSpecialty, setCraftSpecialty] = useState('');
  const [yearsExperience, setYearsExperience] = useState('');
  const [portfolioUrl, setPortfolioUrl] = useState('');

  useEffect(() => {
    if (!loading && !user) {
      navigate('/auth');
    }
  }, [user, loading, navigate]);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setPhone(profile.phone || '');
      setLocation(profile.location || '');
      setBio(profile.bio || '');
      setCraftSpecialty(profile.craft_specialty || '');
      setYearsExperience(profile.years_experience?.toString() || '');
      setPortfolioUrl(profile.portfolio_url || '');
    }
  }, [profile]);

  const handleSave = async () => {
    setIsSaving(true);
    
    const { error } = await updateProfile({
      full_name: fullName,
      phone: phone || null,
      location: location || null,
      bio: bio || null,
      craft_specialty: craftSpecialty || null,
      years_experience: yearsExperience ? parseInt(yearsExperience) : null,
      portfolio_url: portfolioUrl || null
    });
    
    if (error) {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive'
      });
    } else {
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been successfully updated.'
      });
      setIsEditing(false);
    }
    
    setIsSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    toast({
      title: 'Signed Out',
      description: 'You have been successfully signed out.'
    });
    navigate('/');
  };

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[60vh] flex items-center justify-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 border-2 border-destructive text-destructive font-display text-xs tracking-widest">
            <Shield className="w-4 h-4" />
            ADMINISTRATOR
          </span>
        );
      case 'artisan':
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 border-2 border-primary text-primary font-display text-xs tracking-widest">
            <Palette className="w-4 h-4" />
            ARTISAN
            {profile?.is_verified && (
              <span className="ml-1 px-2 py-0.5 bg-primary text-primary-foreground text-[10px]">VERIFIED</span>
            )}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-2 px-4 py-2 border-2 border-foreground text-foreground font-display text-xs tracking-widest">
            <User className="w-4 h-4" />
            BUYER
          </span>
        );
    }
  };

  return (
    <Layout>
      <section className="py-24 md:py-32 bg-muted border-b-2 border-foreground">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-10">
              <div>
                <span className="font-display text-xs tracking-widest text-muted-foreground mb-2 block">
                  [ ACCOUNT ]
                </span>
                <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground tracking-tight">
                  MY ACCOUNT
                </h1>
              </div>
              <div className="flex items-center gap-3">
                {getRoleBadge()}
              </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-8">
              <TabsList className="bg-background border-2 border-foreground p-1">
                <TabsTrigger value="profile" className="font-display text-xs tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  PROFILE
                </TabsTrigger>
                <TabsTrigger value="orders" className="font-display text-xs tracking-widest data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                  <Package className="h-4 w-4 mr-2" />
                  MY ORDERS
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders">
                <OrderHistory />
              </TabsContent>

              <TabsContent value="profile">
                <div className="bg-background border-2 border-foreground p-6 md:p-10 shadow-brutal">
                  {/* Avatar & Email */}
                  <div className="flex flex-col sm:flex-row items-start gap-6 mb-10 pb-10 border-b-2 border-foreground">
                    <div className="w-20 h-20 border-2 border-foreground flex items-center justify-center text-foreground text-2xl font-display font-bold bg-primary text-primary-foreground">
                      {fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="flex-1">
                      <h2 className="font-display text-2xl font-bold text-foreground tracking-wider uppercase">
                        {fullName || 'YOUR NAME'}
                      </h2>
                      <div className="flex items-center gap-2 text-muted-foreground mt-2 font-body">
                        <Mail className="w-4 h-4" />
                        {user?.email}
                      </div>
                      <p className="text-sm text-muted-foreground mt-2 font-body">
                        Member since {new Date(user?.created_at || '').toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long'
                        })}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      {!isEditing ? (
                        <Button 
                          onClick={() => setIsEditing(true)}
                          className="border-2 border-foreground font-display text-xs tracking-widest"
                        >
                          EDIT PROFILE
                        </Button>
                      ) : (
                        <>
                          <Button 
                            variant="outline" 
                            onClick={() => setIsEditing(false)}
                            className="border-2 border-foreground font-display text-xs tracking-widest"
                          >
                            CANCEL
                          </Button>
                          <Button 
                            onClick={handleSave} 
                            disabled={isSaving}
                            className="border-2 border-foreground font-display text-xs tracking-widest"
                          >
                            <Save className="w-4 h-4 mr-2" />
                            {isSaving ? 'SAVING...' : 'SAVE'}
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-2">
                        <Label htmlFor="fullName" className="font-display text-xs tracking-widest">FULL NAME</Label>
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="fullName"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            disabled={!isEditing}
                            className="pl-12 h-12 border-2 border-foreground font-body"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="phone" className="font-display text-xs tracking-widest">PHONE NUMBER</Label>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="phone"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value)}
                            disabled={!isEditing}
                            placeholder="+256 xxx xxx xxx"
                            className="pl-12 h-12 border-2 border-foreground font-body"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="location" className="font-display text-xs tracking-widest">LOCATION</Label>
                      <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <Input
                          id="location"
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          disabled={!isEditing}
                          placeholder="City, Region"
                          className="pl-12 h-12 border-2 border-foreground font-body"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="bio" className="font-display text-xs tracking-widest">BIO</Label>
                      <Textarea
                        id="bio"
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        disabled={!isEditing}
                        placeholder="Tell us about yourself..."
                        rows={4}
                        className="border-2 border-foreground font-body resize-none"
                      />
                    </div>

                    {/* Artisan-specific fields */}
                    {role === 'artisan' && (
                      <>
                        <div className="pt-8 border-t-2 border-foreground">
                          <h3 className="font-display text-xl font-bold text-foreground tracking-wider mb-6 flex items-center gap-2">
                            <Palette className="w-5 h-5 text-primary" />
                            ARTISAN DETAILS
                          </h3>
                          
                          <div className="grid md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                              <Label htmlFor="craftSpecialty" className="font-display text-xs tracking-widest">CRAFT SPECIALTY</Label>
                              <Input
                                id="craftSpecialty"
                                value={craftSpecialty}
                                onChange={(e) => setCraftSpecialty(e.target.value)}
                                disabled={!isEditing}
                                placeholder="e.g., Bark Cloth, Basket Weaving"
                                className="h-12 border-2 border-foreground font-body"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label htmlFor="yearsExperience" className="font-display text-xs tracking-widest">YEARS OF EXPERIENCE</Label>
                              <div className="relative">
                                <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                                <Input
                                  id="yearsExperience"
                                  type="number"
                                  value={yearsExperience}
                                  onChange={(e) => setYearsExperience(e.target.value)}
                                  disabled={!isEditing}
                                  placeholder="0"
                                  className="pl-12 h-12 border-2 border-foreground font-body"
                                  min="0"
                                />
                              </div>
                            </div>
                          </div>

                          <div className="mt-6 space-y-2">
                            <Label htmlFor="portfolioUrl" className="font-display text-xs tracking-widest">PORTFOLIO URL</Label>
                            <div className="relative">
                              <Link2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                              <Input
                                id="portfolioUrl"
                                type="url"
                                value={portfolioUrl}
                                onChange={(e) => setPortfolioUrl(e.target.value)}
                                disabled={!isEditing}
                                placeholder="https://..."
                                className="pl-12 h-12 border-2 border-foreground font-body"
                              />
                            </div>
                          </div>
                        </div>
                      </>
                    )}
                  </div>

                  {/* Sign Out */}
                  <div className="mt-10 pt-8 border-t-2 border-foreground">
                    <Button 
                      variant="outline" 
                      onClick={handleSignOut} 
                      className="border-2 border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground font-display text-xs tracking-widest"
                    >
                      <LogOut className="w-4 h-4 mr-2" />
                      SIGN OUT
                    </Button>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}

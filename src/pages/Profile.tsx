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
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
        </div>
      </Layout>
    );
  }

  const getRoleBadge = () => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
            <Shield className="w-4 h-4" />
            Administrator
          </span>
        );
      case 'artisan':
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Palette className="w-4 h-4" />
            Artisan
            {profile?.is_verified && (
              <span className="ml-1 text-xs bg-accent text-accent-foreground px-1.5 py-0.5 rounded">Verified</span>
            )}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-muted text-muted-foreground text-sm font-medium">
            <User className="w-4 h-4" />
            Buyer
          </span>
        );
    }
  };

  return (
    <Layout>
      <section className="py-16 md:py-24 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-4xl mx-auto"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <h1 className="text-3xl md:text-4xl font-display font-bold text-foreground">
                  My Account
                </h1>
                <p className="text-muted-foreground mt-1">
                  Manage your profile and view orders
                </p>
              </div>
              <div className="flex items-center gap-3">
                {getRoleBadge()}
              </div>
            </div>

            <Tabs defaultValue="profile" className="space-y-6">
              <TabsList>
                <TabsTrigger value="profile">Profile</TabsTrigger>
                <TabsTrigger value="orders">
                  <Package className="h-4 w-4 mr-2" />
                  My Orders
                </TabsTrigger>
              </TabsList>

              <TabsContent value="orders">
                <OrderHistory />
              </TabsContent>

              <TabsContent value="profile">
              <div className="bg-card rounded-2xl border shadow-sm p-6 md:p-8">
              {/* Avatar & Email */}
              <div className="flex flex-col sm:flex-row items-start gap-6 mb-8 pb-8 border-b">
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                  {fullName?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-semibold text-foreground">
                    {fullName || 'Your Name'}
                  </h2>
                  <div className="flex items-center gap-2 text-muted-foreground mt-1">
                    <Mail className="w-4 h-4" />
                    {user?.email}
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">
                    Member since {new Date(user?.created_at || '').toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long'
                    })}
                  </p>
                </div>
                <div className="flex gap-2">
                  {!isEditing ? (
                    <Button onClick={() => setIsEditing(true)}>
                      Edit Profile
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={() => setIsEditing(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleSave} disabled={isSaving}>
                        <Save className="w-4 h-4 mr-2" />
                        {isSaving ? 'Saving...' : 'Save'}
                      </Button>
                    </>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <Label htmlFor="fullName">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        disabled={!isEditing}
                        className="pl-11"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                      <Input
                        id="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        disabled={!isEditing}
                        placeholder="+256 xxx xxx xxx"
                        className="pl-11"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="location"
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      disabled={!isEditing}
                      placeholder="City, Region"
                      className="pl-11"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <Textarea
                    id="bio"
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={!isEditing}
                    placeholder="Tell us about yourself..."
                    rows={4}
                  />
                </div>

                {/* Artisan-specific fields */}
                {role === 'artisan' && (
                  <>
                    <div className="pt-6 border-t">
                      <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                        <Palette className="w-5 h-5 text-primary" />
                        Artisan Details
                      </h3>
                      
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="craftSpecialty">Craft Specialty</Label>
                          <Input
                            id="craftSpecialty"
                            value={craftSpecialty}
                            onChange={(e) => setCraftSpecialty(e.target.value)}
                            disabled={!isEditing}
                            placeholder="e.g., Bark Cloth, Basket Weaving"
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="yearsExperience">Years of Experience</Label>
                          <div className="relative">
                            <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                            <Input
                              id="yearsExperience"
                              type="number"
                              value={yearsExperience}
                              onChange={(e) => setYearsExperience(e.target.value)}
                              disabled={!isEditing}
                              placeholder="0"
                              className="pl-11"
                              min="0"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 space-y-2">
                        <Label htmlFor="portfolioUrl">Portfolio URL</Label>
                        <div className="relative">
                          <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                          <Input
                            id="portfolioUrl"
                            type="url"
                            value={portfolioUrl}
                            onChange={(e) => setPortfolioUrl(e.target.value)}
                            disabled={!isEditing}
                            placeholder="https://..."
                            className="pl-11"
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Sign Out */}
              <div className="mt-8 pt-6 border-t">
                <Button variant="outline" onClick={handleSignOut} className="text-destructive hover:text-destructive">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sign Out
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

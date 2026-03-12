import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Building2, CheckCircle, Clock, AlertCircle, Save } from 'lucide-react';

interface BusinessProfile {
  id: string;
  business_name: string;
  business_type: string;
  tax_id: string | null;
  registration_number: string | null;
  registration_status: string;
  business_email: string | null;
  business_phone: string | null;
  business_address: string | null;
  business_city: string | null;
  business_country: string;
  description: string | null;
  is_verified: boolean;
}

export function BusinessRegistration() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [form, setForm] = useState({
    business_name: '',
    business_type: 'sole_proprietor',
    tax_id: '',
    registration_number: '',
    registration_status: 'unregistered',
    business_email: '',
    business_phone: '',
    business_address: '',
    business_city: '',
    business_country: 'Uganda',
    description: '',
  });

  useEffect(() => {
    if (user) fetchProfile();
  }, [user]);

  const fetchProfile = async () => {
    const { data } = await supabase.from('business_profiles').select('*').eq('user_id', user!.id).maybeSingle();
    if (data) {
      setProfile(data as BusinessProfile);
      setForm({
        business_name: data.business_name || '',
        business_type: data.business_type || 'sole_proprietor',
        tax_id: data.tax_id || '',
        registration_number: data.registration_number || '',
        registration_status: data.registration_status || 'unregistered',
        business_email: data.business_email || '',
        business_phone: data.business_phone || '',
        business_address: data.business_address || '',
        business_city: data.business_city || '',
        business_country: data.business_country || 'Uganda',
        description: data.description || '',
      });
    }
    setLoading(false);
  };

  const handleSave = async () => {
    if (!form.business_name.trim()) {
      toast({ title: 'Business name is required', variant: 'destructive' });
      return;
    }
    setSaving(true);
    const payload = {
      ...form,
      tax_id: form.tax_id || null,
      registration_number: form.registration_number || null,
      business_email: form.business_email || null,
      business_phone: form.business_phone || null,
      business_address: form.business_address || null,
      business_city: form.business_city || null,
      description: form.description || null,
      user_id: user!.id,
    };

    let error;
    if (profile) {
      ({ error } = await supabase.from('business_profiles').update(payload).eq('user_id', user!.id));
    } else {
      ({ error } = await supabase.from('business_profiles').insert(payload));
    }

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: profile ? 'Business profile updated!' : 'Business registered successfully!' });
      fetchProfile();
    }
    setSaving(false);
  };

  const statusIcon = {
    unregistered: <AlertCircle className="h-4 w-4" />,
    pending: <Clock className="h-4 w-4" />,
    registered: <CheckCircle className="h-4 w-4" />,
  };

  const statusColor = {
    unregistered: 'bg-destructive/10 text-destructive border-destructive/30',
    pending: 'bg-secondary/20 text-secondary-foreground border-secondary/30',
    registered: 'bg-accent/10 text-accent-foreground border-accent/30',
  };

  if (loading) return <div className="flex justify-center py-12"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" /></div>;

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Building2 className="h-6 w-6 text-secondary" />
          <h2 className="font-display text-2xl font-bold text-foreground">{profile ? 'BUSINESS PROFILE' : 'REGISTER YOUR BUSINESS'}</h2>
        </div>
        {profile && (
          <Badge className={`font-display text-xs tracking-wider gap-1 ${statusColor[form.registration_status as keyof typeof statusColor] || statusColor.unregistered}`}>
            {statusIcon[form.registration_status as keyof typeof statusIcon] || statusIcon.unregistered}
            {form.registration_status.toUpperCase()}
          </Badge>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <Label className="font-display text-xs tracking-widest">BUSINESS NAME *</Label>
          <Input value={form.business_name} onChange={e => setForm({ ...form, business_name: e.target.value })} className="border-2 border-foreground font-body" placeholder="Your business name" />
        </div>
        <div className="space-y-2">
          <Label className="font-display text-xs tracking-widest">BUSINESS TYPE</Label>
          <Select value={form.business_type} onValueChange={v => setForm({ ...form, business_type: v })}>
            <SelectTrigger className="border-2 border-foreground font-body"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="sole_proprietor">Sole Proprietor</SelectItem>
              <SelectItem value="partnership">Partnership</SelectItem>
              <SelectItem value="cooperative">Cooperative</SelectItem>
              <SelectItem value="limited_company">Limited Company</SelectItem>
              <SelectItem value="ngo">NGO / Non-Profit</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="font-display text-xs tracking-widest">TAX ID (TIN)</Label>
          <Input value={form.tax_id} onChange={e => setForm({ ...form, tax_id: e.target.value })} className="border-2 border-foreground font-body" placeholder="e.g., 1000123456" />
        </div>
        <div className="space-y-2">
          <Label className="font-display text-xs tracking-widest">REGISTRATION NUMBER</Label>
          <Input value={form.registration_number} onChange={e => setForm({ ...form, registration_number: e.target.value })} className="border-2 border-foreground font-body" placeholder="Business registration number" />
        </div>
        <div className="space-y-2">
          <Label className="font-display text-xs tracking-widest">REGISTRATION STATUS</Label>
          <Select value={form.registration_status} onValueChange={v => setForm({ ...form, registration_status: v })}>
            <SelectTrigger className="border-2 border-foreground font-body"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="unregistered">Unregistered</SelectItem>
              <SelectItem value="pending">Pending Registration</SelectItem>
              <SelectItem value="registered">Registered</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="font-display text-xs tracking-widest">BUSINESS EMAIL</Label>
          <Input value={form.business_email} onChange={e => setForm({ ...form, business_email: e.target.value })} className="border-2 border-foreground font-body" placeholder="business@example.com" />
        </div>
        <div className="space-y-2">
          <Label className="font-display text-xs tracking-widest">BUSINESS PHONE</Label>
          <Input value={form.business_phone} onChange={e => setForm({ ...form, business_phone: e.target.value })} className="border-2 border-foreground font-body" placeholder="+256 700 000000" />
        </div>
        <div className="space-y-2">
          <Label className="font-display text-xs tracking-widest">CITY</Label>
          <Input value={form.business_city} onChange={e => setForm({ ...form, business_city: e.target.value })} className="border-2 border-foreground font-body" placeholder="e.g., Kampala" />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label className="font-display text-xs tracking-widest">BUSINESS ADDRESS</Label>
          <Input value={form.business_address} onChange={e => setForm({ ...form, business_address: e.target.value })} className="border-2 border-foreground font-body" placeholder="Full business address" />
        </div>
        <div className="md:col-span-2 space-y-2">
          <Label className="font-display text-xs tracking-widest">BUSINESS DESCRIPTION</Label>
          <Textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="border-2 border-foreground font-body min-h-[100px]" placeholder="Describe your business, products, and story..." />
        </div>
      </div>

      <Button onClick={handleSave} disabled={saving} className="font-display text-xs tracking-widest gap-2">
        <Save className="h-4 w-4" />
        {saving ? 'SAVING...' : profile ? 'UPDATE BUSINESS PROFILE' : 'REGISTER BUSINESS'}
      </Button>
    </motion.div>
  );
}

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';

export interface PickupLocation {
  id: string;
  name: string;
  address: string;
  city: string;
  region: string | null;
  phone: string | null;
  operating_hours: string | null;
  is_active: boolean;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
  updated_at: string;
}

export const usePickupLocations = () => {
  const [locations, setLocations] = useState<PickupLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchLocations = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('pickup_locations')
        .select('*')
        .eq('is_active', true)
        .order('city', { ascending: true });

      if (error) throw error;

      setLocations(data || []);
    } catch (error: any) {
      console.error('Error fetching pickup locations:', error);
      toast({
        title: "Error",
        description: "Failed to load pickup locations",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, []);

  return {
    locations,
    loading,
    refetch: fetchLocations
  };
};

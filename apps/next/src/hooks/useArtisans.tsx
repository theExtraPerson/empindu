'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

import type { Artisan, ArtisanSummary, CraftTradition } from '@/lib/api';
import { getArtisan, getArtisans, getCraftTraditions } from '@/lib/api';
import { useToast } from './use-toast';

export const useArtisans = () => {
  const [artisans, setArtisans] = useState<ArtisanSummary[]>([]);
  const [craftTraditions, setCraftTraditions] = useState<CraftTradition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const { toast } = useToast();

  const { data: session } = useSession();
  const fetchArtisans = async (filters?: {
    craft_type?: string;
    region?: string;
    certified?: boolean;
  }) => {
    try {
      setLoading(true);
      const data = await getArtisans(filters, session?.accessToken);
      setArtisans(data);
    } catch (error: unknown) {
      console.error('Error fetching artisans', error);
      toast({
        title: 'Error',
        description: 'Failed to load artisans',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCraftTraditions = async () => {
    try {
      const data = await getCraftTraditions(session?.accessToken);
      setCraftTraditions(data);
    } catch (error: unknown) {
      console.error('Error fetching craft traditions', error);
    }
  };

  const fetchArtisanBySlug = async (slug: string): Promise<Artisan | null> => {
    try {
      return await getArtisan(slug, session?.accessToken);
    } catch (error: unknown) {
      console.error('Error fetching artisan', error);
      toast({
        title: 'Error',
        description: 'Unable to load artisan profile',
        variant: 'destructive',
      });
      return null;
    }
  };

  useEffect(() => {
    fetchArtisans();
    fetchCraftTraditions();
  }, []);

  return {
    artisans,
    craftTraditions,
    loading,
    fetchArtisans,
    fetchCraftTraditions,
    fetchArtisanBySlug,
  };
};

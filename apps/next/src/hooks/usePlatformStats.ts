'use client';

import { useAdminData } from '@/hooks/useAdminData';

export function usePlatformStats() {
  const { stats, loading } = useAdminData();

  return {
    stats,
    loading,
  };
}

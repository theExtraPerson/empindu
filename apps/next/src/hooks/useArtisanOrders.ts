/**
 * Hook for artisans to view their orders with RLS support
 * Only returns orders for the authenticated artisan
 */
'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getOrders, getOrder, updateOrderStatus, type Order } from '@/lib/api';
import { useAuth } from './useAuth';

export function useArtisanOrders() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch artisan's orders (RLS enforced on backend)
  const {
    data: orders = [],
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ['artisan-orders', user?.id],
    queryFn: () => getOrders(),
    enabled: !!user?.id, // Only fetch if user is authenticated
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  const updateOrderStatusMutation = async (orderId: number, status: string) => {
    try {
      const updatedOrder = await updateOrderStatus(orderId, status);
      // Update the cache
      queryClient.setQueryData(['artisan-orders', user?.id], (old: Order[] | undefined) => {
        if (!old) return [updatedOrder];
        return old.map((o) => (o.id === orderId ? updatedOrder : o));
      });
      return updatedOrder;
    } catch (error) {
      throw new Error(`Failed to update order status: ${error}`);
    }
  };

  const getOrderDetail = async (orderId: number) => {
    try {
      const order = await getOrder(orderId);
      return order;
    } catch (error) {
      throw new Error(`Failed to fetch order details: ${error}`);
    }
  };

  return {
    orders,
    isLoading,
    isError,
    error,
    refetch,
    updateOrderStatus: updateOrderStatusMutation,
    getOrderDetail,
  };
}

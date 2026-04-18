'use client';

import { useEffect, useState } from 'react';

import type { Product as ApiProduct, ProductList as ApiProductList } from '@/lib/api';
import { getProduct, getProducts } from '@/lib/api';
import { useToast } from './use-toast';

export type ProductImage = {
  image_url: string;
  is_primary: boolean;
  display_order: number;
};

export type Product = ApiProduct & {
  price: number;
  stock_quantity: number;
  is_available: boolean;
  description: string;
  category: string;
  hero_image_url: string | null;
  images: ProductImage[];
  is_returnable?: boolean;
  is_personalizable?: boolean;
  use_case?: string;
  materials?: string;
  size_category?: string;
  size_dimensions?: string;
  other_skills?: string;
};

export type ProductList = ApiProductList & {
  price: number;
  stock_quantity: number;
  is_available: boolean;
  description: string;
  category: string;
  hero_image_url: string | null;
  story_excerpt: string;
  images: ProductImage[];
};

export type CreateProductData = {
  name: string;
  description: string;
  price: number;
  category: string;
  stock_quantity: number;
  is_available: boolean;
  materials?: string;
  use_case?: string;
  is_personalizable?: boolean;
  other_skills?: string;
  size_category?: 'small' | 'medium' | 'large';
  size_dimensions?: string;
  is_returnable?: boolean;
};

export const PRODUCT_CATEGORIES = [
  'Baskets',
  'Textiles',
  'Pottery',
  'Beadwork',
  'Woodwork',
  'Jewelry',
  'Home Decor',
  'Accessories',
  'Art',
  'Other',
] as const;

export const SIZE_CATEGORIES = [
  { value: 'small', label: 'Small', description: 'Easy to carry or place in compact spaces' },
  { value: 'medium', label: 'Medium', description: 'Balanced size for everyday gifting or decor' },
  { value: 'large', label: 'Large', description: 'Statement pieces or bulkier handcrafted items' },
] as const;

const normalizeListProduct = (p: ApiProductList): ProductList => ({
  ...p,
  price: p.price_ugx,
  stock_quantity: p.stock,
  is_available: p.stock > 0,
  description: p.story,
  category: p.artisan.craft_tradition,
  hero_image_url: p.hero_photo_url,
  story_excerpt: p.story ? `${p.story.slice(0, 150)}${p.story.length > 150 ? '...' : ''}` : '',
  images: p.hero_photo_url
    ? [{ image_url: p.hero_photo_url, is_primary: true, display_order: 0 }]
    : [],
});

const normalizeProduct = (p: ApiProduct): Product => ({
  ...p,
  price: p.price_ugx,
  stock_quantity: p.stock,
  is_available: p.stock > 0,
  description: p.story,
  category: p.provenance?.craft_tradition || p.artisan.craft_tradition || 'Heritage Craft',
  hero_image_url: p.photos.find((photo) => photo.is_hero)?.url || p.photos[0]?.url || null,
  images: p.photos.map((photo, index) => ({
    image_url: photo.url,
    is_primary: photo.is_hero || index === 0,
    display_order: index,
  })),
});

export const useProducts = () => {
  const [products, setProducts] = useState<ProductList[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchProducts = async (filters?: {
    craft_type?: string;
    region?: string;
    min_usd?: number;
    max_usd?: number;
    occasion?: string;
    artisan_slug?: string;
    page?: number;
    page_size?: number;
  }): Promise<ProductList[]> => {
    try {
      setLoading(true);
      const data = await getProducts(filters);
      const normalized = data.map(normalizeListProduct);
      setProducts(normalized);
      return normalized;
    } catch (error: unknown) {
      console.error('Error fetching products:', error);
      toast({
        title: 'Error',
        description: 'Failed to load products',
        variant: 'destructive',
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const fetchProductBySlug = async (slug: string): Promise<Product | null> => {
    try {
      const product = await getProduct(slug);
      return normalizeProduct(product);
    } catch (error: unknown) {
      console.error('Error fetching product:', error);
      toast({
        title: 'Error',
        description: 'Unable to load product',
        variant: 'destructive',
      });
      return null;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const createProduct = async (data: CreateProductData): Promise<Product | null> => {
    toast({
      title: 'Product creation unavailable',
      description: 'Product write operations are not connected to the current API yet.',
      variant: 'destructive',
    });
    return null;
  };

  const updateProduct = async (productId: number, data: CreateProductData): Promise<boolean> => {
    toast({
      title: 'Product update unavailable',
      description: 'Product write operations are not connected to the current API yet.',
      variant: 'destructive',
    });
    return false;
  };

  const uploadProductImage = async (productId: number, file: File, isPrimary = false): Promise<boolean> => {
    toast({
      title: 'Image upload unavailable',
      description: 'Image uploads are not connected to the current API yet.',
      variant: 'destructive',
    });
    return false;
  };

  return {
    products,
    loading,
    fetchProducts,
    fetchProductBySlug,
    createProduct,
    updateProduct,
    uploadProductImage,
  };
};

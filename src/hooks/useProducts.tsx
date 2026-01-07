import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from './useAuth';
import { useToast } from './use-toast';

export interface Product {
  id: string;
  artisan_id: string;
  name: string;
  description: string | null;
  price: number;
  category: string;
  stock_quantity: number;
  is_available: boolean;
  materials: string | null;
  use_case: string | null;
  is_personalizable: boolean;
  other_skills: string | null;
  size_category: string | null;
  size_dimensions: string | null;
  is_returnable: boolean;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
  artisan?: {
    full_name: string | null;
    location: string | null;
    craft_specialty: string | null;
  };
}

export interface ProductImage {
  id: string;
  product_id: string;
  image_url: string;
  is_primary: boolean;
  display_order: number;
}

export interface CreateProductData {
  name: string;
  description?: string;
  price: number;
  category: string;
  stock_quantity: number;
  is_available?: boolean;
  materials?: string;
  use_case?: string;
  is_personalizable?: boolean;
  other_skills?: string;
  size_category?: string;
  size_dimensions?: string;
  is_returnable?: boolean;
}

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const { toast } = useToast();

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch artisan profiles separately
      const artisanIds = [...new Set(data?.map(p => p.artisan_id) || [])];
      const { data: profiles } = await supabase
        .from('profiles')
        .select('user_id, full_name, location, craft_specialty')
        .in('user_id', artisanIds);

      const profileMap = new Map(profiles?.map(p => [p.user_id, p]) || []);

      const formattedProducts = data?.map((product: any) => ({
        ...product,
        images: product.product_images,
        artisan: profileMap.get(product.artisan_id) || null
      })) || [];

      setProducts(formattedProducts);
    } catch (error: any) {
      console.error('Error fetching products:', error);
      toast({
        title: "Error",
        description: "Failed to load products",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchProductById = async (productId: string): Promise<Product | null> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (*)
        `)
        .eq('id', productId)
        .single();

      if (error) throw error;

      // Fetch artisan profile separately
      const { data: profile } = await supabase
        .from('profiles')
        .select('user_id, full_name, location, craft_specialty')
        .eq('user_id', data.artisan_id)
        .single();

      return {
        ...data,
        images: data.product_images,
        artisan: profile || null
      } as Product;
    } catch (error: any) {
      console.error('Error fetching product:', error);
      return null;
    }
  };

  const fetchArtisanProducts = async () => {
    if (!user) return [];
    
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('products')
        .select(`
          *,
          product_images (*)
        `)
        .eq('artisan_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedProducts = data?.map((product: any) => ({
        ...product,
        images: product.product_images
      })) || [];

      setProducts(formattedProducts);
      return formattedProducts;
    } catch (error: any) {
      console.error('Error fetching artisan products:', error);
      toast({
        title: "Error",
        description: "Failed to load your products",
        variant: "destructive"
      });
      return [];
    } finally {
      setLoading(false);
    }
  };

  const createProduct = async (productData: CreateProductData): Promise<Product | null> => {
    if (!user) {
      toast({
        title: "Error",
        description: "You must be logged in to create products",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          ...productData,
          artisan_id: user.id
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product created successfully"
      });

      await fetchArtisanProducts();
      return data;
    } catch (error: any) {
      console.error('Error creating product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to create product",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateProduct = async (productId: string, updates: Partial<CreateProductData>): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('products')
        .update(updates)
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product updated successfully"
      });

      await fetchArtisanProducts();
      return true;
    } catch (error: any) {
      console.error('Error updating product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to update product",
        variant: "destructive"
      });
      return false;
    }
  };

  const deleteProduct = async (productId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('products')
        .delete()
        .eq('id', productId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Product deleted successfully"
      });

      await fetchArtisanProducts();
      return true;
    } catch (error: any) {
      console.error('Error deleting product:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to delete product",
        variant: "destructive"
      });
      return false;
    }
  };

  const uploadProductImage = async (productId: string, file: File, isPrimary: boolean = false): Promise<string | null> => {
    if (!user) return null;

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}/${productId}/${Date.now()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from('product-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from('product-images')
        .getPublicUrl(fileName);

      // If this is the primary image, update existing primary to false
      if (isPrimary) {
        await supabase
          .from('product_images')
          .update({ is_primary: false })
          .eq('product_id', productId);
      }

      // Insert image record
      const { error: insertError } = await supabase
        .from('product_images')
        .insert({
          product_id: productId,
          image_url: publicUrl,
          is_primary: isPrimary
        });

      if (insertError) throw insertError;

      return publicUrl;
    } catch (error: any) {
      console.error('Error uploading image:', error);
      toast({
        title: "Error",
        description: error.message || "Failed to upload image",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteProductImage = async (imageId: string): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('product_images')
        .delete()
        .eq('id', imageId);

      if (error) throw error;

      return true;
    } catch (error: any) {
      console.error('Error deleting image:', error);
      toast({
        title: "Error",
        description: "Failed to delete image",
        variant: "destructive"
      });
      return false;
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  return {
    products,
    loading,
    fetchProducts,
    fetchProductById,
    fetchArtisanProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    uploadProductImage,
    deleteProductImage
  };
};

export const PRODUCT_CATEGORIES = [
  'Basketry',
  'Woodcarving',
  'Pottery',
  'Jewelry',
  'Textiles',
  'Barkcloth',
  'Leather',
  'Beadwork',
  'Sculptures',
  'Home Decor'
];

export const SIZE_CATEGORIES = [
  { value: 'small', label: 'Small', description: 'Handheld items, jewelry, small accessories' },
  { value: 'medium', label: 'Medium', description: 'Bags, baskets, medium decorations' },
  { value: 'large', label: 'Large', description: 'Furniture, large art pieces, rugs' }
] as const;

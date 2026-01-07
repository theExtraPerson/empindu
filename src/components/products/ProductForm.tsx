import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, X, Loader2 } from 'lucide-react';
import { Product, CreateProductData, PRODUCT_CATEGORIES, SIZE_CATEGORIES, useProducts } from '@/hooks/useProducts';

interface ProductFormProps {
  product?: Product;
  onSuccess: () => void;
  onCancel: () => void;
}

export const ProductForm = ({ product, onSuccess, onCancel }: ProductFormProps) => {
  const { createProduct, updateProduct, uploadProductImage } = useProducts();
  const [loading, setLoading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<CreateProductData>({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    category: product?.category || '',
    stock_quantity: product?.stock_quantity || 0,
    is_available: product?.is_available ?? true,
    materials: product?.materials || '',
    use_case: product?.use_case || '',
    is_personalizable: product?.is_personalizable ?? false,
    other_skills: product?.other_skills || '',
    size_category: product?.size_category || undefined,
    size_dimensions: product?.size_dimensions || '',
    is_returnable: product?.is_returnable ?? true
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length + selectedImages.length > 5) {
      alert('Maximum 5 images allowed');
      return;
    }

    setSelectedImages(prev => [...prev, ...files]);
    
    // Create preview URLs
    files.forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrls(prev => [...prev, reader.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      let productId = product?.id;

      if (product) {
        // Update existing product
        const success = await updateProduct(product.id, formData);
        if (!success) throw new Error('Failed to update product');
      } else {
        // Create new product
        const newProduct = await createProduct(formData);
        if (!newProduct) throw new Error('Failed to create product');
        productId = newProduct.id;
      }

      // Upload images for new products
      if (selectedImages.length > 0 && productId) {
        setUploadingImages(true);
        for (let i = 0; i < selectedImages.length; i++) {
          await uploadProductImage(productId, selectedImages[i], i === 0);
        }
      }

      onSuccess();
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setLoading(false);
      setUploadingImages(false);
    }
  };

  return (
    <motion.form
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6 max-h-[70vh] overflow-y-auto pr-2"
      onSubmit={handleSubmit}
    >
      {/* Basic Information */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Basic Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="name">Product Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Handwoven Basket"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category">Category *</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a category" />
              </SelectTrigger>
              <SelectContent>
                {PRODUCT_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="price">Price (UGX) *</Label>
            <Input
              id="price"
              type="number"
              min="0"
              step="1000"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
              placeholder="85000"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="stock">Stock Quantity *</Label>
            <Input
              id="stock"
              type="number"
              min="0"
              value={formData.stock_quantity}
              onChange={(e) => setFormData(prev => ({ ...prev, stock_quantity: parseInt(e.target.value) || 0 }))}
              placeholder="10"
              required
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            value={formData.description || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            placeholder="Describe your product, its story, and crafting techniques..."
            rows={3}
          />
        </div>
      </div>

      {/* Product Details */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Product Details</h3>
        
        <div className="space-y-2">
          <Label htmlFor="materials">Materials Used</Label>
          <Input
            id="materials"
            value={formData.materials || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, materials: e.target.value }))}
            placeholder="e.g., Banana fiber, natural dyes, sisal"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="use_case">Use Case / Purpose</Label>
          <Textarea
            id="use_case"
            value={formData.use_case || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, use_case: e.target.value }))}
            placeholder="What can this product be used for? e.g., Storage, decoration, gift..."
            rows={2}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="size_category">Size Category</Label>
            <Select
              value={formData.size_category || ''}
              onValueChange={(value) => setFormData(prev => ({ 
                ...prev, 
                size_category: value as 'small' | 'medium' | 'large' 
              }))}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select size" />
              </SelectTrigger>
              <SelectContent>
                {SIZE_CATEGORIES.map((size) => (
                  <SelectItem key={size.value} value={size.value}>
                    <div>
                      <span className="font-medium">{size.label}</span>
                      <span className="text-muted-foreground text-xs ml-2">
                        ({size.description})
                      </span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="size_dimensions">Dimensions</Label>
            <Input
              id="size_dimensions"
              value={formData.size_dimensions || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, size_dimensions: e.target.value }))}
              placeholder="e.g., 30cm x 25cm x 15cm"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="other_skills">Other Skills / Products</Label>
          <Textarea
            id="other_skills"
            value={formData.other_skills || ''}
            onChange={(e) => setFormData(prev => ({ ...prev, other_skills: e.target.value }))}
            placeholder="What other crafts do you make? e.g., Also available: mats, bags, wall hangings..."
            rows={2}
          />
        </div>
      </div>

      {/* Options */}
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Options</h3>
        
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <Label htmlFor="is_personalizable" className="cursor-pointer">Can be Personalised</Label>
            <p className="text-sm text-muted-foreground">
              Allow buyers to request custom modifications
            </p>
          </div>
          <Switch
            id="is_personalizable"
            checked={formData.is_personalizable}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_personalizable: checked }))}
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <Label htmlFor="is_returnable" className="cursor-pointer">Returnable</Label>
            <p className="text-sm text-muted-foreground">
              Can this product be returned after purchase?
            </p>
          </div>
          <Switch
            id="is_returnable"
            checked={formData.is_returnable}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_returnable: checked }))}
          />
        </div>

        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div>
            <Label htmlFor="is_available" className="cursor-pointer">Available for Sale</Label>
            <p className="text-sm text-muted-foreground">
              Show this product in the marketplace
            </p>
          </div>
          <Switch
            id="is_available"
            checked={formData.is_available}
            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, is_available: checked }))}
          />
        </div>
      </div>

      {/* Images */}
      {!product && (
        <div className="space-y-4">
          <h3 className="font-semibold text-lg border-b pb-2">Product Images</h3>
          <div className="border-2 border-dashed border-border rounded-lg p-6 text-center">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handleImageSelect}
              className="hidden"
              id="image-upload"
            />
            <label htmlFor="image-upload" className="cursor-pointer">
              <Upload className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
              <p className="text-sm text-muted-foreground">
                Click to upload images (max 5)
              </p>
            </label>
          </div>

          {previewUrls.length > 0 && (
            <div className="flex gap-2 flex-wrap mt-4">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="h-4 w-4" />
                  </button>
                  {index === 0 && (
                    <span className="absolute bottom-0 left-0 right-0 bg-primary/90 text-primary-foreground text-xs py-0.5 text-center rounded-b-lg">
                      Primary
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex gap-3 pt-4 sticky bottom-0 bg-background pb-2">
        <Button
          type="submit"
          disabled={loading || uploadingImages}
          className="flex-1"
        >
          {loading || uploadingImages ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              {uploadingImages ? 'Uploading images...' : 'Saving...'}
            </>
          ) : (
            product ? 'Update Product' : 'Create Product'
          )}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
      </div>
    </motion.form>
  );
};

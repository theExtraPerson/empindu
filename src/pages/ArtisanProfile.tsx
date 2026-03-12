import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import artisanPortrait from '@/assets/artisan-portrait.jpg';
import {
  MapPin, CheckCircle, Heart, Star, ExternalLink, MessageSquare,
  Package, Calendar, Award, Loader2, ShoppingBag, ArrowLeft
} from 'lucide-react';

interface ArtisanData {
  user_id: string;
  full_name: string | null;
  avatar_url: string | null;
  location: string | null;
  craft_specialty: string | null;
  bio: string | null;
  is_verified: boolean | null;
  years_experience: number | null;
  portfolio_url: string | null;
  created_at: string | null;
}

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  description: string | null;
  is_available: boolean;
  images: { image_url: string; is_primary: boolean }[];
}

interface Review {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  created_at: string;
  reviewer_name: string | null;
}

export default function ArtisanProfile() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { toast } = useToast();

  const [artisan, setArtisan] = useState<ArtisanData | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [likesCount, setLikesCount] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [loading, setLoading] = useState(true);

  // Review form
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    if (id) fetchAll();
  }, [id]);

  const fetchAll = async () => {
    setLoading(true);
    await Promise.all([fetchArtisan(), fetchProducts(), fetchReviews(), fetchLikes()]);
    setLoading(false);
  };

  const fetchArtisan = async () => {
    const { data } = await supabase.from('public_profiles').select('*').eq('user_id', id!).maybeSingle();
    if (data) setArtisan(data as ArtisanData);
  };

  const fetchProducts = async () => {
    const { data: prods } = await supabase.from('products').select('id, name, price, category, description, is_available').eq('artisan_id', id!).eq('is_available', true);
    if (prods) {
      const productIds = prods.map(p => p.id);
      const { data: images } = await supabase.from('product_images').select('product_id, image_url, is_primary').in('product_id', productIds);
      const productsWithImages = prods.map(p => ({
        ...p,
        images: (images || []).filter(img => img.product_id === p.id),
      }));
      setProducts(productsWithImages);
    }
  };

  const fetchReviews = async () => {
    const { data } = await supabase.from('artisan_reviews').select('id, rating, title, comment, created_at, reviewer_id').eq('artisan_id', id!).order('created_at', { ascending: false });
    if (data) {
      const reviewerIds = [...new Set(data.map(r => r.reviewer_id))];
      const { data: profiles } = await supabase.from('public_profiles').select('user_id, full_name').in('user_id', reviewerIds);
      const profileMap = new Map((profiles || []).map(p => [p.user_id, p.full_name]));
      setReviews(data.map(r => ({ ...r, reviewer_name: profileMap.get(r.reviewer_id) || 'Anonymous' })));
    }
  };

  const fetchLikes = async () => {
    const { count } = await supabase.from('artisan_likes').select('*', { count: 'exact', head: true }).eq('artisan_id', id!);
    setLikesCount(count || 0);
    if (user) {
      const { data } = await supabase.from('artisan_likes').select('id').eq('artisan_id', id!).eq('user_id', user.id).maybeSingle();
      setIsLiked(!!data);
    }
  };

  const toggleLike = async () => {
    if (!user) { toast({ title: 'Please sign in', description: 'You need to be signed in to like an artisan.', variant: 'destructive' }); return; }
    if (isLiked) {
      await supabase.from('artisan_likes').delete().eq('artisan_id', id!).eq('user_id', user.id);
      setIsLiked(false);
      setLikesCount(c => c - 1);
    } else {
      await supabase.from('artisan_likes').insert({ artisan_id: id!, user_id: user.id });
      setIsLiked(true);
      setLikesCount(c => c + 1);
    }
  };

  const avgRating = reviews.length > 0 ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : null;

  if (loading) {
    return <Layout><div className="min-h-screen flex items-center justify-center"><Loader2 className="h-12 w-12 animate-spin text-primary" /></div></Layout>;
  }

  if (!artisan) {
    return <Layout><div className="min-h-screen flex flex-col items-center justify-center gap-4"><h2 className="font-display text-2xl">ARTISAN NOT FOUND</h2><Link to="/artisans"><Button variant="outline">Back to Artisans</Button></Link></div></Layout>;
  }

  return (
    <Layout>
      {/* Hero */}
      <section className="relative bg-foreground pt-28 pb-16 overflow-hidden">
        <div className="absolute inset-0 pattern-mudcloth opacity-5" />
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <Link to="/artisans" className="inline-flex items-center gap-2 text-background/70 hover:text-background font-display text-xs tracking-widest mb-8">
            <ArrowLeft className="w-4 h-4" /> BACK TO ARTISANS
          </Link>
          <div className="flex flex-col md:flex-row gap-8 items-start">
            <div className="w-32 h-32 md:w-40 md:h-40 border-4 border-secondary overflow-hidden flex-shrink-0">
              <img src={artisan.avatar_url || artisanPortrait} alt={artisan.full_name || 'Artisan'} className="w-full h-full object-cover" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3 flex-wrap mb-2">
                <h1 className="font-display text-3xl md:text-5xl font-bold text-background tracking-tight">
                  {artisan.full_name || 'UNKNOWN ARTISAN'}
                </h1>
                {artisan.is_verified && (
                  <Badge className="bg-secondary text-secondary-foreground font-display text-xs tracking-wider border-0 gap-1">
                    <CheckCircle className="h-3 w-3" /> VERIFIED
                  </Badge>
                )}
              </div>
              {artisan.craft_specialty && (
                <span className="inline-block px-4 py-1 border-2 border-background/30 text-background font-display text-xs tracking-widest mb-3">
                  {artisan.craft_specialty.toUpperCase()}
                </span>
              )}
              <div className="flex flex-wrap items-center gap-4 text-background/70 text-sm font-body mb-4">
                {artisan.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" />{artisan.location}</span>}
                {artisan.years_experience && <span className="flex items-center gap-1"><Award className="h-4 w-4" />{artisan.years_experience}+ years</span>}
                {artisan.created_at && <span className="flex items-center gap-1"><Calendar className="h-4 w-4" />Joined {new Date(artisan.created_at).getFullYear()}</span>}
                {avgRating && <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-secondary text-secondary" />{avgRating} ({reviews.length} reviews)</span>}
              </div>
              {/* Action Buttons */}
              <div className="flex flex-wrap gap-3">
                {artisan.portfolio_url && (
                  <a href={artisan.portfolio_url} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="border-2 border-background/50 text-background hover:bg-background/10 font-display text-xs tracking-widest">
                      <ExternalLink className="h-4 w-4 mr-2" /> VISIT
                    </Button>
                  </a>
                )}
                <Button onClick={toggleLike} variant={isLiked ? "default" : "outline"} className={`font-display text-xs tracking-widest ${isLiked ? 'bg-secondary text-secondary-foreground border-0' : 'border-2 border-background/50 text-background hover:bg-background/10'}`}>
                  <Heart className={`h-4 w-4 mr-2 ${isLiked ? 'fill-current' : ''}`} /> {likesCount} LIKES
                </Button>
                <a href="#reviews">
                  <Button variant="outline" className="border-2 border-background/50 text-background hover:bg-background/10 font-display text-xs tracking-widest">
                    <MessageSquare className="h-4 w-4 mr-2" /> REVIEW
                  </Button>
                </a>
                <Link to={`/marketplace?artisan=${id}`}>
                  <Button className="bg-secondary text-secondary-foreground font-display text-xs tracking-widest border-0">
                    <ShoppingBag className="h-4 w-4 mr-2" /> SHOP
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content */}
      <section className="py-12 bg-background">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Tabs defaultValue="about" className="space-y-8">
            <TabsList className="border-2 border-foreground bg-transparent p-0 h-auto">
              <TabsTrigger value="about" className="font-display text-xs tracking-widest data-[state=active]:bg-foreground data-[state=active]:text-background px-6 py-3 rounded-none">STORY</TabsTrigger>
              <TabsTrigger value="products" className="font-display text-xs tracking-widest data-[state=active]:bg-foreground data-[state=active]:text-background px-6 py-3 rounded-none">PRODUCTS ({products.length})</TabsTrigger>
              <TabsTrigger value="reviews" className="font-display text-xs tracking-widest data-[state=active]:bg-foreground data-[state=active]:text-background px-6 py-3 rounded-none">REVIEWS ({reviews.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="about">
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
                <h2 className="font-display text-2xl font-bold mb-4 text-foreground">THE ARTISAN'S STORY</h2>
                <div className="prose prose-lg font-body text-muted-foreground">
                  {artisan.bio ? <p className="whitespace-pre-wrap">{artisan.bio}</p> : <p className="italic">This artisan hasn't shared their story yet.</p>}
                </div>
                {artisan.craft_specialty && (
                  <div className="mt-8 p-6 border-2 border-foreground">
                    <h3 className="font-display text-lg font-bold mb-3 text-foreground">SKILLS & EXPERTISE</h3>
                    <div className="flex flex-wrap gap-2">
                      {artisan.craft_specialty.split(',').map((skill, i) => (
                        <span key={i} className="px-4 py-2 bg-muted text-foreground font-display text-xs tracking-wider border border-foreground">{skill.trim().toUpperCase()}</span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </TabsContent>

            <TabsContent value="products">
              {products.length === 0 ? (
                <div className="text-center py-16 border-2 border-dashed border-foreground/30">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                  <p className="font-display text-lg text-muted-foreground">NO PRODUCTS LISTED YET</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product, i) => {
                    const primaryImage = product.images.find(img => img.is_primary)?.image_url || product.images[0]?.image_url;
                    return (
                      <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <Link to={`/marketplace/${product.id}`} className="block group">
                          <div className="border-2 border-foreground overflow-hidden bg-card hover:-translate-y-1 transition-all hover:shadow-brutal">
                            <div className="aspect-square overflow-hidden">
                              {primaryImage ? (
                                <img src={primaryImage} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                              ) : (
                                <div className="w-full h-full bg-muted flex items-center justify-center"><Package className="h-12 w-12 text-muted-foreground" /></div>
                              )}
                            </div>
                            <div className="p-4 border-t-2 border-foreground">
                              <span className="font-display text-xs tracking-widest text-muted-foreground">{product.category.toUpperCase()}</span>
                              <h3 className="font-display text-sm font-bold mt-1 text-foreground uppercase">{product.name}</h3>
                              <p className="font-display text-lg font-bold text-secondary mt-2">UGX {product.price.toLocaleString()}</p>
                            </div>
                          </div>
                        </Link>
                      </motion.div>
                    );
                  })}
                </div>
              )}
            </TabsContent>

            <TabsContent value="reviews" id="reviews">
              <div className="space-y-8 max-w-3xl">
                {/* Review Form */}
                {user && user.id !== id && (
                  <div className="border-2 border-foreground p-6">
                    <h3 className="font-display text-lg font-bold mb-4">LEAVE A REVIEW</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="font-display text-xs tracking-widest block mb-2">RATING</label>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map(star => (
                            <button key={star} onClick={() => setReviewRating(star)} className="p-1">
                              <Star className={`h-6 w-6 ${star <= reviewRating ? 'fill-secondary text-secondary' : 'text-muted-foreground'}`} />
                            </button>
                          ))}
                        </div>
                      </div>
                      <Input placeholder="Review title (optional)" value={reviewTitle} onChange={e => setReviewTitle(e.target.value)} className="border-2 border-foreground font-body" />
                      <Textarea placeholder="Share your experience..." value={reviewComment} onChange={e => setReviewComment(e.target.value)} className="border-2 border-foreground font-body" />
                      <Button disabled={submittingReview} onClick={async () => {
                        setSubmittingReview(true);
                        const { error } = await supabase.from('artisan_reviews').insert({
                          artisan_id: id!, reviewer_id: user.id, rating: reviewRating,
                          title: reviewTitle || null, comment: reviewComment || null,
                        });
                        if (error) {
                          toast({ title: 'Error', description: 'You may need a delivered order to review. ' + error.message, variant: 'destructive' });
                        } else {
                          toast({ title: 'Review submitted!' });
                          setReviewTitle(''); setReviewComment(''); setReviewRating(5);
                          fetchReviews();
                        }
                        setSubmittingReview(false);
                      }} className="font-display text-xs tracking-widest">
                        {submittingReview ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
                      </Button>
                    </div>
                  </div>
                )}

                {reviews.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-foreground/30">
                    <Star className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
                    <p className="font-display text-lg text-muted-foreground">NO REVIEWS YET</p>
                  </div>
                ) : (
                  reviews.map(review => (
                    <div key={review.id} className="border-2 border-foreground/20 p-5">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-display text-sm font-bold text-foreground">{review.reviewer_name}</span>
                        <span className="text-xs text-muted-foreground font-body">{new Date(review.created_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex gap-0.5 mb-2">
                        {[1, 2, 3, 4, 5].map(s => <Star key={s} className={`h-4 w-4 ${s <= review.rating ? 'fill-secondary text-secondary' : 'text-muted-foreground/30'}`} />)}
                      </div>
                      {review.title && <h4 className="font-display text-sm font-bold text-foreground mb-1">{review.title}</h4>}
                      {review.comment && <p className="text-muted-foreground font-body text-sm">{review.comment}</p>}
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>
    </Layout>
  );
}

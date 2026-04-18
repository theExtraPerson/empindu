import { useState } from 'react';
import { motion } from 'framer-motion';
import { Star, MessageSquare, User, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { useArtisanReviews } from '@/hooks/useArtisanReviews';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  artisanId: string;
  artisanName: string;
}

function StarRating({ rating, size = 'sm', interactive = false, onChange }: { 
  rating: number; size?: 'sm' | 'lg'; interactive?: boolean; onChange?: (r: number) => void 
}) {
  const s = size === 'lg' ? 'h-6 w-6' : 'h-4 w-4';
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          disabled={!interactive}
          onClick={() => onChange?.(i)}
          className={interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
        >
          <Star className={`${s} ${i <= rating ? 'fill-[hsl(var(--kente-gold))] text-[hsl(var(--kente-gold))]' : 'text-muted-foreground/30'}`} />
        </button>
      ))}
    </div>
  );
}

function RatingBar({ star, count, total }: { star: number; count: number; total: number }) {
  const pct = total > 0 ? (count / total) * 100 : 0;
  return (
    <div className="flex items-center gap-2">
      <span className="font-display text-xs w-4">{star}</span>
      <Star className="h-3 w-3 fill-[hsl(var(--kente-gold))] text-[hsl(var(--kente-gold))]" />
      <div className="flex-1 h-2 bg-muted border border-foreground/20">
        <div className="h-full bg-[hsl(var(--kente-gold))] transition-all" style={{ width: `${pct}%` }} />
      </div>
      <span className="font-display text-xs w-6 text-right">{count}</span>
    </div>
  );
}

export function ArtisanReviewsSection({ artisanId, artisanName }: Props) {
  const { reviews, stats, loading, canReview, eligibleOrders, submitReview } = useArtisanReviews(artisanId);
  const { user } = useAuth();
  const [showAll, setShowAll] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formRating, setFormRating] = useState(5);
  const [formTitle, setFormTitle] = useState('');
  const [formComment, setFormComment] = useState('');
  const [formOrderId, setFormOrderId] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const displayed = showAll ? reviews : reviews.slice(0, 3);

  const handleSubmit = async () => {
    if (!formOrderId) return;
    setSubmitting(true);
    const ok = await submitReview({ rating: formRating, title: formTitle, comment: formComment, order_id: formOrderId });
    if (ok) { setShowForm(false); setFormTitle(''); setFormComment(''); setFormRating(5); setFormOrderId(''); }
    setSubmitting(false);
  };

  return (
    <section className="border-2 border-foreground bg-background">
      {/* Header */}
      <div className="p-6 border-b-2 border-foreground flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="font-display text-xl tracking-wider">REVIEWS & RATINGS</h3>
          <p className="text-muted-foreground font-body text-sm mt-1">
            What buyers say about {artisanName}
          </p>
        </div>
        {canReview && user && (
          <Button
            onClick={() => setShowForm(true)}
            className="font-display text-xs tracking-widest border-2 border-foreground"
          >
            <MessageSquare className="h-4 w-4 mr-2" />
            WRITE A REVIEW
          </Button>
        )}
      </div>

      {/* Stats */}
      {stats.total_reviews > 0 && (
        <div className="p-6 border-b-2 border-foreground grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-6">
            <div className="text-center">
              <span className="font-display text-5xl font-bold text-foreground">{stats.average_rating}</span>
              <StarRating rating={Math.round(stats.average_rating)} />
              <p className="font-display text-xs text-muted-foreground mt-1">{stats.total_reviews} REVIEWS</p>
            </div>
          </div>
          <div className="space-y-1.5">
            {[5, 4, 3, 2, 1].map(s => (
              <RatingBar key={s} star={s} count={stats.distribution[s] || 0} total={stats.total_reviews} />
            ))}
          </div>
        </div>
      )}

      {/* Reviews list */}
      <div className="divide-y-2 divide-foreground/10">
        {loading ? (
          <div className="p-8 text-center text-muted-foreground font-body">Loading reviews...</div>
        ) : reviews.length === 0 ? (
          <div className="p-8 text-center">
            <MessageSquare className="h-10 w-10 text-muted-foreground mx-auto mb-3" />
            <p className="font-display text-sm tracking-wider text-muted-foreground">NO REVIEWS YET</p>
            <p className="font-body text-sm text-muted-foreground mt-1">Be the first to review this artisan</p>
          </div>
        ) : (
          <>
            {displayed.map((review, i) => (
              <motion.div
                key={review.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="p-6"
              >
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 bg-muted border-2 border-foreground flex items-center justify-center flex-shrink-0">
                    {review.reviewer_avatar ? (
                      <img src={review.reviewer_avatar} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-muted-foreground" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <span className="font-display text-sm tracking-wider">{review.reviewer_name}</span>
                      <StarRating rating={review.rating} />
                    </div>
                    {review.title && (
                      <h4 className="font-display text-sm font-bold mb-1">{review.title}</h4>
                    )}
                    {review.comment && (
                      <p className="font-body text-sm text-muted-foreground">{review.comment}</p>
                    )}
                    <span className="font-display text-[10px] text-muted-foreground mt-2 block">
                      {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
            {reviews.length > 3 && (
              <button
                onClick={() => setShowAll(!showAll)}
                className="w-full p-4 font-display text-xs tracking-widest text-primary hover:bg-muted transition-colors flex items-center justify-center gap-2"
              >
                {showAll ? <><ChevronUp className="h-4 w-4" /> SHOW LESS</> : <><ChevronDown className="h-4 w-4" /> VIEW ALL {reviews.length} REVIEWS</>}
              </button>
            )}
          </>
        )}
      </div>

      {/* Review Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="border-2 border-foreground">
          <DialogHeader>
            <DialogTitle className="font-display text-xl tracking-wider">REVIEW {artisanName.toUpperCase()}</DialogTitle>
            <DialogDescription className="font-body">Share your experience with this artisan's craftsmanship</DialogDescription>
          </DialogHeader>
          <div className="space-y-5 pt-4">
            <div>
              <Label className="font-display text-xs tracking-widest">SELECT ORDER</Label>
              <Select value={formOrderId} onValueChange={setFormOrderId}>
                <SelectTrigger className="border-2 border-foreground mt-1">
                  <SelectValue placeholder="Choose an order to review" />
                </SelectTrigger>
                <SelectContent>
                  {eligibleOrders.map(o => (
                    <SelectItem key={o.id} value={o.id}>
                      Order from {new Date(o.created_at).toLocaleDateString()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="font-display text-xs tracking-widest mb-2 block">YOUR RATING</Label>
              <StarRating rating={formRating} size="lg" interactive onChange={setFormRating} />
            </div>
            <div>
              <Label className="font-display text-xs tracking-widest">TITLE (OPTIONAL)</Label>
              <Input value={formTitle} onChange={e => setFormTitle(e.target.value)} placeholder="Sum up your experience" className="border-2 border-foreground mt-1" />
            </div>
            <div>
              <Label className="font-display text-xs tracking-widest">YOUR REVIEW</Label>
              <Textarea value={formComment} onChange={e => setFormComment(e.target.value)} placeholder="Tell others about the quality, communication, and craftsmanship..." rows={4} className="border-2 border-foreground mt-1 resize-none" />
            </div>
            <Button onClick={handleSubmit} disabled={!formOrderId || submitting} className="w-full font-display text-xs tracking-widest border-2 border-foreground">
              {submitting ? 'SUBMITTING...' : 'SUBMIT REVIEW'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </section>
  );
}

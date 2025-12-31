import { motion } from "framer-motion";
import { Quote, Star, ChevronLeft, ChevronRight } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import artisanPortrait from "@/assets/artisan-portrait.jpg";

const testimonials = [
  {
    id: 1,
    name: "Margaret Namuli",
    role: "Basket Weaver, Kampala",
    image: artisanPortrait,
    quote: "CraftedUganda opened doors I never knew existed. My baskets now reach customers in Europe and America. My income has tripled, and I've been able to train five more women in my community.",
    rating: 5,
  },
  {
    id: 2,
    name: "John Kato",
    role: "Procurement Manager, Serena Hotels",
    image: artisanPortrait,
    quote: "We've completely transformed our gift shops with authentic Ugandan crafts. Our guests love the story behind each piece, and we're proud to support local artisans directly.",
    rating: 5,
  },
  {
    id: 3,
    name: "Dr. Sarah Achola",
    role: "Ministry of Trade Official",
    image: artisanPortrait,
    quote: "This platform is exactly what Uganda's craft sector needed. The data insights help us make informed policy decisions to support artisan communities across the country.",
    rating: 5,
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  const nextTestimonial = () => {
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  const prevTestimonial = () => {
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const current = testimonials[currentIndex];

  return (
    <section className="section-padding bg-background pattern-weave">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <span className="text-primary font-medium uppercase tracking-wider text-sm mb-2 block">
            Success Stories
          </span>
          <h2 className="font-display text-3xl md:text-4xl lg:text-5xl font-bold text-foreground">
            Voices of Our <span className="text-primary">Community</span>
          </h2>
        </motion.div>

        <div className="max-w-4xl mx-auto">
          <motion.div
            key={current.id}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="relative bg-card rounded-3xl shadow-medium p-8 md:p-12"
          >
            {/* Quote Icon */}
            <div className="absolute -top-6 left-8 w-12 h-12 bg-gradient-hero rounded-xl flex items-center justify-center shadow-glow">
              <Quote className="h-6 w-6 text-warm-cream" />
            </div>

            <div className="grid md:grid-cols-3 gap-8 items-center">
              {/* Image */}
              <div className="md:col-span-1">
                <div className="relative w-32 h-32 md:w-full md:h-auto md:aspect-square mx-auto rounded-2xl overflow-hidden">
                  <img
                    src={current.image}
                    alt={current.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-primary/20 to-transparent" />
                </div>
              </div>

              {/* Content */}
              <div className="md:col-span-2">
                {/* Rating */}
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: current.rating }).map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-secondary text-secondary" />
                  ))}
                </div>

                {/* Quote */}
                <blockquote className="font-display text-xl md:text-2xl text-foreground leading-relaxed mb-6">
                  "{current.quote}"
                </blockquote>

                {/* Author */}
                <div>
                  <p className="font-semibold text-lg text-foreground">{current.name}</p>
                  <p className="text-muted-foreground">{current.role}</p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Navigation */}
          <div className="flex items-center justify-center gap-4 mt-8">
            <Button
              variant="outline"
              size="icon"
              onClick={prevTestimonial}
              className="rounded-full"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            
            <div className="flex gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`w-3 h-3 rounded-full transition-all duration-300 ${
                    index === currentIndex 
                      ? "bg-primary w-8" 
                      : "bg-muted hover:bg-primary/50"
                  }`}
                />
              ))}
            </div>

            <Button
              variant="outline"
              size="icon"
              onClick={nextTestimonial}
              className="rounded-full"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}

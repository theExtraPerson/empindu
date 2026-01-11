import { motion, AnimatePresence } from "framer-motion";
import { Quote, Star } from "lucide-react";
import { useState, useEffect } from "react";
import artisanPortrait from "@/assets/artisan-portrait.jpg";

const testimonials = [
  {
    id: 1,
    name: "MARGARET NAMULI",
    role: "Basket Weaver, Kampala",
    image: artisanPortrait,
    quote: "CraftedUganda opened doors I never knew existed. My baskets now reach customers in Europe and America.",
    rating: 5,
  },
  {
    id: 2,
    name: "JOHN KATO",
    role: "Procurement Manager, Serena Hotels",
    image: artisanPortrait,
    quote: "We've completely transformed our gift shops with authentic Ugandan crafts. Our guests love the story behind each piece.",
    rating: 5,
  },
  {
    id: 3,
    name: "DR. SARAH ACHOLA",
    role: "Ministry of Trade Official",
    image: artisanPortrait,
    quote: "This platform is exactly what Uganda's craft sector needed. The data insights help us make informed policy decisions.",
    rating: 5,
  },
  {
    id: 4,
    name: "EMMANUEL SSEKANDI",
    role: "Woodcarver, Jinja",
    image: artisanPortrait,
    quote: "My craft has supported my family for generations. Now, through this platform, I can share our heritage with the world.",
    rating: 5,
  },
];

export function Testimonials() {
  const [currentIndex, setCurrentIndex] = useState(0);

  // Auto-rotate carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % testimonials.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="py-16 md:py-24 bg-warm-cream overflow-hidden">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        {/* Brutalist Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-12 md:mb-16"
        >
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <span className="font-display text-xs tracking-[0.3em] text-bark-brown/60 mb-3 block">
                [ TESTIMONIALS ]
              </span>
              <h2 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold text-mudcloth-black tracking-tight leading-none">
                VOICES OF
                <br />
                <span className="text-primary">COMMUNITY</span>
              </h2>
            </div>
            
            {/* Carousel Indicators */}
            <div className="flex items-center gap-2">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentIndex(index)}
                  className={`h-1 transition-all duration-500 ${
                    index === currentIndex
                      ? "w-8 bg-primary"
                      : "w-4 bg-bark-brown/30 hover:bg-bark-brown/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </motion.div>

        {/* Stacked Cards Carousel */}
        <div className="relative h-[400px] md:h-[350px] max-w-4xl mx-auto">
          <AnimatePresence mode="popLayout">
            {testimonials.map((testimonial, index) => {
              const position = (index - currentIndex + testimonials.length) % testimonials.length;
              const isActive = position === 0;
              const isNext = position === 1;
              const isPrev = position === testimonials.length - 1;
              const isVisible = isActive || isNext || position === 2;

              if (!isVisible) return null;

              return (
                <motion.div
                  key={testimonial.id}
                  initial={{ 
                    scale: 0.85, 
                    y: 60, 
                    opacity: 0,
                    rotateX: -10,
                  }}
                  animate={{
                    scale: isActive ? 1 : isNext ? 0.95 : 0.9,
                    y: isActive ? 0 : isNext ? 30 : 60,
                    opacity: isActive ? 1 : isNext ? 0.7 : 0.4,
                    rotateX: 0,
                    zIndex: isActive ? 30 : isNext ? 20 : 10,
                  }}
                  exit={{ 
                    scale: 0.85, 
                    y: -60, 
                    opacity: 0,
                    rotateX: 10,
                  }}
                  transition={{ 
                    type: "spring", 
                    stiffness: 300, 
                    damping: 30,
                    duration: 0.5 
                  }}
                  className="absolute inset-0 cursor-pointer"
                  onClick={() => setCurrentIndex(index)}
                  style={{ 
                    transformStyle: "preserve-3d",
                    perspective: "1000px",
                  }}
                >
                  <div className={`h-full bg-white border-2 border-mudcloth-black shadow-brutal p-6 md:p-8 flex flex-col md:flex-row gap-6 md:gap-8 ${isActive ? '' : 'pointer-events-none'}`}>
                    {/* Left - Image & Quote Icon */}
                    <div className="flex md:flex-col items-center md:items-start gap-4 md:gap-6 md:w-1/4">
                      {/* Quote Icon */}
                      <div className="w-10 h-10 md:w-12 md:h-12 bg-primary flex items-center justify-center flex-shrink-0">
                        <Quote className="h-5 w-5 md:h-6 md:w-6 text-primary-foreground" />
                      </div>
                      
                      {/* Portrait */}
                      <div className="w-16 h-16 md:w-24 md:h-24 border-2 border-mudcloth-black overflow-hidden flex-shrink-0">
                        <img
                          src={testimonial.image}
                          alt={testimonial.name}
                          className="w-full h-full object-cover grayscale"
                        />
                      </div>

                      {/* Rating - Desktop */}
                      <div className="hidden md:flex gap-0.5">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                        ))}
                      </div>
                    </div>

                    {/* Right - Content */}
                    <div className="flex-1 flex flex-col justify-between">
                      {/* Rating - Mobile */}
                      <div className="flex md:hidden gap-0.5 mb-3">
                        {Array.from({ length: testimonial.rating }).map((_, i) => (
                          <Star key={i} className="h-3 w-3 fill-primary text-primary" />
                        ))}
                      </div>

                      {/* Quote */}
                      <blockquote className="font-display text-lg md:text-xl lg:text-2xl text-mudcloth-black leading-snug mb-6 md:mb-auto">
                        "{testimonial.quote}"
                      </blockquote>

                      {/* Author */}
                      <div className="border-t-2 border-mudcloth-black/10 pt-4">
                        <p className="font-display text-sm md:text-base font-bold text-mudcloth-black tracking-wide">
                          {testimonial.name}
                        </p>
                        <p className="font-mono text-xs text-bark-brown/60 mt-1">
                          {testimonial.role}
                        </p>
                      </div>
                    </div>

                    {/* Index Number */}
                    <div className="absolute top-4 right-4 md:top-6 md:right-6 font-display text-4xl md:text-6xl font-bold text-bark-brown/10">
                      {String(index + 1).padStart(2, '0')}
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {/* Bottom Navigation Hint */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="text-center mt-8 md:mt-12"
        >
          <span className="font-mono text-xs text-bark-brown/40 tracking-wider">
            AUTO-ROTATING · CLICK TO SELECT
          </span>
        </motion.div>
      </div>
    </section>
  );
}

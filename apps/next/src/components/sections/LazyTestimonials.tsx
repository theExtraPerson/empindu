"use client";

import dynamic from "next/dynamic";

export const LazyTestimonials = dynamic(
  () => import("@/components/sections/Testimonials").then((mod) => mod.Testimonials),
  {
    ssr: false,
    loading: () => <div className="min-h-[420px] bg-warm-cream" />,
  },
);

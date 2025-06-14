import React from "react";
import { Star } from "lucide-react";

export interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
}

interface TestimonialsSectionProps {
  testimonials: Testimonial[];
}

export function TestimonialsSection({
  testimonials,
}: TestimonialsSectionProps) {
  return (
    <section
      id="testimonials"
      className="border-t border-linear-border py-20"
      aria-labelledby="testimonials-heading"
    >
      <div className="container mx-auto px-4 sm:px-6">
        <h2
          id="testimonials-heading"
          className="mb-8 text-center text-3xl font-bold text-linear-text sm:text-4xl"
        >
          What our users say
        </h2>
        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((t, index) => (
            <div
              key={index}
              className="rounded-lg border border-linear-border bg-linear-card p-6 text-center"
            >
              <p className="mb-4 text-linear-text-secondary">
                &ldquo;{t.content}&rdquo;
              </p>
              <div className="mb-1 text-sm font-semibold text-linear-text">
                {t.name}
              </div>
              <div className="mb-2 text-sm text-linear-text-tertiary">
                {t.role}
              </div>
              <div
                className="flex justify-center"
                aria-label={`${t.rating} star rating`}
              >
                {Array.from({ length: t.rating }).map((_, i) => (
                  <Star
                    key={i}
                    className="h-4 w-4 fill-yellow-400 text-yellow-400"
                    aria-hidden="true"
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

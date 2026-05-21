import Image from "next/image";
import { getFeaturedTestimonials } from "@/lib/sanity/queries";
import { imageUrlFor } from "@/lib/sanity/image";
import type { Testimonial } from "@/lib/sanity/queries";

function QuoteMark() {
  return (
    <svg
      width="36"
      height="28"
      viewBox="0 0 36 28"
      fill="none"
      aria-hidden="true"
      className="text-gold/40 flex-shrink-0"
    >
      <path
        d="M0 28V17.6C0 12.267 1.2 8.133 3.6 5.2 6 2.267 9.6.533 14.4 0l1.6 3.2C12.267 4 10 5.467 8.4 7.6 6.8 9.733 6 12.4 6 15.6H12V28H0ZM20 28V17.6c0-5.333 1.2-9.467 3.6-12.4C26 2.267 29.6.533 34.4 0L36 3.2c-3.733.8-6 2.267-7.6 4.4C26.8 9.733 26 12.4 26 15.6H32V28H20Z"
        fill="currentColor"
      />
    </svg>
  );
}

function Avatar({ testimonial }: { testimonial: Testimonial }) {
  if (testimonial.photo) {
    const src = imageUrlFor(testimonial.photo)
      .width(80)
      .height(80)
      .fit("crop")
      .auto("format")
      .url();
    return (
      <Image
        src={src}
        alt={testimonial.name}
        width={40}
        height={40}
        className="w-10 h-10 rounded-full object-cover ring-2 ring-gold/30 flex-shrink-0"
      />
    );
  }

  const initials = testimonial.name
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div
      className="w-10 h-10 rounded-full bg-gradient-to-br from-orange/80 to-gold/70 flex items-center justify-center flex-shrink-0 ring-2 ring-gold/30"
      aria-hidden="true"
    >
      <span className="text-cream text-xs font-bold">{initials}</span>
    </div>
  );
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article className="bg-brown-card/70 rounded-2xl p-6 border border-white/[0.06] flex flex-col gap-5 hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
      <QuoteMark />

      <blockquote className="flex-1">
        <p className="text-cream/70 leading-relaxed text-base italic">
          &ldquo;{testimonial.quote}&rdquo;
        </p>
      </blockquote>

      <footer className="flex items-center gap-3 pt-2 border-t border-cream/[0.06]">
        <Avatar testimonial={testimonial} />
        <div>
          <p className="font-semibold text-cream text-sm">{testimonial.name}</p>
          {testimonial.location && (
            <p className="text-cream/35 text-xs">{testimonial.location}</p>
          )}
        </div>
      </footer>
    </article>
  );
}

export default async function TestimonialsSection() {
  const testimonials = await getFeaturedTestimonials();

  if (testimonials.length === 0) return null;

  return (
    <section
      className="border-t border-cream/[0.06] py-24 px-4"
      aria-label="Testimonials"
    >
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-14 space-y-4">
          <p className="text-gold font-bold text-xs uppercase tracking-widest">
            Fruit of the Ministry
          </p>
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-cream leading-tight">
            Lives Being Transformed
          </h2>
          <div className="flex items-center justify-center gap-3 pt-1" aria-hidden="true">
            <div className="w-10 h-px bg-gold/40" />
            <div className="w-1.5 h-1.5 rounded-full bg-gold/60" />
            <div className="w-10 h-px bg-gold/40" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <TestimonialCard key={t._id} testimonial={t} />
          ))}
        </div>
      </div>
    </section>
  );
}

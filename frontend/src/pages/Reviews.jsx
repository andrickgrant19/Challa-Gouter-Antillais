import { Star, ExternalLink } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import translations from "../translations";
import { useScrollRevealAll } from "../hooks/useScrollReveal";

export default function Reviews() {
  const { lang } = useLanguage();
  const T = translations[lang];
  const R = T.reviewsPage;
  useScrollRevealAll();

  return (
    <main className="bg-brand-cream">
      {/* Hero */}
      <section
        className="relative pt-36 pb-24 flex items-center justify-center"
        style={{ backgroundImage: "url(https://images.pexels.com/photos/2116094/pexels-photo-2116094.jpeg?auto=compress&cs=tinysrgb&w=1920)", backgroundSize: "cover", backgroundPosition: "center top" }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 text-center px-6">
          <span className="text-brand-gold text-xs font-body font-semibold tracking-[0.2em] uppercase block mb-3">{R.hero.overline}</span>
          <h1 data-testid="reviews-title" className="font-heading text-5xl md:text-6xl font-bold text-white mb-6">{R.hero.title}</h1>
          {/* Overall Rating */}
          <div className="inline-flex items-center gap-5 bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl px-8 py-5">
            <div className="text-center">
              <div className="font-heading text-5xl font-bold text-brand-gold">{R.overall.rating}</div>
              <div className="flex gap-1 justify-center mt-1">
                {[...Array(5)].map((_, i) => <Star key={i} size={16} fill="#D4AF37" className="text-brand-gold" />)}
              </div>
            </div>
            <div className="w-px h-14 bg-white/20" />
            <div className="text-left">
              <div className="font-heading text-3xl font-bold text-white">{R.overall.count}</div>
              <div className="text-white/70 font-body text-sm">{R.overall.label}</div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Grid */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <span className="text-brand-gold text-xs font-body font-semibold tracking-[0.2em] uppercase block mb-3">{T.reviews.overline}</span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-black whitespace-pre-line">{T.reviews.title}</h2>
            <span className="gold-divider mx-auto mt-4" />
            <p className="text-brand-text font-body text-base mt-4 max-w-xl mx-auto">{T.reviews.subtitle}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {T.reviews.testimonials.map((review, i) => (
              <div
                key={i}
                data-testid={`review-card-${i}`}
                className={`reveal delay-${Math.min((i + 1) * 100, 600)} bg-white rounded-2xl p-7 border border-brand-border hover:shadow-lg transition-all duration-300 hover:-translate-y-1 flex flex-col`}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, j) => (
                    <Star key={j} size={15} fill="#D4AF37" className="text-brand-gold" />
                  ))}
                </div>
                <p className="text-brand-text font-body text-sm leading-relaxed flex-1 italic mb-6">"{review.text}"</p>
                <div className="flex items-center gap-3 pt-4 border-t border-brand-border">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-brand-orange to-brand-orange-dark flex items-center justify-center text-white font-bold text-sm font-heading flex-shrink-0">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-body font-semibold text-sm text-brand-black">{review.name}</p>
                    <p className="font-body text-xs text-brand-text">{review.location}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA - Leave a review */}
      <section className="py-20 bg-brand-black">
        <div className="max-w-2xl mx-auto px-6 text-center reveal">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-3">{R.cta.title}</h2>
          <p className="text-white/60 font-body text-base mb-8">{R.cta.subtitle}</p>
          <a
            href="https://www.google.com/maps/place/Chala+Le+Gouter+Antillais"
            target="_blank"
            rel="noopener noreferrer"
            data-testid="google-review-btn"
            className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-body font-semibold px-8 py-4 rounded-md transition-all duration-200 hover:-translate-y-0.5"
          >
            <Star size={16} fill="white" /> {R.cta.btn} <ExternalLink size={14} />
          </a>
        </div>
      </section>
    </main>
  );
}

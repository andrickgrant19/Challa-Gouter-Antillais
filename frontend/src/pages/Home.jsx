import { useEffect } from "react";
import { Link } from "react-router-dom";
import { ChefHat, Leaf, Heart, Users, Utensils, Star, Phone, MapPin, ArrowRight, ExternalLink, PartyPopper, Building2, Clock } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import translations from "../translations";
import { useScrollRevealAll } from "../hooks/useScrollReveal";

const DISHES = [
  { img: "https://images.pexels.com/photos/9609848/pexels-photo-9609848.jpeg?auto=compress&cs=tinysrgb&w=800", span: "lg:col-span-2 lg:row-span-2" },
  { img: "https://images.pexels.com/photos/27556985/pexels-photo-27556985.jpeg?auto=compress&cs=tinysrgb&w=800", span: "" },
  { img: "https://images.pexels.com/photos/27556971/pexels-photo-27556971.jpeg?auto=compress&cs=tinysrgb&w=800", span: "" },
  { img: "https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=800", span: "" },
  { img: "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800", span: "lg:col-span-2" },
];

const WHY_ICONS = [ChefHat, Leaf, Heart, Users, Utensils];

export default function Home() {
  const { lang } = useLanguage();
  const T = translations[lang];
  useScrollRevealAll();

  return (
    <main>
      {/* HERO */}
      <section
        data-testid="hero-section"
        className="relative min-h-screen flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: "url(https://images.pexels.com/photos/2116094/pexels-photo-2116094.jpeg?auto=compress&cs=tinysrgb&w=1920)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/30" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 w-full pt-20">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-brand-gold/20 border border-brand-gold/40 text-brand-gold text-xs font-body font-semibold tracking-widest uppercase px-4 py-1.5 rounded-full mb-6">
              <Star size={12} fill="currentColor" /> {T.hero.badge}
            </div>
            <h1 className="font-heading text-5xl md:text-6xl lg:text-7xl font-bold text-white leading-none tracking-tight mb-6 whitespace-pre-line">
              {T.hero.headline}
            </h1>
            <p className="text-white/80 font-body text-base md:text-lg leading-relaxed mb-10 max-w-lg">
              {T.hero.subheadline}
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://www.ubereats.com/ca-fr/store/chala-le-gouter-antillais/5PogqSjLWTKTUIYfVPvYPw"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="cta-order-hero"
                className="flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-body font-semibold px-7 py-3.5 rounded-md transition-all duration-200 hover:-translate-y-0.5 shadow-lg"
              >
                <ExternalLink size={16} /> {T.hero.ctaOrder}
              </a>
              <Link
                to="/menu"
                data-testid="cta-menu-hero"
                className="flex items-center gap-2 bg-white/10 hover:bg-white/20 backdrop-blur-sm border border-white/30 text-white font-body font-semibold px-7 py-3.5 rounded-md transition-all duration-200"
              >
                {T.hero.ctaMenu} <ArrowRight size={16} />
              </Link>
              <a
                href="tel:+15145883708"
                data-testid="cta-call-hero"
                className="flex items-center gap-2 border border-brand-gold text-brand-gold hover:bg-brand-gold hover:text-white font-body font-semibold px-7 py-3.5 rounded-md transition-all duration-200"
              >
                <Phone size={16} /> {T.hero.ctaCall}
              </a>
            </div>
          </div>
        </div>
        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-0.5 h-12 bg-gradient-to-b from-white/50 to-transparent animate-pulse" />
        </div>
      </section>

      {/* POPULAR DISHES */}
      <section data-testid="popular-dishes-section" className="py-24 lg:py-32 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <span className="text-brand-gold text-xs font-body font-semibold tracking-[0.2em] uppercase block mb-3">{T.popularDishes.overline}</span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-black whitespace-pre-line leading-tight">{T.popularDishes.title}</h2>
            <span className="gold-divider mx-auto mt-4" />
            <p className="text-brand-text font-body text-base md:text-lg mt-4 max-w-xl mx-auto">{T.popularDishes.subtitle}</p>
          </div>

          {/* Bento Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-12">
            {T.popularDishes.dishes.map((dish, i) => (
              <Link
                key={i}
                to="/menu"
                data-testid={`dish-card-${i}`}
                aria-label={`${dish.name} — ${lang === "fr" ? "Voir le menu" : "View menu"}`}
                className={`reveal delay-${(i + 1) * 100} group relative rounded-2xl overflow-hidden cursor-pointer block transition-transform duration-300 hover:scale-[1.02] hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-brand-orange/60 focus:ring-offset-2 ${DISHES[i]?.span || ""}`}
                style={{ minHeight: i === 0 ? "420px" : "200px" }}
              >
                <img
                  src={DISHES[i]?.img || "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=800"}
                  alt={dish.name}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-5">
                  {dish.tag && (
                    <span className="inline-block bg-brand-gold text-white text-xs font-semibold px-2.5 py-0.5 rounded-full mb-2">{dish.tag}</span>
                  )}
                  <h3 className="font-heading text-white text-xl font-bold">{dish.name}</h3>
                  {i === 0 && <p className="text-white/80 text-sm font-body mt-1 leading-relaxed">{dish.description}</p>}
                </div>
              </Link>
            ))}
          </div>

          <div className="text-center">
            <Link
              to="/menu"
              data-testid="view-menu-btn"
              className="inline-flex items-center gap-2 border-2 border-brand-orange text-brand-orange hover:bg-brand-orange hover:text-white font-body font-semibold px-8 py-3.5 rounded-md transition-all duration-200"
            >
              {T.popularDishes.viewMenu} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* WHY CHOOSE US */}
      <section data-testid="why-us-section" className="py-24 lg:py-32 bg-brand-black">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <span className="text-brand-gold text-xs font-body font-semibold tracking-[0.2em] uppercase block mb-3">{T.whyUs.overline}</span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white whitespace-pre-line leading-tight">{T.whyUs.title}</h2>
            <span className="gold-divider mx-auto mt-4" />
            <p className="text-white/60 font-body text-base md:text-lg mt-4 max-w-xl mx-auto">{T.whyUs.subtitle}</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
            {T.whyUs.features.map((f, i) => {
              const WhyIcon = WHY_ICONS[i] || ChefHat;
              return (
                <div
                  key={i}
                  data-testid={`why-us-card-${i}`}
                  className={`reveal delay-${(i + 1) * 100} group p-6 rounded-xl border border-white/10 hover:border-brand-gold/40 bg-white/5 hover:bg-white/10 transition-all duration-300 text-center`}
                >
                  <div className="w-12 h-12 bg-brand-orange/20 rounded-xl flex items-center justify-center mx-auto mb-4 group-hover:bg-brand-orange/30 transition-colors">
                    <WhyIcon size={22} className="text-brand-orange" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-white mb-2">{f.title}</h3>
                  <p className="text-white/55 font-body text-sm leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ABOUT SNIPPET */}
      <section data-testid="about-section" className="py-24 lg:py-32 bg-brand-cream-secondary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="reveal-left">
              <span className="text-brand-gold text-xs font-body font-semibold tracking-[0.2em] uppercase block mb-3">{T.about.overline}</span>
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-black whitespace-pre-line leading-tight mb-2">{T.about.title}</h2>
              <span className="gold-divider mb-6" />
              <p className="text-brand-text font-body text-base leading-relaxed mb-4">{T.about.p1}</p>
              <p className="text-brand-text font-body text-base leading-relaxed mb-8">{T.about.p2}</p>
              <div className="flex gap-8 mb-8">
                {T.about.stats.map((s, i) => (
                  <div key={i} className="text-center">
                    <div className="font-heading text-3xl font-bold text-brand-orange">{s.value}</div>
                    <div className="text-brand-text text-xs font-body mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
              <Link
                to="/about"
                data-testid="about-cta"
                className="inline-flex items-center gap-2 bg-brand-green hover:bg-green-800 text-white font-body font-semibold px-7 py-3.5 rounded-md transition-all duration-200 hover:-translate-y-0.5"
              >
                {T.about.cta} <ArrowRight size={16} />
              </Link>
            </div>
            <div className="reveal-right relative">
              <div className="rounded-2xl overflow-hidden shadow-2xl aspect-[4/5]">
                <img
                  src="https://images.unsplash.com/photo-1772479036537-2f24be392ab0?w=800&auto=format&fit=crop"
                  alt="Restaurant interior"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="absolute -bottom-5 -left-5 bg-white rounded-xl shadow-xl p-4 border border-brand-border">
                <div className="flex items-center gap-1 mb-1">
                  {[...Array(5)].map((_, i) => <Star key={i} size={14} className="text-brand-gold" fill="#D4AF37" />)}
                </div>
                <p className="font-body text-xs font-semibold text-brand-black">4.9 / 5.0</p>
                <p className="font-body text-xs text-brand-text">200+ Reviews</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* REVIEWS SNIPPET */}
      <section data-testid="reviews-section" className="py-24 lg:py-32 bg-brand-cream">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <span className="text-brand-gold text-xs font-body font-semibold tracking-[0.2em] uppercase block mb-3">{T.reviews.overline}</span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-black whitespace-pre-line leading-tight">{T.reviews.title}</h2>
            <span className="gold-divider mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {T.reviews.testimonials.slice(0, 3).map((review, i) => (
              <div
                key={i}
                data-testid={`review-card-${i}`}
                className={`reveal delay-${(i + 1) * 100} bg-white rounded-xl p-6 shadow-sm border border-brand-border hover:shadow-md transition-all duration-300`}
              >
                <div className="flex gap-1 mb-4">
                  {[...Array(review.rating)].map((_, j) => <Star key={j} size={14} className="text-brand-gold" fill="#D4AF37" />)}
                </div>
                <p className="text-brand-text font-body text-sm leading-relaxed mb-5 italic">"{review.text}"</p>
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-brand-orange flex items-center justify-center text-white font-bold text-sm font-heading">
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
          <div className="text-center mt-10">
            <Link to="/reviews" data-testid="view-all-reviews" className="inline-flex items-center gap-2 text-brand-orange hover:text-brand-orange-dark font-body font-semibold transition-colors">
              {lang === "fr" ? "Voir Tous les Avis" : "View All Reviews"} <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </section>

      {/* CATERING CTA */}
      <section
        data-testid="catering-section"
        className="relative py-24 lg:py-32 overflow-hidden"
        style={{ backgroundImage: "url(https://images.pexels.com/photos/32568165/pexels-photo-32568165.jpeg?auto=compress&cs=tinysrgb&w=1920)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-brand-black/75" />
        <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 text-center">
          <div className="reveal max-w-2xl mx-auto">
            <span className="text-brand-gold text-xs font-body font-semibold tracking-[0.2em] uppercase block mb-3">{T.catering.overline}</span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-white whitespace-pre-line leading-tight mb-4">{T.catering.title}</h2>
            <span className="gold-divider mx-auto mb-6" />
            <p className="text-white/70 font-body text-base md:text-lg mb-10">{T.catering.subtitle}</p>
            <div className="flex flex-wrap gap-3 justify-center">
              <Link
                to="/catering"
                data-testid="catering-cta-btn"
                className="bg-brand-orange hover:bg-brand-orange-dark text-white font-body font-semibold px-8 py-3.5 rounded-md transition-all duration-200 hover:-translate-y-0.5"
              >
                {T.catering.cta}
              </Link>
              <a
                href="tel:+15145883708"
                className="flex items-center gap-2 border border-white text-white hover:bg-white hover:text-brand-black font-body font-semibold px-8 py-3.5 rounded-md transition-all duration-200"
              >
                <Phone size={16} /> {T.catering.ctaSecondary}
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* MAP + CONTACT */}
      <section data-testid="map-section" className="py-24 lg:py-32 bg-brand-cream-secondary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <span className="text-brand-gold text-xs font-body font-semibold tracking-[0.2em] uppercase block mb-3">{T.contact.overline}</span>
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-black">{T.contact.title}</h2>
            <span className="gold-divider mx-auto mt-4" />
          </div>
          <div className="grid lg:grid-cols-2 gap-10 items-start">
            <div className="reveal-left rounded-2xl overflow-hidden shadow-lg h-80 lg:h-96">
              <iframe
                title="Google Maps"
                width="100%"
                height="100%"
                frameBorder="0"
                src="https://maps.google.com/maps?q=11866+Bd+Rivi%C3%A8re-des-Prairies+Montreal+QC+H1C+1P9&output=embed"
                allowFullScreen
                loading="lazy"
              />
            </div>
            <div className="reveal-right space-y-6">
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <MapPin size={18} className="text-brand-orange" />
                </div>
                <div>
                  <p className="font-body font-semibold text-brand-black text-sm mb-1">{lang === "fr" ? "Adresse" : "Address"}</p>
                  <p className="font-body text-brand-text text-sm whitespace-pre-line">{T.contact.address}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-10 h-10 bg-brand-green/10 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Phone size={18} className="text-brand-green" />
                </div>
                <div>
                  <p className="font-heading font-semibold text-brand-black text-sm mb-1">{lang === "fr" ? "Téléphone" : "Phone"}</p>
                  <a href="tel:+15145883708" className="font-body text-brand-text text-sm hover:text-brand-orange transition-colors">{T.contact.phone}</a>
                </div>
              </div>
              <div className="bg-white rounded-xl p-5 border border-brand-border">
                <p className="font-heading font-semibold text-brand-black mb-3 flex items-center gap-2">
                  <Clock size={15} className="text-brand-gold" /> {T.contact.hoursTitle}
                </p>
                <div className="space-y-1.5">
                  {T.contact.hours.map((h, i) => (
                    <div key={i} className="flex justify-between text-xs font-body">
                      <span className="text-brand-text">{h.day}</span>
                      <span className="font-medium text-brand-black">{h.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
              <Link
                to="/contact"
                data-testid="contact-page-link"
                className="block text-center bg-brand-black hover:bg-brand-green text-white font-body font-semibold px-8 py-3.5 rounded-md transition-all duration-300"
              >
                {lang === "fr" ? "Nous Contacter" : "Contact Us"} →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

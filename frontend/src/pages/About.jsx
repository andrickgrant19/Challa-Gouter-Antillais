import { Link } from "react-router-dom";
import { ChefHat, Leaf, Heart, Star, ArrowRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import translations from "../translations";
import { useScrollRevealAll } from "../hooks/useScrollReveal";

const VALUE_ICONS = [ChefHat, Leaf, Heart, Star];

export default function About() {
  const { lang } = useLanguage();
  const T = translations[lang];
  const A = T.aboutPage;
  useScrollRevealAll();

  return (
    <main className="bg-brand-cream">
      {/* Hero */}
      <section
        className="relative pt-36 pb-24 flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: "url(https://images.unsplash.com/photo-1772479036537-2f24be392ab0?w=1920&auto=format&fit=crop)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-black/65" />
        <div className="relative z-10 text-center px-6">
          <span className="text-brand-gold text-xs font-body font-semibold tracking-[0.2em] uppercase block mb-3">{A.hero.overline}</span>
          <h1 data-testid="about-title" className="font-heading text-5xl md:text-6xl font-bold text-white leading-tight">{A.hero.title}</h1>
        </div>
      </section>

      {/* Story Section */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="reveal-left">
              <span className="gold-divider mb-5" />
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-black whitespace-pre-line leading-tight mb-6">{A.story.title}</h2>
              <p className="text-brand-text font-body text-base leading-relaxed mb-4">{A.story.p1}</p>
              <p className="text-brand-text font-body text-base leading-relaxed mb-4">{A.story.p2}</p>
              <p className="text-brand-text font-body text-base leading-relaxed">{A.story.p3}</p>
            </div>
            <div className="reveal-right space-y-4">
              <div className="rounded-2xl overflow-hidden shadow-xl aspect-[4/3]">
                <img
                  src="https://images.pexels.com/photos/32568165/pexels-photo-32568165.jpeg?auto=compress&cs=tinysrgb&w=800"
                  alt="Caribbean dining"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="grid grid-cols-3 gap-3">
                {T.about.stats.map((s, i) => (
                  <div key={i} className="bg-white rounded-xl p-4 border border-brand-border text-center shadow-sm">
                    <div className="font-heading text-2xl font-bold text-brand-orange">{s.value}</div>
                    <div className="text-brand-text text-xs font-body mt-1 leading-tight">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24 lg:py-28 bg-brand-cream-secondary">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="text-center mb-14 reveal">
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-black">{A.values.title}</h2>
            <span className="gold-divider mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {A.values.items.map((v, i) => {
              const ValIcon = VALUE_ICONS[i] || ChefHat;
              return (
                <div
                  key={i}
                  data-testid={`value-card-${i}`}
                  className={`reveal delay-${(i + 1) * 100} bg-white rounded-xl p-6 border border-brand-border hover:shadow-md transition-all duration-300 text-center`}
                >
                  <div className="w-14 h-14 bg-brand-orange/10 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ValIcon size={24} className="text-brand-orange" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-brand-black mb-2">{v.title}</h3>
                  <p className="text-brand-text font-body text-sm leading-relaxed">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Mission */}
      <section className="py-24 bg-brand-black">
        <div className="max-w-3xl mx-auto px-6 text-center reveal">
          <span className="text-brand-gold text-xs font-body font-semibold tracking-[0.2em] uppercase block mb-3">{A.mission.title}</span>
          <blockquote className="font-heading text-2xl md:text-3xl font-medium text-white leading-relaxed italic mb-8">
            "{A.mission.text}"
          </blockquote>
          <div className="flex flex-wrap gap-3 justify-center">
            <Link
              to="/menu"
              className="bg-brand-orange hover:bg-brand-orange-dark text-white font-body font-semibold px-7 py-3.5 rounded-md transition-all duration-200 inline-flex items-center gap-2"
            >
              {lang === "fr" ? "Voir Notre Menu" : "View Our Menu"} <ArrowRight size={16} />
            </Link>
            <Link
              to="/contact"
              className="border border-white/40 text-white hover:border-brand-gold hover:text-brand-gold font-body font-semibold px-7 py-3.5 rounded-md transition-all duration-200"
            >
              {lang === "fr" ? "Nous Visiter" : "Visit Us"}
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}

import { useState, useEffect } from "react";
import { ExternalLink, Plus } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";
import translations from "../translations";
import { restaurantConfig } from "../restaurant.config";
import { supabase } from "../lib/supabase";
import ComboBuilder from "../components/ComboBuilder";

const FAMILY_FALLBACK_IMAGE = "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=600";

export default function Menu() {
  const { lang } = useLanguage();
  const T = translations[lang];

  const [familyMeals, setFamilyMeals] = useState([]);

  useEffect(() => {
    if (!supabase) return;
    let cancelled = false;
    supabase
      .from("menu_items")
      .select("*")
      .eq("is_available", true)
      .eq("category", "Repas Familiale")
      .order("display_order", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled || error) return;
        setFamilyMeals(data || []);
      });
    return () => { cancelled = true; };
  }, []);

  return (
    <main className="bg-brand-cream min-h-screen">
      {/* Hero */}
      <section
        className="relative pt-36 pb-20 flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: "url(https://images.pexels.com/photos/2116094/pexels-photo-2116094.jpeg?auto=compress&cs=tinysrgb&w=1920)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 text-center px-6">
          <span className="text-brand-gold text-xs font-body font-semibold tracking-[0.2em] uppercase block mb-3">{restaurantConfig.name}</span>
          <h1 data-testid="menu-title" className="font-heading text-5xl md:text-6xl font-bold text-white mb-4">{T.menu.title}</h1>
          <p className="text-white/70 font-body text-base md:text-lg max-w-lg mx-auto">{T.menu.subtitle}</p>
        </div>
      </section>

      {/* Uber Eats CTA */}
      <div className="bg-brand-orange py-4 px-6 text-center">
        <a
          href={restaurantConfig.uberEatsUrl}
          target="_blank"
          rel="noopener noreferrer"
          data-testid="ubereats-menu-btn"
          className="inline-flex items-center gap-2 text-white font-body font-semibold hover:underline"
        >
          <ExternalLink size={16} /> {lang === "fr" ? "Commander via Uber Eats" : "Order via Uber Eats"}
        </a>
      </div>

      {/* Combo Builder */}
      <ComboBuilder />

      {/* Family Meals */}
      {familyMeals.length > 0 && (
        <section data-testid="family-meals" className="max-w-6xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <div className="text-center mb-10">
            <span className="gold-divider mb-4 inline-block" />
            <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-black mb-2">
              {lang === "fr" ? "Repas Familiale" : "Family Meals"}
            </h2>
            <p className="font-body text-brand-text">
              {lang === "fr" ? "Pour 4 personnes — prêts à servir" : "Serves 4 — ready to enjoy"}
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {familyMeals.map((item) => (
              <FamilyMealCard key={item.id} item={item} lang={lang} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

function FamilyMealCard({ item, lang }) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);
  const handleAdd = () => {
    addItem({
      id: item.id,
      name: item.name,
      unit_price: parseFloat(item.price),
      image: item.image_url || FAMILY_FALLBACK_IMAGE,
    });
    setAdding(true);
    setTimeout(() => setAdding(false), 700);
  };
  return (
    <div data-testid={`family-meal-${item.id}`} className="bg-white rounded-xl overflow-hidden border border-brand-border hover:shadow-md transition-all duration-300 flex flex-col animate-fadeIn">
      <div className="relative h-40 overflow-hidden">
        <img src={item.image_url || FAMILY_FALLBACK_IMAGE} alt={item.name} loading="lazy" className="w-full h-full object-cover" />
        <span className="absolute bottom-2 left-2 bg-white/95 text-brand-orange text-xs font-bold px-2.5 py-1 rounded-full shadow">${parseFloat(item.price).toFixed(2)}</span>
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-heading text-lg font-semibold text-brand-black mb-1">{item.name}</h3>
        {item.description && <p className="text-brand-text font-body text-sm leading-relaxed flex-1">{item.description}</p>}
        <button
          onClick={handleAdd}
          data-testid={`add-family-${item.id}`}
          className={`mt-3 w-full inline-flex items-center justify-center gap-2 font-body font-semibold text-sm py-2.5 rounded-lg transition-all ${adding ? "bg-brand-green text-white" : "bg-brand-orange hover:bg-brand-orange-dark text-white"}`}
        >
          <Plus size={14} />
          {adding ? (lang === "fr" ? "Ajouté ✓" : "Added ✓") : (lang === "fr" ? "Ajouter au panier" : "Add to Cart")}
        </button>
      </div>
    </div>
  );
}

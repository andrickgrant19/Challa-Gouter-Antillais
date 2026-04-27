import { useState, useEffect } from "react";
import { Flame, ExternalLink, Plus } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";
import translations from "../translations";
import menuData from "../menuData";
import { restaurantConfig } from "../restaurant.config";
import { supabase } from "../lib/supabase";
import { useScrollRevealAll } from "../hooks/useScrollReveal";

// Stable display order for owner-defined categories.
// Anything not listed here is appended at the end in alphabetical order.
const CATEGORY_ORDER = [
  "Griot",
  "Poulet",
  "Dinde",
  "Végétarien",
  "Poisson",
  "Salades et Repas",
  "Repas Familiale",
];

// Fallback header image per category (used when items don't have image_url set).
const CATEGORY_FALLBACK_IMAGE = {
  Griot:             "https://images.pexels.com/photos/9609848/pexels-photo-9609848.jpeg?auto=compress&cs=tinysrgb&w=600",
  Poulet:            "https://images.pexels.com/photos/27556985/pexels-photo-27556985.jpeg?auto=compress&cs=tinysrgb&w=600",
  Dinde:             "https://images.pexels.com/photos/2233729/pexels-photo-2233729.jpeg?auto=compress&cs=tinysrgb&w=600",
  Végétarien:        "https://images.pexels.com/photos/1640774/pexels-photo-1640774.jpeg?auto=compress&cs=tinysrgb&w=600",
  Poisson:           "https://images.pexels.com/photos/3296434/pexels-photo-3296434.jpeg?auto=compress&cs=tinysrgb&w=600",
  "Salades et Repas":"https://images.pexels.com/photos/7625056/pexels-photo-7625056.jpeg?auto=compress&cs=tinysrgb&w=600",
  "Repas Familiale": "https://images.pexels.com/photos/2474661/pexels-photo-2474661.jpeg?auto=compress&cs=tinysrgb&w=600",
};
const DEFAULT_FOOD_IMAGE = "https://images.pexels.com/photos/2116094/pexels-photo-2116094.jpeg?auto=compress&cs=tinysrgb&w=600";

export default function Menu() {
  const { lang } = useLanguage();
  const T = translations[lang];
  const staticData = menuData[lang];
  const [activeCategory, setActiveCategory] = useState("all");
  const [dbItems, setDbItems] = useState(null); // null = not loaded, [] = loaded but empty
  // Re-run scroll reveal whenever items load OR the active filter changes
  useScrollRevealAll(".reveal", 0.12, [dbItems, activeCategory]);

  // Try to load from Supabase; fallback to static
  useEffect(() => {
    if (!supabase) { setDbItems([]); return; }
    let cancelled = false;
    supabase
      .from("menu_items")
      .select("*")
      .eq("is_available", true)
      .order("display_order", { ascending: true })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) { setDbItems([]); return; }
        setDbItems(data || []);
      });
    return () => { cancelled = true; };
  }, []);

  // Merge: if DB has items, group them by category and use them; else fallback
  const data = (() => {
    if (!dbItems || dbItems.length === 0) return staticData;
    const byCat = {};
    dbItems.forEach((it) => {
      const cat = it.category || "Autres";
      if (!byCat[cat]) {
        byCat[cat] = {
          id: cat,
          name: cat,
          image: CATEGORY_FALLBACK_IMAGE[cat] || DEFAULT_FOOD_IMAGE,
          items: [],
        };
      }
      byCat[cat].items.push({
        id: it.id,
        name: it.name,
        description: it.description || "",
        spicy: false,
        price: parseFloat(it.price),
        image: it.image_url || byCat[cat].image,
      });
    });
    // Stable order: known categories first (per CATEGORY_ORDER), unknown ones appended alphabetically
    const knownIndex = (c) => {
      const i = CATEGORY_ORDER.indexOf(c);
      return i === -1 ? 1e6 : i;
    };
    return Object.values(byCat).sort((a, b) => {
      const ai = knownIndex(a.id);
      const bi = knownIndex(b.id);
      if (ai !== bi) return ai - bi;
      return a.name.localeCompare(b.name);
    });
  })();

  const categories = data.map((c) => ({ id: c.id, name: c.name }));

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

      {/* Category Tabs */}
      <div className="sticky top-16 md:top-20 z-30 bg-white/95 backdrop-blur-sm border-b border-brand-border shadow-sm">
        <div className="max-w-7xl mx-auto px-4 overflow-x-auto">
          <div className="flex gap-1 py-3 min-w-max">
            <button
              data-testid="cat-all"
              onClick={() => setActiveCategory("all")}
              className={`px-4 py-2 rounded-lg text-sm font-body font-medium transition-all whitespace-nowrap ${activeCategory === "all" ? "bg-brand-orange text-white" : "text-brand-text hover:text-brand-orange hover:bg-brand-cream"}`}
            >
              {T.menu.allItems}
            </button>
            {categories.map((cat) => (
              <button
                key={cat.id}
                data-testid={`cat-${cat.id}`}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-4 py-2 rounded-lg text-sm font-body font-medium transition-all whitespace-nowrap ${activeCategory === cat.id ? "bg-brand-orange text-white" : "text-brand-text hover:text-brand-orange hover:bg-brand-cream"}`}
              >
                {cat.name}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Items Grid */}
      <section className="max-w-7xl mx-auto px-6 lg:px-8 py-12">
        {activeCategory === "all" ? (
          data.map((category) => (
            <div key={category.id} className="mb-14">
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0">
                  <img src={category.image} alt={category.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-brand-black">{category.name}</h2>
                  <span className="gold-divider mt-1" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {category.items.map((item) => (
                  <MenuItemCard key={item.id} item={item} image={item.image || category.image} lang={lang} T={T} />
                ))}
              </div>
            </div>
          ))
        ) : (
          (() => {
            const cat = data.find((c) => c.id === activeCategory);
            if (!cat) return null;
            return (
              <div>
                <div className="flex items-center gap-4 mb-6">
                  <h2 className="font-heading text-3xl font-bold text-brand-black">{cat.name}</h2>
                  <span className="gold-divider self-center" />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {cat.items.map((item) => (
                    <MenuItemCard key={item.id} item={item} image={item.image || cat.image} lang={lang} T={T} />
                  ))}
                </div>
              </div>
            );
          })()
        )}
      </section>
    </main>
  );
}

function MenuItemCard({ item, image, lang, T }) {
  const { addItem } = useCart();
  const [adding, setAdding] = useState(false);

  const handleAdd = () => {
    addItem({ id: item.id, name: item.name, unit_price: item.price, image });
    setAdding(true);
    setTimeout(() => setAdding(false), 700);
  };

  return (
    <div data-testid={`menu-item-${item.id}`} className="bg-white rounded-xl overflow-hidden border border-brand-border hover:shadow-md transition-all duration-300 group flex flex-col animate-fadeIn">
      <div className="relative h-40 overflow-hidden">
        <img src={image} alt={item.name} loading="lazy" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {item.spicy && (
          <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Flame size={10} /> {T.menu.spicy}
          </span>
        )}
        {typeof item.price === "number" && (
          <span className="absolute bottom-2 left-2 bg-white/95 text-brand-orange text-xs font-bold px-2.5 py-1 rounded-full shadow">
            ${item.price.toFixed(2)}
          </span>
        )}
      </div>
      <div className="p-4 flex-1 flex flex-col">
        <h3 className="font-heading text-lg font-semibold text-brand-black mb-1">{item.name}</h3>
        <p className="text-brand-text font-body text-sm leading-relaxed flex-1">{item.description}</p>
        {typeof item.price === "number" && (
          <button
            onClick={handleAdd}
            data-testid={`add-to-cart-${item.id}`}
            className={`mt-3 w-full inline-flex items-center justify-center gap-2 font-body font-semibold text-sm py-2.5 rounded-lg transition-all ${adding ? "bg-brand-green text-white" : "bg-brand-orange hover:bg-brand-orange-dark text-white"}`}
          >
            <Plus size={14} />
            {adding
              ? (lang === "fr" ? "Ajouté ✓" : "Added ✓")
              : (lang === "fr" ? "Ajouter au panier" : "Add to Cart")}
          </button>
        )}
      </div>
    </div>
  );
}

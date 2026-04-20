import { useState, useEffect } from "react";
import { Flame, ExternalLink } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import translations from "../translations";
import menuData from "../menuData";
import { useScrollRevealAll } from "../hooks/useScrollReveal";

export default function Menu() {
  const { lang } = useLanguage();
  const T = translations[lang];
  const data = menuData[lang];
  const [activeCategory, setActiveCategory] = useState("all");
  useScrollRevealAll();

  const categories = data.map((c) => ({ id: c.id, name: c.name }));
  const allItems = data.flatMap((c) => c.items.map((item) => ({ ...item, category: c.id, categoryName: c.name, image: c.image })));
  const displayItems = activeCategory === "all" ? allItems : data.find((c) => c.id === activeCategory)?.items.map((item) => ({ ...item, category: activeCategory, categoryName: data.find((c) => c.id === activeCategory)?.name, image: data.find((c) => c.id === activeCategory)?.image })) || [];

  return (
    <main className="bg-brand-cream min-h-screen">
      {/* Hero */}
      <section
        className="relative pt-36 pb-20 flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: "url(https://images.pexels.com/photos/2116094/pexels-photo-2116094.jpeg?auto=compress&cs=tinysrgb&w=1920)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 text-center px-6">
          <span className="text-brand-gold text-xs font-body font-semibold tracking-[0.2em] uppercase block mb-3">Chala Le Gouter Antillais</span>
          <h1 data-testid="menu-title" className="font-heading text-5xl md:text-6xl font-bold text-white mb-4">{T.menu.title}</h1>
          <p className="text-white/70 font-body text-base md:text-lg max-w-lg mx-auto">{T.menu.subtitle}</p>
        </div>
      </section>

      {/* Uber Eats CTA */}
      <div className="bg-brand-orange py-4 px-6 text-center">
        <a
          href="https://www.ubereats.com/ca-fr/store/chala-le-gouter-antillais/5PogqSjLWTKTUIYfVPvYPw"
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
              <div className="flex items-center gap-4 mb-6 reveal">
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
                  <MenuItemCard key={item.id} item={item} image={category.image} lang={lang} T={T} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div>
            <div className="flex items-center gap-4 mb-6">
              <h2 className="font-heading text-3xl font-bold text-brand-black">
                {data.find((c) => c.id === activeCategory)?.name}
              </h2>
              <span className="gold-divider self-center" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {displayItems.map((item) => (
                <MenuItemCard key={item.id} item={item} image={item.image} lang={lang} T={T} />
              ))}
            </div>
          </div>
        )}
      </section>
    </main>
  );
}

function MenuItemCard({ item, image, T }) {
  return (
    <div data-testid={`menu-item-${item.id}`} className="reveal bg-white rounded-xl overflow-hidden border border-brand-border hover:shadow-md transition-all duration-300 group">
      <div className="relative h-40 overflow-hidden">
        <img src={image} alt={item.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        {item.spicy && (
          <span className="absolute top-2 right-2 bg-red-600 text-white text-xs font-semibold px-2 py-0.5 rounded-full flex items-center gap-1">
            <Flame size={10} /> {T.menu.spicy}
          </span>
        )}
      </div>
      <div className="p-4">
        <h3 className="font-heading text-lg font-semibold text-brand-black mb-1">{item.name}</h3>
        <p className="text-brand-text font-body text-sm leading-relaxed">{item.description}</p>
      </div>
    </div>
  );
}

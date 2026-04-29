import { useState } from "react";
import { ExternalLink, ChefHat, Users, Coffee } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import translations from "../translations";
import { restaurantConfig } from "../restaurant.config";
import { IndividualBuilder, FamilyBuilder, DrinksMenu } from "../components/MenuSections";

export default function Menu() {
  const { lang } = useLanguage();
  const T = translations[lang];
  const [tab, setTab] = useState("individual");

  const tabs = [
    { id: "individual", label_fr: "Plats Individuels", label_en: "Individual Plates", icon: ChefHat },
    { id: "family",     label_fr: "Repas Familiaux",   label_en: "Family Meals",      icon: Users },
    { id: "drinks",     label_fr: "Boissons",          label_en: "Drinks",            icon: Coffee },
  ];

  return (
    <main className="bg-brand-cream min-h-screen">
      {/* Hero */}
      <section
        className="relative pt-36 pb-20 flex items-center justify-center overflow-hidden"
        style={{ backgroundImage: "url(https://customer-assets.emergentagent.com/job_antilles-kitchen/artifacts/qt3r3qxx_Combo%20Haitien.webp)", backgroundSize: "cover", backgroundPosition: "center" }}
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
        <a href={restaurantConfig.uberEatsUrl} target="_blank" rel="noopener noreferrer"
          data-testid="ubereats-menu-btn"
          className="inline-flex items-center gap-2 text-white font-body font-semibold hover:underline">
          <ExternalLink size={16} /> {lang === "fr" ? "Commander via Uber Eats" : "Order via Uber Eats"}
        </a>
      </div>

      {/* Section Tabs */}
      <div className="sticky top-16 md:top-20 z-30 bg-white/95 backdrop-blur-sm border-b border-brand-border shadow-sm">
        <div className="max-w-6xl mx-auto px-4 overflow-x-auto">
          <div className="flex gap-1 py-3 min-w-max justify-start sm:justify-center">
            {tabs.map((t) => {
              const I = t.icon;
              return (
                <button key={t.id} onClick={() => setTab(t.id)} data-testid={`menu-tab-${t.id}`}
                  className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-body font-semibold whitespace-nowrap transition-colors ${
                    tab === t.id ? "bg-brand-orange text-white" : "text-brand-text hover:text-brand-orange hover:bg-brand-cream"}`}>
                  <I size={14} />
                  {lang === "fr" ? t.label_fr : t.label_en}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <section className="max-w-6xl mx-auto px-6 lg:px-8 py-12 lg:py-16">
        <div className="text-center mb-10">
          <span className="gold-divider mb-4 inline-block" />
          <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-black mb-2">
            {tab === "individual" && (lang === "fr" ? "Composez votre combo" : "Build Your Combo")}
            {tab === "family"     && (lang === "fr" ? "Repas familial pour 4" : "Family Meal for 4")}
            {tab === "drinks"     && (lang === "fr" ? "Boissons" : "Drinks")}
          </h2>
          <p className="font-body text-brand-text">
            {tab === "individual" && (lang === "fr" ? "Personnalisez votre repas en 4 étapes" : "Customize your meal in 4 steps")}
            {tab === "family"     && (lang === "fr" ? "Personnalisez un repas pour 4 personnes" : "Customize a meal that serves 4")}
            {tab === "drinks"     && (lang === "fr" ? "Rafraîchissements pour accompagner votre repas" : "Refreshments to pair with your meal")}
          </p>
        </div>

        {tab === "individual" && <IndividualBuilder />}
        {tab === "family"     && <FamilyBuilder />}
        {tab === "drinks"     && <DrinksMenu />}
      </section>
    </main>
  );
}

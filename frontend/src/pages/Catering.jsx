import { useState } from "react";
import { PartyPopper, Building2, Heart, Users, Phone, Check, ArrowRight } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import translations from "../translations";
import { useScrollRevealAll } from "../hooks/useScrollReveal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const EVENT_ICONS = [PartyPopper, Building2, Heart, Users];

export default function Catering() {
  const { lang } = useLanguage();
  const T = translations[lang];
  const C = T.cateringPage;
  const [form, setForm] = useState({ name: "", email: "", phone: "", event_date: "", event_type: "", guest_count: "", message: "" });
  const [status, setStatus] = useState(null);
  useScrollRevealAll();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const payload = {
        name: form.name,
        email: form.email,
        phone: form.phone || null,
        event_date: form.event_date || null,
        event_type: form.event_type || null,
        guest_count: form.guest_count ? parseInt(form.guest_count, 10) : null,
        message: form.message || null,
      };
      const res = await fetch(`${BACKEND_URL}/api/catering`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) { setStatus("success"); setForm({ name: "", email: "", phone: "", event_date: "", event_type: "", guest_count: "", message: "" }); }
      else setStatus("error");
    } catch { setStatus("error"); }
  };

  return (
    <main className="bg-brand-cream">
      {/* Hero */}
      <section
        className="relative pt-36 pb-24 flex items-center justify-center"
        style={{ backgroundImage: "url(https://images.pexels.com/photos/32568165/pexels-photo-32568165.jpeg?auto=compress&cs=tinysrgb&w=1920)", backgroundSize: "cover", backgroundPosition: "center" }}
      >
        <div className="absolute inset-0 bg-black/70" />
        <div className="relative z-10 text-center px-6">
          <span className="text-brand-gold text-xs font-body font-semibold tracking-[0.2em] uppercase block mb-3">{C.hero.overline}</span>
          <h1 data-testid="catering-title" className="font-heading text-5xl md:text-6xl font-bold text-white whitespace-pre-line leading-tight">{C.hero.title}</h1>
        </div>
      </section>

      {/* Intro */}
      <section className="py-24 lg:py-32">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="reveal-left">
              <span className="gold-divider mb-5" />
              <h2 className="font-heading text-4xl md:text-5xl font-bold text-brand-black whitespace-pre-line leading-tight mb-6">{C.intro.title}</h2>
              <p className="text-brand-text font-body text-base leading-relaxed mb-5">{C.intro.p1}</p>
              <p className="text-brand-text font-body text-base leading-relaxed mb-8">{C.intro.p2}</p>
              <div className="space-y-2.5">
                {T.catering.features.map((f, i) => (
                  <div key={i} className="flex items-center gap-3 font-body text-sm text-brand-text">
                    <div className="w-5 h-5 rounded-full bg-brand-green flex items-center justify-center flex-shrink-0">
                      <Check size={11} className="text-white" />
                    </div>
                    {f}
                  </div>
                ))}
              </div>
            </div>
            <div className="reveal-right">
              <div className="grid grid-cols-2 gap-4">
                {T.catering.events.map((ev, i) => {
                  const EvIcon = EVENT_ICONS[i] || Heart;
                  return (
                    <div
                      key={i}
                      data-testid={`catering-event-${i}`}
                      className="bg-white rounded-xl p-5 border border-brand-border hover:shadow-md transition-all duration-300 hover:border-brand-gold/40"
                    >
                      <div className="w-10 h-10 bg-brand-orange/10 rounded-lg flex items-center justify-center mb-3">
                        <EvIcon size={20} className="text-brand-orange" />
                      </div>
                      <h3 className="font-heading text-base font-semibold text-brand-black mb-1">{ev.title}</h3>
                      <p className="text-brand-text text-xs font-body leading-relaxed">{ev.desc}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Why Us */}
      <section className="py-16 bg-brand-cream-secondary">
        <div className="max-w-4xl mx-auto px-6 text-center reveal">
          <h2 className="font-heading text-3xl md:text-4xl font-bold text-brand-black mb-8">{C.whyUs.title}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {C.whyUs.items.map((item, i) => (
              <div key={i} className="flex items-center gap-3 bg-white rounded-xl p-4 border border-brand-border text-left">
                <div className="w-6 h-6 rounded-full bg-brand-green flex items-center justify-center flex-shrink-0">
                  <Check size={12} className="text-white" />
                </div>
                <span className="font-body text-sm text-brand-black font-medium">{item}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section className="py-24 lg:py-32 bg-brand-cream" id="catering-form">
        <div className="max-w-3xl mx-auto px-6">
          <div className="text-center mb-10 reveal">
            <h2 className="font-heading text-4xl font-bold text-brand-black mb-2">{C.contact.title}</h2>
            <p className="text-brand-text font-body">{C.contact.subtitle}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-brand-border p-8 reveal">
            <form onSubmit={handleSubmit} className="space-y-5" data-testid="catering-form">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-body font-medium text-brand-black mb-1.5">{T.contact.form.name} *</label>
                  <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} data-testid="catering-name" className="w-full border border-brand-border rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange" />
                </div>
                <div>
                  <label className="block text-sm font-body font-medium text-brand-black mb-1.5">{T.contact.form.email} *</label>
                  <input required type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} data-testid="catering-email" className="w-full border border-brand-border rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-body font-medium text-brand-black mb-1.5">{T.contact.form.phone}</label>
                  <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} data-testid="catering-phone" className="w-full border border-brand-border rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange" />
                </div>
                <div>
                  <label className="block text-sm font-body font-medium text-brand-black mb-1.5">{lang === "fr" ? "Type d'Événement" : "Event Type"}</label>
                  <select value={form.event_type} onChange={(e) => setForm({...form, event_type: e.target.value})} data-testid="catering-event-type" className="w-full border border-brand-border rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange bg-white">
                    <option value="">{lang === "fr" ? "Sélectionner..." : "Select..."}</option>
                    {T.catering.events.map((ev, i) => <option key={i} value={ev.title}>{ev.title}</option>)}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-body font-medium text-brand-black mb-1.5">{lang === "fr" ? "Date de l'Événement" : "Event Date"}</label>
                  <input type="date" value={form.event_date} onChange={(e) => setForm({...form, event_date: e.target.value})} data-testid="catering-event-date" className="w-full border border-brand-border rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange bg-white" />
                </div>
                <div>
                  <label className="block text-sm font-body font-medium text-brand-black mb-1.5">{lang === "fr" ? "Nombre d'Invités" : "Guest Count"}</label>
                  <input type="number" min="1" value={form.guest_count} onChange={(e) => setForm({...form, guest_count: e.target.value})} data-testid="catering-guest-count" placeholder={lang === "fr" ? "Ex: 25" : "e.g. 25"} className="w-full border border-brand-border rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange bg-white" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-body font-medium text-brand-black mb-1.5">{T.contact.form.message} *</label>
                <textarea required rows={5} value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} data-testid="catering-message" placeholder={lang === "fr" ? "Décrivez votre événement — nombre d'invités, date, lieu..." : "Describe your event — number of guests, date, venue..."} className="w-full border border-brand-border rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange resize-none" />
              </div>
              {status === "success" && <div data-testid="catering-success" className="bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 text-sm font-body">{T.contact.form.success}</div>}
              {status === "error" && <div data-testid="catering-error" className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 text-sm font-body">{T.contact.form.error}</div>}
              <button type="submit" disabled={status === "loading"} data-testid="catering-submit" className="w-full bg-brand-orange hover:bg-brand-orange-dark text-white font-body font-semibold py-3.5 rounded-lg transition-all duration-200 disabled:opacity-60">
                {status === "loading" ? "..." : T.catering.cta}
              </button>
            </form>
            <div className="mt-6 pt-6 border-t border-brand-border text-center">
              <p className="text-brand-text text-sm font-body mb-2">{lang === "fr" ? "Ou appelez-nous directement" : "Or call us directly"}</p>
              <a href="tel:+15145883708" className="inline-flex items-center gap-2 text-brand-green font-body font-semibold hover:underline">
                <Phone size={16} /> (514) 588-3708
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

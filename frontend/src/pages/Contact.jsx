import { useState } from "react";
import { MapPin, Phone, Clock, Send } from "lucide-react";import { useLanguage } from "../context/LanguageContext";
import translations from "../translations";
import { useScrollRevealAll } from "../hooks/useScrollReveal";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

export default function Contact() {
  const { lang } = useLanguage();
  const T = translations[lang];
  const F = T.contact.form;
  const [form, setForm] = useState({ name: "", email: "", phone: "", subject: "", message: "" });
  const [status, setStatus] = useState(null);
  useScrollRevealAll();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    try {
      const res = await fetch(`${BACKEND_URL}/api/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) { setStatus("success"); setForm({ name: "", email: "", phone: "", subject: "", message: "" }); }
      else setStatus("error");
    } catch { setStatus("error"); }
  };

  const today = new Date().toLocaleDateString(lang === "fr" ? "fr-CA" : "en-CA", { weekday: "long" }).toLowerCase();

  return (
    <main className="bg-brand-cream">
      {/* Hero */}
      <section className="relative pt-36 pb-20 bg-brand-black">
        <div className="relative z-10 text-center px-6">
          <span className="text-brand-gold text-xs font-body font-semibold tracking-[0.2em] uppercase block mb-3">{T.contact.overline}</span>
          <h1 data-testid="contact-title" className="font-heading text-5xl md:text-6xl font-bold text-white mb-3">{T.contact.title}</h1>
          <p className="text-white/60 font-body text-base max-w-lg mx-auto">{T.contact.subtitle}</p>
        </div>
      </section>

      {/* Info Cards */}
      <section className="py-12 bg-brand-cream-secondary">
        <div className="max-w-5xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[
              {
                icon: MapPin, iconColor: "text-brand-orange", bg: "bg-brand-orange/10",
                title: lang === "fr" ? "Adresse" : "Address",
                content: <p className="text-brand-text font-body text-sm whitespace-pre-line">{T.contact.address}</p>,
                testid: "contact-address",
              },
              {
                icon: Phone, iconColor: "text-brand-green", bg: "bg-brand-green/10",
                title: lang === "fr" ? "Téléphone" : "Phone",
                content: <a href="tel:+15145883708" className="text-brand-text font-body text-sm hover:text-brand-orange transition-colors font-semibold">{T.contact.phone}</a>,
                testid: "contact-phone",
              },
              {
                icon: Clock, iconColor: "text-brand-gold", bg: "bg-brand-gold/10",
                title: T.contact.hoursTitle,
                content: <p className="text-brand-text font-body text-xs">{lang === "fr" ? "Lun–Ven: 11h–21h • Sam: 11h–20h • Dim: 12h–19h" : "Mon–Fri: 11am–9pm • Sat: 11am–8pm • Sun: 12pm–7pm"}</p>,
                testid: "contact-hours-card",
              },
            ].map((card, i) => (
              <div key={i} data-testid={card.testid} className="reveal bg-white rounded-xl p-6 border border-brand-border shadow-sm flex gap-4 items-start">
                <div className={`w-10 h-10 ${card.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                  <card.icon size={18} className={card.iconColor} />
                </div>
                <div>
                  <p className="font-heading font-semibold text-brand-black text-sm mb-1">{card.title}</p>
                  {card.content}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Map + Form */}
      <section className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12">
            {/* Map */}
            <div className="space-y-6 reveal-left">
              <a
                href="https://www.google.com/maps/search/?api=1&query=Chala+le+gouter+antillais+11866+Boulevard+De+La+Rivi%C3%A8re-Des-Prairies+Montr%C3%A9al+QC+H1C+1P9"
                target="_blank"
                rel="noopener noreferrer"
                data-testid="google-map-link"
                className="block rounded-2xl overflow-hidden shadow-lg cursor-pointer"
                aria-label={lang === "fr" ? "Voir sur Google Maps" : "View on Google Maps"}
              >
                <iframe
                  title="Chala Le Goûter Antillais - Localisation"
                  src={`https://maps.google.com/maps?q=11866+Boulevard+De+La+Rivi%C3%A8re-Des-Prairies+Montr%C3%A9al+QC+H1C+1P9+Canada&output=embed&hl=${lang === "fr" ? "fr" : "en"}`}
                  width="100%"
                  className="block w-full h-[280px] md:h-[450px] border-0 pointer-events-none"
                  allowFullScreen=""
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  data-testid="google-map"
                />
              </a>
              {/* Full Hours Table */}
              <div className="bg-white rounded-xl border border-brand-border p-6 shadow-sm">
                <h3 className="font-heading text-lg font-semibold text-brand-black mb-4 flex items-center gap-2">
                  <Clock size={16} className="text-brand-gold" /> {T.contact.hoursTitle}
                </h3>
                <div className="space-y-2">
                  {T.contact.hours.map((h, i) => (
                    <div key={i} className="flex justify-between items-center py-1 border-b border-brand-border last:border-0">
                      <span className={`font-body text-sm ${i === 4 || i === 5 ? "font-semibold text-brand-orange" : "text-brand-text"}`}>{h.day}</span>
                      <span className="font-body text-sm font-medium text-brand-black">{h.hours}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="reveal-right">
              <h2 className="font-heading text-3xl font-bold text-brand-black mb-6">{F.title}</h2>
              <form onSubmit={handleSubmit} className="space-y-4" data-testid="contact-form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-body font-medium text-brand-black mb-1.5">{F.name} *</label>
                    <input required value={form.name} onChange={(e) => setForm({...form, name: e.target.value})} data-testid="contact-name-input" className="w-full border border-brand-border rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-body font-medium text-brand-black mb-1.5">{F.email} *</label>
                    <input required type="email" value={form.email} onChange={(e) => setForm({...form, email: e.target.value})} data-testid="contact-email-input" className="w-full border border-brand-border rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange bg-white" />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-body font-medium text-brand-black mb-1.5">{F.phone}</label>
                    <input value={form.phone} onChange={(e) => setForm({...form, phone: e.target.value})} data-testid="contact-phone-input" className="w-full border border-brand-border rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange bg-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-body font-medium text-brand-black mb-1.5">{F.subject} *</label>
                    <input required value={form.subject} onChange={(e) => setForm({...form, subject: e.target.value})} data-testid="contact-subject-input" className="w-full border border-brand-border rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange bg-white" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-body font-medium text-brand-black mb-1.5">{F.message} *</label>
                  <textarea required rows={5} value={form.message} onChange={(e) => setForm({...form, message: e.target.value})} data-testid="contact-message-input" className="w-full border border-brand-border rounded-lg px-4 py-3 font-body text-sm focus:outline-none focus:ring-2 focus:ring-brand-orange/30 focus:border-brand-orange resize-none bg-white" />
                </div>
                {status === "success" && (
                  <div data-testid="contact-success" className="bg-green-50 text-green-700 border border-green-200 rounded-lg p-3 text-sm font-body">{F.success}</div>
                )}
                {status === "error" && (
                  <div data-testid="contact-error" className="bg-red-50 text-red-600 border border-red-200 rounded-lg p-3 text-sm font-body">{F.error}</div>
                )}
                <button
                  type="submit"
                  disabled={status === "loading"}
                  data-testid="contact-submit-btn"
                  className="w-full flex items-center justify-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white font-body font-semibold py-3.5 rounded-lg transition-all duration-200 disabled:opacity-60"
                >
                  <Send size={16} /> {status === "loading" ? "..." : F.send}
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

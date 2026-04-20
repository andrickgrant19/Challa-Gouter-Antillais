import { Link } from "react-router-dom";
import { MapPin, Phone, Clock, ExternalLink } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import translations from "../translations";

export default function Footer() {
  const { lang } = useLanguage();
  const T = translations[lang];

  const navLinks = [
    { to: "/", label: T.nav.home },
    { to: "/menu", label: T.nav.menu },
    { to: "/about", label: T.nav.about },
    { to: "/catering", label: T.nav.catering },
    { to: "/reviews", label: T.nav.reviews },
    { to: "/contact", label: T.nav.contact },
  ];

  const hours = T.contact.hours;

  return (
    <footer data-testid="footer" className="bg-brand-black text-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 pb-12 border-b border-white/10">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="mb-4">
              <div className="font-heading font-bold text-2xl text-white">Chala</div>
              <div className="text-brand-gold font-heading text-sm tracking-[0.15em] uppercase">Le Gouter Antillais</div>
            </div>
            <p className="text-white/60 text-sm font-body leading-relaxed mb-5">
              {T.footer.tagline}
            </p>
            <a
              href="https://www.ubereats.com/ca-fr/store/chala-le-gouter-antillais/5PogqSjLWTKTUIYfVPvYPw"
              target="_blank"
              rel="noopener noreferrer"
              data-testid="footer-order-btn"
              className="inline-flex items-center gap-2 bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-semibold px-5 py-2.5 rounded-md transition-all"
            >
              {T.nav.orderOnline} <ExternalLink size={13} />
            </a>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-white mb-4">{T.footer.quickLinks}</h4>
            <ul className="space-y-2">
              {navLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className="text-white/60 hover:text-brand-gold text-sm font-body transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-white mb-4">{T.footer.contactUs}</h4>
            <div className="space-y-3 text-sm font-body text-white/60">
              <div className="flex gap-2.5">
                <MapPin size={15} className="text-brand-gold mt-0.5 flex-shrink-0" />
                <span className="whitespace-pre-line">{T.contact.address}</span>
              </div>
              <div className="flex gap-2.5">
                <Phone size={15} className="text-brand-gold mt-0.5 flex-shrink-0" />
                <a href="tel:+15145883708" className="hover:text-brand-gold transition-colors">{T.contact.phone}</a>
              </div>
            </div>
          </div>

          {/* Hours */}
          <div>
            <h4 className="font-heading text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock size={16} className="text-brand-gold" /> {T.footer.hours}
            </h4>
            <div className="space-y-1.5">
              {hours.slice(0, 7).map((h, i) => (
                <div key={i} className="flex justify-between text-xs font-body gap-3">
                  <span className="text-white/50">{h.day}</span>
                  <span className="text-white/80">{h.hours}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs font-body text-white/40">
          <p>{T.footer.copyright}</p>
          <p>Montreal, Québec, Canada</p>
        </div>
      </div>
    </footer>
  );
}

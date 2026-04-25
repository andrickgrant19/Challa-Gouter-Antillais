import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, Phone, ShoppingBag } from "lucide-react";
import { useLanguage } from "../context/LanguageContext";
import { useCart } from "../context/CartContext";
import { restaurantConfig } from "../restaurant.config";
import translations from "../translations";

export default function Navbar() {
  const { totalItems, openDrawer } = useCart();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { lang, switchLang } = useLanguage();
  const T = translations[lang];
  const location = useLocation();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setMobileOpen(false);
  }, [location]);

  const navLinks = [
    { to: "/", label: T.nav.home },
    { to: "/menu", label: T.nav.menu },
    { to: "/about", label: T.nav.about },
    { to: "/catering", label: T.nav.catering },
    { to: "/reviews", label: T.nav.reviews },
    { to: "/contact", label: T.nav.contact },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <>
      <nav
        data-testid="navbar"
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrolled || mobileOpen
            ? "bg-white/95 backdrop-blur-xl shadow-sm border-b border-brand-border"
            : "bg-transparent"
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 md:h-20">
            {/* Logo */}
            <Link to="/" data-testid="logo" className="flex flex-col leading-none">
              <span className={`font-heading font-bold text-xl md:text-2xl tracking-tight ${scrolled || mobileOpen ? "text-brand-black" : "text-white"}`}>
                Chala
              </span>
              <span className="text-brand-gold font-heading text-xs md:text-sm tracking-[0.15em] uppercase font-medium">
                Le Gouter Antillais
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center gap-6">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  data-testid={`nav-${link.to.replace("/", "") || "home"}`}
                  className={`font-body text-sm font-medium transition-colors duration-200 relative group ${
                    isActive(link.to)
                      ? "text-brand-orange"
                      : scrolled
                      ? "text-brand-black hover:text-brand-orange"
                      : "text-white/90 hover:text-white"
                  }`}
                >
                  {link.label}
                  <span className={`absolute -bottom-1 left-0 h-0.5 bg-brand-orange transition-all duration-200 ${isActive(link.to) ? "w-full" : "w-0 group-hover:w-full"}`} />
                </Link>
              ))}
            </div>

            {/* Right: Lang + CTA */}
            <div className="hidden lg:flex items-center gap-3">
              {/* Language Switcher */}
              <div data-testid="lang-switcher" className="flex items-center border border-brand-gold/40 rounded-md overflow-hidden">
                <button
                  onClick={() => switchLang("fr")}
                  data-testid="lang-fr"
                  className={`px-3 py-1.5 text-xs font-body font-semibold transition-all ${lang === "fr" ? "bg-brand-gold text-white" : scrolled ? "text-brand-text hover:bg-brand-gold/10" : "text-white/80 hover:text-white"}`}
                >
                  FR
                </button>
                <button
                  onClick={() => switchLang("en")}
                  data-testid="lang-en"
                  className={`px-3 py-1.5 text-xs font-body font-semibold transition-all ${lang === "en" ? "bg-brand-gold text-white" : scrolled ? "text-brand-text hover:bg-brand-gold/10" : "text-white/80 hover:text-white"}`}
                >
                  EN
                </button>
              </div>
              <button
                onClick={openDrawer}
                data-testid="navbar-cart-btn"
                className={`relative p-2 rounded-md transition-colors ${scrolled || mobileOpen ? "text-brand-black hover:text-brand-orange hover:bg-brand-cream" : "text-white/90 hover:text-white"}`}
                aria-label="Open cart"
              >
                <ShoppingBag size={18} />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 bg-brand-orange text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {totalItems}
                  </span>
                )}
              </button>
              <a
                href={restaurantConfig.uberEatsUrl}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="cta-order-nav"
                className="bg-brand-orange hover:bg-brand-orange-dark text-white text-sm font-body font-semibold px-5 py-2 rounded-md transition-all duration-200 -translate-y-0 hover:-translate-y-0.5 shadow-sm"
              >
                {T.nav.orderOnline}
              </a>
            </div>

            {/* Mobile: Lang switcher + cart + hamburger */}
            <div className="flex lg:hidden items-center gap-2">
              <div data-testid="lang-switcher-mobile" className="flex items-center border border-brand-gold/40 rounded overflow-hidden">
                <button onClick={() => switchLang("fr")} data-testid="lang-fr-mobile" className={`px-2.5 py-1 text-xs font-semibold ${lang === "fr" ? "bg-brand-gold text-white" : scrolled ? "text-brand-text" : "text-white/80"}`}>FR</button>
                <button onClick={() => switchLang("en")} data-testid="lang-en-mobile" className={`px-2.5 py-1 text-xs font-semibold ${lang === "en" ? "bg-brand-gold text-white" : scrolled ? "text-brand-text" : "text-white/80"}`}>EN</button>
              </div>
              <button
                onClick={openDrawer}
                data-testid="navbar-cart-btn-mobile"
                className={`relative p-2 rounded-md ${scrolled || mobileOpen ? "text-brand-black" : "text-white"}`}
                aria-label="Open cart"
              >
                <ShoppingBag size={20} />
                {totalItems > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-brand-orange text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                    {totalItems}
                  </span>
                )}
              </button>
              <button
                onClick={() => setMobileOpen(!mobileOpen)}
                data-testid="mobile-menu-toggle"
                className={`p-2 rounded-md ${scrolled || mobileOpen ? "text-brand-black" : "text-white"}`}
              >
                {mobileOpen ? <X size={22} /> : <Menu size={22} />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div data-testid="mobile-menu" className="lg:hidden bg-white border-t border-brand-border">
            <div className="px-4 py-4 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`block py-3 px-3 font-body text-base font-medium rounded-md transition-colors ${isActive(link.to) ? "text-brand-orange bg-brand-cream" : "text-brand-black hover:text-brand-orange hover:bg-brand-cream"}`}
                >
                  {link.label}
                </Link>
              ))}
              <a
                href={restaurantConfig.uberEatsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block mt-3 bg-brand-orange text-white text-center py-3 rounded-md font-semibold font-body"
              >
                {T.nav.orderOnline}
              </a>
              <a
                href={`tel:${restaurantConfig.phone.replace(/[^0-9+]/g, "")}`}
                className="flex items-center justify-center gap-2 mt-2 border border-brand-green text-brand-green py-3 rounded-md font-semibold font-body"
              >
                <Phone size={16} /> {restaurantConfig.phone}
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Mobile floating call button */}
      <a
        href={`tel:${restaurantConfig.phone.replace(/[^0-9+]/g, "")}`}
        data-testid="mobile-call-btn"
        className="lg:hidden fixed bottom-6 right-6 z-40 bg-brand-green text-white p-4 rounded-full shadow-lg hover:bg-green-800 transition-all duration-200 hover:scale-110"
        aria-label="Call us"
      >
        <Phone size={22} />
      </a>
    </>
  );
}

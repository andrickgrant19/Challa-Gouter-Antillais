import { createContext, useContext, useState, useEffect } from "react";

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem("lang") || "fr";
  });

  const toggleLang = () => {
    const newLang = lang === "en" ? "fr" : "en";
    setLang(newLang);
    localStorage.setItem("lang", newLang);
  };

  const switchLang = (l) => {
    setLang(l);
    localStorage.setItem("lang", l);
  };

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, toggleLang, switchLang }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

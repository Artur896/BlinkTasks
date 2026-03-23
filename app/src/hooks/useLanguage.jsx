import { useState, useCallback, createContext, useContext } from "react";
import { translations } from "../i18n.js";

// ─── Context ──────────────────────────────────────────────────
export const LanguageContext = createContext(null);

// ─── Detectar idioma inicial ──────────────────────────────────
function detectLanguage() {
  const saved = localStorage.getItem("blinktasks_lang");
  if (saved === "es" || saved === "en") return saved;
  const browser = navigator.language?.slice(0, 2).toLowerCase();
  return browser === "es" ? "es" : "en";
}

// ─── Provider — envuelve toda la app ─────────────────────────
export function LanguageProvider({ children }) {
  const [lang, setLangState] = useState(detectLanguage);

  const setLang = useCallback((l) => {
    setLangState(l);
    localStorage.setItem("blinktasks_lang", l);
  }, []);

  const t = useCallback((key) => {
    return translations[lang]?.[key] ?? translations["en"][key] ?? key;
  }, [lang]);

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

// ─── Hook para consumir en cualquier componente ───────────────
export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage must be used inside LanguageProvider");
  return ctx;
}
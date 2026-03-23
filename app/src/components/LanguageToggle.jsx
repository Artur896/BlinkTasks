import { useLanguage } from "../hooks/useLanguage.jsx";

export function LanguageToggle() {
  const { lang, setLang } = useLanguage();

  return (
    <div style={s.wrapper}>
      <button
        onClick={() => setLang("es")}
        style={{ ...s.btn, ...(lang === "es" ? s.active : {}) }}>
        ES
      </button>
      <span style={s.divider}>|</span>
      <button
        onClick={() => setLang("en")}
        style={{ ...s.btn, ...(lang === "en" ? s.active : {}) }}>
        EN
      </button>
    </div>
  );
}

const s = {
  wrapper: { display: "flex", alignItems: "center", gap: 2, background: "#1c1c27", border: "1px solid #2a2a3d", borderRadius: 8, padding: "4px 8px" },
  btn:     { background: "none", color: "#6b6b8a", fontSize: 12, fontFamily: "'DM Mono', monospace", fontWeight: 500, padding: "2px 4px", borderRadius: 4, cursor: "pointer", letterSpacing: "0.05em" },
  active:  { color: "#a78bfa", fontWeight: 700 },
  divider: { color: "#2a2a3d", fontSize: 12, userSelect: "none" },
};
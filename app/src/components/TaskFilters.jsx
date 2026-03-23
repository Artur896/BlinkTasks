import { useLanguage } from "../hooks/useLanguage.jsx";
import { useBreakpoint } from "../hooks/useBreakpoint.js";

export function TaskFilters({ search, setSearch, filterCat, setFilterCat, filterStatus, setFilterStatus, categories }) {
  const { t }        = useLanguage();
  const { isMobile } = useBreakpoint();

  const statuses = [
    { key: "",           label: t("allStatuses")      },
    { key: "open",       label: t("statusOpen")       },
    { key: "inProgress", label: t("statusInProgress") },
    { key: "submitted",  label: t("statusSubmitted")  },
    { key: "disputed",   label: t("statusDisputed")   },
    { key: "paid",       label: t("statusPaid")       },
  ];

  return (
    <div style={s.wrapper}>
      <div className="search-box" style={s.searchBox}>
        <SearchIcon />
        <input style={s.searchInput} value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder={t("searchPlaceholder")} />
        {search && <button onClick={() => setSearch("")} style={s.clearBtn}>✕</button>}
      </div>

      <div style={s.pillsWrapper}>
        <div style={s.pills}>
          {statuses.map(st => (
            <button key={st.key} onClick={() => setFilterStatus(st.key)}
              className={`pill-btn ${filterStatus === st.key ? "pill-active" : ""}`}
              style={{ ...s.pill, ...(filterStatus === st.key ? s.pillActive : {}) }}>
              {st.label}
            </button>
          ))}
          {!isMobile && categories.length > 0 && (
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={s.select}>
              <option value="">{t("allCategories")}</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>
      </div>

      {isMobile && categories.length > 0 && (
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          style={{ ...s.select, width: "100%" }}>
          <option value="">{t("allCategories")}</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--muted)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

const s = {
  wrapper:      { display: "flex", flexDirection: "column", gap: 10 },
  searchBox:    { display: "flex", alignItems: "center", gap: 8, background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 14px" },
  searchInput:  { flex: 1, background: "none", border: "none", outline: "none", color: "var(--text)", fontSize: 14, fontFamily: "'DM Mono', monospace", minWidth: 0 },
  clearBtn:     { background: "none", color: "var(--subtle)", fontSize: 13, cursor: "pointer", flexShrink: 0 },
  pillsWrapper: { overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none" },
  pills:        { display: "flex", gap: 6, paddingBottom: 2, minWidth: "max-content" },
  pill:         { padding: "7px 14px", borderRadius: 999, background: "var(--surface)", color: "var(--muted)", border: "1px solid var(--border)", fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer", whiteSpace: "nowrap", minHeight: 36 },
  pillActive:   { background: "rgba(124,109,255,0.18)", color: "var(--accent2)", borderColor: "rgba(124,109,255,0.5)" },
  select:       { padding: "9px 12px", background: "var(--surface)", border: "1px solid var(--border)", borderRadius: 10, color: "var(--muted)", fontSize: 13, fontFamily: "'DM Mono', monospace", outline: "none", cursor: "pointer", minHeight: 40 },
};
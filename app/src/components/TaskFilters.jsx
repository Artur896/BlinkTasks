import { useBreakpoint } from "../hooks/useBreakpoint.js";

const STATUSES = [
  { key: "",           label: "Todos"       },
  { key: "open",       label: "Disponibles" },
  { key: "inProgress", label: "En progreso" },
  { key: "submitted",  label: "Por revisar" },
  { key: "disputed",   label: "Disputados"  },
  { key: "paid",       label: "Pagados"     },
];

export function TaskFilters({ search, setSearch, filterCat, setFilterCat, filterStatus, setFilterStatus, categories }) {
  const { isMobile } = useBreakpoint();

  return (
    <div style={s.wrapper}>
      {/* Search */}
      <div style={s.searchBox}>
        <SearchIcon />
        <input
          style={s.searchInput}
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Buscar tareas..."
        />
        {search && (
          <button onClick={() => setSearch("")} style={s.clearBtn}>✕</button>
        )}
      </div>

      {/* Status pills — scroll horizontal en mobile */}
      <div style={s.pillsWrapper}>
        <div style={s.pills}>
          {STATUSES.map(st => (
            <button key={st.key} onClick={() => setFilterStatus(st.key)}
              style={{ ...s.pill, ...(filterStatus === st.key ? s.pillActive : {}) }}>
              {st.label}
            </button>
          ))}

          {/* Category inline en desktop, separado en mobile */}
          {!isMobile && categories.length > 0 && (
            <select value={filterCat} onChange={e => setFilterCat(e.target.value)} style={s.select}>
              <option value="">Todas las categorías</option>
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          )}
        </div>
      </div>

      {/* Category select separado en mobile */}
      {isMobile && categories.length > 0 && (
        <select value={filterCat} onChange={e => setFilterCat(e.target.value)}
          style={{ ...s.select, width: "100%" }}>
          <option value="">Todas las categorías</option>
          {categories.map(c => <option key={c} value={c}>{c}</option>)}
        </select>
      )}
    </div>
  );
}

function SearchIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#6b6b8a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
    </svg>
  );
}

const s = {
  wrapper:      { display: "flex", flexDirection: "column", gap: 10 },
  searchBox:    { display: "flex", alignItems: "center", gap: 8, background: "#13131a", border: "1px solid #2a2a3d", borderRadius: 10, padding: "10px 14px" },
  searchInput:  { flex: 1, background: "none", border: "none", outline: "none", color: "#f0f0fa", fontSize: 14, fontFamily: "'DM Mono', monospace", minWidth: 0 },
  clearBtn:     { background: "none", color: "#3a3a55", fontSize: 13, cursor: "pointer", flexShrink: 0 },
  pillsWrapper: { overflowX: "auto", WebkitOverflowScrolling: "touch", scrollbarWidth: "none", msOverflowStyle: "none" },
  pills:        { display: "flex", gap: 6, paddingBottom: 2, minWidth: "max-content" },
  pill:         { padding: "7px 14px", borderRadius: 999, background: "#13131a", color: "#6b6b8a", border: "1px solid #2a2a3d", fontSize: 12, fontFamily: "'DM Mono', monospace", cursor: "pointer", whiteSpace: "nowrap", minHeight: 36 },
  pillActive:   { background: "#7c6dff22", color: "#a78bfa", borderColor: "#7c6dff55" },
  select:       { padding: "9px 12px", background: "#13131a", border: "1px solid #2a2a3d", borderRadius: 10, color: "#6b6b8a", fontSize: 13, fontFamily: "'DM Mono', monospace", outline: "none", cursor: "pointer", minHeight: 40 },
};
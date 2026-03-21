import { TaskCard } from "./TaskCard.jsx";

export function TaskList({ tasks, loading, onAccept, onSubmitDelivery, onApprove, onReportError, onCancel }) {
  if (loading) {
    return (
      <div style={s.center}>
        <div style={s.spinner} />
        <span style={{ color: "#3a3a55", fontSize: 13 }}>Cargando tareas...</span>
      </div>
    );
  }
  if (tasks.length === 0) {
    return (
      <div style={s.empty}>
        <span style={s.emptyIcon}>◎</span>
        <p style={s.emptyText}>No hay tareas todavía</p>
        <p style={s.emptyHint}>Crea la primera para empezar</p>
      </div>
    );
  }
  return (
    <div style={s.grid}>
      {tasks.map(t => (
        <TaskCard key={t.publicKey.toString()} task={t}
          onAccept={onAccept}
          onSubmitDelivery={onSubmitDelivery}
          onApprove={onApprove}
          onReportError={onReportError}
          onCancel={onCancel}
        />
      ))}
    </div>
  );
}

const s = {
  grid:      { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: 16 },
  center:    { display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "60px 0" },
  spinner:   { width: 32, height: 32, border: "2px solid #2a2a3d", borderTopColor: "#7c6dff", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  empty:     { display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "60px 0" },
  emptyIcon: { fontSize: 40, color: "#2a2a3d" },
  emptyText: { color: "#6b6b8a", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16 },
  emptyHint: { color: "#3a3a55", fontSize: 12 },
};
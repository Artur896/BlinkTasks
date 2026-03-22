import { TaskCard } from "./TaskCard.jsx";

export function TaskList({ tasks, loading, onAccept, onSubmitDelivery, onApprove, onReportError, onCancel, resolveUsername, onProfileClick }) {
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
        <span style={{ fontSize: 36, color: "#2a2a3d" }}>◎</span>
        <p style={{ color: "#6b6b8a", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16 }}>Sin resultados</p>
        <p style={{ color: "#3a3a55", fontSize: 12 }}>Intenta cambiar los filtros o la búsqueda</p>
      </div>
    );
  }
  return (
    <>
      {tasks.map(t => (
        <TaskCard key={t.publicKey.toString()} task={t}
          onAccept={onAccept}
          onSubmitDelivery={onSubmitDelivery}
          onApprove={onApprove}
          onReportError={onReportError}
          onCancel={onCancel}
          resolveUsername={resolveUsername}
          onProfileClick={onProfileClick}
        />
      ))}
    </>
  );
}

const s = {
  center: { display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "60px 0", gridColumn: "1 / -1" },
  empty:  { display: "flex", flexDirection: "column", alignItems: "center", gap: 8,  padding: "60px 0", gridColumn: "1 / -1" },
  spinner:{ width: 32, height: 32, border: "2px solid #2a2a3d", borderTopColor: "#7c6dff", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
};
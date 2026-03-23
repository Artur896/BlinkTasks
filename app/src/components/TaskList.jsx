import { useLanguage } from "../hooks/useLanguage.jsx";
import { TaskCard } from "./TaskCard.jsx";

export function TaskList({ tasks, loading, hasMore, onLoadMore, onAccept, onSubmitDelivery, onApprove, onReportError, onCancel, getUsername, onProfileClick }) {
  const { t } = useLanguage();

  if (loading) {
    return (
      <>
        {[0,1,2,3,4,5].map(i => (
          <div key={i} className="skeleton" style={{ height: 200, animationDelay: `${i * 0.1}s` }} />
        ))}
      </>
    );
  }
  if (tasks.length === 0) {
    return (
      <div style={s.empty}>
        <span style={{ fontSize: 36, color: "#2a2a3d" }}>◎</span>
        <p style={{ color: "#6b6b8a", fontFamily: "'Syne', sans-serif", fontWeight: 700, fontSize: 16 }}>{t("noResults")}</p>
        <p style={{ color: "#3a3a55", fontSize: 12 }}>{t("noResultsHint")}</p>
      </div>
    );
  }

  return (
    <>
      {tasks.map((t, i) => (
        <TaskCard key={t.publicKey.toString()} task={t} index={i}
          onAccept={onAccept}
          onSubmitDelivery={onSubmitDelivery}
          onApprove={onApprove}
          onReportError={onReportError}
          onCancel={onCancel}
          getUsername={getUsername}
          onProfileClick={onProfileClick}
        />
      ))}

      {/* Load more button — span full grid width */}
      {hasMore && (
        <div style={s.loadMore}>
          <button onClick={onLoadMore} style={s.loadMoreBtn}>
            {t("loadMore")}
          </button>
        </div>
      )}
    </>
  );
}

const s = {
  center:      { display: "flex", flexDirection: "column", alignItems: "center", gap: 16, padding: "60px 0", gridColumn: "1 / -1" },
  empty:       { display: "flex", flexDirection: "column", alignItems: "center", gap: 8,  padding: "60px 0", gridColumn: "1 / -1" },
  spinner:     { width: 32, height: 32, border: "2px solid #2a2a3d", borderTopColor: "#7c6dff", borderRadius: "50%", animation: "spin 0.8s linear infinite" },
  loadMore:    { gridColumn: "1 / -1", display: "flex", justifyContent: "center", paddingTop: 8 },
  loadMoreBtn: { padding: "10px 32px", borderRadius: 10, background: "#1c1c27", color: "#6b6b8a", border: "1px solid #2a2a3d", fontSize: 13, fontFamily: "'DM Mono', monospace", cursor: "pointer" },
};
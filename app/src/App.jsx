import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useProfile }            from "./hooks/useProfile.js";
import { useTasks }              from "./hooks/useTasks.js";
import { useProfiles }           from "./hooks/useProfiles.js";
import { useNotifications }      from "./hooks/useNotifications.js";
import { useBreakpoint }         from "./hooks/useBreakpoint.js";
import { ProfileBadge }          from "./components/ProfileBadge.jsx";
import { ProfileModal }          from "./components/ProfileModal.jsx";
import { PublicProfileModal }    from "./components/PublicProfileModal.jsx";
import { TaskList }              from "./components/TaskList.jsx";
import { TaskFilters }           from "./components/TaskFilters.jsx";
import { CreateTaskModal }       from "./components/CreateTaskModal.jsx";
import { NotificationBell }      from "./components/NotificationBell.jsx";
import "./styles/globals.css";

export default function App() {
  const { connected, publicKey } = useWallet();
  const { isMobile, isTouch }    = useBreakpoint();

  const { profile, loading: profileLoading, checking, initProfile, updateProfile, checkProfile } = useProfile();
  const {
    tasks, creating, loadingTasks,
    search, setSearch, filterCat, setFilterCat, filterStatus, setFilterStatus,
    categories, getTasks, createTask, acceptTask, submitDelivery,
    approveAndPay, reportError, cancelTask,
  } = useTasks(profile, checkProfile);

  const { resolveUsername, resolveMany } = useProfiles();
  const { notifications, unread, markAllRead } = useNotifications(publicKey?.toString());

  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showEditProfile,   setShowEditProfile]   = useState(false);
  const [showCreateTask,    setShowCreateTask]    = useState(false);
  const [viewingProfile,    setViewingProfile]    = useState(null);

  useEffect(() => {
    if (tasks.length === 0) return;
    const pubkeys = tasks.flatMap(t => [t.account.creator.toString(), t.account.worker.toString()]);
    resolveMany(pubkeys);
  }, [tasks]);

  return (
    <div style={s.root}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes slideUp { from { transform:translateY(100%); opacity:0; } to { transform:translateY(0); opacity:1; } }
        .fade { animation: fadeUp 0.35s ease forwards; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
        select option { background: #13131a; }
        /* Hide scrollbar for pills */
        .pills-scroll::-webkit-scrollbar { display: none; }
      `}</style>

      {/* ── HEADER ── */}
      <header style={s.header(isMobile)}>
        <div style={s.logo(isMobile)}>
          <span style={s.logoDot} />
          {!isMobile ? "BlinkTasks" : "BT"}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 8 : 12 }}>
          {connected && (
            <NotificationBell notifications={notifications} unread={unread} onMarkRead={markAllRead} />
          )}
          <WalletMultiButton />
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={s.main(isMobile)} className="fade">

        {/* Hero — oculto en mobile si hay wallet conectada */}
        {(!isMobile || !connected) && (
          <section style={s.hero(isMobile)}>
            <h1 style={s.heroTitle(isMobile)}>
              Trabajo freelance<br />
              <span style={s.heroAccent}>sin intermediarios.</span>
            </h1>
            {!isMobile && (
              <p style={s.heroSub}>
                Escrow on-chain en Solana — el pago se bloquea al crear la tarea
                y se libera cuando el cliente aprueba la entrega.
              </p>
            )}
          </section>
        )}

        {/* Profile bar */}
        <ProfileBadge
          profile={profile}
          loading={profileLoading}
          checking={checking}
          onCreateClick={() => setShowCreateProfile(true)}
          onEditClick={() => setShowEditProfile(true)}
        />

        {/* Actions */}
        <div style={s.topActions(isMobile)}>
          {!isMobile && (
            <button onClick={getTasks} disabled={!connected} style={s.btnSecondary}>
              Actualizar
            </button>
          )}
          <button
            onClick={() => setShowCreateTask(true)}
            disabled={!connected || !profile}
            style={{ ...s.btnPrimary, flex: isMobile ? 1 : "initial" }}>
            + Nueva tarea
          </button>
          {isMobile && (
            <button onClick={getTasks} disabled={!connected} style={{ ...s.btnSecondary, flex: 1 }}>
              Actualizar
            </button>
          )}
        </div>

        {/* Filters */}
        {connected && (
          <TaskFilters
            search={search}             setSearch={setSearch}
            filterCat={filterCat}       setFilterCat={setFilterCat}
            filterStatus={filterStatus} setFilterStatus={setFilterStatus}
            categories={categories}
          />
        )}

        {/* Divider */}
        <div style={s.divider}>
          <span style={s.dividerLine} />
          <span style={s.dividerLabel}>
            {tasks.length > 0 ? `${tasks.length} tarea${tasks.length !== 1 ? "s" : ""}` : "sin resultados"}
          </span>
          <span style={s.dividerLine} />
        </div>

        {/* Task list */}
        <div className="task-grid">
          <TaskList
            tasks={tasks}
            loading={loadingTasks}
            onAccept={acceptTask}
            onSubmitDelivery={submitDelivery}
            onApprove={approveAndPay}
            onReportError={reportError}
            onCancel={cancelTask}
            resolveUsername={resolveUsername}
            onProfileClick={setViewingProfile}
          />
        </div>
      </main>

      {/* ── MODALS ── */}
      {showCreateProfile && (
        <ProfileModal onClose={() => setShowCreateProfile(false)} onSave={initProfile} loading={profileLoading} />
      )}
      {showEditProfile && (
        <ProfileModal existing={profile} onClose={() => setShowEditProfile(false)} onSave={updateProfile} loading={profileLoading} />
      )}
      {showCreateTask && (
        <CreateTaskModal onClose={() => setShowCreateTask(false)} onCreate={createTask} creating={creating} />
      )}
      {viewingProfile && (
        <PublicProfileModal pubkey={viewingProfile} onClose={() => setViewingProfile(null)} />
      )}
    </div>
  );
}

const s = {
  root:      { minHeight: "100vh", background: "#0a0a0f" },

  header: (isMobile) => ({
    display: "flex", justifyContent: "space-between", alignItems: "center",
    padding: isMobile ? "12px 16px" : "20px 40px",
    borderBottom: "1px solid #2a2a3d",
    position: "sticky", top: 0,
    background: "#0a0a0fee",
    backdropFilter: "blur(12px)",
    zIndex: 50,
  }),

  logo: (isMobile) => ({
    display: "flex", alignItems: "center", gap: 10,
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: isMobile ? 18 : 20,
    color: "#f0f0fa",
    letterSpacing: "-0.02em",
  }),

  logoDot: { width: 10, height: 10, borderRadius: "50%", background: "#7c6dff", boxShadow: "0 0 12px #7c6dff" },

  main: (isMobile) => ({
    maxWidth: 960,
    margin: "0 auto",
    padding: isMobile ? "20px 16px 80px" : "48px 24px 80px",
    display: "flex",
    flexDirection: "column",
    gap: isMobile ? 16 : 24,
  }),

  hero: (isMobile) => ({
    display: "flex", flexDirection: "column",
    gap: isMobile ? 8 : 12,
  }),

  heroTitle: (isMobile) => ({
    fontFamily: "'Syne', sans-serif",
    fontWeight: 800,
    fontSize: isMobile ? "28px" : "clamp(32px, 5vw, 54px)",
    color: "#f0f0fa",
    lineHeight: 1.1,
    letterSpacing: "-0.03em",
  }),

  heroAccent: { background: "linear-gradient(135deg, #7c6dff, #22d3a5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },

  heroSub: { color: "#6b6b8a", fontSize: 14, lineHeight: 1.8, fontFamily: "'DM Mono', monospace", maxWidth: 500 },

  topActions: (isMobile) => ({
    display: "flex",
    gap: 10,
    justifyContent: isMobile ? "stretch" : "flex-end",
  }),

  btnSecondary: { padding: "10px 18px", borderRadius: 10, background: "#1c1c27", color: "#6b6b8a", border: "1px solid #2a2a3d", fontSize: 13, fontFamily: "'DM Mono', monospace", cursor: "pointer" },
  btnPrimary:   { padding: "10px 20px", borderRadius: 10, background: "linear-gradient(135deg, #7c6dff, #a78bfa)", color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: "'Syne', sans-serif", cursor: "pointer" },

  divider:      { display: "flex", alignItems: "center", gap: 14 },
  dividerLine:  { flex: 1, height: 1, background: "#1c1c27" },
  dividerLabel: { fontSize: 11, color: "#3a3a55", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" },
};
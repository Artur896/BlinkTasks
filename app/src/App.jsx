import { useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useProfile } from "./hooks/useProfile.js";
import { useTasks }   from "./hooks/useTasks.js";
import { ProfileBadge }     from "./components/ProfileBadge.jsx";
import { ProfileModal }     from "./components/ProfileModal.jsx";
import { TaskList }         from "./components/TaskList.jsx";
import { CreateTaskModal }  from "./components/CreateTaskModal.jsx";
import "./styles/globals.css";

export default function App() {
  const { connected } = useWallet();
  const { profile, loading: profileLoading, checking, initProfile, updateProfile, checkProfile } = useProfile();
  const { tasks, creating, loadingTasks, getTasks, createTask, acceptTask, submitDelivery, approveAndPay, reportError, cancelTask } = useTasks(profile, checkProfile);

  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showEditProfile,   setShowEditProfile]   = useState(false);
  const [showCreateTask,    setShowCreateTask]    = useState(false);

  return (
    <div style={s.root}>
      <style>{`
        @keyframes spin    { to { transform: rotate(360deg); } }
        @keyframes fadeUp  { from { opacity:0; transform:translateY(14px); } to { opacity:1; transform:translateY(0); } }
        .fade { animation: fadeUp 0.35s ease forwards; }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
      `}</style>

      {/* Header */}
      <header style={s.header}>
        <div style={s.logo}>
          <span style={s.logoDot} />
          BlinkTasks
        </div>
        <WalletMultiButton />
      </header>

      <main style={s.main} className="fade">
        {/* Hero */}
        <section style={s.hero}>
          <h1 style={s.heroTitle}>
            Trabajo freelance<br />
            <span style={s.heroAccent}>sin intermediarios.</span>
          </h1>
          <p style={s.heroSub}>
            Escrow on-chain en Solana. El pago se bloquea al crear la tarea<br />
            y se libera solo cuando el cliente aprueba la entrega.
          </p>
        </section>

        {/* Profile bar */}
        <ProfileBadge
          profile={profile}
          loading={profileLoading}
          checking={checking}
          onCreateClick={() => setShowCreateProfile(true)}
          onEditClick={()   => setShowEditProfile(true)}
        />

        {/* Controls */}
        <div style={s.controls}>
          <div style={s.actions}>
            <button onClick={getTasks} disabled={!connected} style={s.btnSecondary}>
              Actualizar
            </button>
            <button onClick={() => setShowCreateTask(true)} disabled={!connected || !profile} style={s.btnPrimary}>
              + Nueva tarea
            </button>
          </div>
          <div style={s.divider}>
            <span style={s.dividerLine} />
            <span style={s.dividerLabel}>
              {tasks.length > 0 ? `${tasks.length} tarea${tasks.length !== 1 ? "s" : ""}` : "sin tareas"}
            </span>
            <span style={s.dividerLine} />
          </div>
        </div>

        {/* Task list */}
        <TaskList
          tasks={tasks}
          loading={loadingTasks}
          onAccept={acceptTask}
          onSubmitDelivery={submitDelivery}
          onApprove={approveAndPay}
          onReportError={reportError}
          onCancel={cancelTask}
        />
      </main>

      {/* Modals */}
      {showCreateProfile && (
        <ProfileModal
          onClose={() => setShowCreateProfile(false)}
          onSave={initProfile}
          loading={profileLoading}
        />
      )}
      {showEditProfile && (
        <ProfileModal
          existing={profile}
          onClose={() => setShowEditProfile(false)}
          onSave={updateProfile}
          loading={profileLoading}
        />
      )}
      {showCreateTask && (
        <CreateTaskModal
          onClose={() => setShowCreateTask(false)}
          onCreate={createTask}
          creating={creating}
        />
      )}
    </div>
  );
}

const s = {
  root: { minHeight: "100vh", background: "#0a0a0f" },
  header: { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", borderBottom: "1px solid #2a2a3d", position: "sticky", top: 0, background: "#0a0a0fee", backdropFilter: "blur(12px)", zIndex: 50 },
  logo:   { display: "flex", alignItems: "center", gap: 10, fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: 20, color: "#f0f0fa", letterSpacing: "-0.02em" },
  logoDot:{ width: 10, height: 10, borderRadius: "50%", background: "#7c6dff", boxShadow: "0 0 12px #7c6dff" },
  main:   { maxWidth: 960, margin: "0 auto", padding: "48px 24px 80px", display: "flex", flexDirection: "column", gap: 28 },
  hero:   { display: "flex", flexDirection: "column", gap: 12 },
  heroTitle: { fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: "clamp(32px, 5vw, 56px)", color: "#f0f0fa", lineHeight: 1.1, letterSpacing: "-0.03em" },
  heroAccent:{ background: "linear-gradient(135deg, #7c6dff, #22d3a5)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
  heroSub:   { color: "#6b6b8a", fontSize: 14, lineHeight: 1.8, fontFamily: "'DM Mono', monospace" },
  controls:  { display: "flex", flexDirection: "column", gap: 16 },
  actions:   { display: "flex", gap: 10, justifyContent: "flex-end" },
  btnSecondary: { padding: "9px 18px", borderRadius: 10, background: "#1c1c27", color: "#6b6b8a", border: "1px solid #2a2a3d", fontSize: 13, fontFamily: "'DM Mono', monospace", cursor: "pointer" },
  btnPrimary:   { padding: "9px 20px", borderRadius: 10, background: "linear-gradient(135deg, #7c6dff, #a78bfa)", color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: "'Syne', sans-serif", cursor: "pointer" },
  divider:      { display: "flex", alignItems: "center", gap: 14 },
  dividerLine:  { flex: 1, height: 1, background: "#1c1c27" },
  dividerLabel: { fontSize: 11, color: "#3a3a55", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" },
};
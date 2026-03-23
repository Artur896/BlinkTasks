import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { useProfile }          from "./hooks/useProfile.js";
import { useTasks }            from "./hooks/useTasks.js";
import { useProfiles }         from "./hooks/useProfiles.js";
import { useNotifications }    from "./hooks/useNotifications.js";
import { useBreakpoint }       from "./hooks/useBreakpoint.js";
import { useLanguage }         from "./hooks/useLanguage.jsx";
import { useAutoLoad }         from "./hooks/useAutoLoad.js";
import { ProfileBadge }        from "./components/ProfileBadge.jsx";
import { ProfileModal }        from "./components/ProfileModal.jsx";
import { PublicProfileModal }  from "./components/PublicProfileModal.jsx";
import { TaskList }            from "./components/TaskList.jsx";
import { TaskFilters }         from "./components/TaskFilters.jsx";
import { CreateTaskModal }     from "./components/CreateTaskModal.jsx";
import { NotificationBell }    from "./components/NotificationBell.jsx";
import { LanguageToggle }      from "./components/LanguageToggle.jsx";
import { ThemeToggle }         from "./components/ThemeToggle.jsx";
import { WelcomeToast }        from "./components/WelcomeToast.jsx";
import { WalletMenu }          from "./components/WalletMenu.jsx";
import { SuccessModal }        from "./components/SuccessModal.jsx";
import "./styles/globals.css";

// Botón de conectar cuando no hay wallet
function ConnectButton({ lang }) {
  return (
    <button
      onClick={() => document.querySelector(".wallet-adapter-button")?.click()}
      style={{
        padding: "8px 16px", borderRadius: 10,
        background: "#1c1c27", color: "#f0f0fa",
        border: "1px solid #2a2a3d", fontSize: 13,
        fontFamily: "'Syne', sans-serif", fontWeight: 700,
        cursor: "pointer",
      }}>
      {lang === "es" ? "Conectar wallet" : "Connect wallet"}
    </button>
  );
}

export default function App() {
  const { connected, publicKey } = useWallet();
  const { isMobile }             = useBreakpoint();
  const { t, lang }              = useLanguage();

  const { profile, loading: profileLoading, checking, justConnected, initProfile, updateProfile, checkProfile } = useProfile();
  const {
    tasks, hasMore, loadNextPage, creating, loadingTasks,
    successModal, closeSuccessModal,
    search, setSearch, filterCat, setFilterCat, filterStatus, setFilterStatus,
    categories, getTasks, createTask, acceptTask, submitDelivery,
    approveAndPay, reportError, cancelTask,
  } = useTasks(profile, checkProfile);

  const { resolveMany, getUsername } = useProfiles();
  const { notifications, unread, markAllRead } = useNotifications(publicKey?.toString(), t);

  const [showCreateProfile, setShowCreateProfile] = useState(false);
  const [showEditProfile,   setShowEditProfile]   = useState(false);
  const [showCreateTask,    setShowCreateTask]    = useState(false);
  const [viewingProfile,    setViewingProfile]    = useState(null);
  const [showToast,         setShowToast]         = useState(false);

  useAutoLoad(getTasks, connected);

  useEffect(() => {
    const handler = (e) => setFilterStatus(e.detail);
    window.addEventListener("blinktasks:filter", handler);
    return () => window.removeEventListener("blinktasks:filter", handler);
  }, []);

  useEffect(() => {
    if (!connected || justConnected || checking) return;
    if (profile) {
      setShowToast(true);
    } else {
      const timer = setTimeout(() => setShowCreateProfile(true), 600);
      return () => clearTimeout(timer);
    }
  }, [connected, profile, checking, justConnected]);

  useEffect(() => {
    if (tasks.length === 0) return;
    const pubkeys = tasks.flatMap(t => [t.account.creator.toString(), t.account.worker.toString()]);
    resolveMany(pubkeys);
  }, [tasks]);

  // Aceptar tarea — verificar perfil primero
  const handleAcceptTask = async (taskPubkey) => {
    if (!profile) {
      // Sin perfil → abrir modal de creación
      setShowCreateProfile(true);
      return;
    }
    try {
      await acceptTask(taskPubkey, profile);
    } catch (e) {
      if (e.message === "NO_PROFILE") {
        setShowCreateProfile(true);
      } else {
        console.error(e);
      }
    }
  };

  const taskCount = tasks.length;
  const taskLabel = taskCount === 1
    ? "1 " + t("tasks")
    : taskCount > 0 ? taskCount + " " + t("tasksPlural") : t("noTasks");

  return (
    <div style={{ minHeight: "100vh", background: "var(--bg)", position: "relative" }}>
      <div className="app-bg" />
      <style>{`
        .wallet-adapter-button-trigger { display: none !important; }
        select option { background: var(--surface); color: var(--text); }
        input[type=date]::-webkit-calendar-picker-indicator { filter: invert(0.5); }
      `}</style>

      <div style={{ position: "relative", zIndex: 1 }}>

      {/* ── HEADER ── */}
      <header style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        padding: isMobile ? "12px 16px" : "18px 40px",
        borderBottom: "1px solid var(--border)",
        position: "sticky", top: 0,
        background: "color-mix(in srgb, var(--bg) 92%, transparent)",
        backdropFilter: "blur(16px)",
        WebkitBackdropFilter: "blur(16px)",
        zIndex: 50,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10, fontFamily: "'Syne', sans-serif", fontWeight: 800, fontSize: isMobile ? 18 : 20, color: "var(--text)", letterSpacing: "-0.02em" }}>
          <svg className="logo-float" width="28" height="28" viewBox="0 0 32 32" fill="none">
            <defs>
              <linearGradient id="lg1" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#22d3a5"/>
                <stop offset="50%" stopColor="#7c6dff"/>
                <stop offset="100%" stopColor="#f472b6"/>
              </linearGradient>
              <linearGradient id="lg2" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#22d3a5" stopOpacity="0.4"/>
                <stop offset="50%" stopColor="#7c6dff" stopOpacity="0.4"/>
                <stop offset="100%" stopColor="#f472b6" stopOpacity="0.4"/>
              </linearGradient>
            </defs>
            <path d="M4 6 L14 16 L4 26" stroke="url(#lg2)" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M13 6 L23 16 L13 26" stroke="url(#lg1)" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" fill="none"/>
            <path d="M22 9 L28 16 L22 23" stroke="url(#lg1)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" strokeDasharray="3 2"/>
          </svg>
          {!isMobile && "BlinkTasks"}
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: isMobile ? 6 : 10 }}>
          <LanguageToggle />
          <ThemeToggle />
          {connected && (
            <NotificationBell notifications={notifications} unread={unread} onMarkRead={markAllRead} />
          )}
          {connected ? <WalletMenu profile={profile} /> : <ConnectButton lang={lang} />}
        </div>
      </header>

      {/* ── MAIN ── */}
      <main style={{
        maxWidth: 960, margin: "0 auto",
        padding: isMobile ? "20px 16px 80px" : "48px 24px 80px",
        display: "flex", flexDirection: "column",
        gap: isMobile ? 16 : 24,
      }} className="fade">

        {(!isMobile || !connected) && (
          <section style={{ display: "flex", flexDirection: "column", gap: isMobile ? 8 : 12 }}>
            <h1 style={{
              fontFamily: "'Syne', sans-serif", fontWeight: 800,
              fontSize: isMobile ? "28px" : "clamp(32px, 5vw, 54px)",
              color: "#f0f0fa", lineHeight: 1.1, letterSpacing: "-0.03em",
            }}>
              {lang === "es" ? <>Trabajo freelance<br /></> : <>Freelance work<br /></>}
              <span className="gradient-anim">
                {lang === "es" ? "sin intermediarios." : "without middlemen."}
              </span>
            </h1>
            {!isMobile && (
              <p style={{ color: "#6b6b8a", fontSize: 14, lineHeight: 1.8, fontFamily: "'DM Mono', monospace", maxWidth: 500 }}>
                {lang === "es"
                  ? "Escrow on-chain en Solana — el pago se bloquea al crear la tarea y se libera cuando el cliente aprueba."
                  : "On-chain escrow on Solana — payment is locked when the task is created and released when the client approves."}
              </p>
            )}
          </section>
        )}

        <ProfileBadge
          profile={profile} loading={profileLoading} checking={checking}
          onCreateClick={() => setShowCreateProfile(true)}
          onEditClick={() => setShowEditProfile(true)}
        />

        <div style={{ display: "flex", gap: 10, justifyContent: isMobile ? "stretch" : "flex-end" }}>
          {!isMobile && (
            <button onClick={() => getTasks(false)} disabled={!connected}
              style={{ padding: "10px 18px", borderRadius: 10, background: "#1c1c27", color: "#6b6b8a", border: "1px solid #2a2a3d", fontSize: 13, fontFamily: "'DM Mono', monospace", cursor: "pointer" }}>
              {t("refresh")}
            </button>
          )}
          <button onClick={() => setShowCreateTask(true)} disabled={!connected || !profile}
            style={{ padding: "10px 20px", borderRadius: 10, background: "linear-gradient(135deg, #7c6dff, #a78bfa)", color: "#fff", fontWeight: 700, fontSize: 13, fontFamily: "'Syne', sans-serif", cursor: "pointer", flex: isMobile ? 1 : "initial" }}>
            {t("newTask")}
          </button>
          {isMobile && (
            <button onClick={() => getTasks(false)} disabled={!connected}
              style={{ padding: "10px 18px", borderRadius: 10, background: "#1c1c27", color: "#6b6b8a", border: "1px solid #2a2a3d", fontSize: 13, fontFamily: "'DM Mono', monospace", cursor: "pointer", flex: 1 }}>
              {t("refresh")}
            </button>
          )}
        </div>

        {connected && (
          <TaskFilters
            search={search}             setSearch={setSearch}
            filterCat={filterCat}       setFilterCat={setFilterCat}
            filterStatus={filterStatus} setFilterStatus={setFilterStatus}
            categories={categories}
          />
        )}

        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span style={{ flex: 1, height: 1, background: "#1c1c27" }} />
          <span style={{ fontSize: 11, color: "#3a3a55", fontFamily: "'DM Mono', monospace", textTransform: "uppercase", letterSpacing: "0.1em", whiteSpace: "nowrap" }}>{taskLabel}</span>
          <span style={{ flex: 1, height: 1, background: "#1c1c27" }} />
        </div>

        <div className="task-grid">
          <TaskList
            tasks={tasks} loading={loadingTasks}
            hasMore={hasMore} onLoadMore={loadNextPage}
            onAccept={handleAcceptTask}
            onSubmitDelivery={submitDelivery}
            onApprove={approveAndPay}
            onReportError={reportError}
            onCancel={cancelTask}
            getUsername={getUsername}
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

      {/* ── SUCCESS MODAL ── */}
      {successModal && (
        <SuccessModal
          type={successModal.type}
          title={successModal.title}
          message={successModal.message}
          onClose={closeSuccessModal}
          autoClose={3500}
        />
      )}

      {/* ── WELCOME TOAST ── */}
      {showToast && profile && (
        <WelcomeToast username={profile.username} onDone={() => setShowToast(false)} />
      )}
      </div>
    </div>
  );
}
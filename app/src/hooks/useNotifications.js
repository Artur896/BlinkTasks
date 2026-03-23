import { useState, useEffect, useRef, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getProgram } from "../anchor.js";
import { getTaskStatus } from "../utils/helpers.js";
import { useNotificationSound } from "./useNotificationSound.js";

const POLL_ACTIVE     = 10_000;
const POLL_BACKGROUND = 30_000;

// Qué rol recibe cada notificación
// creator = quien creó la tarea, worker = quien la tomó
const NOTIF_ROLE = {
  inProgress: "creator",  // alguien aceptó mi tarea
  submitted:  "creator",  // el worker entregó, yo debo revisar
  disputed:   "worker",   // el cliente reportó un problema en mi entrega
  paid:       "worker",   // recibí el pago
  cancelled:  "creator",  // mi tarea fue cancelada
};

export function useNotifications(myPubkey, t) {
  const wallet = useWallet();
  const { play } = useNotificationSound();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]               = useState(0);
  const prevStatuses = useRef(new Map());
  const intervalRef  = useRef(null);
  const initialized  = useRef(false);

  const getMsg = useCallback((status) => {
    const map = {
      inProgress: t?.("notifAccepted")  ?? "Tu tarea fue aceptada",
      submitted:  t?.("notifSubmitted") ?? "El trabajador subió su entrega",
      disputed:   t?.("notifDisputed")  ?? "El cliente reportó un problema",
      paid:       t?.("notifPaid")      ?? "Recibiste el pago",
      cancelled:  t?.("notifCancelled") ?? "Una tarea fue cancelada",
    };
    return map[status] ?? null;
  }, [t]);

  const addNotif = useCallback((msg, taskId) => {
    const notif = { id: Date.now(), msg, taskId, read: false, ts: new Date() };
    setNotifications(prev => [notif, ...prev].slice(0, 20));
    setUnread(n => n + 1);
    play();
  }, [play]);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  }, []);

  const poll = useCallback(async () => {
    if (!wallet.publicKey || !myPubkey) return;
    try {
      const program = getProgram(wallet);
      const all     = await program.account.task.all();

      for (const t of all) {
        const data    = t.account;
        const pubStr  = t.publicKey.toString();
        const creatorKey = data.creator.toString();
        const workerKey  = data.worker.toString();

        // Solo procesar tareas donde participo
        const isMine = creatorKey === myPubkey || workerKey === myPubkey;
        if (!isMine) continue;

        const status = getTaskStatus(data);
        const prev   = prevStatuses.current.get(pubStr);

        if (initialized.current && prev && prev !== status) {
          const msg  = getMsg(status);
          const role = NOTIF_ROLE[status]; // "creator" o "worker"

          // Solo notificar si soy el rol correcto para este evento
          const shouldNotify =
            (role === "creator" && creatorKey === myPubkey) ||
            (role === "worker"  && workerKey  === myPubkey);

          if (msg && shouldNotify) {
            addNotif(msg, data.taskId?.toString() ?? pubStr.slice(0, 6));
          }
        }

        prevStatuses.current.set(pubStr, status);
      }

      initialized.current = true;
    } catch { /* silencioso */ }
  }, [myPubkey, wallet.publicKey, getMsg, addNotif]);

  useEffect(() => {
    if (!wallet.publicKey || !myPubkey) return;

    const start = (ms) => {
      clearInterval(intervalRef.current);
      intervalRef.current = setInterval(poll, ms);
    };

    const onVisibility = () => {
      start(document.hidden ? POLL_BACKGROUND : POLL_ACTIVE);
    };

    poll();
    start(POLL_ACTIVE);
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      clearInterval(intervalRef.current);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [myPubkey, wallet.publicKey, poll]);

  return { notifications, unread, markAllRead };
}
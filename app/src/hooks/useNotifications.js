import { useState, useEffect, useRef, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { getProgram } from "../anchor.js";
import { getTaskStatus } from "../utils/helpers.js";

const POLL_INTERVAL = 10000; // 10 segundos

const STATUS_MESSAGES = {
  inProgress: "Tu tarea fue aceptada por un worker",
  submitted:  "El worker subió su entrega — revísala",
  disputed:   "El cliente reportó un problema en tu entrega",
  paid:       "¡Recibiste el pago por tu tarea!",
  cancelled:  "Una tarea fue cancelada",
};

export function useNotifications(myPubkey) {
  const wallet = useWallet();
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread]               = useState(0);
  const prevStatuses = useRef(new Map()); // taskPubkey → status

  const addNotif = useCallback((msg, taskId) => {
    const notif = { id: Date.now(), msg, taskId, read: false, ts: new Date() };
    setNotifications(prev => [notif, ...prev].slice(0, 20)); // max 20
    setUnread(n => n + 1);
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    setUnread(0);
  }, []);

  // Polling: detecta cambios de status en tareas donde soy creador o worker
  useEffect(() => {
    if (!wallet.publicKey || !myPubkey) return;

    const poll = async () => {
      try {
        const program = getProgram(wallet);
        const all     = await program.account.task.all();

        for (const t of all) {
          const data      = t.account;
          const pubStr    = t.publicKey.toString();
          const isMine    = data.creator.toString() === myPubkey || data.worker.toString() === myPubkey;
          if (!isMine) continue;

          const status    = getTaskStatus(data);
          const prevStatus = prevStatuses.current.get(pubStr);

          if (prevStatus && prevStatus !== status) {
            const msg = STATUS_MESSAGES[status];
            if (msg) addNotif(msg, data.taskId?.toString() ?? pubStr.slice(0, 6));
          }

          prevStatuses.current.set(pubStr, status);
        }
      } catch { /* silencioso */ }
    };

    const id = setInterval(poll, POLL_INTERVAL);
    poll(); // primera llamada inmediata
    return () => clearInterval(id);
  }, [myPubkey, wallet.publicKey]);

  return { notifications, unread, markAllRead };
}
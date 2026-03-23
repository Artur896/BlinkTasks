import { useState, useCallback, useMemo } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { SystemProgram } from "@solana/web3.js";
import { getProgram } from "../anchor.js";
import { getTaskStatus } from "../utils/helpers.js";

const PAGE_SIZE = 20;

export function useTasks(profile, checkProfile) {
  const wallet = useWallet();
  const [allTasks, setAllTasks]         = useState([]);
  const [creating, setCreating]         = useState(false);
  const [loadingTasks, setLoading]      = useState(false);
  const [page, setPage]                 = useState(1);
  const [search, setSearch]             = useState("");
  const [filterCat, setFilterCat]       = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [successModal, setSuccessModal] = useState(null);

  const showSuccess = (type, title, message) => setSuccessModal({ type, title, message });

  const getTasks = useCallback(async (silent = false) => {
    if (!wallet.publicKey) return;
    if (!silent) setLoading(true);
    try {
      const program = getProgram(wallet);
      const all     = await program.account.task.all();
      all.sort((a, b) => Number(b.account.taskId) - Number(a.account.taskId));
      setAllTasks(all);
    } catch (err) {
      console.error(err);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [wallet.publicKey]);

  const myKey = wallet.publicKey?.toString();

  const filteredTasks = useMemo(() => {
    return allTasks.filter(t => {
      const data   = t.account;
      const status = getTaskStatus(data);
      const isMine = data.creator.toString() === myKey ||
                     data.worker.toString()   === myKey;

      // Tareas paid/cancelled: solo visibles para creador o worker
      if (status === "paid" || status === "cancelled") {
        if (!isMine) return false;
      }

      // Tareas tomadas por otros (inProgress, submitted, disputed): ocultar
      if (!isMine && status !== "open") return false;

      if (filterStatus && status !== filterStatus) return false;
      if (filterCat && data.category !== filterCat) return false;
      if (search) {
        const q = search.toLowerCase();
        const match =
          data.title.toLowerCase().includes(q) ||
          data.description.toLowerCase().includes(q) ||
          data.category.toLowerCase().includes(q);
        if (!match) return false;
      }
      return true;
    });
  }, [allTasks, myKey, filterStatus, filterCat, search]);

  const pagedTasks   = useMemo(() => filteredTasks.slice(0, page * PAGE_SIZE), [filteredTasks, page]);
  const hasMore      = filteredTasks.length > pagedTasks.length;
  const loadNextPage = useCallback(() => setPage(p => p + 1), []);

  const handleSetSearch       = useCallback((v) => { setSearch(v);       setPage(1); }, []);
  const handleSetFilterCat    = useCallback((v) => { setFilterCat(v);    setPage(1); }, []);
  const handleSetFilterStatus = useCallback((v) => { setFilterStatus(v); setPage(1); }, []);

  const categories = useMemo(
    () => [...new Set(allTasks.map(t => t.account.category).filter(Boolean))],
    [allTasks]
  );

  const createTask = async ({ amount, title, description, category, deadline }) => {
    if (!wallet.publicKey || !profile) throw new Error("No profile");
    setCreating(true);
    try {
      const program      = getProgram(wallet);
      const [profilePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), wallet.publicKey.toBuffer()], program.programId
      );
      const taskId    = profile.tasksCreated;
      const [taskPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("task"), wallet.publicKey.toBuffer(), taskId.toArrayLike(Buffer, "le", 8)],
        program.programId
      );
      const [vaultPda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("vault"), wallet.publicKey.toBuffer()], program.programId
      );
      await program.methods
        .createTask(new anchor.BN(amount), title, description, category, new anchor.BN(deadline || 0))
        .accounts({ task: taskPda, profile: profilePda, vault: vaultPda, creator: wallet.publicKey, systemProgram: SystemProgram.programId })
        .rpc();
      await checkProfile(); // ← actualiza tasksCreated en el badge
      await getTasks(false);
      showSuccess("success", "¡Tarea creada!", "Tu tarea está publicada y el SOL está bloqueado.");
    } finally {
      setCreating(false);
    }
  };

  const acceptTask = async (taskPubkey, workerProfile) => {
    if (!workerProfile) throw new Error("NO_PROFILE");
    const program = getProgram(wallet);
    await program.methods.acceptTask()
      .accounts({ task: taskPubkey, worker: wallet.publicKey })
      .rpc();
    await Promise.all([getTasks(true), checkProfile()]);
    showSuccess("success", "¡Tarea aceptada!", "El trabajo es tuyo. Entrega tu resultado cuando esté listo.");
  };

  const submitDelivery = async (taskPubkey, deliveryUrl) => {
    const program = getProgram(wallet);
    await program.methods.submitDelivery(deliveryUrl)
      .accounts({ task: taskPubkey, worker: wallet.publicKey })
      .rpc();
    await Promise.all([getTasks(true), checkProfile()]);
    showSuccess("info", "Entrega enviada", "El cliente revisará tu trabajo.");
  };

  const approveAndPay = async (taskPubkey, creatorKey, workerKey, rating = 5) => {
    const program       = getProgram(wallet);
    const workerPubkey  = new anchor.web3.PublicKey(workerKey);
    const creatorPubkey = new anchor.web3.PublicKey(creatorKey);
    const [vaultPda]    = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), creatorPubkey.toBuffer()], program.programId
    );
    const [workerProfilePda] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("profile"), workerPubkey.toBuffer()], program.programId
    );
    await program.methods.approveAndPay(rating)
      .accounts({ task: taskPubkey, creator: wallet.publicKey, worker: workerPubkey, workerProfile: workerProfilePda, vault: vaultPda, systemProgram: SystemProgram.programId })
      .rpc();
    await Promise.all([getTasks(true), checkProfile()]);
    showSuccess("success", "¡Pago liberado!", `${lamportsLabel()} transferidos al worker. ¡Gracias por usar BlinkTasks!`);
  };

  const reportError = async (taskPubkey, note) => {
    const program = getProgram(wallet);
    await program.methods.reportError(note)
      .accounts({ task: taskPubkey, creator: wallet.publicKey })
      .rpc();
    await Promise.all([getTasks(true), checkProfile()]);
    showSuccess("warning", "Problema reportado", "El worker verá tu nota y podrá resubmitir.");
  };

  const cancelTask = async (taskPubkey, creatorKey) => {
    const program       = getProgram(wallet);
    const creatorPubkey = new anchor.web3.PublicKey(creatorKey);
    const [vaultPda]    = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), creatorPubkey.toBuffer()], program.programId
    );
    await program.methods.cancelTask()
      .accounts({ task: taskPubkey, creator: wallet.publicKey, vault: vaultPda, systemProgram: SystemProgram.programId })
      .rpc();
    await Promise.all([getTasks(true), checkProfile()]);
    showSuccess("info", "Tarea cancelada", "El SOL regresó a tu wallet.");
  };

  return {
    tasks: pagedTasks,
    allTasks,
    hasMore,
    loadNextPage,
    creating,
    loadingTasks,
    successModal,
    closeSuccessModal: () => setSuccessModal(null),
    search,       setSearch: handleSetSearch,
    filterCat,    setFilterCat: handleSetFilterCat,
    filterStatus, setFilterStatus: handleSetFilterStatus,
    categories,
    getTasks,
    createTask,
    acceptTask,
    submitDelivery,
    approveAndPay,
    reportError,
    cancelTask,
  };
}

function lamportsLabel() { return "SOL"; }
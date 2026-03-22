import { useState, useCallback } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import * as anchor from "@coral-xyz/anchor";
import { SystemProgram } from "@solana/web3.js";
import { getProgram } from "../anchor.js";
import { getTaskStatus } from "../utils/helpers.js";

export function useTasks(profile, checkProfile) {
  const wallet = useWallet();
  const [allTasks, setAllTasks]     = useState([]);
  const [creating, setCreating]     = useState(false);
  const [loadingTasks, setLoading]  = useState(false);
  const [search, setSearch]         = useState("");
  const [filterCat, setFilterCat]   = useState("");
  const [filterStatus, setFilterStatus] = useState(""); // "" = todos visibles

  const getTasks = useCallback(async () => {
    if (!wallet.publicKey) return;
    setLoading(true);
    try {
      const program = getProgram(wallet);
      const all     = await program.account.task.all();
      setAllTasks(all);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [wallet.publicKey]);

  const myKey = wallet.publicKey?.toString();

  /**
   * Regla principal:
   * - Ocultar tareas en InProgress/Submitted/Disputed/Paid/Cancelled
   *   SALVO que yo sea creador o worker de esa tarea.
   * - Aplicar filtros de categoría, status y búsqueda encima de eso.
   */
  const filteredTasks = allTasks.filter(t => {
    const data   = t.account;
    const status = getTaskStatus(data);
    const isMine = data.creator.toString() === myKey || data.worker.toString() === myKey;

    // Ocultar tareas tomadas por otros
    if (!isMine && status !== "open") return false;

    // Filtro de status manual (si el usuario quiere ver solo pagadas, etc. en sus tareas)
    if (filterStatus && status !== filterStatus) return false;

    // Filtro de categoría
    if (filterCat && data.category !== filterCat) return false;

    // Búsqueda de texto
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

  const categories = [...new Set(allTasks.map(t => t.account.category).filter(Boolean))];

  // ── Instrucciones ──────────────────────────────────────────

  const createTask = async ({ amount, title, description, category, deadline }) => {
    if (!wallet.publicKey || !profile) throw new Error("Sin perfil");
    setCreating(true);
    try {
      const program      = getProgram(wallet);
      const [profilePda] = anchor.web3.PublicKey.findProgramAddressSync(
        [Buffer.from("profile"), wallet.publicKey.toBuffer()], program.programId
      );
      const taskId   = profile.tasksCreated;
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
      await checkProfile();
      await getTasks();
    } finally {
      setCreating(false);
    }
  };

  const acceptTask = async (taskPubkey) => {
    const program = getProgram(wallet);
    await program.methods.acceptTask()
      .accounts({ task: taskPubkey, worker: wallet.publicKey })
      .rpc();
    await getTasks();
  };

  const submitDelivery = async (taskPubkey, deliveryUrl) => {
    const program = getProgram(wallet);
    await program.methods.submitDelivery(deliveryUrl)
      .accounts({ task: taskPubkey, worker: wallet.publicKey })
      .rpc();
    await getTasks();
  };

  const approveAndPay = async (taskPubkey, creatorKey, workerKey, rating = 5) => {
    const program       = getProgram(wallet);
    const workerPubkey  = new anchor.web3.PublicKey(workerKey);
    const creatorPubkey = new anchor.web3.PublicKey(creatorKey);
    const [vaultPda]    = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), creatorPubkey.toBuffer()], program.programId
    );
    const [workerProfile] = anchor.web3.PublicKey.findProgramAddressSync(
      [Buffer.from("profile"), workerPubkey.toBuffer()], program.programId
    );
    await program.methods.approveAndPay(rating)
      .accounts({ task: taskPubkey, creator: wallet.publicKey, worker: workerPubkey, workerProfile, vault: vaultPda, systemProgram: SystemProgram.programId })
      .rpc();
    await getTasks();
  };

  const reportError = async (taskPubkey, note) => {
    const program = getProgram(wallet);
    await program.methods.reportError(note)
      .accounts({ task: taskPubkey, creator: wallet.publicKey })
      .rpc();
    await getTasks();
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
    await getTasks();
  };

  return {
    tasks: filteredTasks,
    allTasks,
    creating,
    loadingTasks,
    search,       setSearch,
    filterCat,    setFilterCat,
    filterStatus, setFilterStatus,
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
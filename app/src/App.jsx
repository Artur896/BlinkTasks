import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { getProgram } from "./anchor.js";
import { useState } from "react";
import { Keypair, SystemProgram } from "@solana/web3.js";
import * as anchor from "@coral-xyz/anchor";

export default function App() {
  const wallet = useWallet();
  const [loading, setLoading] = useState(false);
  const [tasks, setTasks] = useState([]);

  const createTask = async () => {
    try {
      if (!wallet.publicKey) {
        alert("Conecta tu wallet primero");
        return;
      }

      setLoading(true);

      const program = getProgram(wallet);

      const taskAccount = Keypair.generate();

      await program.methods
        .createTask(new anchor.BN(1000000))
        .accounts({
          task: taskAccount.publicKey,
          creator: wallet.publicKey,
          systemProgram: SystemProgram.programId,
        })
        .signers([taskAccount])
        .rpc();

      alert("✅ Tarea creada en blockchain");
    } catch (err) {
      console.error(err);
      alert("Error, revisa consola");
    } finally {
      setLoading(false);
    }
  };

  const acceptTask = async (taskPubkey) => {
    try {
      const program = getProgram(wallet);

      await program.methods
        .acceptTask()
        .accounts({
          task: taskPubkey,
          worker: wallet.publicKey,
        })
        .remainingAccounts([
          {
            pubkey: taskPubkey,
            isWritable: true,
            isSigner: false,
          },
        ])
        .rpc();

      alert("Tarea aceptada");
      getTasks();
    } catch (err) {
      console.error(err);
      alert(" Error al aceptar");
    }
  };

  const completeTask = async (taskPubkey) => {
    const program = getProgram(wallet);

    await program.methods
      .completeTask()
      .accounts({
        task: taskPubkey,
        worker: wallet.publicKey,
      })
      .rpc();

    getTasks();
  };

  const payTask = async (taskPubkey, creator, worker) => {
    const program = getProgram(wallet);

    await program.methods
      .releasePayment()
      .accounts({
        task: taskPubkey,
        creator: wallet.publicKey,
        worker: worker,
      })
      .rpc();

    getTasks();
  };

  const getTasks = async () => {
  try {
    const program = getProgram(wallet);

    const tasks = await program.account.task.all();

    setTasks(tasks);
  } catch (err) {
    console.error(err);
  }
};

  return (
    <div style={{ padding: 40 }}>
      <h1>BlinkTasks</h1>

      <WalletMultiButton />

      <br /><br />

      <button onClick={createTask} disabled={!wallet.connected || loading}>
        {loading ? "Creando..." : "Crear tarea"}
      </button>
      <button onClick={getTasks}>
        Ver tareas
      </button>
      <div style={{ marginTop: 30 }}>
        {tasks.map((t) => {
          const data = t.account;

          const isAvailable =
            data.worker.toString() === anchor.web3.PublicKey.default.toString();

          const isWorker =
            wallet.publicKey &&
            data.worker.toString() === wallet.publicKey.toString();

          const isCreator =
            wallet.publicKey &&
            data.creator.toString() === wallet.publicKey.toString();

          return (
            <div
              key={t.publicKey.toString()}
              style={{
                border: "1px solid #ccc",
                padding: 15,
                marginBottom: 10,
                borderRadius: 10,
              }}
            >
              <p>Monto: {data.amount.toString()}</p>

              <p>
                Estado:
                {data.isPaid
                  ? " Pagado"
                  : data.isCompleted
                  ? " Completado"
                  : isAvailable
                  ? " Disponible"
                  : " En progreso"}
              </p>

              {/* ACEPTAR */}
              {isAvailable && (
                <button onClick={() => acceptTask(t.publicKey)}>
                  Aceptar
                </button>
              )}

              {/* COMPLETAR */}
              {isWorker && !data.isCompleted && (
                <button onClick={() => completeTask(t.publicKey)}>
                  Completar
                </button>
              )}

              {/* PAGAR */}
              {isCreator && data.isCompleted && !data.isPaid && (
                <button
                  onClick={() =>
                    payTask(t.publicKey, data.creator, data.worker)
                  }
                >
                  Pagar
                </button>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
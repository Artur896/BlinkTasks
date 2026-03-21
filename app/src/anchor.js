import { Connection, PublicKey } from "@solana/web3.js";
import { AnchorProvider, Program } from "@coral-xyz/anchor";
import idl from "./idl/blinktasks.json";

const programID = new PublicKey("An6HpDp4ypTZB1mKEFzmvXyHSP1oBPf2KeG9J2MkP2my");

const network = "http://127.0.0.1:8899";

export const getProgram = (wallet) => {
  const connection = new Connection(network, "processed");

  const provider = new AnchorProvider(connection, wallet, {
    preflightCommitment: "processed",
  });

  return new Program(idl, provider);
};
import { Buffer } from "buffer";
import process from "process";
window.Buffer  = window.Buffer  ?? Buffer;
window.process = window.process ?? process;

import React from "react";
import ReactDOM from "react-dom/client";
import { LanguageProvider } from "./hooks/useLanguage.jsx";
import { ThemeProvider }    from "./hooks/useTheme.jsx";
import App from "./App.jsx";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./styles/wallet.css";

const wallets = [];
const endpoint = "https://api.devnet.solana.com";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <ThemeProvider>
            <LanguageProvider>
              <App />
            </LanguageProvider>
          </ThemeProvider>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  </React.StrictMode>
);
import { Buffer } from "buffer";
window.Buffer = window.Buffer ?? Buffer;

import React from "react";
import ReactDOM from "react-dom/client";
import { LanguageProvider } from "./hooks/useLanguage.jsx";
import { ThemeProvider }    from "./hooks/useTheme.jsx";
import App from "./App.jsx";
import { ConnectionProvider, WalletProvider } from "@solana/wallet-adapter-react";
import { WalletModalProvider } from "@solana/wallet-adapter-react-ui";
import { PhantomWalletAdapter } from "@solana/wallet-adapter-wallets";
import "@solana/wallet-adapter-react-ui/styles.css";
import "./styles/wallet.css";

const wallets  = [new PhantomWalletAdapter()];
const endpoint = "http://localhost:8899"; // localnet

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
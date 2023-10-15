import "./App.css";
import { useMemo } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Home from "./Home";
import OTCDashboard from "./otc/test";

import { clusterApiUrl } from "@solana/web3.js";

import * as anchor from "@coral-xyz/anchor";

import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter, TrustWalletAdapter } from '@solana/wallet-adapter-wallets';
import {
  WalletModalProvider,
  WalletDisconnectButton,
  WalletMultiButton
} from '@solana/wallet-adapter-react-ui';


import { createTheme, ThemeProvider } from "@material-ui/core";

// const network = "mainnet-beta" as WalletAdapterNetwork;
const network = "mainnet-beta" as WalletAdapterNetwork;

/* const rpcHost = "https://api.devnet.solana.com"; */
/* let rpcHost = "https://solana.genesysgo.net/";
 *  */
let rpcHost =
  "https://solana.coin.ledger.com/";

const connection = new anchor.web3.Connection(rpcHost, {
  commitment: "confirmed",
  confirmTransactionInitialTimeout: 250000,
});

const theme = createTheme({
  palette: {
    type: "dark",
  },
  overrides: {
    MuiButtonBase: {
      root: {
        justifyContent: "flex-start",
      },
    },
    MuiButton: {
      root: {
        textTransform: undefined,
        padding: "12px 16px",
      },
      startIcon: {
        marginRight: 8,
      },
      endIcon: {
        marginLeft: 8,
      },
    },
  },
});

const OTCDashboardPage = () => {
  const endpoint = useMemo(() => clusterApiUrl(network), []);
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TrustWalletAdapter(),
    ],
    [network]
  );


  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets}>
        <WalletModalProvider>
       
        <OTCDashboard connection={connection} />
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
           
  );
};

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={OTCDashboardPage}></Route>
      </Switch>
    </Router>
  );
};

export default App;

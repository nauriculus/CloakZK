import "./App.css";
import { useMemo } from "react";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";

import Home from "./Home";
import OTCDashboard from "./otc/test";

import * as anchor from "@project-serum/anchor";
import { clusterApiUrl } from "@solana/web3.js";
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base'

import {
  getPhantomWallet,
  getSlopeWallet,
  getSolflareWallet,
  getSolletWallet,
  getSolletExtensionWallet,
} from "@solana/wallet-adapter-wallets";


import { WalletDialogProvider } from "@solana/wallet-adapter-material-ui";

import {
  ConnectionProvider,
  WalletProvider,
} from "@solana/wallet-adapter-react";

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

const Main = () => {
  return (
     <Home/>
  );
};

const OTCDashboardPage = () => {
  const endpoint = useMemo(() => clusterApiUrl(network), []);

  const wallets = useMemo(
    () => [
      getPhantomWallet(),
      getSlopeWallet(),
      getSolflareWallet(),
      getSolletWallet({ network }),
      getSolletExtensionWallet({ network }),
    ],
    []
  );
  return (
    <ThemeProvider theme={theme}>
      <ConnectionProvider endpoint={endpoint}>
        <WalletProvider wallets={wallets} autoConnect={true}>
          <WalletDialogProvider>
            <OTCDashboard connection={connection} />
          </WalletDialogProvider>
        </WalletProvider>
      </ConnectionProvider>
    </ThemeProvider>
  );
};

const App = () => {
  return (
    <Router>
      <Switch>
        <Route exact path="/" component={Main}></Route>
        <Route exact path="/otc" component={OTCDashboardPage}></Route>
      </Switch>
    </Router>
  );
};

export default App;

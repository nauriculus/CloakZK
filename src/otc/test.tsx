
import styled from "styled-components";
import "./OTC.css";
import "../BlockList.css";
import * as anchor from "@project-serum/anchor";
import { useAnchorWallet } from "@solana/wallet-adapter-react";
import Nav from "../partials/Nav";
import Footer from "../partials/Footer";
import { shortenAddress } from "../candy-machine";
import Box from "@material-ui/core/Box";
import Modal from "@material-ui/core/Modal";
import Fade from "@material-ui/core/Fade";
import Backdrop from "@material-ui/core/Backdrop";
import { Connection } from '@solana/web3.js';
import { PublicKey } from '@solana/web3.js';
import React, { useRef } from 'react';

import Snackbar from "@material-ui/core/Snackbar";
import { useWallet } from '@solana/wallet-adapter-react';
import { Elusiv, SEED_MESSAGE,TokenType, TopupTxData   } from '@elusiv/sdk';
import { useConnection } from '@solana/wallet-adapter-react';
import { LAMPORTS_PER_SOL, ConfirmedSignatureInfo  } from '@solana/web3.js';
import { WalletDialogButton } from "@solana/wallet-adapter-material-ui";


import { css } from '@emotion/react';
import { BounceLoader } from 'react-spinners';

import { useState, useEffect } from 'react';

let privateTransferTransaction: string = null;
let topUpTransaction: string = null;
let sessionId: string = null;
let counterWallet: string = null;
let tradeId: string = null;
let walletId: string = null;

const ConnectButton = styled(WalletDialogButton)`
/* Add your custom styles here */
padding: 0.5rem 1.25rem;
border-radius: 8px;
color: #fff;
font-size: 16px;
border: none;
cursor: pointer;
box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.3);
transition: box-shadow 0.2s ease-in-out;

&:hover {
  animation: glow 1s ease-in-out infinite;
}

@keyframes glow {
  0% {
    box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.3);
  }
  50% {
    box-shadow: 0 0 20px rgba(108,39,255,255);
  }
  100% {
    box-shadow: 6px 6px 0 rgba(0, 0, 0, 0.3);
  }
}
`;


  const CenteredContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

export interface TradeProps {
  connection: anchor.web3.Connection;
}







const OTC = (props: TradeProps) => {

  const [loadingAnimation, changeLoadingAnimationText] = useState('');

  const [elusiv, setElusiv] = useState<Elusiv>();
  const { publicKey, signMessage } = useWallet();
  const { connection } = useConnection()
  
  const wallet = useAnchorWallet();
  const vertical = "top";
  const horizontal = "center";
  
  const [open, setOpen] = useState(false);
  const [showErrorMessage, setShowErrorMessage] = useState(false);
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isTransactionInfoOpen, setTransactionInfoOpen] = useState(false);
  const [isConfirmationInfoOpen, setConfirmationInfoOpen] = useState(false);
  const [isTransactionCostInfoOpen, setTransactionCostInfoOpen] = useState(false);

  const useLoadingAnimation = ({ isFinished }) => {
    return (
      <div className="loading-animation-container">
        {isFinished ? (
          <div className="green-checkmark">
            <img src="../success.png" alt="success" />
          </div>
        ) : (
          <div className="loading-animation">
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
            <div className="loading-dot"></div>
          </div>
        )}
        <p className="animation-text">{loadingAnimation}</p>
      </div>
    );
  };
  
  useEffect(() => {
    const getElusiv = async () => {
      if (publicKey && signMessage) {
        const encodedMessage = new TextEncoder().encode(SEED_MESSAGE);
        const seed = await signMessage(encodedMessage);


     //   let rpcHost = "https://alien-lingering-owl.solana-mainnet.quiknode.pro/5ac3510e008f3d8bc524613775744dc354bf629e/";

      let rpcHost =
      "https://solana.coin.ledger.com/";

        const connection = new Connection(rpcHost, {
          commitment: "confirmed",
          confirmTransactionInitialTimeout: 250000,
        });
        
        const elusivInstance = await Elusiv.getElusivInstance(seed, publicKey, connection, 'mainnet-beta')
        setElusiv(elusivInstance);
      }
    }
    getElusiv()

    return () => {
      setElusiv(undefined)
    }
  }, [publicKey, connection])

  const handleCloseErrorMessage = () => {
    setShowErrorMessage(false);
  };

  const handleCloseSuccessMessage = () => {
    setShowSuccessMessage(false);
  };

  const handleOpenModal = () => {
    setOpen(true);
  };

  const handleCloseRedeem = () => {
    if(!isLoading) {
    setOpen(false);
    setbuttonIsLoading(false);
    setTradeButtonLoad(false);
    }
  };

  function shortenTransactionId(transactionId: string | null): string {
    if (transactionId === null) {
      return "";
    }
    
    const shortenedId = transactionId.substr(0, 8) + "..." + transactionId.substr(-8);
    return shortenedId;
  }

  const [isTransactionFinished, setIsTransactionFinished] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [tradingDashboard, setTradingDashboardOpen] = useState(false);
  const [buttonisLoading, setbuttonIsLoading] = useState(false);
  const [TradeButtonIsLoading, setTradeButtonLoad] = useState(false);
  const [showFundsButton, setShowFundsButton] = useState(false);
  const loadingText = useLoadingAnimation({ isFinished: isTransactionFinished }); 
  const tradingCodeInputRef = useRef(null);
  const [solAmount, setSolAmount] = useState('');
  const [tradeStatus, setTradeStatus] = useState('Pending');
  const { signTransaction } = useWallet();
  const [copied, setCopied] = useState(false);
  
  const getTransactionDetails = async (txid: any) => {
    try {
      const payload = {
        method: 'getTransaction',
        jsonrpc: '2.0',
        params: [
          txid.toString(),
          {
            encoding: 'jsonParsed',
            maxSupportedTransactionVersion: 0,
          },
        ],
        id: 'd1077efd-2c84-4e05-b6a3-ae7c26105b7b',
      };
  
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json, text/plain, */*',
          'accept-language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
          'user-agent':
            'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36',
        },
        body: JSON.stringify(payload),
      };
  
      const response = await fetch('https://rpc.ironforge.network/v1/mainnet/getTransaction?apiKey=01H7J57NQ1A1R2ZCAPPXK4737Q', options);
  
  
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      if (data.result === null) {
        // Repeat the API call
        await getTransactionDetails(txid); // Await the recursive call
      } else {
        setIsLoading(false);
        const timestamp = data.result.blockTime;
        const slot = data.result.slot;
        const currentTime = Math.floor(Date.now() / 1000);
        const elapsedTime = currentTime - timestamp;
  
        
        const LAMPORTS_PER_SOL = 1000000000; // 1 SOL = 1,000,000,000 lamports
        const feeLamports = data.result.meta.fee;
        
        const transactionIdNew = shortenTransactionId(txid);
      }
    } catch (error) {
      console.error('Error occurred:', error);
    }
  };
  

  const toggleInfoBox = (boxType: any) => {
    switch (boxType) {
      case "transaction":
        setTransactionInfoOpen(!isTransactionInfoOpen);
        break;
      case "confirmation":
        setConfirmationInfoOpen(!isConfirmationInfoOpen);
        break;
      case "transactionCost":
        setTransactionCostInfoOpen(!isTransactionCostInfoOpen);
        break;
      default:
        break;
    }
  };

  const handleSOLAmountChange = (amount: any) => {
    setSolAmount(amount);
  };
  const resetInfoBoxes = () => {
    setTransactionInfoOpen(false);
    setConfirmationInfoOpen(false);
    setTransactionCostInfoOpen(false);
  };

  async function topup(
    elusivInstance: Elusiv,
    amount: number,
    tokenType: TokenType,
  ): Promise<ConfirmedSignatureInfo> {
   // Build our topup transaction
  const topupTx = await elusivInstance.buildTopUpTx(amount, tokenType);

  // Sign it (only needed for topups, as we're topping up from our public key here)
  const signedTx = await signTransaction!(topupTx.tx);
  // Send it off
  topupTx.setSignedTx(signedTx);
  return elusivInstance.sendElusivTx(topupTx);
}

  async function listenForTradeStatus() {
    const tradeAccepted = await checkTradeStatus(tradeId);
    
    if(counterWallet === "Not available yet") {

      const payload = {
        sessionId: sessionId,
      };

      fetch("https://binaramics.com:2222/getCounterWallet", {
        method: "POST",
        headers: {
        "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
       })
      .then(response => response.json())
      .then(data => {
        counterWallet = null;
        if(data.wallet !== null) {
        counterWallet = data.wallet;
        }
       })

      .catch(error => {
        setShowErrorMessage(true);
        setErrorMessage("An error occured try again");
        setIsLoading(false);
        setTradeButtonLoad(false);
        setTradingDashboardOpen(false);
        handleCloseRedeem();
        changeLoadingAnimationText('');
        sessionId = null;
        tradeId = null;
        console.error("Error joining trade:", error);
      });

    }
    if(tradeAccepted) {
      setTradeStatus("Accepted");
      setShowSuccessMessage(true);
      setSuccessMessage("Trade was accepted by both parties");
      setShowFundsButton(true);
    } 
    else {
      setTradeStatus("Pending");
      setTimeout(listenForTradeStatus, 10000);
    }
  }

  async function getFunds() {
    try {
      const payload = {
        sessionId: sessionId,
      };
  
      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json, text/plain, */*',
        },
        body: JSON.stringify(payload),
      };
  
      const response = await fetch('https://binaramics.com:2222/requestFunds', options);
      if (!response.ok) {
        throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
      }
  
      const data = await response.json();
      const claimLink = data.link;
  
      // Perform the redirection after processing the response
      if (claimLink) {
        window.location.href = claimLink;
      } else {
        // Handle the case where the claimLink is empty
        console.error('Claim link is not available.');
      }
    } catch (error) {
      console.error('An error occurred:', error);
    }
  }

  async function checkTradeStatus(tradeId) {
    try {

      const payload = {
        tradeId: tradeId
      };

      const options = {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          accept: 'application/json, text/plain, */*',
        },
        body: JSON.stringify(payload),
      };

      const response = await fetch('https://binaramics.com:2222/checkTradeStatus', options);
      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      if (response.ok) {
        if (data.status !== undefined) {
          return data.status; // Return true or false directly
        } else {
          return false;
        }
      }
    } catch (error) {
      return false;
    }
  }

  const startNewTrade = async (event: any) => {
    try {
      
      const parsedAmount = parseFloat(solAmount); // Parse the input as a number
      setTradeButtonLoad(true);
      
      if (parsedAmount > 0) {
        if (elusiv) {
          setIsTransactionFinished(false);
          setIsLoading(true);

          const payload = {
          
          };

          const options = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              accept: 'application/json, text/plain, */*',
            },
            body: JSON.stringify(payload),
          };
      
          const response = await fetch('https://binaramics.com:2222/newTrade', options);
          if (!response.ok) {
            throw new Error(`Network response was not ok: ${response.status} ${response.statusText}`);
          }
      

          setShowFundsButton(false);
          const data = await response.json();
          sessionId = null;
          sessionId = data.sessionId;
          walletId = null;
          walletId = data.tiplinkWalletCreator;
          tradeId = null;
          tradeId = data.tradeId;

          changeLoadingAnimationText("Building transaction... Waiting for your approval");
          const sig = await topup(elusiv, parsedAmount * LAMPORTS_PER_SOL, 'LAMPORTS');
          
          topUpTransaction = sig.signature;
        
          const privateBalance = await elusiv.getLatestPrivateBalance('LAMPORTS');
          const balance = Number(privateBalance) * LAMPORTS_PER_SOL;
          
          if(balance >= parsedAmount) {
          changeLoadingAnimationText("Topped up private balance");
          const depositWallet = new PublicKey(walletId);

          const isValidAddress = await PublicKey.isOnCurve(depositWallet);
          if(!isValidAddress) {
            setIsLoading(false);
            setShowFundsButton(false);
            setTradeButtonLoad(false);
            setbuttonIsLoading(false);
            setShowErrorMessage(true);
            setTradingDashboardOpen(false);
            setErrorMessage(`Internal Error. Please try again!`);
            return "Error";
          }
          
          changeLoadingAnimationText("Sending a ZK-proof transaction");
          const sendTx = await elusiv.buildSendTx(
            parsedAmount * LAMPORTS_PER_SOL,
            depositWallet,
            'LAMPORTS',
          )

          const sigSend = await elusiv.sendElusivTx(sendTx)
          privateTransferTransaction = sigSend.signature;
          console.log(`Send complete with sig ${sigSend.signature}`)

          changeLoadingAnimationText('Deposited ' + parsedAmount + ' SOL successfully');

          setIsTransactionFinished(true);
          setTimeout(() => {
            setIsLoading(false);
            setTradingDashboardOpen(true);
          }, 2000); // Adjust the delay time as needed (in milliseconds)
        }
      }
      else {
        setIsLoading(false);
            setTradeButtonLoad(false);
            setbuttonIsLoading(false);
            setShowErrorMessage(true);
            setTradingDashboardOpen(false);
            setErrorMessage(`Internal Error. Please try again!`);
            return "Error";
      }
      }
      else {
        setIsLoading(false);
        setTradeButtonLoad(false);
        setbuttonIsLoading(false);
        setShowErrorMessage(true);
        setTradingDashboardOpen(false);
        setErrorMessage(`SOL amount is invaild`);
      }
     

     // validators = await connection.getVoteAccounts();
      
     // const response = await fetch(`https://api.coingecko.com/api/v3/simple/price?ids=${"solana"}&vs_currencies=usd&include_24hr_change=true`);
     // const json = await response.json();
    
    //  const solanaPriceObj = json["solana"];
    //  solanaPrice = solanaPriceObj.usd;
      
    //  getTransactionDetails(transaction);

     
      

    } catch (e) {
      setIsLoading(false);
      setTradeButtonLoad(false);
      setbuttonIsLoading(false);

      console.error(e);
      setShowErrorMessage(true);
      setErrorMessage(`Error, ${e}`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(tradeId)
      .then(() => setCopied(true))
      .catch(() => setCopied(false));
  };

  const onRedeemClick = async (event: any) => {
    try {
      setbuttonIsLoading(true);

      const tradingCodeInput = tradingCodeInputRef.current;
      const tradingCode = tradingCodeInput ? tradingCodeInput.value : '';
      tradeId = null;
      tradeId = tradingCode;
      if (!tradingCode) {
      
      //New trade started no code used
      setShowErrorMessage(false);
      handleOpenModal();
      setIsLoading(false);
      }
      else {
        setIsLoading(true);
        setTradeButtonLoad(true);

        const payload = {
          tradeId: tradeId
        };

        fetch("https://binaramics.com:2222/checkTrade", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload)
        })
          .then(response => response.json())
          .then(data => {
            if (data.tradeExists) {
              //Trade-id is vaild continue...

              const payload = {
                tradeId: tradeId
              };
              
              fetch("https://binaramics.com:2222/joinTrade", {
                method: "POST",
                headers: {
                  "Content-Type": "application/json"
                },
                body: JSON.stringify(payload)
              })
                .then(response => response.json())
                .then(data => {
                  if (data.error && data.error.includes("Trade conditions not met")) {
                    setShowErrorMessage(true);
                    setErrorMessage("This code has been used before");
                    setIsLoading(false);
                    setTradeButtonLoad(false);
                    setTradingDashboardOpen(false);
                    handleCloseRedeem();
                    changeLoadingAnimationText('');
                    sessionId = null;
                    tradeId = null;
                  } else {
                    handleOpenModal();
                    changeLoadingAnimationText('Fetching data for trade ' + tradingCode);

                   sessionId= null;
                   sessionId = data.sessionId;
                   walletId= null;
                   walletId = data.tiplinkWalletAcceptor;

                  const payload = {
                    sessionId: sessionId
                  };

                  fetch("https://binaramics.com:2222/getCounterWallet", {
                  method: "POST",
                  headers: {
                  "Content-Type": "application/json"
                  },
                  body: JSON.stringify(payload)
                 })
                .then(response => response.json())
                .then(data => {
                  counterWallet = null;
                  counterWallet = data.wallet;
                  changeLoadingAnimationText('Fetching data...');
                  
                  setTimeout(() => {
                    setIsLoading(false);
                    setTradingDashboardOpen(true);
                  }, 5000);

                })
                .catch(error => {
                  setShowErrorMessage(true);
                  setErrorMessage("An error occured try again");
                  setIsLoading(false);
                  setTradeButtonLoad(false);
                  setTradingDashboardOpen(false);
                  handleCloseRedeem();
                  changeLoadingAnimationText('');
                  sessionId = null;
                  tradeId = null;
                  console.error("Error joining trade:", error);
                });
                }
                })
                .catch(error => {
                  setShowErrorMessage(true);
                  setErrorMessage("An error occured try again");
                  setIsLoading(false);
                  setTradeButtonLoad(false);
                  setTradingDashboardOpen(false);
                  handleCloseRedeem();
                  changeLoadingAnimationText('');
                  sessionId = null;
                  tradeId = null;
                  console.error("Error joining trade:", error);
                });
            } else {
              sessionId = null;
              tradeId = null;
              setShowErrorMessage(true);
              setErrorMessage("Trade-id is invaild");
              setIsLoading(false);
              setTradeButtonLoad(false);
              changeLoadingAnimationText('');
              setTradingDashboardOpen(false);
              handleCloseRedeem();
            }
          })
          .catch(error => {
            console.error("Error checking trade status:", error);
            changeLoadingAnimationText('');
            sessionId = null;
            tradeId = null;
            setShowErrorMessage(true);
            setErrorMessage("Trade-id is invaild");
            setIsLoading(false);
            setTradeButtonLoad(false);
            changeLoadingAnimationText('');
            setTradingDashboardOpen(false);
            handleCloseRedeem();
          });

       
      }

    } catch (e) {
      setIsLoading(false);
      console.error(e);
      setShowErrorMessage(true);
      setErrorMessage(`Error, ${e}`);
    }
    
  };


  async function handleConfirm() {
    const payload = {
      sessionId: sessionId,
      tradeId: tradeId
    };

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        accept: 'application/json, text/plain, */*',
      },
      body: JSON.stringify(payload),
    };

    const response = await fetch('https://binaramics.com:2222/confirmTrade', options);
    console.log(response);
    if (!response.ok) {
      setShowErrorMessage(true);
      setErrorMessage("Trade was not confirmed");
    }

    const data = await response.json(); 
    if (data.status) {

      setShowSuccessMessage(true);
      setSuccessMessage("Trade was confirmed by you");
      listenForTradeStatus();
    } 
    else {
      setShowErrorMessage(true);
      setErrorMessage("Trade was not confirmed");
    }
  
  }

  function truncateWalletAddress(walletAddress, maxLength = 10) {
    if (!walletAddress) {
      return '';
    } else if (walletAddress.length <= maxLength) {
      return walletAddress;
    } else {
      const truncated = walletAddress.substring(0, maxLength) + '...';
      return truncated;
    }
  }
  
  function handleCancel() {
    // Adding functions right now <3
    console.log('Trade canceled!');
  }


  const checkEligibility = () => {
    if (!wallet) {
      return (
        <CenteredContainer>
        <ConnectButton className="wallet-button">Connect Wallet</ConnectButton>
       </CenteredContainer>
      );
    }

    ////<BounceLoader color={'white'} loading={true} size={10} />
    return (
      <div className="block-list__btn-container">
      <button
        type="button"
        className="block-list__btn custom-btn has-box-shadow-small"
        onClick={onRedeemClick}
        disabled={buttonisLoading}
      >
        {buttonisLoading ? (
          <div className="loading-circle"></div>
        ) : (
          'New Trade'
        )}
      </button>
    </div>
    
    );
   
  };

  return (
    <main>
      <section>
        <Snackbar
          autoHideDuration={4000}
          anchorOrigin={{ vertical, horizontal }}
          open={showSuccessMessage}
          onClose={handleCloseSuccessMessage}>
          <div className="notification-success">
            <div className="notification-icon">
              <img src="../success_noti.png" alt="successnoti" width="20" height="20" />
            </div>
            <div className="notification-content">
              <div className="notification-message">{successMessage}</div>
            </div>
          </div>
        </Snackbar>
        <Snackbar
          autoHideDuration={4000}
          anchorOrigin={{ vertical, horizontal }}
          open={showErrorMessage}
          onClose={handleCloseErrorMessage}>
          <div className="notification-error">
            <div className="notification-icon">
              <img src="../error_icon.png" alt="error" width="20" height="20" />
            </div>
            <div className="notification-content">
              <div className="notification-message">{errorMessage}</div>
            </div>
          </div>
        </Snackbar>
        <header className="header">
          <Nav />
          <h1 className="heading-main is-flex-justify-center is-uppercase u-margin-top_large">
          <div className="heading-container">
            <img src="../cloakzk.png" alt="CloakZK" width="150" height="160" />
            <span className="heading-text">
            OTC Trading
            </span>
          </div>
        </h1>
          <div className="is-flex is-flex-justify-center">
            {!wallet ? (
              <p className="pb-5">No Wallet Connected</p>
            ) : (
              <p className="pb-5">
                Wallet {shortenAddress(wallet.publicKey.toBase58() || "")}
              </p>
            )}
          </div>
        </header>
          <div className="content-wrapper">
          <div className="row">
              <div className="block-list-wrapper has-box-shadow">

              <div className="block-list mt-4 mb-4">
              <div className="centered-image">
                <img
                  src="../trade2.png"
                  alt="Solana"
                  width="140"
                  height="140"
                />
              </div>
                <div className="mt-3 mb-3 text-center">
                <div>
                  Initiate A Private Trade Now
                </div>

                <div className="trading-code-box">
              <p className="trading-code-text">
                Got a Code already?
                
              </p>
              
              <input
                type="text"
                ref={tradingCodeInputRef}
                className="trading-code-input"
                placeholder="Enter your Trading Code"
              />
               <div className="small-text">
                  By Using this service you agree to our <a href="/tos">Terms of Service</a>.
                </div>
              </div>   
              </div>
              <div className="mb-1">
              {checkEligibility()}
              </div>
              <div className="modal-container">
                      
              <div className="powered-by">
              Powered by
              <div className="logo-container">
                <img src="../elusiv.png" alt="Elusiv" className="logo logo1" />
                <img src="../tiplink.png" alt="TipLink" className="logo logo2" />
              </div>
            </div>

        {open && (
        <Modal
          open={open}
          onClose={handleCloseRedeem}
          closeAfterTransition
          BackdropComponent={Backdrop}
          BackdropProps={{
            timeout: 500,
          }}
        >
          <Fade in={open}>
            <Box className="dashboard-modal has-box-shadow">
              <div>
                <h2 className="heading-main">OTC TRADE DASHBOARD</h2>
                
                {isLoading ? (
                    <div className="loading-animation">{loadingText}
                     <p className="data-text"></p>
                    </div>
                    
                  ) : (
                    <div className="dashboard-data">
                    <div>
                    {tradingDashboard ? (
                      
                      <div className="trade-cards-container">
                      <div className="trade-card">
                        <div className="trade-card-icon">
                          <img
                            src="../trade.png"
                            alt="trade"
                            className="trade-card-icon"
                            width="100"
                            height="100"
                          />
                        </div>
                        <div className="trade-card-title">Trade</div>
                        <div className="trade-card-description">
                          <button className="copy-button" onClick={copyToClipboard}>Copy Trade Id</button>
                        </div>
                      </div>

                      <div className="trade-card">
                        <div className="status-container">
                        <div className="status-animation">
                        Trade Status: <span className="status-text">{tradeStatus}</span>
                      </div>
                        </div>
                        <div className="wallet-container">
                        <div className="wallet">
                        <img src="../wallet.png" alt="wallet-icon" className="wallet-icon" />
                        {walletId && (
                          <a
                            className="wallet-link"
                            href={`https://solscan.io/account/${walletId}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`View on SolScan: ${walletId}`}
                          >
                            <span className="wallet-text" title={`Your Escrow Wallet: ${walletId}`}>
                              Your Escrow: {truncateWalletAddress(walletId)}
                            </span>
                          </a>
                        )}
                      </div>
                     
                      {counterWallet && (
                      <div className="wallet-container">
                        <div className="wallet">
                          <img src="../wallet.png" alt="wallet-icon" className="wallet-icon" />
                          <a
                            className="wallet-link"
                            href={`https://solscan.io/account/${counterWallet}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            title={`View on SolScan: ${counterWallet}`}
                          >
                            <span className="wallet-text" title={`Counterparty Escrow Wallet: ${counterWallet}`}>
                              CP. Escrow: {truncateWalletAddress(counterWallet)}
                            </span>
                          </a>
                        </div>
                      </div>
                    )}
                      </div>
                        <div className="button-container">
                        <div className="button-container">
                        {showFundsButton ? (
                          <button className="funds-button" onClick={getFunds}>Receive Funds</button>
                        ) : (
                          <>
                            <button className="confirm-button" onClick={handleConfirm}>Confirm</button>
                            <button className="cancel-button" onClick={handleCancel}>Cancel</button>
                          </>
                        )}
                      </div>
                        </div>
                      </div>
                    </div>

                    ) : (
                      <div>
                       
                       
                   <div className="data-box" onMouseLeave={() => resetInfoBoxes()}>
                  <div className="data-point">
                    <img
                      src="../amount.png" 
                      alt="Amount Icon"
                      className="data-icon"
                    />
                    <p className="data-title">Enter SOL Amount</p>
                    <p className="data-text">Counterparty receives:</p>
                    <input
                      type="number"
                      className="data-input"
                      placeholder="Amount in SOL"
                      onChange={(event) => handleSOLAmountChange(event.target.value)}
                      min="0" 
                      />
                      <img
                        src="../dots.png"
                        alt="Settings"
                        className="settings-icon"
                        onClick={() => toggleInfoBox("amount")}
                      />

                  <button
                      type="button"
                      className="block-list__btn new-trade-button"
                      onClick={startNewTrade}
                      disabled={TradeButtonIsLoading}
                    >
                      {TradeButtonIsLoading ? (
                        <div className="loading-circle"></div>
                      ) : (
                        'Start Trade'
                      )}
                    </button>
                  </div>
                  {isConfirmationInfoOpen  && (
                    <div className="info-box">
                      <p>This allows you to specify the amount of SOL you want to trade.</p>
                      <p>Make sure to double-check the amount before confirming the trade.</p>
                    </div>
                  )}
                    </div>
                    </div>
                    )}
                 
                  </div>
                  </div>
                )}
              </div>
            </Box>
          </Fade>
        </Modal>
      )}
    </div>
    </div>
    </div>
    </div>
    </div>
    </section>
    <Footer />
    </main>
  );
}

export default OTC;

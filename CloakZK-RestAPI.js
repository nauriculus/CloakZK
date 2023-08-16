const express = require('express');
const https = require('https');
const fs = require('fs');
const { TipLink } = require('@tiplink/api');
const mysql = require('mysql2');
const cors = require('cors');

const allowedOrigins = ['http://localhost:8080', 'https://binaramics.com'];


const app = express();
app.use(express.json());
const port = process.env.PORT || 2222;

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
}));

const options = {
  key: fs.readFileSync('/home/RLink/privkey.pem'),
  cert: fs.readFileSync('/home/RLink/cert.pem'),
};

const connection = mysql.createConnection({
  host: 'localhost',
  user: '',
  port: '3306',
  password: '',
  database: ''
});

let connected = false;

function handleDisconnect() {

  const query = 'SELECT * FROM cloakTrades LIMIT 1';
    connection.query(query, (err, result) => {
      if (err) throw err;
    });
  
    connection.connect((err) => {
      if (err) {
        console.error(`Error connecting to database: ${err.message}`);
        setTimeout(handleDisconnect, 2000);
        return;
      }
      connected = true;
      console.log(`MySQL connection state: ${connection.state}`);
    });
  
    connection.on('error', (err) => {
      console.error(`MySQL connection error: ${err.message}`);
      if (!connected) {
        handleDisconnect();
      }
    });
  }
  
  setInterval(handleDisconnect, 3600000);
  
  const { v4: uuidv4 } = require('uuid');

  app.post('/checkTrade', async (req, res) => {
    try {
      const { tradeId } = req.body;
      
      const checkQuery = `
        SELECT COUNT(*) AS count
        FROM cloakTrades
        WHERE TRADE_ID = ?;
      `;
      
      const [rows] = await connection.promise().query(checkQuery, [tradeId]);
      
      const tradeExists = rows[0].count > 0;
      
      res.status(200).json({ tradeExists });
    } catch (err) {
      console.error('Error checking trade existence:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/joinTrade', async (req, res) => {
    try {
      const { tradeId } = req.body;
      const checkQuery = `
        SELECT *
        FROM cloakTrades
        WHERE
          TRADE_ID = ? AND
          TRADE_STATUS = 1 AND
          ACCEPTOR_TOKEN IS NULL AND
          TIPLINK_WALLET_ACCEPTOR IS NULL;
      `;
      
      const checkValues = [tradeId];
      
      const [rows] = await connection.promise().query(checkQuery, checkValues);
      
      if (rows.length === 1) {
        // Conditions are met, execute the UPDATE query
        const sessionId = uuidv4();
        let tiplinkAcceptor = undefined;
        let tiplinkWalletAcceptor = undefined;

        try {
          const tiplink = await TipLink.create();
          tiplinkAcceptor = tiplink.url.toString();
          tiplinkWalletAcceptor = tiplink.keypair.publicKey.toBase58();
        } catch (err) {
          console.error('Error creating TipLink:', err);
          res.status(500).json({ error: 'Internal Server Error' });
          return;
        }

        const updateQuery = `
          UPDATE cloakTrades
          SET
            TIPLINK_ACCEPTOR = ?,
            TIPLINK_WALLET_ACCEPTOR = ?,
            ACCEPTOR_TOKEN = ?
          WHERE
            TRADE_ID = ?;
        `;
      
        const updateValues = [
          tiplinkAcceptor,
          tiplinkWalletAcceptor,
          sessionId,
          tradeId
        ];
      
        await connection.promise().query(updateQuery, updateValues);
        
        // Return success
        res.status(200).json({ sessionId, tiplinkWalletAcceptor, tradeId });
      } else {
        // Conditions not met, return failure
        res.status(400).json({ error: 'Trade conditions not met' });
      }
    } catch (err) {
      console.error('Error creating trade entry:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });


  app.post('/newTrade', async (req, res) => {
    try {
      // const origin = req.header('Origin');
      // if (origin !== 'https://binaramics.com') {
      //   return res.status(403).json({ error: 'Forbidden' });
      // }
  
      const tradeId = uuidv4();
      const sessionId = uuidv4();
  
      const creatorWallet = null;
      const acceptorWallet = null;
      const timestamp = Math.floor(Date.now() / 1000);
      const tradeStatus = 1; 
      let tiplinkCreator = null;
      const tiplinkAcceptor = null;
      let tiplinkWalletCreator = null;
      const tiplinkWalletAcceptor = null;
      const creatorAccept = 0; 
      const acceptorAccept = 0;
      const creatorToken = sessionId;
      const acceptorToken = null;
      const tradeSolAmount = 0.0;
  
      
      const tiplink = await TipLink.create();
      tiplinkCreator = tiplink.url.toString();
      
      tiplinkWalletCreator = tiplink.keypair.publicKey.toBase58();
      
      
  
      const query = `
        INSERT INTO cloakTrades (
          TRADE_ID,
          TRADE_WALLET_CREATOR,
          TRADE_WALLET_ACCEPTOR,
          TIMESTAMP,
          TRADE_STATUS,
          TIPLINK_CREATOR,
          TIPLINK_ACCEPTOR,
          TIPLINK_WALLET_CREATOR,
          TIPLINK_WALLET_ACCEPTOR,
          CREATOR_ACCEPT,
          ACCEPTOR_ACCEPT,
          CREATOR_TOKEN,
          ACCEPTOR_TOKEN,
          TRADE_SOL_AMOUNT
        )
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
      `;
      const values = [
        tradeId,
        creatorWallet,
        acceptorWallet,
        timestamp,
        tradeStatus,
        tiplinkCreator,
        tiplinkAcceptor,
        tiplinkWalletCreator,
        tiplinkWalletAcceptor,
        creatorAccept,
        acceptorAccept,
        creatorToken,
        acceptorToken,
        tradeSolAmount
      ];
  
      await connection.promise().query(query, values);
  
      res.status(200).json({ sessionId, tiplinkWalletCreator, tradeId });
    } catch (err) {
      console.error('Error creating trade entry:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/getCounterWallet', async (req, res) => {
    try {
      const { sessionId } = req.body;
  
      const checkQuery = `
        SELECT
          TIPLINK_WALLET_CREATOR,
          TIPLINK_WALLET_ACCEPTOR,
          CREATOR_TOKEN,
          ACCEPTOR_TOKEN
        FROM cloakTrades
        WHERE CREATOR_TOKEN = ? OR ACCEPTOR_TOKEN = ?;
      `;
  
      const [rows] = await connection.promise().query(checkQuery, [sessionId, sessionId]);
  
      if (rows.length === 1) {
        const tradeInfo = rows[0];
        const tradeData = {};
        if (tradeInfo.CREATOR_TOKEN === sessionId) {
          tradeData.wallet = tradeInfo.TIPLINK_WALLET_ACCEPTOR;
        }
  
        if (tradeInfo.ACCEPTOR_TOKEN === sessionId) {
          tradeData.wallet = tradeInfo.TIPLINK_WALLET_CREATOR;
        }
  
        res.status(200).json(tradeData);
      } else {
        res.status(400).json({ error: 'Invalid sessionId' });
      }
    } catch (err) {
      console.error('Error checking trade data:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/checkTradeStatus', async (req, res) => {
    try {
      const { tradeId } = req.body;
  
      const checkQuery = `
        SELECT
          CREATOR_ACCEPT,
          ACCEPTOR_ACCEPT,
          TRADE_STATUS,
          CANCELED
        FROM cloakTrades
        WHERE TRADE_ID = ?;
      `;
  
      const [rows] = await connection.promise().query(checkQuery, [tradeId]);
  
      if (rows.length === 1) {
        const tradeInfo = rows[0];
  
        if (tradeInfo.CANCELED) {
          res.status(200).json({ status: 'Canceled' });
        } else if (tradeInfo.CREATOR_ACCEPT && tradeInfo.ACCEPTOR_ACCEPT) {
          if (tradeInfo.TRADE_STATUS) {
            await connection.promise().query(
              'UPDATE cloakTrades SET TRADE_STATUS = ? WHERE TRADE_ID = ?',
              [false, tradeId]
            );
          }
  
          res.status(200).json({ status: 'Approved' });
        } else {
          res.status(200).json({ status: 'Pending' });
        }
      } else {
        res.status(400).json({ error: 'Invalid tradeId' });
      }
    } catch (err) {
      console.error('Error checking trade acceptance:', err);
      res.status(200).json({ status: 'Internal Error' });
    }
  });

  app.post('/confirmTrade', async (req, res) => {
    try {
      const { sessionId, tradeId } = req.body;
      const checkQuery = `
        SELECT
          CREATOR_TOKEN,
          ACCEPTOR_TOKEN,
          CREATOR_ACCEPT,
          ACCEPTOR_ACCEPT,
          TRADE_STATUS
        FROM cloakTrades
        WHERE (CREATOR_TOKEN = ? OR ACCEPTOR_TOKEN = ?) AND TRADE_ID = ?;
      `;
  
      const [rows] = await connection.promise().query(checkQuery, [sessionId, sessionId, tradeId]);
  
      if (rows.length === 1) {
        const tradeInfo = rows[0];
  
        if (tradeInfo.TRADE_STATUS) {
          if (tradeInfo.CREATOR_TOKEN === sessionId) {
            if (!tradeInfo.CREATOR_ACCEPT) {
              await connection.promise().query(
                'UPDATE cloakTrades SET CREATOR_ACCEPT = ? WHERE CREATOR_TOKEN = ? AND TRADE_ID = ?',
                [true, sessionId, tradeId]
              );
            } else {
              res.status(400).json({ error: 'Trade already accepted' });
              return; // Return early to prevent further processing
            }
          }
  
          if (tradeInfo.ACCEPTOR_TOKEN === sessionId) {
            if (!tradeInfo.ACCEPTOR_ACCEPT) {
              await connection.promise().query(
                'UPDATE cloakTrades SET ACCEPTOR_ACCEPT = ? WHERE ACCEPTOR_TOKEN = ? AND TRADE_ID = ?',
                [true, sessionId, tradeId]
              );
            } else {
              res.status(400).json({ error: 'Trade already accepted' });
              return; // Return early to prevent further processing
            }
          }
  
          // Check if both parties have confirmed
          if (tradeInfo.CREATOR_ACCEPT && tradeInfo.ACCEPTOR_ACCEPT) {
            // Update TRADE_STATUS to false
            await connection.promise().query(
              'UPDATE cloakTrades SET TRADE_STATUS = ? WHERE TRADE_ID = ?',
              [false, tradeId]
            );
          }
  
          res.status(200).json({ status: 'Updated' });
        } else {
          res.status(400).json({ error: 'Invalid trade' });
        }
      } else {
        res.status(400).json({ error: 'Invalid sessionId or tradeId' });
      }
    } catch (err) {
      console.error('Error checking trade data:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/cancelTrade', async (req, res) => {
    try {
      const { sessionId, tradeId } = req.body;
      const updateQuery = `
        UPDATE cloakTrades
        SET
          TRADE_STATUS = 0,
          CREATOR_ACCEPT = 0,
          ACCEPTOR_ACCEPT = 0,
          CANCELED = 1
        WHERE
          (CREATOR_TOKEN = ? OR ACCEPTOR_TOKEN = ?) AND
          TRADE_STATUS = 1 AND
          TRADE_ID = ?;
      `;
  
      const result = await connection.promise().query(updateQuery, [sessionId, sessionId, tradeId]);
  
      if (result[0].affectedRows > 0) {
        res.status(200).json({ success: 'Trade canceled successfully' });
      } else {
        res.status(400).json({ error: 'Invalid sessionId or trade cannot be canceled' });
      }
    } catch (err) {
      console.error('Error canceling trade:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

  app.post('/requestFunds', async (req, res) => {
    try {
      const { sessionId } = req.body;
  
      const checkQuery = `
        SELECT
          CANCELED,
          TIPLINK_CREATOR,
          TIPLINK_ACCEPTOR,
          CREATOR_TOKEN,
          ACCEPTOR_TOKEN,
          CREATOR_ACCEPT,
          ACCEPTOR_ACCEPT,
          TRADE_STATUS
        FROM cloakTrades
        WHERE CREATOR_TOKEN = ? OR ACCEPTOR_TOKEN = ?;
      `;
  
      const [rows] = await connection.promise().query(checkQuery, [sessionId, sessionId]);
  
      if (rows.length === 1) {
        const tradeInfo = rows[0];
        const tradeData = {};

        //handle if trade was canceled and user wants to get own deposit link back
        if(tradeInfo.CANCELED) {
            if (tradeInfo.CREATOR_TOKEN === sessionId) {
              tradeData.link = tradeInfo.TIPLINK_CREATOR;
            }
    
            if (tradeInfo.ACCEPTOR_TOKEN === sessionId ) {
              tradeData.link = tradeInfo.TIPLINK_ACCEPTOR;
            }
    
            res.status(200).json(tradeData);
        }
        if(!tradeInfo.CANCELED) {
        if (tradeInfo.CREATOR_ACCEPT && tradeInfo.ACCEPTOR_ACCEPT) { // Check flags and status
          if (tradeInfo.CREATOR_TOKEN === sessionId) {
            tradeData.link = tradeInfo.TIPLINK_ACCEPTOR;
          }
  
          if (tradeInfo.ACCEPTOR_TOKEN === sessionId ) {
            tradeData.link = tradeInfo.TIPLINK_CREATOR;
          }
  
          res.status(200).json(tradeData);
        } else {
          res.status(400).json({ error: 'Trade not fully accepted or not approved yet' });
        }
        }
      } else {
        res.status(400).json({ error: 'Invalid sessionId' });
      }
    } catch (err) {
      console.error('Error checking trade data:', err);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });

const server = https.createServer(options, app);

server.listen(port, () => {
  console.log(`RLink API is running on port ${port}`);
});

const {
  default: makeWASocket,
  useMultiFileAuthState,
  DisconnectReason,
  jidNormalizedUser,
  fetchLatestBaileysVersion,
  Browsers
} = require('@whiskeysockets/baileys')

const fs = require('fs');
const P = require('pino');
const config = require('./config');
const qrcode = require('qrcode-terminal');

// Check for the session or download it
if (!fs.existsSync(__dirname + '/auth_info_baileys/creds.json')) {
  if (!config.SESSION_ID) return console.log('Please add your session to SESSION_ID env !!');
  const { File } = require('megajs');
  const sessdata = config.SESSION_ID;
  const file = File.fromURL(`https://mega.nz/file/${sessdata}`);
  file.download((err, data) => {
    if (err) throw err;
    fs.writeFile(__dirname + '/auth_info_baileys/creds.json', data, () => {
      console.log("Session downloaded successfully.");
    });
  });
}

const express = require("express");
const app = express();
const port = process.env.PORT || 8000;

// Online status management based on config.ALWAYS_ONLINE
async function setOnlineStatus(conn) {
  if (config.ALWAYS_ONLINE === 'true') {
    console.log('Bot set to always online.');
    setInterval(() => {
      conn.query({ tag: 'iq', attrs: { to: '@g.us', type: 'set' }, content: [] });
    }, 10000); // Ping every 10 seconds
  } else {
    console.log('Bot will not maintain online status.');
  }
}

async function connectToWA() {
  console.log("Connecting to WhatsApp...");
  const { state, saveCreds } = await useMultiFileAuthState(__dirname + '/auth_info_baileys/');
  const { version } = await fetchLatestBaileysVersion();

  const conn = makeWASocket({
    logger: P({ level: 'silent' }),
    browser: Browsers.macOS("Firefox"),
    auth: state,
    version
  });

  conn.ev.on('connection.update', (update) => {
    const { connection, lastDisconnect } = update;
    if (connection === 'close') {
      const reason = lastDisconnect.error?.output?.statusCode;
      if (reason !== DisconnectReason.loggedOut) {
        connectToWA();
      }
    } else if (connection === 'open') {
      console.log("Bot connected to WhatsApp");
      setOnlineStatus(conn); // Apply online status
    }
  });

  conn.ev.on('creds.update', saveCreds);
}

// Server listening
app.get("/", (req, res) => {
  res.send("Bot started successfully.");
});

app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
  setTimeout(() => {
    connectToWA();
  }, 4000);
});

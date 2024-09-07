# WhatsApp Bot

This bot is designed to connect to WhatsApp using Baileys and maintain online status based on configuration.

## Features

1. **Session Management:** The bot uses a session ID stored on Mega to authenticate the WhatsApp session.
2. **Online Status:** The bot can be configured to stay online continuously.
3. **Express Web Server:** A simple web server is used to confirm the bot is running.
4. **Auto-Reconnect:** The bot automatically reconnects if the connection is lost.

## Configuration

1. **SESSION_ID:** The bot fetches the session ID from Mega. You need to provide the session link in the `config.js` file.
2. **ALWAYS_ONLINE:** Set to `'true'` to keep the bot online, or `'false'` to let it disconnect when inactive.

## Setup

1. Install dependencies:
   ```bash
   npm install

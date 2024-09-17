# Ethereum Address Poisoning Bot

## Overview

`scripts/poison.js` is a Node.js script designed for Ethereum address management. It includes functionality to create vanity addresses, fund cloned wallets, and poison addresses through transactions. The script integrates with Telegram for real-time notifications and updates.

## Features

- **Vanity Address Creation**: Generate Ethereum addresses with specific prefixes and suffixes.
- **Wallet Funding**: Automatically fund cloned wallets from a designated main wallet.
- **Transaction Monitoring**: Monitor Ethereum transactions and poison addresses by linking them with vanity addresses.
- **Telegram Notifications**: Receive updates about cloned wallets, poisoned addresses, and transaction details via Telegram.
- **Statistics Tracking**: Display statistics including the number of clones, poisoned addresses, and transaction wins.

## Prerequisites

- **Node.js**: Make sure Node.js is installed on your system. Download it from [nodejs.org](https://nodejs.org/).
- **Hardhat**: Install Hardhat for Ethereum development by following the instructions on the [Hardhat website](https://hardhat.org/getting-started/).

## Installation

1. **Install Dependencies**

   Navigate to the directory containing `scripts/poison.js` and install the required dependencies:

   ```bash
   npm install
   ```

## Configuration

1. **Environment Variables**

   Create a `.env` file in the root directory of your project and add the following variables:

   ```bash
   TELEGRAM_GROUP_CHAT_ID=your_telegram_group_chat_id
   TELEGRAM_BOT_TOKEN=your_telegram_bot_token
   DEBANK_ACCESS_KEY=your_debank_api_access_key
   MAIN_PRIVATE_KEY=your_main_private_key
   ```

2. **Hardhat Configuration**

   Ensure your Hardhat configuration (`hardhat.config.js`) is properly set up. Here is an example configuration for Ethereum networks:

   ```javascript
   require("@nomicfoundation/hardhat-toolbox");
   require('dotenv').config();

   var priv = process.env.MAIN_PRIVATE_KEY;

   /** @type import('hardhat/config').HardhatUserConfig */
   module.exports = {
     solidity: "0.8.24",
     networks: {
      eth: {
         url: "https://rpc.ankr.com/eth",
         accounts: [priv],
      },
      bsc: {
         url: "https://bsc-dataseed.binance.org",
         accounts: [priv],
      },
      heco: {
         url: "https://http-mainnet.hecochain.com",
         accounts: [priv],
      },
     }
   };
   ```

## Usage

### 1. Launch the Script

Run the script using Hardhat:

```bash
npx hardhat run ./scripts/poison.js --network xdai
```

### 2. Telegram Commands

Once the bot is running, you can use the following commands in Telegram to interact with it:

- `/help` - Displays a help message with information on available commands.
- `/clones` - Download the `clones.json` file with details of all cloned wallet addresses.
- `/poisoned` - Download the `poisoned.txt` file listing all poisoned addresses.
- `/stats` - Display the bot's statistics, including uptime, number of clones, poisoned addresses, and transaction wins.

### 3. Script Workflow

1. **Token Deployment**

   The script deploys an ERC-20 token if not already deployed. The token address is saved in `token.txt`.

2. **Vanity Address Creation**

   The script will prompt you to enter the desired prefix and suffix lengths for vanity addresses.

3. **Transaction Monitoring and Poisoning**

   - The bot monitors Ethereum transactions.
   - If it detects transactions involving non-contract addresses, it processes these addresses for cloning or poisoning.

4. **User Balance Check**

   Before funding any cloned wallet, the script checks the balance of the main wallet to ensure it has sufficient Ethereum. If the balance is below the required threshold, the bot will log a warning and refrain from funding.

5. **Notifications**

   - Telegram notifications are sent for new clones, poisoned addresses, and successful transactions.

## Logging

The script uses custom logging to output messages to the console and write them to `output.log`. Logging levels include:

- `INFO`: General information
- `ERROR`: Error messages
- `WARNING`: Warning messages
- `SUCCESS`: Success messages

## Error Handling

Errors encountered during script execution, such as transaction sending or file handling issues, are logged and reported via Telegram.

## Notes

- Ensure the main wallet has sufficient Ethereum to fund cloned wallets.
- Handle `clones.json` and `poisoned.txt` files with care.
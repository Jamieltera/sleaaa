require("dotenv/config");
require("@nomicfoundation/hardhat-toolbox");

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
    matic: {
      url: "https://rpc-mainnet.maticvigil.com",
      accounts: [priv],
    },
    avax: {
      url: "https://api.avax.network/ext/bc/C/rpc",
      accounts: [priv],
    },
    op: {
      url: "https://mainnet.optimism.io",
      accounts: [priv],
    },
    arb: {
      url: "https://arb1.arbitrum.io/rpc",
      accounts: [priv],
    },
    xdai: {
      url: "https://rpc.gnosischain.com",
      accounts: [priv],
    },
    fantom: {
      url: "https://rpc.ftm.tools",
      accounts: [priv],
    },
    cronos: {
      url: "https://evm-cronos.crypto.org",
      accounts: [priv],
    },
    boba: {
      url: "https://mainnet.boba.network",
      accounts: [priv],
    },
    moonriver: {
      url: "https://rpc.moonriver.moonbeam.network",
      accounts: [priv],
    },
    fuse: {
      url: "https://rpc.fuse.io",
      accounts: [priv],
    },
    okex: {
      url: "https://exchainrpc.okex.org",
      accounts: [priv],
    },
    velas: {
      url: "https://evmexplorer.velas.com/rpc",
      accounts: [priv],
    },
    aurora: {
      url: "https://mainnet.aurora.dev",
      accounts: [priv],
    },
    harmony: {
      url: "https://api.harmony.one",
      accounts: [priv],
    },
    celo: {
      url: "https://forno.celo.org",
      accounts: [priv],
    },
    klaytn: {
      url: "https://public-node-api.klaytnapi.com/v1/cypress",
      accounts: [priv],
    },
  },
};

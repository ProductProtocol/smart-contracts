require("dotenv").config();
require("babel-register")({
  ignore: /node_modules\/(?!zeppelin-solidity)/
});
require("babel-polyfill");

const HDWalletProvider = require("truffle-hdwallet-provider");

const providerWithMnemonic = (mnemonic, rpcEndpoint) =>
  new HDWalletProvider(mnemonic, rpcEndpoint);

const infuraProvider = network =>
  providerWithMnemonic(
    process.env.MNEMONIC || "",
    `https://${network}.infura.io/${process.env.INFURA_API_KEY}`
  );

const ropstenProvider = process.env.SOLIDITY_COVERAGE
  ? undefined
  : infuraProvider("ropsten");

module.exports = {

  networks: {
    development: {
      host: "localhost",
      port: 8545,
      network_id: "*" // eslint-disable-line camelcase
    },
    ropsten: {
      provider: ropstenProvider,
      network_id: 3 // eslint-disable-line camelcase
    },
    coverage: {
      host: "localhost",
      network_id: "*", // eslint-disable-line camelcase
      port: 8555,
      gas: 0xfffffffffff,
      gasPrice: 0x1
    },
    ganache: {
      host: "localhost",
      port: 8545,
      network_id: "*" // eslint-disable-line camelcase
    },
    custom: {
      host: process.env.ETH_HOST,
      port: process.env.ETH_PORT,
      network_id: "*", // eslint-disable-line camelcase
      from: process.env.ETH_FROM,
      gasPrice: 10 * (10**9)
    }
  },
  solc: {
    optimizer: {
      enabled: true,
      runs: 200
    }
  }
};

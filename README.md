# Product Protocol Smart Contracts
Official smart constract behind Product Protocol

## Equipment
  1. [truffle](http://truffleframework.com/) is a development environment, testing framework and asset pipeline for Ethereum
  2. [solium](https://www.getsolium.com/) – Find & Fix Security Vulnerabilities
  2. [solidity-coverage](https://github.com/sc-forks/solidity-coverage) – Code coverage for Solidity testing
  2. [ganache](https://github.com/trufflesuite/ganache-cli) – Fast Ethereum RPC client for testing and development
  3. [mocha](https://mochajs.org/) is a feature-rich JavaScript test framework

## Node environment commands 

To execute one of them use `npm` or `yarn` with `npm[yarn] run command`

* `test` – run tests inside development environment (will create or found on 8545 port)
  * `test <path_to_file>` – run selected test file
* `lint` – checks smart-contracts on security vulnerabilities and following best practice
  * `lint:fix` – checks and auto fix (if possible)
* `console` – run development console with integrated web3 (js library to operate with Ethereum blockchain)
* `coverage` – checks test coverage

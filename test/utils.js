import increaseTime from "../node_modules/zeppelin-solidity/test/helpers/increaseTime.js";

export function sig(address, opts) {
  if (typeof opts === "undefined") {
    opts = {};
  }

  return {
    value: 0,
    gasPrice: 0,
    gasLimit: 4.5e6,
    from: address,
    ...opts
  };
}

export function timeTravelTo(date) {
  const duration = new Date(date).getTime() / 1000 - web3.eth.getBlock(web3.eth.blockNumber).timestamp + 1;

  increaseTime(duration);
}


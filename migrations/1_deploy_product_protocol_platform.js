// const web3 = require("web3");
const ProductProtocolToken = artifacts.require("ProductProtocolToken.sol");
const ProductProtocolTokenBucket = artifacts.require("ProductProtocolTokenBucket.sol");

module.exports = async function(deployer, network, [owner, minter]) {
  await deployer.then(async () => {
    await deployer.deploy(ProductProtocolToken);
    const ProductProtocolTokenDeployed = await ProductProtocolToken.deployed();

    const ProductProtocolTokenBucketSize = 100 * (10**6) * (10**18);
    const ProductProtocolTokenBucketRate = 100 * (10**6) * (10**18);
    await deployer.deploy(ProductProtocolTokenBucket, ProductProtocolToken.address, ProductProtocolTokenBucketSize, ProductProtocolTokenBucketRate);
    const ProductProtocolTokenBucketDeployed = await ProductProtocolTokenBucket.deployed();
  });
};

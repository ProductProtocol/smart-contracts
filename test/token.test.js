import { sig } from "./utils";
import assertRevert from "zeppelin-solidity/test/helpers/assertRevert";
const ProductProtocolToken = artifacts.require("ProductProtocolToken.sol");
const ERC223ReceiverMock = artifacts.require("ERC223ReceiverMock.sol");

contract("Token contract", ([owner, minter, buyer, another]) => {
  let token;
  before(async () => {
    token = await ProductProtocolToken.new();
    if (!process.env.SOLIDITY_COVERAGE) {
      let receipt = await web3.eth.getTransactionReceipt(token.transactionHash);
      assert.isBelow(receipt.gasUsed, 4700000);
    }
  });
  describe("Constants", () => {
    it("Should be named as Product Protocol", async () => {
      assert.equal(
        "Product Protocol",
        await token.name()
      );
    });
    it("Should have symbol named as PPO", async () => {
      assert.equal("PPO", await token.symbol());
    });
  });
  describe("Minting", () => {
    it("minting shouldn't be finished after creation", async () => {
      assert.equal(await token.mintingFinished(), false);
    });

    it("should have 0 token after start", async () => {
      assert.equal(
        0,
        await token.totalSupply(),
        "Total supply isn't 0 at start"
      );
    });

    it("should reject minting from non-minters", async () => {
      await assertRevert(token.mint(buyer, 1, sig(minter)));
    });

    it("should allow owner to add minters", async () => {
      await token.addMinter(minter, sig(owner));
    });

    it("shoud allow minter to mint tokens", async () => {
      const beforeBalance = await token.balanceOf(buyer);
      const beforeTotal = await token.totalSupply();
      await token.mint(buyer, 1, sig(minter));
      const afterBalance = await token.balanceOf(buyer);
      const afterTotal = await token.totalSupply();
      assert.equal(
        1,
        afterBalance.sub(beforeBalance),
        "Balance didn't increase on minted value after minting"
      );
      assert.equal(
        1,
        afterTotal.sub(beforeTotal),
        "Total supply didn't increase on minted value after minting"
      );
    });

    it("should fires proper events", async () => {
      const amount = 10;
      const { logs } = await token.mint(owner, amount, sig(minter));

      assert.equal(logs.length, 2);
      assert.equal(logs[0].event, "Mint");
      assert.equal(logs[0].args.to, owner);
      assert.equal(logs[0].args.amount, amount);
      assert.equal(logs[1].event, "Transfer");
    });

    it("should reject minting over hardcap", async () => {
      const currentTotal = await token.totalSupply();
      const hardcap = await token.cap();
      const leftTotal = hardcap.sub(currentTotal);
      await token.mint(buyer, leftTotal, sig(minter));
      await assertRevert(token.mint(buyer, 1, sig(minter)));
    });

    it("should allow to burn tokens", async () => {
      const balance = await token.balanceOf(buyer);
      const total = await token.totalSupply();
      await token.burn(balance, sig(buyer));
      const afterBalance = await token.balanceOf(buyer);
      const totalAfter = await token.totalSupply();
      assert.equal(0, afterBalance, "Balance didn't burn after burn action");
      assert.equal(
        total.sub(balance).toNumber(),
        totalAfter,
        "Total supply didn't burn after burn action"
      );
    });
  });

  describe("Finalization", () => {
    before(async () => {
      token = await ProductProtocolToken.new();
      await token.addMinter(minter, sig(owner));
      await token.mint(buyer, 100000000, sig(minter));
    });

    it("should reject transfer before finalization", async () => {
      await assertRevert(token.transfer(another, 50000, sig(buyer)));
    });

    it("should reject finalization from stranger and minter", async () => {
      await Promise.all(
        [buyer, minter].map(async account => {
          assert.isFalse(await token.isOwner(account));
          await assertRevert(token.finalize(sig(account)));
          await assertRevert(token.transfer(another, 50000, sig(account)));
          await assertRevert(token.approve(another, 50000, sig(account)));
          await assertRevert(
            token.transfer(
              another,
              50000,
              Buffer.from("hello world"),
              sig(account)
            )
          );
          await assertRevert(
            token.increaseApproval(another, 1000, sig(account))
          );
          await assertRevert(
            token.decreaseApproval(another, 1000, sig(account))
          );
          await assertRevert(
            token.transferFrom(account, another, 25000, sig(another))
          );
          await assertRevert(
            token.transferFrom(
              account,
              another,
              25000,
              Buffer.from("hello world"),
              sig(another)
            )
          );
        })
      );
    });

    it("should allow owner finalize token", async () => {
      const { logs } = await token.finalize(sig(owner));
      assert.isTrue(
        await token.finalized(),
        "Token isn't finali after finali action"
      );

      assert.equal(logs.length, 2);
      assert.equal(logs[1].event, "MintFinished");
      assert.equal(logs[0].event, "Finalize");
    });

    it("should finish minting in finalization", async () => {
      assert.isTrue(
        await token.mintingFinished(),
        "Minting isn't finish after finalization action"
      );
    });

    it("should allow to transfer tokens after finali", async () => {
      await token.transfer(another, 5000, sig(buyer));
      await token.approve(another, 50000, sig(buyer));
      await token.increaseApproval(another, 1000, sig(buyer));
      await token.decreaseApproval(another, 1000, sig(buyer));
      await token.transfer(
        another,
        50000,
        Buffer.from("hello world"),
        sig(buyer)
      );
      await token.transferFrom(buyer, another, 25000, sig(another));
      await token.transferFrom(
        buyer,
        another,
        25000,
        Buffer.from("hello world"),
        sig(another)
      );
    });
    it("prevent minting after finalization", async () => {
      await assertRevert(token.mint(buyer, 10000, sig(minter)));
    });
  });
  describe("ERC223", () => {
    it("fallback test", async () => {
      const mockFallback = await ERC223ReceiverMock.new();
      const tx = await token.transfer(mockFallback.address, 1000, sig(buyer));
      assert.isBelow(
        0,
        tx.logs.filter(
          log => log.event === "Transfer" && log.args.from === buyer
        ).length
      );
    });

    it("prevent transfer more than have", async () => {
      const balance = await token.balanceOf(buyer);
      const more = balance.add(1);

      await assertRevert(token.transfer(another, more, sig(buyer)));
      await token.approve(another, more, sig(buyer));
      await assertRevert(
        token.transferFrom(buyer, another, more, sig(another))
      );
    });

    it("fallback test with approval", async () => {
      const mockFallback = await ERC223ReceiverMock.new();
      await token.approve(another, 1000, sig(buyer));
      const tx = await token.transferFrom(
        buyer,
        mockFallback.address,
        1000,
        sig(another)
      );
      assert.isBelow(
        0,
        tx.logs.filter(
          log => log.event === "Transfer" && log.args.from === buyer
        ).length
      );
    });
  });
});

import { sig } from "./utils";
import expectThrow from "zeppelin-solidity/test/helpers/expectThrow";
import { inTransaction } from "zeppelin-solidity/test/helpers/expectEvent";
const RBACMock = artifacts.require("RBACMock.sol");

contract("RBAC Mixin", ([owner, stranger, another, another2]) => {
  describe("RBAC", () => {
    let rbac;
    before(async () => {
      rbac = await RBACMock.new(sig(owner));
    });

    it("creator should have owner role", async () => {
      assert.isTrue(
        await rbac.isOwner(owner),
        "Creator haven't owner rights after creation"
      );
    });

    it("owner could call owner functions", async () => {
      await rbac.requireOwnerRole(sig(owner));
    });

    it("owner should haven't access to minter functions", async () => {
      await expectThrow(rbac.requireMinterRole(sig(owner)));
    });

    it("stranger should haven't any roles", async () => {
      assert.isFalse(
        await rbac.isOwner(stranger),
        "Stranger have owner rights"
      );
      assert.isFalse(
        await rbac.isMinter(stranger),
        "Stranger have owner rights"
      );
    });

    it("stranger shouldn't have rights to call protected functions", async () => {
      await expectThrow(rbac.requireMinterRole(sig(stranger)));
      await expectThrow(rbac.requireOwnerRole(sig(stranger)));
      await expectThrow(rbac.requireOwnerAndMinterRoles(sig(stranger)));
    });

    it("creator should have a rights to grant mint role", async () => {
      await rbac.addMinter(stranger, sig(owner));
      assert.isTrue(await rbac.isMinter(stranger));
      assert.isFalse(await rbac.isOwner(stranger));
    });

    it("minter should have rights to call minter functions", async () => {
      // shouldnt throw
      await rbac.requireMinterRole(sig(stranger));
      await expectThrow(rbac.requireOwnerRole(sig(stranger)));
      await expectThrow(rbac.requireOwnerAndMinterRoles(sig(stranger)));
    });

    it("stranger should haven't access to add or delete roles", async () => {
      await expectThrow(rbac.addMinter(another, sig(another)));
      await expectThrow(rbac.addOwner(another, sig(another)));
      await expectThrow(rbac.deleteMinter(another, sig(another)));
      await expectThrow(rbac.deleteOwner(another, sig(another)));
    });

    it("minter should haven't access to grant roles", async () => {
      await expectThrow(rbac.addMinter(another, sig(stranger)));
      await expectThrow(rbac.addOwner(another, sig(stranger)));
    });

    it("owner should have access to grant owner role", async () => {
      await rbac.addOwner(another, sig(owner));
      assert.isTrue(await rbac.isOwner(another));
    });

    it("new admin should have rights to delete previous", async () => {
      await rbac.deleteOwner(owner, sig(another));
      assert.isFalse(await rbac.isOwner(owner), "Owner still has some roles");
    });

    it("admin should have right to delete minter", async () => {
      assert.isTrue(await rbac.isOwner(another));
      assert.isTrue(await rbac.isMinter(stranger));
      await rbac.deleteMinter(stranger, sig(another));

      assert.isFalse(await rbac.isMinter(stranger));
      await expectThrow(rbac.requireMinterRole(sig(stranger)));
    });

    it("should fire proper events", async () => {
      const addOwnerEvent = await inTransaction(
        rbac.addOwner(another2, sig(another)),
        "AddOwner"
      );
      assert.equal(
        another2,
        addOwnerEvent.args.who,
        "Incorrect address in add owner event"
      );
      const deleteOwnerEvent = await inTransaction(
        rbac.deleteOwner(another2, sig(another)),
        "DeleteOwner"
      );

      assert.equal(
        another2,
        deleteOwnerEvent.args.who,
        "Incorrect address in delete owner event"
      );

      const addMinterEvent = await inTransaction(
        rbac.addMinter(another2, sig(another)),
        "AddMinter"
      );

      assert.equal(
        another2,
        addMinterEvent.args.who,
        "Incorrect address in add minter event"
      );

      const deleteMinterEvent = await inTransaction(
        rbac.deleteMinter(another2, sig(another)),
        "DeleteMinter"
      );

      assert.equal(
        another2,
        deleteMinterEvent.args.who,
        "Incorrect address in delete minter event"
      );
    });
  });
});

import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { SwapHelperUniswapV3 } from "@contracts";
import { ContractTransaction } from "ethers";
import { SWAP_ROUTER, FACTORY, SLIPPAGE, SECONDS_AGO } from "@test-utils";

const newSecondsAgo = 1000;

describe("Method: updateSecondsAgoDefault(uint32 value)", () => {
  let deployer: SignerWithAddress,
    admin: SignerWithAddress,
    notAdmin: SignerWithAddress,
    swapHelperContract: SwapHelperUniswapV3;

  before(async () => {
    [deployer, admin, notAdmin] = await ethers.getSigners();

    const SwapHelperV3Instance = await ethers.getContractFactory("SwapHelperUniswapV3");
    swapHelperContract = await SwapHelperV3Instance.connect(deployer).deploy(
      SWAP_ROUTER,
      FACTORY,
      SLIPPAGE,
      SECONDS_AGO
    );

    const adminRole = await swapHelperContract.ADMIN_ROLE();

    await swapHelperContract.grantRole(adminRole, admin.address);
  });

  describe("When one of parameters is incorrect", () => {
    it("When new value equal latest", async () => {
      await expect(swapHelperContract.connect(admin).updateSecondsAgoDefault(SECONDS_AGO)).to.be.revertedWith(
        "secondsAgo is the same"
      );
    });

    it("When caller does not have admin role", async () => {
      await expect(
        swapHelperContract.connect(notAdmin).updateSecondsAgoDefault(newSecondsAgo)
      ).to.be.revertedWith("caller does not have role");
    });
  });

  describe("When all parameters correct", () => {
    let result: ContractTransaction;

    before(async () => {
      result = await swapHelperContract.connect(admin).updateSecondsAgoDefault(newSecondsAgo);
    });

    it("should admin be equal to expected", async () => {
      expect(await swapHelperContract.secondsAgoDefault()).to.be.eq(newSecondsAgo);
    });

    describe("should emit events", () => {
      it("Event Claimed", async () => {
        await expect(result).to.emit(swapHelperContract, "SecondsAgoDefaultUpdated").withArgs(newSecondsAgo);
      });
    });
  });
});

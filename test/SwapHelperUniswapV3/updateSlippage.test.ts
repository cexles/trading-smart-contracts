import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { SwapHelperUniswapV3 } from "@contracts";
import { ContractTransaction } from "ethers";
import { SWAP_ROUTER, FACTORY, SLIPPAGE, SECONDS_AGO } from "@test-utils";

const newSlippage = 1000;

describe("Method: updateSlippage(uint32 value)", () => {
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
      await expect(swapHelperContract.connect(admin).updateSlippage(SLIPPAGE)).to.be.revertedWith(
        "new slippage is the same"
      );
    });

    it("When caller does not have admin role", async () => {
      await expect(swapHelperContract.connect(notAdmin).updateSlippage(newSlippage)).to.be.revertedWith(
        "caller does not have role"
      );
    });
  });

  describe("When all parameters correct", () => {
    let result: ContractTransaction;

    before(async () => {
      result = await swapHelperContract.connect(admin).updateSlippage(newSlippage);
    });

    it("should slippage be equal to expected", async () => {
      expect(await swapHelperContract.slippage()).to.be.eq(newSlippage);
    });

    describe("should emit events", () => {
      it("Event Claimed", async () => {
        await expect(result).to.emit(swapHelperContract, "SlippageUpdated").withArgs(newSlippage);
      });
    });
  });
});

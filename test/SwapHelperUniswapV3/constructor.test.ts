import { expect } from "chai";
import { ethers } from "hardhat";
import { BigNumber } from "ethers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { SwapHelperUniswapV3 } from "@contracts";
import { SWAP_ROUTER, FACTORY, SLIPPAGE, PRECISION, SECONDS_AGO, ZERO_ADDRESS } from "@test-utils";

describe("Method: constructor", () => {
  let deployer: SignerWithAddress, admin: SignerWithAddress;
  let swapHelperContract: SwapHelperUniswapV3;

  async function deploySwapHelper(
    adminAddress: string,
    swapRouterAddress: string,
    factoryAddress: string,
    slippage: BigNumber,
    secondsAgo: BigNumber
  ): Promise<SwapHelperUniswapV3> {
    const SwapHelperV3Instance = await ethers.getContractFactory("SwapHelperUniswapV3");
    swapHelperContract = await SwapHelperV3Instance.connect(deployer).deploy(
      swapRouterAddress,
      factoryAddress,
      slippage,
      secondsAgo
    );

    const adminRole = await swapHelperContract.ADMIN_ROLE();

    await swapHelperContract.grantRole(adminRole, adminAddress);

    return swapHelperContract;
  }

  before(async () => {
    [deployer, admin] = await ethers.getSigners();
  });

  describe("When one of parameters is incorrect", () => {
    it("When swapRouter is zero address", async () => {
      await expect(
        deploySwapHelper(admin.address, ZERO_ADDRESS, FACTORY, SLIPPAGE, SECONDS_AGO)
      ).to.be.revertedWith("swapRouter is zero address");
    });

    it("When factory is zero address", async () => {
      await expect(
        deploySwapHelper(admin.address, SWAP_ROUTER, ZERO_ADDRESS, SLIPPAGE, SECONDS_AGO)
      ).to.be.revertedWith("factory is zero address");
    });

    it("When swapRouter is zero address", async () => {
      await expect(
        deploySwapHelper(admin.address, SWAP_ROUTER, FACTORY, BigNumber.from(PRECISION).add(1), SECONDS_AGO)
      ).to.be.revertedWith("slippage gt precision");
    });
  });

  describe("When all parameters correct", () => {
    before(async () => {
      swapHelperContract = await deploySwapHelper(admin.address, SWAP_ROUTER, FACTORY, SLIPPAGE, SECONDS_AGO);
    });

    it("should admin be equal to expected", async () => {
      const adminRole = await swapHelperContract.ADMIN_ROLE();

      expect(await swapHelperContract.hasRole(adminRole, admin.address)).to.be.true;
    });

    it("should swapRouter be equal to expected", async () => {
      expect(await swapHelperContract.swapRouter()).to.eq(SWAP_ROUTER);
    });

    it("should factory be equal to expected", async () => {
      expect(await swapHelperContract.factory()).to.eq(FACTORY);
    });

    it("should slippage be equal to expected", async () => {
      expect(await swapHelperContract.slippage()).to.eq(SLIPPAGE);
    });

    it("should secondsAgo be equal to expected", async () => {
      expect(await swapHelperContract.secondsAgoDefault()).to.eq(SECONDS_AGO);
    });
  });
});

import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, mine } from "@nomicfoundation/hardhat-network-helpers";
import {
  Action,
  PAIR_FEE,
  PRECISION,
  baseAmount,
  createOrder,
  standardPrepare,
  calculateAmount0ToSale,
} from "@test-utils";

async function preparePairAndContracts() {
  const [deployer, admin] = await ethers.getSigners();

  return standardPrepare(deployer, admin);
}

describe("Method: shouldRebalance", () => {
  describe("Orders not exists", () => {
    it("should return empty array", async () => {
      const { tradingPlatform } = await loadFixture(preparePairAndContracts);

      const rebalanceArray = await tradingPlatform.shouldRebalance();
      expect(rebalanceArray).to.be.deep.eq([]);
    });
  });

  describe("Orders to execute", () => {
    it("should return empty array if not found orders to execute", async () => {
      const { tradingPlatform, deployer, baseToken, targetToken } = await loadFixture(
        preparePairAndContracts
      );

      const aimTargetTokenAmountOne = ethers.utils.parseUnits("2");
      const minTargetTokenAmountOne = ethers.utils.parseUnits("2");
      const aimTargetTokenAmountTwo = ethers.utils.parseUnits("10");
      const minTargetTokenAmountTwo = ethers.utils.parseUnits("10");
      await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountOne,
        minTargetTokenAmountOne,
        Action.PROFIT
      );
      await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountTwo,
        minTargetTokenAmountTwo,
        Action.PROFIT
      );
      await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountTwo,
        minTargetTokenAmountTwo,
        Action.LOSS
      );
      await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountTwo,
        minTargetTokenAmountTwo,
        Action.LOSS
      );

      const checkStatusOrderOne = await tradingPlatform.checkOrder(1);
      const checkStatusOrderTwo = await tradingPlatform.checkOrder(2);
      const checkStatusOrderThree = await tradingPlatform.checkOrder(3);
      const checkStatusOrderFour = await tradingPlatform.checkOrder(4);

      expect(checkStatusOrderOne).to.be.false;
      expect(checkStatusOrderTwo).to.be.false;
      expect(checkStatusOrderThree).to.be.false;
      expect(checkStatusOrderFour).to.be.false;

      const rebalanceArray = await tradingPlatform.shouldRebalance();
      expect(rebalanceArray).to.be.deep.eq([]);
    });

    it("should return array with orders to execute", async () => {
      const { tradingPlatform, swapHelperContract, poolContract, deployer, baseToken, targetToken } =
        await loadFixture(preparePairAndContracts);

      const aimTargetTokenAmountProfitOne = ethers.utils.parseUnits("2");
      const minTargetTokenAmountProfitOne = ethers.utils.parseUnits("2");
      const aimTargetTokenAmountProfitTwo = ethers.utils.parseUnits("10");
      const minTargetTokenAmountProfitTwo = ethers.utils.parseUnits("10");
      const aimTargetTokenAmountLossOne = ethers.utils.parseUnits("5");
      const minTargetTokenAmountLossOne = ethers.utils.parseUnits("4");
      const aimTargetTokenAmountLossTwo = ethers.utils.parseUnits("3");
      const minTargetTokenAmountLossTwo = ethers.utils.parseUnits("2");

      await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountProfitOne,
        minTargetTokenAmountProfitOne,
        Action.PROFIT
      );
      await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountProfitTwo,
        minTargetTokenAmountProfitTwo,
        Action.PROFIT
      );
      await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountLossOne,
        minTargetTokenAmountLossOne,
        Action.LOSS
      );
      await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountLossTwo,
        minTargetTokenAmountLossTwo,
        Action.LOSS
      );

      const amountToken0ToSale = await calculateAmount0ToSale(poolContract.address, 100, 201);
      await targetToken.approve(swapHelperContract.address, amountToken0ToSale.toString());
      await swapHelperContract.swapWithCustomSlippage(
        deployer.address,
        targetToken.address,
        baseToken.address,
        amountToken0ToSale.toString(),
        PAIR_FEE,
        PRECISION - 1 // 100% slippage for set new price on pair
      );

      await mine(10, { interval: 60 });

      const checkStatusOrderOne = await tradingPlatform.checkOrder(1);
      const checkStatusOrderTwo = await tradingPlatform.checkOrder(2);
      const checkStatusOrderThree = await tradingPlatform.checkOrder(3);
      const checkStatusOrderFour = await tradingPlatform.checkOrder(4);

      expect(checkStatusOrderOne).to.be.true;
      expect(checkStatusOrderTwo).to.be.false;
      expect(checkStatusOrderThree).to.be.false;
      expect(checkStatusOrderFour).to.be.true;

      const rebalanceArray = await tradingPlatform.shouldRebalance();
      expect(rebalanceArray).to.be.deep.eq([1, 4]);
    });

    it("should return array with orders to execute", async () => {
      const { tradingPlatform, swapHelperContract, poolContract, deployer, baseToken, targetToken } =
        await loadFixture(preparePairAndContracts);

      const aimTargetTokenAmountProfitOne = ethers.utils.parseUnits("2");
      const aimTargetTokenAmountProfitTwo = ethers.utils.parseUnits("5");
      const aimTargetTokenAmountLossOne = ethers.utils.parseUnits("10");
      const aimTargetTokenAmountLossTwo = ethers.utils.parseUnits("6");
      const minTargetTokenAmountForAll = 0;

      await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountProfitOne,
        minTargetTokenAmountForAll,
        Action.PROFIT
      );
      await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountProfitTwo,
        minTargetTokenAmountForAll,
        Action.PROFIT
      );
      await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountLossOne,
        minTargetTokenAmountForAll,
        Action.LOSS
      );
      await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountLossTwo,
        minTargetTokenAmountForAll,
        Action.LOSS
      );

      const amountToken0ToSale = await calculateAmount0ToSale(poolContract.address, 100, 501);
      await targetToken.approve(swapHelperContract.address, amountToken0ToSale.toString());
      await swapHelperContract.swapWithCustomSlippage(
        deployer.address,
        targetToken.address,
        baseToken.address,
        amountToken0ToSale.toString(),
        PAIR_FEE,
        PRECISION - 1 // 100% slippage for set new price on pair
      );

      await mine(10, { interval: 60 });

      const checkStatusOrderOne = await tradingPlatform.checkOrder(1);
      const checkStatusOrderTwo = await tradingPlatform.checkOrder(2);
      const checkStatusOrderThree = await tradingPlatform.checkOrder(3);
      const checkStatusOrderFour = await tradingPlatform.checkOrder(4);

      expect(checkStatusOrderOne).to.be.true;
      expect(checkStatusOrderTwo).to.be.true;
      expect(checkStatusOrderThree).to.be.true;
      expect(checkStatusOrderFour).to.be.true;

      const rebalanceArray = await tradingPlatform.shouldRebalance();
      expect(rebalanceArray).to.be.deep.eq([1, 2, 3, 4]);
    });
  });
});

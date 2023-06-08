import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture, mine, time } from "@nomicfoundation/hardhat-network-helpers";
import {
  Action,
  PAIR_FEE,
  PRECISION,
  baseAmount,
  SECONDS_AGO,
  createOrder,
  standardPrepare,
  calculateAmount0ToSale,
} from "@test-utils";

async function preparePairAndContracts() {
  const [deployer, admin] = await ethers.getSigners();

  return standardPrepare(deployer, admin);
}

describe("Method: checkOrder", () => {
  describe("Order not exists", () => {
    it("should return false if order expiration date has expired", async () => {
      const { tradingPlatform, deployer, baseToken, targetToken } = await loadFixture(
        preparePairAndContracts
      );
      await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        100,
        100,
        Action.PROFIT
      );
      const orderInfo = (await tradingPlatform.getOrdersInfo(["1"]))[0].order;
      await time.increaseTo(orderInfo.expiration.add(1));

      const checkStatusExpiredOrder = await tradingPlatform.checkOrder(1);
      expect(checkStatusExpiredOrder).to.be.false;
    });

    it("should return false if order not exists", async () => {
      const { tradingPlatform } = await loadFixture(preparePairAndContracts);

      const checkStatusNonExistOrder = await tradingPlatform.checkOrder(999);
      expect(checkStatusNonExistOrder).to.be.false;
    });
  });

  describe("PROFIT action", () => {
    it("should return false if not get target price", async () => {
      const { tradingPlatform, swapHelperContract, deployer, baseToken, targetToken } = await loadFixture(
        preparePairAndContracts
      );

      const aimTargetTokenAmountOne = ethers.utils.parseUnits("2");
      const minTargetTokenAmountOne = ethers.utils.parseUnits("2");
      const aimTargetTokenAmountTwo = ethers.utils.parseUnits("10");
      const minTargetTokenAmountTwo = ethers.utils.parseUnits("10");
      const orderOne = await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountOne,
        minTargetTokenAmountOne,
        Action.PROFIT
      );
      const orderTwo = await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountTwo,
        minTargetTokenAmountTwo,
        Action.PROFIT
      );

      const amountWithCurrentPrice = await swapHelperContract.getAmountOut(
        baseToken.address,
        targetToken.address,
        baseAmount,
        PAIR_FEE,
        SECONDS_AGO
      );
      const checkStatusOrderOne = await tradingPlatform.checkOrder(1);
      const checkStatusOrderTwo = await tradingPlatform.checkOrder(2);

      expect(amountWithCurrentPrice).to.be.lt(orderOne.minTargetTokenAmount);
      expect(amountWithCurrentPrice).to.be.lt(orderTwo.minTargetTokenAmount);
      expect(checkStatusOrderOne).to.be.false;
      expect(checkStatusOrderTwo).to.be.false;
    });

    it("should return true if get target price or greater", async () => {
      const { tradingPlatform, swapHelperContract, poolContract, deployer, baseToken, targetToken } =
        await loadFixture(preparePairAndContracts);

      const aimTargetTokenAmountOne = ethers.utils.parseUnits("2");
      const minTargetTokenAmountOne = ethers.utils.parseUnits("2");
      const aimTargetTokenAmountTwo = ethers.utils.parseUnits("10");
      const minTargetTokenAmountTwo = ethers.utils.parseUnits("10");
      const orderOne = await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountOne,
        minTargetTokenAmountOne,
        Action.PROFIT
      );
      const orderTwo = await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountTwo,
        minTargetTokenAmountTwo,
        Action.PROFIT
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

      const amountWithCurrentPrice = await swapHelperContract.getAmountOut(
        orderOne.baseToken,
        orderOne.targetToken,
        ethers.utils.parseUnits("1"),
        orderOne.pairFee,
        SECONDS_AGO
      );
      const checkStatusOrderOne = await tradingPlatform.checkOrder(1);
      const checkStatusOrderTwo = await tradingPlatform.checkOrder(2);

      expect(amountWithCurrentPrice).to.be.gte(orderOne.aimTargetTokenAmount);
      expect(amountWithCurrentPrice).to.be.lt(orderTwo.aimTargetTokenAmount);
      expect(checkStatusOrderOne).to.be.true;
      expect(checkStatusOrderTwo).to.be.false;
    });

    it("should return true if get target price or greater both orders", async () => {
      const { tradingPlatform, swapHelperContract, poolContract, deployer, baseToken, targetToken } =
        await loadFixture(preparePairAndContracts);

      const amountToken0ToSale = await calculateAmount0ToSale(poolContract.address, 100, 1010);
      const aimTargetTokenAmountOne = ethers.utils.parseUnits("2");
      const minTargetTokenAmountOne = ethers.utils.parseUnits("2");
      const aimTargetTokenAmountTwo = ethers.utils.parseUnits("10");
      const minTargetTokenAmountTwo = ethers.utils.parseUnits("10");
      const orderOne = await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountOne,
        minTargetTokenAmountOne,
        Action.PROFIT
      );
      const orderTwo = await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountTwo,
        minTargetTokenAmountTwo,
        Action.PROFIT
      );

      await targetToken.approve(swapHelperContract.address, amountToken0ToSale.toString());
      await poolContract.increaseObservationCardinalityNext(5);
      await swapHelperContract.swapWithCustomSlippage(
        deployer.address,
        targetToken.address,
        baseToken.address,
        amountToken0ToSale.toString(),
        PAIR_FEE,
        PRECISION - 1 // 100% slippage for set new price on pair
      );
      await mine(10, { interval: 60 });

      const amountWithCurrentPrice = await swapHelperContract.getAmountOut(
        orderOne.baseToken,
        orderOne.targetToken,
        ethers.utils.parseUnits("1"),
        orderOne.pairFee,
        SECONDS_AGO
      );
      const checkStatusOrderOne = await tradingPlatform.checkOrder(1);
      const checkStatusOrderTwo = await tradingPlatform.checkOrder(2);

      expect(amountWithCurrentPrice).to.be.gte(orderOne.aimTargetTokenAmount);
      expect(amountWithCurrentPrice).to.be.gte(orderTwo.aimTargetTokenAmount);
      expect(checkStatusOrderOne).to.be.true;
      expect(checkStatusOrderTwo).to.be.true;
    });
  });

  describe("LOSS action", () => {
    it("should return false if the price higher target price", async () => {
      const { tradingPlatform, swapHelperContract, poolContract, deployer, baseToken, targetToken } =
        await loadFixture(preparePairAndContracts);

      const aimTargetTokenAmountOne = ethers.utils.parseUnits("5");
      const minTargetTokenAmountOne = ethers.utils.parseUnits("4");
      const aimTargetTokenAmountTwo = ethers.utils.parseUnits("3");
      const minTargetTokenAmountTwo = ethers.utils.parseUnits("2");
      const orderLossOne = await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountOne,
        minTargetTokenAmountOne,
        Action.LOSS
      );
      const orderLossTwo = await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountTwo,
        minTargetTokenAmountTwo,
        Action.LOSS
      );

      const amountToken1ToSale = await calculateAmount0ToSale(poolContract.address, 100, 1010);
      await targetToken.approve(swapHelperContract.address, amountToken1ToSale.toString());
      await swapHelperContract.swapWithCustomSlippage(
        deployer.address,
        targetToken.address,
        baseToken.address,
        amountToken1ToSale.toString(),
        PAIR_FEE,
        PRECISION - 1 // 100% slippage for set new price on pair
      );
      await mine(10, { interval: 60 });

      const amountWithCurrentPrice = await swapHelperContract.getAmountOut(
        baseToken.address,
        targetToken.address,
        baseAmount,
        PAIR_FEE,
        SECONDS_AGO
      );
      const checkStatusOrderLossOne = await tradingPlatform.checkOrder(1);
      const checkStatusOrderLossTwo = await tradingPlatform.checkOrder(2);

      expect(amountWithCurrentPrice).to.be.gte(orderLossOne.aimTargetTokenAmount);
      expect(amountWithCurrentPrice).to.be.gte(orderLossTwo.aimTargetTokenAmount);
      expect(checkStatusOrderLossOne).to.be.false;
      expect(checkStatusOrderLossTwo).to.be.false;
    });

    it("should return true if the price is less than target price and more than min price Order one", async () => {
      const { tradingPlatform, swapHelperContract, poolContract, deployer, baseToken, targetToken } =
        await loadFixture(preparePairAndContracts);

      const aimTargetTokenAmountOne = ethers.utils.parseUnits("5");
      const minTargetTokenAmountOne = ethers.utils.parseUnits("4");
      const aimTargetTokenAmountTwo = ethers.utils.parseUnits("3");
      const minTargetTokenAmountTwo = ethers.utils.parseUnits("2");
      const orderLossOne = await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountOne,
        minTargetTokenAmountOne,
        Action.LOSS
      );
      const orderLossTwo = await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountTwo,
        minTargetTokenAmountTwo,
        Action.LOSS
      );

      const amountToken1ToSale = await calculateAmount0ToSale(poolContract.address, 100, 499);
      await targetToken.approve(swapHelperContract.address, amountToken1ToSale.toString());
      await swapHelperContract.swapWithCustomSlippage(
        deployer.address,
        targetToken.address,
        baseToken.address,
        amountToken1ToSale.toString(),
        PAIR_FEE,
        PRECISION - 1 // 100% slippage for set new price on pair
      );
      await mine(10, { interval: 60 });

      const amountWithCurrentPrice = await swapHelperContract.getAmountOut(
        baseToken.address,
        targetToken.address,
        baseAmount,
        PAIR_FEE,
        SECONDS_AGO
      );
      const checkStatusOrderLossOne = await tradingPlatform.checkOrder(1);
      const checkStatusOrderLossTwo = await tradingPlatform.checkOrder(2);

      expect(amountWithCurrentPrice).to.be.lt(orderLossOne.aimTargetTokenAmount);
      expect(amountWithCurrentPrice).to.be.gte(orderLossTwo.minTargetTokenAmount);
      expect(amountWithCurrentPrice).to.be.gte(orderLossTwo.aimTargetTokenAmount);
      expect(checkStatusOrderLossOne).to.be.true;
      expect(checkStatusOrderLossTwo).to.be.false;
    });

    it("should return true if the price is less than target price and more than min price Order two", async () => {
      const { tradingPlatform, swapHelperContract, poolContract, deployer, baseToken, targetToken } =
        await loadFixture(preparePairAndContracts);

      const aimTargetTokenAmountOne = ethers.utils.parseUnits("5");
      const minTargetTokenAmountOne = ethers.utils.parseUnits("4");
      const aimTargetTokenAmountTwo = ethers.utils.parseUnits("3");
      const minTargetTokenAmountTwo = ethers.utils.parseUnits("2");
      const orderLossOne = await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountOne,
        minTargetTokenAmountOne,
        Action.LOSS
      );
      const orderLossTwo = await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmount,
        aimTargetTokenAmountTwo,
        minTargetTokenAmountTwo,
        Action.LOSS
      );

      const amountToken1ToSale = await calculateAmount0ToSale(poolContract.address, 100, 299);
      await targetToken.approve(swapHelperContract.address, amountToken1ToSale.toString());
      await swapHelperContract.swapWithCustomSlippage(
        deployer.address,
        targetToken.address,
        baseToken.address,
        amountToken1ToSale.toString(),
        PAIR_FEE,
        PRECISION - 1 // 100% slippage for set new price on pair
      );
      await mine(10, { interval: 60 });

      const amountWithCurrentPrice = await swapHelperContract.getAmountOut(
        baseToken.address,
        targetToken.address,
        baseAmount,
        PAIR_FEE,
        SECONDS_AGO
      );
      const checkStatusOrderLossOne = await tradingPlatform.checkOrder(1);
      const checkStatusOrderLossTwo = await tradingPlatform.checkOrder(2);

      expect(amountWithCurrentPrice).to.be.lt(orderLossOne.aimTargetTokenAmount);
      expect(amountWithCurrentPrice).to.be.lt(orderLossOne.minTargetTokenAmount);
      expect(amountWithCurrentPrice).to.be.lt(orderLossTwo.aimTargetTokenAmount);
      expect(amountWithCurrentPrice).to.be.gte(orderLossTwo.minTargetTokenAmount);
      expect(checkStatusOrderLossOne).to.be.false;
      expect(checkStatusOrderLossTwo).to.be.true;
    });
  });

  describe("DCA action", () => {
    const baseAmountForDCA = ethers.utils.parseUnits("100");
    const period = 120;
    const AmountToSpendForPeriod = ethers.utils.parseUnits("10");
    const data = ethers.utils.defaultAbiCoder.encode(
      ["uint128", "uint128"],
      [period, AmountToSpendForPeriod]
    );

    it("should return false if required period has not passed", async () => {
      const { tradingPlatform, deployer, baseToken, targetToken } = await loadFixture(
        preparePairAndContracts
      );

      await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmountForDCA,
        0,
        0,
        Action.DCA,
        data,
        0
      );

      const checkStatusOrderOne = await tradingPlatform.checkOrder(1);
      const orderInfo = await tradingPlatform.getOrdersInfo([1]);
      const lsatUpdateTimestamp = orderInfo[0]["additionalInformation"];
      const timestamp = await time.latest();

      expect(timestamp).to.be.lt(lsatUpdateTimestamp.add(period));
      expect(checkStatusOrderOne).to.be.false;
    });

    it("should return true if required period has passed", async () => {
      const { tradingPlatform, deployer, baseToken, targetToken } = await loadFixture(
        preparePairAndContracts
      );

      await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmountForDCA,
        0,
        0,
        Action.DCA,
        data,
        0
      );

      await time.increase(period + 1);

      const checkStatusOrderOne = await tradingPlatform.checkOrder(1);
      const orderInfo = await tradingPlatform.getOrdersInfo([1]);
      const lsatUpdateTimestamp = orderInfo[0]["additionalInformation"];
      const timestamp = await time.latest();

      expect(timestamp).to.be.gte(lsatUpdateTimestamp.add(period));
      expect(checkStatusOrderOne).to.be.true;
    });
  });

  describe("TRAILING action", () => {
    const baseAmountForTRAILING = ethers.utils.parseUnits("100");
    const aimTargetTokenAmountOne = ethers.utils.parseUnits("200");
    const minTargetTokenAmountOne = ethers.utils.parseUnits("200");
    const step = 100000; // 10%
    const AmountToSpendForPeriod = ethers.utils.parseUnits("10");
    const data = ethers.utils.defaultAbiCoder.encode(
      ["uint128", "uint128", "uint24"],
      [baseAmountForTRAILING, AmountToSpendForPeriod, step]
    );

    it("should return false if not get target price", async () => {
      const { tradingPlatform, swapHelperContract, deployer, baseToken, targetToken } = await loadFixture(
        preparePairAndContracts
      );

      await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmountForTRAILING,
        aimTargetTokenAmountOne,
        minTargetTokenAmountOne,
        Action.TRAILING,
        data
      );

      const amountWithCurrentPrice = await swapHelperContract.getAmountOut(
        baseToken.address,
        targetToken.address,
        baseAmountForTRAILING,
        PAIR_FEE,
        SECONDS_AGO
      );
      const checkStatusOrderOne = await tradingPlatform.checkOrder(1);

      expect(amountWithCurrentPrice).to.be.lt(aimTargetTokenAmountOne);
      expect(checkStatusOrderOne).to.be.false;
    });

    it("should return false if not get target price plus percent (after first execution)", async () => {
      const { tradingPlatform, swapHelperContract, poolContract, deployer, baseToken, targetToken } =
        await loadFixture(preparePairAndContracts);

      const orderOne = await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmountForTRAILING,
        aimTargetTokenAmountOne,
        minTargetTokenAmountOne,
        Action.TRAILING,
        data
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

      const amountWithCurrentPrice = await swapHelperContract.getAmountOut(
        orderOne.baseToken,
        orderOne.targetToken,
        baseAmountForTRAILING,
        orderOne.pairFee,
        SECONDS_AGO
      );
      expect(amountWithCurrentPrice).to.be.gt(aimTargetTokenAmountOne);
      const checkStatusOrderOne = await tradingPlatform.checkOrder(1);
      expect(checkStatusOrderOne).to.be.true;
      await tradingPlatform.executeOrders([1]);
      const additionalPercent = aimTargetTokenAmountOne.mul(step).div(PRECISION);
      const newTargetPrice = aimTargetTokenAmountOne.add(additionalPercent);

      const amountWithCurrentPriceSecond = await swapHelperContract.getAmountOut(
        orderOne.baseToken,
        orderOne.targetToken,
        baseAmountForTRAILING,
        orderOne.pairFee,
        SECONDS_AGO
      );

      const checkStatusOrderOneSecond = await tradingPlatform.checkOrder(1);
      expect(amountWithCurrentPriceSecond).to.be.lt(newTargetPrice);
      expect(checkStatusOrderOneSecond).to.be.false;
    });

    it("should return true if get target price plus percent (after first execution)", async () => {
      const { tradingPlatform, swapHelperContract, poolContract, deployer, baseToken, targetToken } =
        await loadFixture(preparePairAndContracts);

      const orderOne = await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmountForTRAILING,
        aimTargetTokenAmountOne,
        minTargetTokenAmountOne,
        Action.TRAILING,
        data
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

      const amountWithCurrentPrice = await swapHelperContract.getAmountOut(
        orderOne.baseToken,
        orderOne.targetToken,
        baseAmountForTRAILING,
        orderOne.pairFee,
        SECONDS_AGO
      );
      expect(amountWithCurrentPrice).to.be.gt(aimTargetTokenAmountOne);
      const checkStatusOrderOne = await tradingPlatform.checkOrder(1);
      expect(checkStatusOrderOne).to.be.true;
      await tradingPlatform.executeOrders([1]);
      const additionalPercent = aimTargetTokenAmountOne.mul(step).div(PRECISION);
      const newTargetPrice = aimTargetTokenAmountOne.add(additionalPercent);

      const amountToken0ToSaleSecond = await calculateAmount0ToSale(poolContract.address, 100, 501);
      await targetToken.approve(swapHelperContract.address, amountToken0ToSaleSecond.toString());
      await swapHelperContract.swapWithCustomSlippage(
        deployer.address,
        targetToken.address,
        baseToken.address,
        amountToken0ToSaleSecond.toString(),
        PAIR_FEE,
        PRECISION - 1 // 100% slippage for set new price on pair
      );
      await mine(10, { interval: 60 });

      const amountWithCurrentPriceSecond = await swapHelperContract.getAmountOut(
        orderOne.baseToken,
        orderOne.targetToken,
        baseAmountForTRAILING,
        orderOne.pairFee,
        SECONDS_AGO
      );

      const checkStatusOrderOneSecond = await tradingPlatform.checkOrder(1);
      expect(amountWithCurrentPriceSecond).to.be.gt(newTargetPrice);
      expect(checkStatusOrderOneSecond).to.be.true;
    });

    it("should return true if get price equal to price minus percent (after first execution)", async () => {
      const { tradingPlatform, swapHelperContract, poolContract, deployer, baseToken, targetToken } =
        await loadFixture(preparePairAndContracts);

      const orderOne = await createOrder(
        deployer,
        tradingPlatform,
        baseToken,
        targetToken,
        baseAmountForTRAILING,
        aimTargetTokenAmountOne,
        minTargetTokenAmountOne,
        Action.TRAILING,
        data
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

      const amountWithCurrentPrice = await swapHelperContract.getAmountOut(
        orderOne.baseToken,
        orderOne.targetToken,
        baseAmountForTRAILING,
        orderOne.pairFee,
        SECONDS_AGO
      );
      expect(amountWithCurrentPrice).to.be.gt(aimTargetTokenAmountOne);
      const checkStatusOrderOne = await tradingPlatform.checkOrder(1);
      expect(checkStatusOrderOne).to.be.true;
      await tradingPlatform.executeOrders([1]);
      const lastExecutingPrice = (await tradingPlatform.getOrdersInfo([1]))[0].additionalInformation;
      const borderPrice = lastExecutingPrice.sub(lastExecutingPrice.mul(step).div(PRECISION));

      const amountToken0ToSaleSecond = await calculateAmount0ToSale(poolContract.address, 100, 100);
      await baseToken.approve(swapHelperContract.address, amountToken0ToSaleSecond.toString());
      await swapHelperContract.swapWithCustomSlippage(
        deployer.address,
        baseToken.address,
        targetToken.address,
        amountToken0ToSaleSecond.toString(),
        PAIR_FEE,
        PRECISION - 1 // 100% slippage for set new price on pair
      );
      await mine(10, { interval: 60 });

      const amountWithCurrentPriceSecond = await swapHelperContract.getAmountOut(
        orderOne.baseToken,
        orderOne.targetToken,
        baseAmountForTRAILING,
        orderOne.pairFee,
        SECONDS_AGO
      );

      const checkStatusOrderOneSecond = await tradingPlatform.checkOrder(1);
      expect(amountWithCurrentPriceSecond).to.be.lt(borderPrice);
      expect(checkStatusOrderOneSecond).to.be.true;
    });
  });
});

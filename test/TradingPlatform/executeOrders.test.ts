import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { loadFixture, mine, time } from "@nomicfoundation/hardhat-network-helpers";
import { BigNumber, ContractTransaction } from "ethers";
import { ERC20, IUniswapV3Pool, SwapHelperUniswapV3, TradingPlatform } from "@contracts";
import {
  Action,
  PAIR_FEE,
  PRECISION,
  baseAmount,
  createOrder,
  standardPrepare,
  calculateAmount0ToSale,
  SECONDS_AGO,
  calculateAmount1ToSale,
} from "@test-utils";

async function preparePairAndContracts() {
  const [deployer, admin] = await ethers.getSigners();

  return standardPrepare(deployer, admin);
}

describe("Method: executeOrders", () => {
  describe("Orders not exists", () => {
    it("should do nothing", async () => {
      const { tradingPlatform } = await loadFixture(preparePairAndContracts);

      const executeOrders = await tradingPlatform.executeOrders([1]);
      await expect(executeOrders).to.be.not.reverted;
    });
  });

  describe("Unfair exchange when amount out less than min target amount", () => {
    it("should revert", async () => {
      const { tradingPlatform, swapHelperContract, deployer, baseToken, poolContract, targetToken, admin } =
        await loadFixture(preparePairAndContracts);
      const aimTargetTokenAmountOne = ethers.utils.parseUnits("2");
      const minTargetTokenAmountOne = ethers.utils.parseUnits("2");
      await tradingPlatform.connect(admin).setProtocolFee(PRECISION - 1);

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

      expect(checkStatusOrderOne).to.be.true;
      await expect(tradingPlatform.executeOrders([1])).to.be.revertedWith("Unfair exchange");
    });
  });

  describe("Orders to execute", () => {
    it("should do nothing with empty array", async () => {
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
      const executeOrders = await tradingPlatform.executeOrders(rebalanceArray);

      expect(rebalanceArray).to.be.deep.eq([]);
      await expect(executeOrders).to.be.not.reverted;
    });

    it("should execute all ready orders and skip others", async () => {
      const { tradingPlatform, swapHelperContract, poolContract, deployer, baseToken, targetToken, admin } =
        await loadFixture(preparePairAndContracts);

      await tradingPlatform.connect(admin).setProtocolFee(0); // skip fee influence

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

      let rebalanceArray = await tradingPlatform.shouldRebalance();
      expect(rebalanceArray).to.be.deep.eq([1, 4]);
      const randomRebalanceArray = [1, 2, 4, 1, 99, 3];

      await tradingPlatform.executeOrders(randomRebalanceArray);

      rebalanceArray = await tradingPlatform.shouldRebalance();
      expect(rebalanceArray).to.be.deep.eq([]);
      const resultTokenOutOne = await tradingPlatform.getResultTokenOut(1);
      const resultTokenOutFour = await tradingPlatform.getResultTokenOut(4);
      const resultTokenOutNinetyNine = await tradingPlatform.getResultTokenOut(99);
      expect(resultTokenOutOne).to.be.gt(0);
      expect(resultTokenOutFour).to.be.gt(0);
      expect(resultTokenOutNinetyNine).to.be.eq(0);
    });

    it("should execute all ready orders", async () => {
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

      let rebalanceArray = await tradingPlatform.shouldRebalance();
      expect(rebalanceArray).to.be.deep.eq([1, 2, 3, 4]);

      await tradingPlatform.executeOrders(rebalanceArray);

      rebalanceArray = await tradingPlatform.shouldRebalance();
      expect(rebalanceArray).to.be.deep.eq([]);
    });
  });

  describe("When all parameters correct", () => {
    describe("PROFIT action with bound", () => {
      let result: ContractTransaction;
      let tradingPlatform: TradingPlatform;
      let swapHelperContract: SwapHelperUniswapV3;
      let poolContract: IUniswapV3Pool;
      let baseToken: ERC20;
      let targetToken: ERC20;
      let deployer: SignerWithAddress;
      const aimTargetTokenAmountProfit = ethers.utils.parseUnits("2");
      const minTargetTokenAmountProfit = ethers.utils.parseUnits("2");

      before(async () => {
        const deployments = await loadFixture(preparePairAndContracts);
        tradingPlatform = deployments.tradingPlatform;
        swapHelperContract = deployments.swapHelperContract;
        poolContract = deployments.poolContract;
        baseToken = deployments.baseToken;
        targetToken = deployments.targetToken;
        deployer = deployments.deployer;

        await createOrder(
          deployer,
          tradingPlatform,
          baseToken,
          targetToken,
          baseAmount,
          aimTargetTokenAmountProfit,
          minTargetTokenAmountProfit,
          Action.PROFIT
        );

        await createOrder(
          deployer,
          tradingPlatform,
          baseToken,
          targetToken,
          baseAmount,
          aimTargetTokenAmountProfit,
          minTargetTokenAmountProfit,
          Action.PROFIT
        );

        await tradingPlatform.boundOrders(1, 2);

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

        result = await tradingPlatform.executeOrders([1]);
      });

      it("should not reverted", async () => {
        await expect(result).to.be.not.reverted;
      });

      it("should remove order from actives", async () => {
        const orderStatus = await tradingPlatform.isActiveOrderExist(1);
        expect(orderStatus).to.be.false;
      });

      it("should remove bound orders from actives", async () => {
        const orderStatus = await tradingPlatform.isActiveOrderExist(2);
        expect(orderStatus).to.be.false;
      });

      it("should remove orders from actives", async () => {
        const activeOrdersIds = await tradingPlatform.activeOrdersIds(0, 1000);
        expect(activeOrdersIds).to.be.deep.eq([]);
      });

      it("should increment fee balance", async () => {
        // TODO: fix fee check
        const feeRecipient = await tradingPlatform.getFeeRecipient();
        const feeRecipientBalance = await tradingPlatform.getUserBalance(feeRecipient, targetToken.address);
        expect(feeRecipientBalance).to.be.gte(0);
      });

      it("should increment user balance", async () => {
        const userBalance = await tradingPlatform.getUserBalance(deployer.address, targetToken.address);
        expect(userBalance).to.be.gte(minTargetTokenAmountProfit);
      });

      it("should don't send tokens from contract to user", async () => {
        const feeRecipient = await tradingPlatform.getFeeRecipient();
        const userBalance = await tradingPlatform.getUserBalance(deployer.address, targetToken.address);
        const feeBalance = await tradingPlatform.getUserBalance(feeRecipient, targetToken.address);
        await expect(result).to.changeTokenBalances(
          targetToken,
          [deployer, tradingPlatform.address],
          [0, userBalance.add(feeBalance)]
        );
      });

      it("should increment resultTokenOut for order", async () => {
        const userBalance = await tradingPlatform.getUserBalance(deployer.address, targetToken.address);
        const resultTokenOut = await tradingPlatform.getResultTokenOut(1);
        expect(resultTokenOut).to.be.eq(userBalance);
      });

      it("should not change user orders list", async () => {
        const userOrders = await tradingPlatform.getUserOrdersIds(deployer.address);
        expect(userOrders).to.be.deep.eq([1, 2]);
      });

      it("should emit OrderExecuted event", async () => {
        await expect(result).to.emit(tradingPlatform, "OrderExecuted").withArgs(1, deployer.address);
      });

      it("should emit OrderCanceled event", async () => {
        await expect(result).to.emit(tradingPlatform, "OrderCanceled").withArgs(2);
      });
    });

    describe("LOSS action", () => {
      let result: ContractTransaction;
      let tradingPlatform: TradingPlatform;
      let swapHelperContract: SwapHelperUniswapV3;
      let poolContract: IUniswapV3Pool;
      let baseToken: ERC20;
      let targetToken: ERC20;
      let deployer: SignerWithAddress;
      let checkStatusOrderBefore: boolean;
      let amountWithCurrentPriceSecond: BigNumber;
      const aimTargetTokenAmount = ethers.utils.parseUnits("4");
      const minTargetTokenAmount = ethers.utils.parseUnits("3");

      before(async () => {
        const deployments = await loadFixture(preparePairAndContracts);
        tradingPlatform = deployments.tradingPlatform;
        swapHelperContract = deployments.swapHelperContract;
        poolContract = deployments.poolContract;
        baseToken = deployments.baseToken;
        targetToken = deployments.targetToken;
        deployer = deployments.deployer;

        const amountToSaleBefore = await calculateAmount0ToSale(poolContract.address, 100, 501);
        await targetToken.approve(swapHelperContract.address, amountToSaleBefore.toString());
        await swapHelperContract.swapWithCustomSlippage(
          deployer.address,
          targetToken.address,
          baseToken.address,
          amountToSaleBefore.toString(),
          PAIR_FEE,
          PRECISION - 1 // 100% slippage for set new price on pair
        );
        await mine(10, { interval: 60 });

        await createOrder(
          deployer,
          tradingPlatform,
          baseToken,
          targetToken,
          baseAmount,
          aimTargetTokenAmount,
          minTargetTokenAmount,
          Action.LOSS
        );

        const amountToSale = await calculateAmount0ToSale(poolContract.address, 399, 100);
        await baseToken.approve(swapHelperContract.address, amountToSale.toString());
        await swapHelperContract.swapWithCustomSlippage(
          deployer.address,
          baseToken.address,
          targetToken.address,
          amountToSale.toString(),
          PAIR_FEE,
          PRECISION - 1 // 100% slippage for set new price on pair
        );
        await mine(10, { interval: 60 });

        amountWithCurrentPriceSecond = await swapHelperContract.getAmountOut(
          baseToken.address,
          targetToken.address,
          baseAmount,
          PAIR_FEE,
          SECONDS_AGO
        );

        checkStatusOrderBefore = await tradingPlatform.isActiveOrderExist(1);
        result = await tradingPlatform.executeOrders([1]);
      });

      it("should not reverted", async () => {
        expect(amountWithCurrentPriceSecond).to.be.lt(aimTargetTokenAmount);
        expect(amountWithCurrentPriceSecond).to.be.gt(minTargetTokenAmount);
        await expect(result).to.be.not.reverted;
      });

      it("should remove order from actives", async () => {
        const orderStatus = await tradingPlatform.isActiveOrderExist(1);
        expect(checkStatusOrderBefore).to.be.true;
        expect(orderStatus).to.be.false;
      });

      it("should increment fee balance", async () => {
        // TODO: fix fee check
        const feeRecipient = await tradingPlatform.getFeeRecipient();
        const feeRecipientBalance = await tradingPlatform.getUserBalance(feeRecipient, targetToken.address);
        expect(feeRecipientBalance).to.be.gt(0);
      });

      it("should increment user balance", async () => {
        const userBalance = await tradingPlatform.getUserBalance(deployer.address, targetToken.address);
        expect(userBalance).to.be.gte(minTargetTokenAmount);
      });

      it("should don't send tokens from contract to user", async () => {
        const feeRecipient = await tradingPlatform.getFeeRecipient();
        const userBalance = await tradingPlatform.getUserBalance(deployer.address, targetToken.address);
        const feeBalance = await tradingPlatform.getUserBalance(feeRecipient, targetToken.address);
        await expect(result).to.changeTokenBalances(
          targetToken,
          [deployer, tradingPlatform.address],
          [0, userBalance.add(feeBalance)]
        );
      });

      it("should increment resultTokenOut for order", async () => {
        const userBalance = await tradingPlatform.getUserBalance(deployer.address, targetToken.address);
        const resultTokenOut = await tradingPlatform.getResultTokenOut(1);
        expect(resultTokenOut).to.be.eq(userBalance);
      });

      it("should not change user orders list", async () => {
        const userOrders = await tradingPlatform.getUserOrdersIds(deployer.address);
        expect(userOrders).to.be.deep.eq([1]);
      });

      it("should emit OrderExecuted event", async () => {
        await expect(result).to.emit(tradingPlatform, "OrderExecuted").withArgs(1, deployer.address);
      });
    });

    describe("DCA action", () => {
      let result: ContractTransaction;
      let tradingPlatform: TradingPlatform;
      let baseToken: ERC20;
      let targetToken: ERC20;
      let deployer: SignerWithAddress;
      let checkStatusOrderBefore: boolean;
      let feeRecipientBalance: BigNumber;
      let userBalance: BigNumber;

      const aimTargetTokenAmount = 0;
      const minTargetTokenAmount = 0;
      const baseAmountForDCA = ethers.utils.parseUnits("100");
      const period = 120;
      const amountToSpendForPeriod = ethers.utils.parseUnits("60");
      const data = ethers.utils.defaultAbiCoder.encode(
        ["uint128", "uint128"],
        [period, amountToSpendForPeriod]
      );

      before(async () => {
        const deployments = await loadFixture(preparePairAndContracts);
        tradingPlatform = deployments.tradingPlatform;
        baseToken = deployments.baseToken;
        targetToken = deployments.targetToken;
        deployer = deployments.deployer;

        await createOrder(
          deployer,
          tradingPlatform,
          baseToken,
          targetToken,
          baseAmountForDCA,
          aimTargetTokenAmount,
          minTargetTokenAmount,
          Action.DCA,
          data,
          0
        );

        checkStatusOrderBefore = await tradingPlatform.isActiveOrderExist(1);

        await time.increase(period + 1);
        result = await tradingPlatform.executeOrders([1]);
      });

      it("should not reverted", async () => {
        await expect(result).to.be.not.reverted;
      });

      it("should not remove order from actives", async () => {
        const orderStatus = await tradingPlatform.isActiveOrderExist(1);
        expect(checkStatusOrderBefore).to.be.true;
        expect(orderStatus).to.be.true;
      });

      it("should increment fee balance", async () => {
        // TODO: fix fee check
        const feeRecipient = await tradingPlatform.getFeeRecipient();
        feeRecipientBalance = await tradingPlatform.getUserBalance(feeRecipient, targetToken.address);
        expect(feeRecipientBalance).to.be.gt(0);
      });

      it("should increment user balance", async () => {
        userBalance = await tradingPlatform.getUserBalance(deployer.address, targetToken.address);
        expect(userBalance).to.be.gt(0);
      });

      it("should don't send tokens from contract to user", async () => {
        await expect(result).to.changeTokenBalances(
          targetToken,
          [deployer, tradingPlatform.address],
          [0, userBalance.add(feeRecipientBalance)]
        );
      });

      it("should increment resultTokenOut for order", async () => {
        const resultTokenOut = await tradingPlatform.getResultTokenOut(1);
        expect(resultTokenOut).to.be.eq(userBalance);
      });

      it("should decries order baseAmount", async () => {
        const orderInfo = (await tradingPlatform.getOrdersInfo([1]))[0].order;
        expect(orderInfo.baseAmount).to.be.eq(baseAmountForDCA.sub(amountToSpendForPeriod));
      });

      it("should set last update timestamp", async () => {
        const orderInfo = (await tradingPlatform.getOrdersInfo([1]))[0];
        const lastBlockTimestamp = await time.latest();
        expect(orderInfo.additionalInformation).to.be.eq(lastBlockTimestamp);
      });

      it("should not change user orders list", async () => {
        const userOrders = await tradingPlatform.getUserOrdersIds(deployer.address);
        expect(userOrders).to.be.deep.eq([1]);
      });

      it("should emit OrderExecuted event", async () => {
        await expect(result).to.emit(tradingPlatform, "OrderExecuted").withArgs(1, deployer.address);
      });

      describe("DCA finish swap", () => {
        before(async () => {
          checkStatusOrderBefore = await tradingPlatform.isActiveOrderExist(1);

          await time.increase(period + 1);
          result = await tradingPlatform.executeOrders([1]);
        });

        it("should not reverted", async () => {
          await expect(result).to.be.not.reverted;
        });

        it("should remove order from actives", async () => {
          const orderStatus = await tradingPlatform.isActiveOrderExist(1);
          expect(checkStatusOrderBefore).to.be.true;
          expect(orderStatus).to.be.false;
        });

        it("should increment fee balance", async () => {
          // TODO: fix fee check
          const feeRecipient = await tradingPlatform.getFeeRecipient();
          const newFeeRecipientBalance = await tradingPlatform.getUserBalance(
            feeRecipient,
            targetToken.address
          );
          expect(newFeeRecipientBalance).to.be.gt(feeRecipientBalance);
        });

        it("should increment user balance", async () => {
          const newUserBalance = await tradingPlatform.getUserBalance(deployer.address, targetToken.address);
          expect(newUserBalance).to.be.gt(userBalance);
        });

        it("should don't send tokens from contract to user", async () => {
          const feeRecipient = await tradingPlatform.getFeeRecipient();
          const newFeeRecipientBalance = await tradingPlatform.getUserBalance(
            feeRecipient,
            targetToken.address
          );
          const newUserBalance = await tradingPlatform.getUserBalance(deployer.address, targetToken.address);
          const txAmountOutForUser = newUserBalance.sub(userBalance);
          const txAmountOutFee = newFeeRecipientBalance.sub(feeRecipientBalance);
          await expect(result).to.changeTokenBalances(
            targetToken,
            [deployer, tradingPlatform.address],
            [0, txAmountOutForUser.add(txAmountOutFee)]
          );
        });

        it("should increment resultTokenOut for order", async () => {
          const newUserBalance = await tradingPlatform.getUserBalance(deployer.address, targetToken.address);
          const resultTokenOut = await tradingPlatform.getResultTokenOut(1);
          expect(resultTokenOut).to.be.eq(newUserBalance);
        });

        it("should not change user orders list", async () => {
          const userOrders = await tradingPlatform.getUserOrdersIds(deployer.address);
          expect(userOrders).to.be.deep.eq([1]);
        });

        it("should emit OrderExecuted event", async () => {
          await expect(result).to.emit(tradingPlatform, "OrderExecuted").withArgs(1, deployer.address);
        });
      });
    });

    describe("TRAILING action", () => {
      let result: ContractTransaction;
      let tradingPlatform: TradingPlatform;
      let swapHelperContract: SwapHelperUniswapV3;
      let baseToken: ERC20;
      let targetToken: ERC20;
      let poolContract: IUniswapV3Pool;
      let deployer: SignerWithAddress;
      let checkStatusOrderBefore: boolean;
      let feeRecipientBalance: BigNumber;
      let userBalance: BigNumber;
      let amountWithCurrentPriceBefore: BigNumber;

      const baseAmountForTRAILING = ethers.utils.parseUnits("100");
      const aimTargetTokenAmount = ethers.utils.parseUnits("200");
      const minTargetTokenAmount = ethers.utils.parseUnits("200");
      const step = 100000; // 10%
      const amountToSpendForPeriod = ethers.utils.parseUnits("60");
      const data = ethers.utils.defaultAbiCoder.encode(
        ["uint128", "uint128", "uint24"],
        [baseAmountForTRAILING, amountToSpendForPeriod, step]
      );

      before(async () => {
        const deployments = await loadFixture(preparePairAndContracts);
        tradingPlatform = deployments.tradingPlatform;
        swapHelperContract = deployments.swapHelperContract;
        baseToken = deployments.baseToken;
        targetToken = deployments.targetToken;
        deployer = deployments.deployer;
        poolContract = deployments.poolContract;

        await createOrder(
          deployer,
          tradingPlatform,
          baseToken,
          targetToken,
          baseAmountForTRAILING,
          aimTargetTokenAmount,
          minTargetTokenAmount,
          Action.TRAILING,
          data
        );
        const amountToSale = await calculateAmount0ToSale(poolContract.address, 100, 201);
        await targetToken.approve(swapHelperContract.address, amountToSale.toString());
        await swapHelperContract.swapWithCustomSlippage(
          deployer.address,
          targetToken.address,
          baseToken.address,
          amountToSale.toString(),
          PAIR_FEE,
          PRECISION - 1 // 100% slippage for set new price on pair
        );
        await mine(10, { interval: 60 });

        amountWithCurrentPriceBefore = await swapHelperContract.getAmountOut(
          baseToken.address,
          targetToken.address,
          baseAmountForTRAILING,
          PAIR_FEE,
          SECONDS_AGO
        );

        checkStatusOrderBefore = await tradingPlatform.isActiveOrderExist(1);
        result = await tradingPlatform.executeOrders([1]);
      });

      it("should not reverted", async () => {
        // expect(amountWithCurrentPriceBefore).to.be.gt(aimTargetTokenAmount);
        await expect(result).to.be.not.reverted;
      });

      it("should not remove order from actives", async () => {
        const orderStatus = await tradingPlatform.isActiveOrderExist(1);
        expect(checkStatusOrderBefore).to.be.true;
        expect(orderStatus).to.be.true;
      });

      it("should increment fee balance", async () => {
        // TODO: fix fee check
        const feeRecipient = await tradingPlatform.getFeeRecipient();
        feeRecipientBalance = await tradingPlatform.getUserBalance(feeRecipient, targetToken.address);
        expect(feeRecipientBalance).to.be.gt(0);
      });

      it("should increment user balance", async () => {
        userBalance = await tradingPlatform.getUserBalance(deployer.address, targetToken.address);
        expect(userBalance).to.be.gt(0);
      });

      it("should don't send tokens from contract to user", async () => {
        await expect(result).to.changeTokenBalances(
          targetToken,
          [deployer, tradingPlatform.address],
          [0, userBalance.add(feeRecipientBalance)]
        );
      });

      it("should increment resultTokenOut for order", async () => {
        const resultTokenOut = await tradingPlatform.getResultTokenOut(1);
        expect(resultTokenOut).to.be.eq(userBalance);
      });

      it("should set last update price", async () => {
        const orderInfo = (await tradingPlatform.getOrdersInfo([1]))[0];
        expect(orderInfo.additionalInformation).to.be.eq(amountWithCurrentPriceBefore);
      });

      it("should decries order baseAmount", async () => {
        const orderInfo = (await tradingPlatform.getOrdersInfo([1]))[0].order;
        expect(orderInfo.baseAmount).to.be.eq(baseAmountForTRAILING.sub(amountToSpendForPeriod));
      });

      it("should not change user orders list", async () => {
        const userOrders = await tradingPlatform.getUserOrdersIds(deployer.address);
        expect(userOrders).to.be.deep.eq([1]);
      });

      it("should emit OrderExecuted event", async () => {
        await expect(result).to.emit(tradingPlatform, "OrderExecuted").withArgs(1, deployer.address);
      });

      describe("TRAILING finish swap", () => {
        before(async () => {
          checkStatusOrderBefore = await tradingPlatform.isActiveOrderExist(1);

          const amountToSale = await calculateAmount1ToSale(poolContract.address, 100, 251);
          await targetToken.approve(swapHelperContract.address, amountToSale.toString());
          await swapHelperContract.swapWithCustomSlippage(
            deployer.address,
            targetToken.address,
            baseToken.address,
            amountToSale.toString(),
            PAIR_FEE,
            PRECISION - 1 // 100% slippage for set new price on pair
          );
          await mine(10, { interval: 60 });

          const additionalPercent = aimTargetTokenAmount.mul(step).div(PRECISION);
          const newTargetPrice = aimTargetTokenAmount.add(additionalPercent);
          const amountWithCurrentPriceSecond = await swapHelperContract.getAmountOut(
            baseToken.address,
            targetToken.address,
            baseAmountForTRAILING,
            PAIR_FEE,
            SECONDS_AGO
          );

          const checkStatusOrderSecond = await tradingPlatform.checkOrder(1);
          expect(amountWithCurrentPriceSecond).to.be.gt(newTargetPrice);
          expect(checkStatusOrderSecond).to.be.true;

          result = await tradingPlatform.executeOrders([1]);
        });

        it("should not reverted", async () => {
          await expect(result).to.be.not.reverted;
        });

        it("should remove order from actives", async () => {
          const orderStatus = await tradingPlatform.isActiveOrderExist(1);
          expect(checkStatusOrderBefore).to.be.true;
          expect(orderStatus).to.be.false;
        });

        it("should increment fee balance", async () => {
          // TODO: fix fee check
          const feeRecipient = await tradingPlatform.getFeeRecipient();
          const newFeeRecipientBalance = await tradingPlatform.getUserBalance(
            feeRecipient,
            targetToken.address
          );
          expect(newFeeRecipientBalance).to.be.gt(feeRecipientBalance);
        });

        it("should increment user balance", async () => {
          const newUserBalance = await tradingPlatform.getUserBalance(deployer.address, targetToken.address);
          expect(newUserBalance).to.be.gt(userBalance);
        });

        it("should don't send tokens from contract to user", async () => {
          const feeRecipient = await tradingPlatform.getFeeRecipient();
          const newFeeRecipientBalance = await tradingPlatform.getUserBalance(
            feeRecipient,
            targetToken.address
          );
          const newUserBalance = await tradingPlatform.getUserBalance(deployer.address, targetToken.address);
          const txAmountOutForUser = newUserBalance.sub(userBalance);
          const txAmountOutFee = newFeeRecipientBalance.sub(feeRecipientBalance);
          await expect(result).to.changeTokenBalances(
            targetToken,
            [deployer, tradingPlatform.address],
            [0, txAmountOutForUser.add(txAmountOutFee)]
          );
        });

        it("should increment resultTokenOut for order", async () => {
          const newUserBalance = await tradingPlatform.getUserBalance(deployer.address, targetToken.address);
          const resultTokenOut = await tradingPlatform.getResultTokenOut(1);
          expect(resultTokenOut).to.be.eq(newUserBalance);
        });

        it("should not change user orders list", async () => {
          const userOrders = await tradingPlatform.getUserOrdersIds(deployer.address);
          expect(userOrders).to.be.deep.eq([1]);
        });

        it("should emit OrderExecuted event", async () => {
          await expect(result).to.emit(tradingPlatform, "OrderExecuted").withArgs(1, deployer.address);
        });
      });
    });
    describe("TRAILING with ending on price fail", () => {
      let result: ContractTransaction;
      let tradingPlatform: TradingPlatform;
      let swapHelperContract: SwapHelperUniswapV3;
      let baseToken: ERC20;
      let targetToken: ERC20;
      let poolContract: IUniswapV3Pool;
      let deployer: SignerWithAddress;
      let checkStatusOrderBefore: boolean;
      let feeRecipientBalance: BigNumber;
      let userBalance: BigNumber;

      const baseAmountForTRAILING = ethers.utils.parseUnits("100");
      const aimTargetTokenAmount = ethers.utils.parseUnits("200");
      const minTargetTokenAmount = ethers.utils.parseUnits("200");
      const step = 100000; // 10%
      const amountToSpendForPeriod = ethers.utils.parseUnits("10");
      const data = ethers.utils.defaultAbiCoder.encode(
        ["uint128", "uint128", "uint24"],
        [baseAmountForTRAILING, amountToSpendForPeriod, step]
      );

      before(async () => {
        const deployments = await loadFixture(preparePairAndContracts);
        tradingPlatform = deployments.tradingPlatform;
        swapHelperContract = deployments.swapHelperContract;
        baseToken = deployments.baseToken;
        targetToken = deployments.targetToken;
        deployer = deployments.deployer;
        poolContract = deployments.poolContract;

        await createOrder(
          deployer,
          tradingPlatform,
          baseToken,
          targetToken,
          baseAmountForTRAILING,
          aimTargetTokenAmount,
          minTargetTokenAmount,
          Action.TRAILING,
          data
        );
        let amountToSale = await calculateAmount0ToSale(poolContract.address, 100, 201);
        await targetToken.approve(swapHelperContract.address, amountToSale.toString());
        await swapHelperContract.swapWithCustomSlippage(
          deployer.address,
          targetToken.address,
          baseToken.address,
          amountToSale.toString(),
          PAIR_FEE,
          PRECISION - 1 // 100% slippage for set new price on pair
        );
        await mine(10, { interval: 60 });

        await tradingPlatform.executeOrders([1]);

        amountToSale = await calculateAmount0ToSale(poolContract.address, 271, 100);
        await targetToken.approve(swapHelperContract.address, amountToSale.toString());
        await swapHelperContract.swapWithCustomSlippage(
          deployer.address,
          targetToken.address,
          baseToken.address,
          amountToSale.toString(),
          PAIR_FEE,
          PRECISION - 1 // 100% slippage for set new price on pair
        );
        await mine(10, { interval: 60 });
        await tradingPlatform.executeOrders([1]);

        amountToSale = await calculateAmount0ToSale(poolContract.address, 201, 100);
        await baseToken.approve(swapHelperContract.address, amountToSale.toString());
        await swapHelperContract.swapWithCustomSlippage(
          deployer.address,
          baseToken.address,
          targetToken.address,
          amountToSale.toString(),
          PAIR_FEE,
          PRECISION - 1 // 100% slippage for set new price on pair
        );
        await mine(10, { interval: 60 });

        checkStatusOrderBefore = await tradingPlatform.isActiveOrderExist(1);
        result = await tradingPlatform.executeOrders([1]);
      });

      it("should not reverted", async () => {
        await expect(result).to.be.not.reverted;
      });

      it("should not remove order from actives", async () => {
        const orderStatus = await tradingPlatform.isActiveOrderExist(1);
        expect(checkStatusOrderBefore).to.be.true;
        expect(orderStatus).to.be.false;
      });

      it("should increment fee balance", async () => {
        // TODO: fix fee check
        const feeRecipient = await tradingPlatform.getFeeRecipient();
        feeRecipientBalance = await tradingPlatform.getUserBalance(feeRecipient, targetToken.address);
        expect(feeRecipientBalance).to.be.gt(0);
      });

      it("should increment user balance", async () => {
        // TODO: fix fee check
        userBalance = await tradingPlatform.getUserBalance(deployer.address, targetToken.address);
        expect(userBalance).to.be.gt(0);
      });

      it("should don't send tokens from contract to user", async () => {
        await expect(result).to.changeTokenBalance(targetToken, deployer, 0);
      });

      it("should not change user orders list", async () => {
        const userOrders = await tradingPlatform.getUserOrdersIds(deployer.address);
        expect(userOrders).to.be.deep.eq([1]);
      });

      it("should emit OrderExecuted event", async () => {
        await expect(result).to.emit(tradingPlatform, "OrderExecuted").withArgs(1, deployer.address);
      });
    });
  });
});

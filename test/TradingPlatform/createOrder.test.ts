import { ZERO_BYTES } from "./../utils/constants";
import { expect } from "chai";
import { ethers } from "hardhat";
import { time, loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MockERC20, TradingPlatform, ITradingPlatform } from "@contracts";
import { BigNumber, BigNumberish, ContractTransaction } from "ethers";
import { standardPrepare, PAIR_FEE, SLIPPAGE, Action, ZERO_ADDRESS } from "@test-utils";

const baseAmount = ethers.utils.parseUnits("100");

describe("Method: createOrder", () => {
  let deployer: SignerWithAddress, admin: SignerWithAddress, random: SignerWithAddress;

  async function deployTradingPlatform() {
    [deployer, admin, random] = await ethers.getSigners();

    const standardParams = await standardPrepare(deployer, admin);

    const order: ITradingPlatform.OrderStruct = {
      userAddress: deployer.address,
      baseToken: standardParams.baseToken.address,
      targetToken: standardParams.targetToken.address,
      pairFee: PAIR_FEE,
      slippage: SLIPPAGE,
      baseAmount: baseAmount,
      aimTargetTokenAmount: ethers.utils.parseUnits("50"),
      minTargetTokenAmount: ethers.utils.parseUnits("45"),
      expiration: Math.floor(Date.now() / 1000) + 60 * 60,
      boundOrder: 0,
      action: Action.LOSS,
      data: ZERO_BYTES,
    };

    const orderWithBound: ITradingPlatform.OrderStruct = {
      userAddress: deployer.address,
      baseToken: standardParams.baseToken.address,
      targetToken: standardParams.targetToken.address,
      pairFee: PAIR_FEE,
      slippage: SLIPPAGE,
      baseAmount: baseAmount,
      aimTargetTokenAmount: ethers.utils.parseUnits("50"),
      minTargetTokenAmount: ethers.utils.parseUnits("45"),
      expiration: Math.floor(Date.now() / 1000) + 60 * 60,
      boundOrder: 1,
      action: Action.LOSS,
      data: ZERO_BYTES,
    };

    return {
      ...standardParams,
      order,
      orderWithBound,
    };
  }

  describe("When one of parameters is incorrect", () => {
    it("When baseToken is zero address", async () => {
      const { tradingPlatform, order } = await loadFixture(deployTradingPlatform);
      const wrongOrder = { ...order };
      wrongOrder.baseToken = ZERO_ADDRESS;
      await expect(tradingPlatform.createOrder(wrongOrder)).to.be.revertedWith("Zero address check");
    });

    it("When targetToken is zero address", async () => {
      const { tradingPlatform, order } = await loadFixture(deployTradingPlatform);
      const wrongOrder = { ...order };
      wrongOrder.targetToken = ZERO_ADDRESS;
      await expect(tradingPlatform.createOrder(wrongOrder)).to.be.revertedWith("Zero address check");
    });

    it("When baseToken is equal targetToken", async () => {
      const { tradingPlatform, order } = await loadFixture(deployTradingPlatform);
      const wrongOrder = { ...order };
      wrongOrder.baseToken = order.targetToken;
      await expect(tradingPlatform.createOrder(wrongOrder)).to.be.revertedWith("Tokens must be different");
    });

    it("When baseToken amount is zero", async () => {
      const { tradingPlatform, order } = await loadFixture(deployTradingPlatform);
      const wrongOrder = { ...order };
      wrongOrder.baseAmount = 0;
      await expect(tradingPlatform.createOrder(wrongOrder)).to.be.revertedWith("Amount in must be gt 0");
    });

    it("When slippage is zero", async () => {
      const { tradingPlatform, order } = await loadFixture(deployTradingPlatform);
      const wrongOrder = { ...order };
      wrongOrder.slippage = 0;
      await expect(tradingPlatform.createOrder(wrongOrder)).to.be.revertedWith("Unsafe slippage");
    });

    it("When aimTargetTokenAmount is zero", async () => {
      const { tradingPlatform, order } = await loadFixture(deployTradingPlatform);
      const wrongOrder = { ...order };
      wrongOrder.aimTargetTokenAmount = 0;
      await expect(tradingPlatform.createOrder(wrongOrder)).to.be.revertedWith("Aim amount must be gt 0");
    });

    it("When expiration is lt time now", async () => {
      const { tradingPlatform, order } = await loadFixture(deployTradingPlatform);
      const wrongOrder = { ...order };
      wrongOrder.expiration = (await time.latest()) - 10;
      await expect(tradingPlatform.createOrder(wrongOrder)).to.be.revertedWith("Wrong expiration date");
    });

    it("When baseToken is not allowed", async () => {
      const { tradingPlatform, order, randomToken } = await loadFixture(deployTradingPlatform);
      const wrongOrder = { ...order };
      wrongOrder.baseToken = randomToken.address;
      await expect(tradingPlatform.createOrder(wrongOrder)).to.be.revertedWith("Token not allowed");
    });

    it("When targetToken is not allowed", async () => {
      const { tradingPlatform, order, randomToken } = await loadFixture(deployTradingPlatform);
      const wrongOrder = { ...order };
      wrongOrder.targetToken = randomToken.address;
      await expect(tradingPlatform.createOrder(wrongOrder)).to.be.revertedWith("Token not allowed");
    });

    it("When user address is wrong", async () => {
      const { tradingPlatform, order, baseToken } = await loadFixture(deployTradingPlatform);
      await baseToken.approve(tradingPlatform.address, baseAmount);
      const wrongOrder = { ...order };
      wrongOrder.userAddress = random.address;
      await expect(tradingPlatform.createOrder(wrongOrder)).to.be.revertedWith("Wrong user address");
    });

    it("When DCA order has amountPerPeriod equal zero", async () => {
      const { tradingPlatform, order, baseToken } = await loadFixture(deployTradingPlatform);
      await baseToken.approve(tradingPlatform.address, baseAmount);
      const dcaOrder = { ...order };
      const data = ethers.utils.defaultAbiCoder.encode(["uint128", "uint128"], [120, 0]);
      dcaOrder.action = Action.DCA;
      dcaOrder.data = data;
      dcaOrder.expiration = 0;
      await expect(tradingPlatform.createOrder(dcaOrder)).to.be.revertedWith("Zero amount to swap");
    });

    it("When TRAILING order has fixingPerStep equal zero", async () => {
      const { tradingPlatform, order, baseToken } = await loadFixture(deployTradingPlatform);
      await baseToken.approve(tradingPlatform.address, baseAmount);
      const dcaOrder = { ...order };
      const data = ethers.utils.defaultAbiCoder.encode(
        ["uint128", "uint128", "uint24"],
        [baseAmount, 0, 5000]
      );
      dcaOrder.action = Action.TRAILING;
      dcaOrder.data = data;
      await expect(tradingPlatform.createOrder(dcaOrder)).to.be.revertedWith("Zero amount to swap");
    });

    it("When TRAILING order base amount not equal data.baseAmount", async () => {
      const { tradingPlatform, order, baseToken } = await loadFixture(deployTradingPlatform);
      await baseToken.approve(tradingPlatform.address, baseAmount);
      const dcaOrder = { ...order };
      const data = ethers.utils.defaultAbiCoder.encode(
        ["uint128", "uint128", "uint24"],
        [baseAmount.sub(1), 100, 5000]
      );
      dcaOrder.action = Action.TRAILING;
      dcaOrder.data = data;
      await expect(tradingPlatform.createOrder(dcaOrder)).to.be.revertedWith("Wrong base amount");
    });

    it("When TRAILING order has step equal zero", async () => {
      const { tradingPlatform, order, baseToken } = await loadFixture(deployTradingPlatform);
      await baseToken.approve(tradingPlatform.address, baseAmount);
      const dcaOrder = { ...order };
      const data = ethers.utils.defaultAbiCoder.encode(
        ["uint128", "uint128", "uint24"],
        [baseAmount, 100, 0]
      );
      dcaOrder.action = Action.TRAILING;
      dcaOrder.data = data;
      await expect(tradingPlatform.createOrder(dcaOrder)).to.be.revertedWith("Wrong step amount");
    });

    it("When try to bound DCA order", async () => {
      const { tradingPlatform, order, orderWithBound, baseToken } = await loadFixture(deployTradingPlatform);
      await baseToken.approve(tradingPlatform.address, baseAmount.mul(2));
      await tradingPlatform.createOrder(order);
      const dcaOrder = { ...orderWithBound };
      const data = ethers.utils.defaultAbiCoder.encode(["uint128", "uint128"], [120, baseAmount.div(10)]);
      dcaOrder.action = Action.DCA;
      dcaOrder.data = data;
      await expect(tradingPlatform.createOrder(dcaOrder)).to.be.revertedWith("Can't bound DCA order");
    });

    it("When try to bound with not your order", async () => {
      const { tradingPlatform, order, orderWithBound, baseToken } = await loadFixture(deployTradingPlatform);
      await baseToken.approve(tradingPlatform.address, baseAmount.mul(2));
      await tradingPlatform.createOrder(order);
      const dcaOrder = { ...orderWithBound };
      dcaOrder.userAddress = random.address;
      await expect(tradingPlatform.connect(random).createOrder(dcaOrder)).to.be.revertedWith(
        "Bound order is not yours"
      );
    });

    it("When try to bound with not active order", async () => {
      const { tradingPlatform, order, orderWithBound, baseToken } = await loadFixture(deployTradingPlatform);
      await baseToken.approve(tradingPlatform.address, baseAmount.mul(2));
      await tradingPlatform.createOrder(order);
      await tradingPlatform.cancelOrders([1]);
      const dcaOrder = { ...orderWithBound };
      dcaOrder.boundOrder = 1;
      await expect(tradingPlatform.createOrder(dcaOrder)).to.be.revertedWith("Bound order is not active");
    });

    it("When try to bound with already bounded order", async () => {
      const { tradingPlatform, order, orderWithBound, baseToken } = await loadFixture(deployTradingPlatform);
      await baseToken.approve(tradingPlatform.address, baseAmount.mul(2));
      await tradingPlatform.createOrder(order);
      await tradingPlatform.createOrder(orderWithBound);
      const dcaOrder = { ...orderWithBound };
      dcaOrder.boundOrder = 1;
      await expect(tradingPlatform.createOrder(dcaOrder)).to.be.revertedWith("Bound order already bounded");
    });
  });

  describe("LOSS with bound: When all parameters correct", () => {
    let result: ContractTransaction;
    let tradingPlatform: TradingPlatform;
    let baseToken: MockERC20;
    let order: ITradingPlatform.OrderStruct;
    let orderWithBound: ITradingPlatform.OrderStruct;
    let orderIdBefore: BigNumber;
    let orderId: BigNumber;
    let activeOrdersLengthBefore: BigNumber;
    let orderInfo: ITradingPlatform.OrderStruct;

    before(async () => {
      const deploy = await loadFixture(deployTradingPlatform);
      tradingPlatform = deploy.tradingPlatform;
      order = deploy.order;
      baseToken = deploy.baseToken;
      orderWithBound = deploy.orderWithBound;
      await baseToken.approve(tradingPlatform.address, baseAmount.mul(2));
      await tradingPlatform.createOrder(order);
      activeOrdersLengthBefore = await tradingPlatform.activeOrdersLength();
      orderIdBefore = await tradingPlatform.getOrderCounter();
      result = await tradingPlatform.createOrder(orderWithBound);
      orderId = await tradingPlatform.getOrderCounter();
      orderInfo = (await tradingPlatform.getOrdersInfo([orderId]))[0].order;
    });

    it("should not reverted", async () => {
      await expect(result).to.be.not.reverted;
    });

    it("should increment orderWithBound id", () => {
      expect(orderIdBefore.add(1)).to.be.eq(orderId);
    });

    it("should add new orderWithBound to active list", async () => {
      const orderStatus = await tradingPlatform.isActiveOrderExist(orderId);
      expect(orderStatus).to.be.true;
    });

    it("should increment active list", async () => {
      const activeOrdersLength = await tradingPlatform.activeOrdersLength();
      expect(activeOrdersLength).to.be.eq(activeOrdersLengthBefore.add(1));
    });

    it("should add expected orderWithBound id to active list", async () => {
      const activeOrderId = await tradingPlatform.activeOrderId(1);
      expect(activeOrderId).to.be.eq(orderId);
    });

    it("should orderWithBound list be equal to expected", async () => {
      const orderStatus = await tradingPlatform.activeOrdersIds(0, 10);
      expect(orderStatus).to.be.deep.eq([1, 2]);
    });

    it("should userAddress be equal to expected", () => {
      expect(orderInfo["userAddress"]).to.be.eq(orderWithBound.userAddress);
    });

    it("should baseToken be equal to expected", () => {
      expect(orderInfo["baseToken"]).to.be.eq(orderWithBound.baseToken);
    });

    it("should targetToken be equal to expected", () => {
      expect(orderInfo["targetToken"]).to.be.eq(orderWithBound.targetToken);
    });

    it("should pairFee be equal to expected", () => {
      expect(orderInfo["pairFee"]).to.be.eq(orderWithBound.pairFee);
    });

    it("should slippage be equal to expected", () => {
      expect(orderInfo["slippage"]).to.be.eq(orderWithBound.slippage);
    });

    it("should baseAmount be equal to expected", () => {
      expect(orderInfo["baseAmount"]).to.be.eq(orderWithBound.baseAmount);
    });

    it("should aimTargetTokenAmount be equal to expected", () => {
      expect(orderInfo["aimTargetTokenAmount"]).to.be.eq(orderWithBound.aimTargetTokenAmount);
    });

    it("should minTargetTokenAmount be equal to expected", () => {
      expect(orderInfo["minTargetTokenAmount"]).to.be.eq(orderWithBound.minTargetTokenAmount);
    });

    it("should expiration be equal to expected", () => {
      expect(orderInfo["expiration"]).to.be.eq(orderWithBound.expiration);
    });

    it("should boundOrders be equal to expected", () => {
      expect(orderInfo["boundOrder"]).to.be.eq(orderWithBound.boundOrder);
    });

    it("should baseAmount be equal to expected", () => {
      expect(orderInfo["action"]).to.be.eq(Action.LOSS);
    });

    it("should send tokens from user to trading contract", async () => {
      await expect(result).to.changeTokenBalances(
        baseToken,
        [deployer, tradingPlatform.address],
        [`-${orderWithBound.baseAmount}`, orderWithBound.baseAmount]
      );
    });

    it("should emit OrderCreated event", async () => {
      await expect(result).to.emit(tradingPlatform, "OrderCreated").withArgs(orderId, deployer.address);
    });
  });

  describe("Order with deposited order balance: When all parameters correct", () => {
    let result: ContractTransaction;
    let tradingPlatform: TradingPlatform;
    let baseToken: MockERC20;
    let order: ITradingPlatform.OrderStruct;
    let orderIdBefore: BigNumber;
    let orderId: BigNumber;
    let activeOrdersLengthBefore: BigNumber;
    let orderInfo: ITradingPlatform.OrderInfoStruct;
    let userBalanceOnContractBefore: BigNumber;
    let userBalanceOnContractAfter: BigNumber;

    const depositAmount = baseAmount.div(2);
    const neededAmount = baseAmount.sub(depositAmount);

    before(async () => {
      const deploy = await loadFixture(deployTradingPlatform);
      tradingPlatform = deploy.tradingPlatform;
      order = deploy.order;
      baseToken = deploy.baseToken;
      await baseToken.approve(tradingPlatform.address, baseAmount);
      await tradingPlatform.deposit(baseToken.address, depositAmount);
      activeOrdersLengthBefore = await tradingPlatform.activeOrdersLength();
      orderIdBefore = await tradingPlatform.getOrderCounter();
      userBalanceOnContractBefore = await tradingPlatform.getUserBalance(
        deploy.deployer.address,
        baseToken.address
      );
      result = await tradingPlatform.createOrder(order);
      userBalanceOnContractAfter = await tradingPlatform.getUserBalance(
        deploy.deployer.address,
        baseToken.address
      );
      orderId = await tradingPlatform.getOrderCounter();
      orderInfo = (await tradingPlatform.getUserOrdersInfo(deploy.deployer.address))[0];
    });

    it("should not reverted", async () => {
      await expect(result).to.be.not.reverted;
    });

    it("should order id be equal to expected", () => {
      expect(orderInfo.id).to.be.eq(orderId);
    });

    it("should increment orderWithBound id", () => {
      expect(orderIdBefore.add(1)).to.be.eq(orderInfo.id);
    });

    it("should add new order to active list", async () => {
      const orderStatus = await tradingPlatform.isActiveOrderExist(orderInfo.id);
      expect(orderStatus).to.be.true;
    });

    it("should increment active list", async () => {
      const activeOrdersLength = await tradingPlatform.activeOrdersLength();
      expect(activeOrdersLength).to.be.eq(activeOrdersLengthBefore.add(1));
    });

    it("should add expected id to active list", () => {
      expect(orderInfo.id).to.be.eq(orderId);
    });

    it("should userAddress be equal to expected", () => {
      expect(orderInfo.order["userAddress"]).to.be.eq(order.userAddress);
    });

    it("should baseToken be equal to expected", () => {
      expect(orderInfo.order["baseToken"]).to.be.eq(order.baseToken);
    });

    it("should targetToken be equal to expected", () => {
      expect(orderInfo.order["targetToken"]).to.be.eq(order.targetToken);
    });

    it("should pairFee be equal to expected", () => {
      expect(orderInfo.order["pairFee"]).to.be.eq(order.pairFee);
    });

    it("should slippage be equal to expected", () => {
      expect(orderInfo.order["slippage"]).to.be.eq(order.slippage);
    });

    it("should baseAmount be equal to expected", () => {
      expect(orderInfo.order["baseAmount"]).to.be.eq(order.baseAmount);
    });

    it("should orderInfo.order be equal to expected", () => {
      expect(orderInfo.order["aimTargetTokenAmount"]).to.be.eq(order.aimTargetTokenAmount);
    });

    it("should minTargetTokenAmount be equal to expected", () => {
      expect(orderInfo.order["minTargetTokenAmount"]).to.be.eq(order.minTargetTokenAmount);
    });

    it("should expiration be equal to expected", () => {
      expect(orderInfo.order["expiration"]).to.be.eq(order.expiration);
    });

    it("should boundOrders be equal to expected", () => {
      expect(orderInfo.order["boundOrder"]).to.be.eq(order.boundOrder);
    });

    it("should baseAmount be equal to expected", () => {
      expect(orderInfo.order["action"]).to.be.eq(Action.LOSS);
    });

    it("should send needed amounts of tokens from user to trading contract", async () => {
      await expect(result).to.changeTokenBalances(
        baseToken,
        [deployer, tradingPlatform.address],
        [`-${neededAmount}`, neededAmount]
      );
    });

    it("should spend user tokens on contract", () => {
      expect(userBalanceOnContractAfter).to.eq(userBalanceOnContractBefore.sub(depositAmount));
    });

    it("should emit OrderCreated event", async () => {
      await expect(result).to.emit(tradingPlatform, "OrderCreated").withArgs(orderId, deployer.address);
    });
  });

  describe("Order with deposited order balance: When all parameters correct", () => {
    let result: ContractTransaction;
    let tradingPlatform: TradingPlatform;
    let baseToken: MockERC20;
    let order: ITradingPlatform.OrderStruct;
    let orderIdBefore: BigNumber;
    let orderId: BigNumber;
    let activeOrdersLengthBefore: BigNumber;
    let orderInfo: ITradingPlatform.OrderInfoStruct;
    let userBalanceOnContractBefore: BigNumber;
    let userBalanceOnContractAfter: BigNumber;

    before(async () => {
      const deploy = await loadFixture(deployTradingPlatform);
      tradingPlatform = deploy.tradingPlatform;
      order = deploy.order;
      baseToken = deploy.baseToken;
      await baseToken.approve(tradingPlatform.address, baseAmount);
      await tradingPlatform.deposit(baseToken.address, baseAmount);
      activeOrdersLengthBefore = await tradingPlatform.activeOrdersLength();
      orderIdBefore = await tradingPlatform.getOrderCounter();
      userBalanceOnContractBefore = await tradingPlatform.getUserBalance(
        deploy.deployer.address,
        baseToken.address
      );
      result = await tradingPlatform.createOrder(order);
      userBalanceOnContractAfter = await tradingPlatform.getUserBalance(
        deploy.deployer.address,
        baseToken.address
      );
      orderId = await tradingPlatform.getOrderCounter();
      // orderInfo = (await tradingPlatform.getOrdersInfo([orderId]))[0].order;
      orderInfo = (await tradingPlatform.getUserOrdersInfo(deploy.deployer.address))[0];
    });

    it("should not reverted", async () => {
      await expect(result).to.be.not.reverted;
    });

    it("should order id be equal to expected", () => {
      expect(orderInfo.id).to.be.eq(orderId);
    });

    it("should increment orderWithBound id", () => {
      expect(orderIdBefore.add(1)).to.be.eq(orderInfo.id);
    });

    it("should add new order to active list", async () => {
      const orderStatus = await tradingPlatform.isActiveOrderExist(orderInfo.id);
      expect(orderStatus).to.be.true;
    });

    it("should increment active list", async () => {
      const activeOrdersLength = await tradingPlatform.activeOrdersLength();
      expect(activeOrdersLength).to.be.eq(activeOrdersLengthBefore.add(1));
    });

    it("should add expected id to active list", () => {
      expect(orderInfo.id).to.be.eq(orderId);
    });

    it("should userAddress be equal to expected", () => {
      expect(orderInfo.order["userAddress"]).to.be.eq(order.userAddress);
    });

    it("should baseToken be equal to expected", () => {
      expect(orderInfo.order["baseToken"]).to.be.eq(order.baseToken);
    });

    it("should targetToken be equal to expected", () => {
      expect(orderInfo.order["targetToken"]).to.be.eq(order.targetToken);
    });

    it("should pairFee be equal to expected", () => {
      expect(orderInfo.order["pairFee"]).to.be.eq(order.pairFee);
    });

    it("should slippage be equal to expected", () => {
      expect(orderInfo.order["slippage"]).to.be.eq(order.slippage);
    });

    it("should baseAmount be equal to expected", () => {
      expect(orderInfo.order["baseAmount"]).to.be.eq(order.baseAmount);
    });

    it("should orderInfo.order be equal to expected", () => {
      expect(orderInfo.order["aimTargetTokenAmount"]).to.be.eq(order.aimTargetTokenAmount);
    });

    it("should minTargetTokenAmount be equal to expected", () => {
      expect(orderInfo.order["minTargetTokenAmount"]).to.be.eq(order.minTargetTokenAmount);
    });

    it("should expiration be equal to expected", () => {
      expect(orderInfo.order["expiration"]).to.be.eq(order.expiration);
    });

    it("should boundOrders be equal to expected", () => {
      expect(orderInfo.order["boundOrder"]).to.be.eq(order.boundOrder);
    });

    it("should baseAmount be equal to expected", () => {
      expect(orderInfo.order["action"]).to.be.eq(Action.LOSS);
    });

    it("should not send tokens from user to trading contract", async () => {
      await expect(result).to.changeTokenBalances(baseToken, [deployer, tradingPlatform.address], [0, 0]);
    });

    it("should spend user tokens on contract", () => {
      expect(userBalanceOnContractAfter).to.eq(userBalanceOnContractBefore.sub(baseAmount));
    });

    it("should emit OrderCreated event", async () => {
      await expect(result).to.emit(tradingPlatform, "OrderCreated").withArgs(orderId, deployer.address);
    });
  });

  describe("DCA: When all parameters correct", () => {
    let result: ContractTransaction;
    let tradingPlatform: TradingPlatform;
    let baseToken: MockERC20;
    let targetToken: MockERC20;
    let orderDCA: ITradingPlatform.OrderStruct;
    let orderIdBefore: BigNumber;
    let orderId: BigNumber;
    let activeOrdersLengthBefore: BigNumber;
    let orderInfo: ITradingPlatform.OrderInfoStruct;
    let creationTimeStamp: BigNumberish;

    before(async () => {
      const deploy = await loadFixture(deployTradingPlatform);
      tradingPlatform = deploy.tradingPlatform;
      baseToken = deploy.baseToken;
      targetToken = deploy.targetToken;
      const data = ethers.utils.defaultAbiCoder.encode(
        ["uint128", "uint128"],
        [120, ethers.utils.parseUnits("1")]
      );

      orderDCA = {
        userAddress: deployer.address,
        baseToken: baseToken.address,
        targetToken: targetToken.address,
        pairFee: PAIR_FEE,
        slippage: SLIPPAGE,
        baseAmount: baseAmount,
        aimTargetTokenAmount: 0,
        minTargetTokenAmount: 0,
        expiration: 0,
        boundOrder: 0,
        action: Action.DCA,
        data,
      };
      await baseToken.approve(tradingPlatform.address, baseAmount.mul(2));
      activeOrdersLengthBefore = await tradingPlatform.activeOrdersLength();
      orderIdBefore = await tradingPlatform.getOrderCounter();
      result = await tradingPlatform.createOrder(orderDCA);
      creationTimeStamp = await time.latest();
      orderId = await tradingPlatform.getOrderCounter();
      orderInfo = (await tradingPlatform.getOrdersInfo([orderId]))[0];
    });

    it("should not reverted", async () => {
      await expect(result).to.be.not.reverted;
    });

    it("should increment orderWithBound id", () => {
      expect(orderIdBefore.add(1)).to.be.eq(orderId);
    });

    it("should add new orderWithBound to active list", async () => {
      const orderStatus = await tradingPlatform.isActiveOrderExist(orderId);
      expect(orderStatus).to.be.true;
    });

    it("should increment active list", async () => {
      const activeOrdersLength = await tradingPlatform.activeOrdersLength();
      expect(activeOrdersLength).to.be.eq(activeOrdersLengthBefore.add(1));
    });

    it("should add expected orderWithBound id to active list", async () => {
      const activeOrderId = await tradingPlatform.activeOrderId(0);
      expect(activeOrderId).to.be.eq(orderId);
    });

    it("should order list be equal to expected", async () => {
      const orderStatus = await tradingPlatform.activeOrdersIds(0, 10);
      expect(orderStatus).to.be.deep.eq([1]);
    });

    it("should userAddress be equal to expected", () => {
      expect(orderInfo.order["userAddress"]).to.be.eq(orderDCA.userAddress);
    });

    it("should baseToken be equal to expected", () => {
      expect(orderInfo.order["baseToken"]).to.be.eq(orderDCA.baseToken);
    });

    it("should targetToken be equal to expected", () => {
      expect(orderInfo.order["targetToken"]).to.be.eq(orderDCA.targetToken);
    });

    it("should pairFee be equal to expected", () => {
      expect(orderInfo.order["pairFee"]).to.be.eq(orderDCA.pairFee);
    });

    it("should slippage be equal to expected", () => {
      expect(orderInfo.order["slippage"]).to.be.eq(orderDCA.slippage);
    });

    it("should baseAmount be equal to expected", () => {
      expect(orderInfo.order["baseAmount"]).to.be.eq(orderDCA.baseAmount);
    });

    it("should aimTargetTokenAmount be equal to expected", () => {
      expect(orderInfo.order["aimTargetTokenAmount"]).to.be.eq(orderDCA.aimTargetTokenAmount);
    });

    it("should minTargetTokenAmount be equal to expected", () => {
      expect(orderInfo.order["minTargetTokenAmount"]).to.be.eq(orderDCA.minTargetTokenAmount);
    });

    it("should expiration be equal to expected", () => {
      expect(orderInfo.order["expiration"]).to.be.eq(orderDCA.expiration);
    });

    it("should boundOrders be equal to expected", () => {
      expect(orderInfo.order["boundOrder"]).to.be.eq(orderDCA.boundOrder);
    });

    it("should data be equal to expected", () => {
      expect(orderInfo.order["data"]).to.be.deep.eq(orderDCA.data);
    });

    it("should additionalInformation be equal to expected", () => {
      expect(orderInfo["additionalInformation"]).to.be.deep.eq(creationTimeStamp);
    });

    it("should baseAmount be equal to expected", () => {
      expect(orderInfo.order["action"]).to.be.eq(Action.DCA);
    });

    it("should send tokens from user to trading contract", async () => {
      await expect(result).to.changeTokenBalances(
        baseToken,
        [deployer, tradingPlatform.address],
        [`-${orderDCA.baseAmount}`, orderDCA.baseAmount]
      );
    });

    it("should emit OrderCreated event", async () => {
      await expect(result).to.emit(tradingPlatform, "OrderCreated").withArgs(orderId, deployer.address);
    });
  });

  describe("TRAILING: When all parameters correct", () => {
    let result: ContractTransaction;
    let tradingPlatform: TradingPlatform;
    let baseToken: MockERC20;
    let targetToken: MockERC20;
    let orderTrailing: ITradingPlatform.OrderStruct;
    let orderIdBefore: BigNumber;
    let orderId: BigNumber;
    let activeOrdersLengthBefore: BigNumber;
    let orderInfo: ITradingPlatform.OrderStruct;

    before(async () => {
      const deploy = await loadFixture(deployTradingPlatform);
      tradingPlatform = deploy.tradingPlatform;
      baseToken = deploy.baseToken;
      targetToken = deploy.targetToken;
      const data = ethers.utils.defaultAbiCoder.encode(
        ["uint128", "uint128", "uint24"],
        [baseAmount, ethers.utils.parseUnits("20"), 5000]
      );
      orderTrailing = {
        userAddress: deployer.address,
        baseToken: baseToken.address,
        targetToken: targetToken.address,
        pairFee: PAIR_FEE,
        slippage: SLIPPAGE,
        baseAmount: baseAmount,
        aimTargetTokenAmount: ethers.utils.parseUnits("50"),
        minTargetTokenAmount: ethers.utils.parseUnits("45"),
        expiration: Math.floor(Date.now() / 1000) + 60 * 60,
        boundOrder: 0,
        action: Action.TRAILING,
        data,
      };
      await baseToken.approve(tradingPlatform.address, baseAmount.mul(2));
      activeOrdersLengthBefore = await tradingPlatform.activeOrdersLength();
      orderIdBefore = await tradingPlatform.getOrderCounter();
      result = await tradingPlatform.createOrder(orderTrailing);
      orderId = await tradingPlatform.getOrderCounter();
      orderInfo = (await tradingPlatform.getOrdersInfo([orderId]))[0].order;
    });

    it("should not reverted", async () => {
      await expect(result).to.be.not.reverted;
    });

    it("should increment orderWithBound id", () => {
      expect(orderIdBefore.add(1)).to.be.eq(orderId);
    });

    it("should add new orderWithBound to active list", async () => {
      const orderStatus = await tradingPlatform.isActiveOrderExist(orderId);
      expect(orderStatus).to.be.true;
    });

    it("should increment active list", async () => {
      const activeOrdersLength = await tradingPlatform.activeOrdersLength();
      expect(activeOrdersLength).to.be.eq(activeOrdersLengthBefore.add(1));
    });

    it("should add expected orderWithBound id to active list", async () => {
      const activeOrderId = await tradingPlatform.activeOrderId(0);
      expect(activeOrderId).to.be.eq(orderId);
    });

    it("should order list be equal to expected", async () => {
      const orderStatus = await tradingPlatform.activeOrdersIds(0, 10);
      expect(orderStatus).to.be.deep.eq([1]);
    });

    it("should userAddress be equal to expected", () => {
      expect(orderInfo["userAddress"]).to.be.eq(orderTrailing.userAddress);
    });

    it("should baseToken be equal to expected", () => {
      expect(orderInfo["baseToken"]).to.be.eq(orderTrailing.baseToken);
    });

    it("should targetToken be equal to expected", () => {
      expect(orderInfo["targetToken"]).to.be.eq(orderTrailing.targetToken);
    });

    it("should pairFee be equal to expected", () => {
      expect(orderInfo["pairFee"]).to.be.eq(orderTrailing.pairFee);
    });

    it("should slippage be equal to expected", () => {
      expect(orderInfo["slippage"]).to.be.eq(orderTrailing.slippage);
    });

    it("should baseAmount be equal to expected", () => {
      expect(orderInfo["baseAmount"]).to.be.eq(orderTrailing.baseAmount);
    });

    it("should aimTargetTokenAmount be equal to expected", () => {
      expect(orderInfo["aimTargetTokenAmount"]).to.be.eq(orderTrailing.aimTargetTokenAmount);
    });

    it("should minTargetTokenAmount be equal to expected", () => {
      expect(orderInfo["minTargetTokenAmount"]).to.be.eq(orderTrailing.minTargetTokenAmount);
    });

    it("should expiration be equal to expected", () => {
      expect(orderInfo["expiration"]).to.be.eq(orderTrailing.expiration);
    });

    it("should boundOrders be equal to expected", () => {
      expect(orderInfo["boundOrder"]).to.be.eq(orderTrailing.boundOrder);
    });

    it("should data be equal to expected", () => {
      expect(orderInfo["data"]).to.be.deep.eq(orderTrailing.data);
    });

    it("should baseAmount be equal to expected", () => {
      expect(orderInfo["action"]).to.be.eq(Action.TRAILING);
    });

    it("should send tokens from user to trading contract", async () => {
      await expect(result).to.changeTokenBalances(
        baseToken,
        [deployer, tradingPlatform.address],
        [`-${orderTrailing.baseAmount}`, orderTrailing.baseAmount]
      );
    });

    it("should emit OrderCreated event", async () => {
      await expect(result).to.emit(tradingPlatform, "OrderCreated").withArgs(orderId, deployer.address);
    });
  });
});

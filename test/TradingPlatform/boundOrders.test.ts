import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { TradingPlatform } from "@contracts";
import { ContractTransaction } from "ethers";
import { baseAmount, Action, standardPrepare, createOrder } from "@test-utils";

describe("Method: boundOrders", () => {
  async function deployTradingPlatform() {
    const [deployer, admin, user] = await ethers.getSigners();

    const standardParams = await standardPrepare(deployer, admin);
    await standardParams.baseToken.transfer(user.address, baseAmount);

    await createOrder(
      deployer,
      standardParams.tradingPlatform,
      standardParams.baseToken,
      standardParams.targetToken,
      baseAmount,
      ethers.utils.parseUnits("50"),
      ethers.utils.parseUnits("45"),
      Action.PROFIT
    );
    await createOrder(
      deployer,
      standardParams.tradingPlatform,
      standardParams.baseToken,
      standardParams.targetToken,
      baseAmount,
      ethers.utils.parseUnits("50"),
      ethers.utils.parseUnits("45"),
      Action.PROFIT
    );
    await createOrder(
      deployer,
      standardParams.tradingPlatform,
      standardParams.baseToken,
      standardParams.targetToken,
      baseAmount,
      ethers.utils.parseUnits("50"),
      ethers.utils.parseUnits("45"),
      Action.PROFIT
    );
    await createOrder(
      user,
      standardParams.tradingPlatform,
      standardParams.baseToken,
      standardParams.targetToken,
      baseAmount,
      ethers.utils.parseUnits("50"),
      ethers.utils.parseUnits("45"),
      Action.PROFIT
    );
    await createOrder(
      deployer,
      standardParams.tradingPlatform,
      standardParams.baseToken,
      standardParams.targetToken,
      baseAmount,
      ethers.utils.parseUnits("50"),
      ethers.utils.parseUnits("45"),
      Action.PROFIT
    );

    const data = ethers.utils.defaultAbiCoder.encode(["uint128", "uint128"], [120, 100000]);
    await createOrder(
      deployer,
      standardParams.tradingPlatform,
      standardParams.baseToken,
      standardParams.targetToken,
      baseAmount,
      ethers.utils.parseUnits("50"),
      ethers.utils.parseUnits("45"),
      Action.DCA,
      data,
      0
    );

    return standardParams;
  }

  describe("When one of parameters is incorrect", () => {
    it("When id of left order is zero", async () => {
      const { tradingPlatform } = await loadFixture(deployTradingPlatform);
      await expect(tradingPlatform.boundOrders(0, 1)).to.be.revertedWith("Non-compatible orders");
    });

    it("When id of right order is zero", async () => {
      const { tradingPlatform } = await loadFixture(deployTradingPlatform);
      await expect(tradingPlatform.boundOrders(1, 0)).to.be.revertedWith("Non-compatible orders");
    });

    it("When id of right order is equal to left", async () => {
      const { tradingPlatform } = await loadFixture(deployTradingPlatform);
      await expect(tradingPlatform.boundOrders(1, 1)).to.be.revertedWith("Non-compatible orders");
    });

    it("When try bound not your order", async () => {
      const { tradingPlatform } = await loadFixture(deployTradingPlatform);
      await expect(tradingPlatform.boundOrders(4, 1)).to.be.revertedWith("Not your order");
    });

    it("When try bound with not your order", async () => {
      const { tradingPlatform } = await loadFixture(deployTradingPlatform);
      await expect(tradingPlatform.boundOrders(1, 4)).to.be.revertedWith("Not your order");
    });

    it("When try bound non executing order", async () => {
      const { tradingPlatform } = await loadFixture(deployTradingPlatform);
      await expect(tradingPlatform.boundOrders(100, 1)).to.be.revertedWith("Not your order");
      await expect(tradingPlatform.boundOrders(1, 100)).to.be.revertedWith("Not your order");
    });

    it("When try bound DCA or with DCA", async () => {
      const { tradingPlatform } = await loadFixture(deployTradingPlatform);
      await expect(tradingPlatform.boundOrders(6, 1)).to.be.revertedWith("Can't bound DCA");
      await expect(tradingPlatform.boundOrders(1, 6)).to.be.revertedWith("Can't bound DCA");
    });

    it("When try bound already bounded or with already bounded", async () => {
      const { tradingPlatform } = await loadFixture(deployTradingPlatform);
      await tradingPlatform.boundOrders(1, 3);
      await expect(tradingPlatform.boundOrders(3, 5)).to.be.revertedWith("Orders already bounded");
      await expect(tradingPlatform.boundOrders(2, 3)).to.be.revertedWith("Orders already bounded");
    });
  });

  describe("When all parameters correct", () => {
    let result: ContractTransaction;
    let tradingPlatform: TradingPlatform;

    before(async () => {
      const deploy = await loadFixture(deployTradingPlatform);
      tradingPlatform = deploy.tradingPlatform;
      result = await tradingPlatform.boundOrders(1, 3);
      await tradingPlatform.boundOrders(2, 5);
    });

    it("should not reverted", async () => {
      await expect(result).to.be.not.reverted;
    });

    it("should bound orders", async () => {
      const orderOne = await tradingPlatform.getOrdersInfo([1]);
      const orderTwo = await tradingPlatform.getOrdersInfo([2]);
      const orderThree = await tradingPlatform.getOrdersInfo([3]);
      const orderFour = await tradingPlatform.getOrdersInfo([4]);
      const orderFive = await tradingPlatform.getOrdersInfo([5]);

      expect(orderOne[0].order["boundOrder"]).to.be.eq(3);
      expect(orderTwo[0].order["boundOrder"]).to.be.eq(5);
      expect(orderThree[0].order["boundOrder"]).to.be.eq(1);
      expect(orderFour[0].order["boundOrder"]).to.be.eq(0);
      expect(orderFive[0].order["boundOrder"]).to.be.eq(2);
    });

    it("should emit OrdersBounded event", async () => {
      await expect(result).to.emit(tradingPlatform, "OrdersBounded").withArgs(1, 3);
    });
  });
});

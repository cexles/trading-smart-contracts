import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MockERC20, TradingPlatform } from "@contracts";
import { BigNumber, ContractTransaction } from "ethers";
import { standardPrepare, Action, createOrder } from "@test-utils";

const baseAmount = ethers.utils.parseUnits("100");

describe("Method: cancelOrders", () => {
  let owner: SignerWithAddress;
  let admin: SignerWithAddress;

  const aimAmount = ethers.utils.parseUnits("2");
  const minAmount = ethers.utils.parseUnits("1");

  async function deployTradingPlatform() {
    [owner, admin] = await ethers.getSigners();

    const standardParams = await standardPrepare(owner, admin);
    await createOrder(
      owner,
      standardParams.tradingPlatform,
      standardParams.baseToken,
      standardParams.targetToken,
      baseAmount,
      aimAmount,
      minAmount,
      Action.PROFIT
    );
    await createOrder(
      owner,
      standardParams.tradingPlatform,
      standardParams.baseToken,
      standardParams.targetToken,
      baseAmount,
      minAmount,
      aimAmount,
      Action.LOSS
    );
    await createOrder(
      owner,
      standardParams.tradingPlatform,
      standardParams.baseToken,
      standardParams.targetToken,
      baseAmount,
      aimAmount,
      minAmount,
      Action.PROFIT
    );

    return {
      ...standardParams,
    };
  }

  describe("When one of parameters is incorrect", () => {
    it("When it is not your order", async () => {
      const { tradingPlatform } = await loadFixture(deployTradingPlatform);
      await expect(tradingPlatform.connect(admin).cancelOrders([1])).to.be.revertedWith("Not your order");
    });

    it("When not exist do nothing", async () => {
      const { tradingPlatform } = await loadFixture(deployTradingPlatform);
      const activeOrdersBefore = await tradingPlatform.activeOrdersIds(0, 100);
      await tradingPlatform.connect(owner).cancelOrders([999]);
      const activeOrdersAfter = await tradingPlatform.activeOrdersIds(0, 100);
      expect(activeOrdersBefore).to.be.deep.eq([1, 2, 3]);
      expect(activeOrdersAfter).to.be.deep.eq([1, 2, 3]);
    });
  });

  describe("When all parameters are correct", () => {
    let result: ContractTransaction;
    let tradingPlatform: TradingPlatform;
    let baseToken: MockERC20;
    let deployer: SignerWithAddress;
    let userBalanceBefore: BigNumber;
    let activeOrdersLengthBefore: BigNumber;
    let activeOrdersBefore: BigNumber[];

    before(async () => {
      const deploy = await loadFixture(deployTradingPlatform);
      tradingPlatform = deploy.tradingPlatform;
      baseToken = deploy.baseToken;
      deployer = deploy.deployer;
      await baseToken.approve(tradingPlatform.address, baseAmount.mul(2));
      activeOrdersLengthBefore = await tradingPlatform.activeOrdersLength();
      activeOrdersBefore = await tradingPlatform.activeOrdersIds(0, 100);
      userBalanceBefore = await tradingPlatform.getUserBalance(deployer.address, baseToken.address);
      result = await tradingPlatform.cancelOrders([1]);
    });

    it("should not reverted", async () => {
      await expect(result).to.be.not.reverted;
    });

    it("should decries active list", async () => {
      const activeOrdersLength = await tradingPlatform.activeOrdersLength();
      expect(activeOrdersLengthBefore.sub(1)).to.be.eq(activeOrdersLength);
    });

    it("should remove order from active list", async () => {
      const orderStatus = await tradingPlatform.isActiveOrderExist(1);
      expect(orderStatus).to.be.false;
    });

    it("should active list be equal to expected", async () => {
      activeOrdersBefore = await tradingPlatform.activeOrdersIds(0, 100);
      expect(activeOrdersBefore).to.be.deep.eq([3, 2]);
    });

    it("should change user balance", async () => {
      const userBalance = await tradingPlatform.getUserBalance(deployer.address, baseToken.address);

      expect(userBalance).to.be.eq(userBalanceBefore.add(baseAmount));
    });

    it("should emit OrderCreated event", async () => {
      await expect(result).to.emit(tradingPlatform, "OrderCanceled").withArgs(1);
    });
  });
});

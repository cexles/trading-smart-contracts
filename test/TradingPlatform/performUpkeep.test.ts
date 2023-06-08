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

const CHECK_DATA = ethers.utils.defaultAbiCoder.encode(["uint128", "uint128"], [0, 100]);

async function preparePairAndContracts() {
  const [deployer, admin] = await ethers.getSigners();

  return standardPrepare(deployer, admin);
}

describe("Method: performUpkeep", () => {
  describe("Orders not exists", () => {
    it("should revert if no orders for execution", async () => {
      const { tradingPlatform } = await loadFixture(preparePairAndContracts);
      const checkResult = await tradingPlatform.checkUpkeep(CHECK_DATA);
      const decodedPerformData = ethers.utils.defaultAbiCoder.decode(
        ["uint256[]"],
        checkResult["performData"]
      );

      expect(checkResult["upkeepNeeded"]).to.be.false;
      expect(decodedPerformData[0]).to.be.deep.eq([]);
      await expect(tradingPlatform.performUpkeep(checkResult["performData"])).to.be.revertedWith(
        "Nothing for execution"
      );
    });
  });

  describe("Orders to execute", () => {
    it("should execute ready orders", async () => {
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

      let checkResult = await tradingPlatform.checkUpkeep(CHECK_DATA);
      let decodedPerformData = ethers.utils.defaultAbiCoder.decode(["uint256[]"], checkResult["performData"]);

      expect(checkResult["upkeepNeeded"]).to.be.true;
      expect(decodedPerformData[0]).to.be.deep.eq([1, 4]);
      await expect(tradingPlatform.performUpkeep(checkResult["performData"])).to.be.not.reverted;

      checkResult = await tradingPlatform.checkUpkeep(CHECK_DATA);
      decodedPerformData = ethers.utils.defaultAbiCoder.decode(["uint256[]"], checkResult["performData"]);
      expect(decodedPerformData[0]).to.be.deep.eq([]);
    });

    it("should execute ready orders and skip others", async () => {
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
      let checkResult = await tradingPlatform.checkUpkeep(CHECK_DATA);
      let decodedPerformData = ethers.utils.defaultAbiCoder.decode(["uint256[]"], checkResult["performData"]);

      const newPerformData = ethers.utils.defaultAbiCoder.encode(["uint256[]"], [[1, 2, 5, 10, 55]]);

      expect(checkResult["upkeepNeeded"]).to.be.true;
      expect(decodedPerformData[0]).to.be.deep.eq([1, 2, 3, 4]);

      await expect(tradingPlatform.performUpkeep(newPerformData)).to.be.not.reverted;

      checkResult = await tradingPlatform.checkUpkeep(CHECK_DATA);
      decodedPerformData = ethers.utils.defaultAbiCoder.decode(["uint256[]"], checkResult["performData"]);
      expect(decodedPerformData[0]).to.be.deep.eq([4, 3]);
    });
  });
});

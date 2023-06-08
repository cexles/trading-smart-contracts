import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { standardPrepare } from "@test-utils";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MockERC20, TradingPlatform } from "@contracts";
import { BigNumber, ContractTransaction } from "ethers";

const baseAmount = ethers.utils.parseUnits("100");

describe("Method: withdraw", () => {
  async function deployTradingPlatform() {
    const [deployer, admin] = await ethers.getSigners();
    const standardParams = await standardPrepare(deployer, admin);
    await standardParams.baseToken.approve(standardParams.tradingPlatform.address, baseAmount);
    await standardParams.tradingPlatform.deposit(standardParams.baseToken.address, baseAmount);

    return standardParams;
  }

  describe("When one of parameters is incorrect", () => {
    it("When amount exceed balance", async () => {
      const { tradingPlatform, baseToken } = await loadFixture(deployTradingPlatform);
      await expect(tradingPlatform.withdraw(baseToken.address, baseAmount.add(1))).to.be.revertedWith(
        "Amount exceed balance"
      );
    });
  });

  describe("When all parameters correct", () => {
    let result: ContractTransaction;
    let deployer: SignerWithAddress;
    let tradingPlatform: TradingPlatform;
    let baseToken: MockERC20;
    let userBalanceBefore: BigNumber;
    let withdrawAmount: BigNumber;

    before(async () => {
      const deploy = await loadFixture(deployTradingPlatform);
      deployer = deploy.deployer;
      tradingPlatform = deploy.tradingPlatform;
      baseToken = deploy.baseToken;
      userBalanceBefore = await tradingPlatform.getUserBalance(deployer.address, baseToken.address);
      withdrawAmount = baseAmount.div(2);
      result = await tradingPlatform.withdraw(baseToken.address, baseAmount.div(2));
    });

    it("should not reverted", async () => {
      await expect(result).to.be.not.reverted;
    });

    it("should decrement user balance", async () => {
      const userBalance = await tradingPlatform.getUserBalance(deployer.address, baseToken.address);
      expect(userBalance).to.be.eq(userBalanceBefore.sub(withdrawAmount));
    });

    it("should send tokens from user to trading contract", async () => {
      await expect(result).to.changeTokenBalances(
        baseToken,
        [tradingPlatform.address, deployer],
        [`-${withdrawAmount}`, withdrawAmount]
      );
    });

    it("should emit Deposited event", async () => {
      await expect(result)
        .to.emit(tradingPlatform, "Withdrawed")
        .withArgs(deployer.address, baseToken.address, withdrawAmount);
    });
  });
});

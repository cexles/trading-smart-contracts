import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { MockERC20, TradingPlatform } from "@contracts";
import { standardPrepare, totalSupply } from "@test-utils";
import { BigNumber, ContractTransaction } from "ethers";

const baseAmount = ethers.utils.parseUnits("100");

describe("Method: deposit", () => {
  async function deployTradingPlatform() {
    const [deployer, admin] = await ethers.getSigners();

    return await standardPrepare(deployer, admin);
  }

  describe("When one of parameters is incorrect", () => {
    it("When token not allowed", async () => {
      const { tradingPlatform, randomToken } = await loadFixture(deployTradingPlatform);
      await expect(tradingPlatform.deposit(randomToken.address, totalSupply)).to.be.revertedWith(
        "Token not allowed"
      );
    });

    it("When amount exceed approval", async () => {
      const { tradingPlatform, baseToken } = await loadFixture(deployTradingPlatform);
      await expect(tradingPlatform.deposit(baseToken.address, baseAmount)).to.be.revertedWith(
        "ERC20: insufficient allowance"
      );
    });

    it("When amount exceed balance", async () => {
      const { tradingPlatform, baseToken } = await loadFixture(deployTradingPlatform);
      await baseToken.approve(tradingPlatform.address, totalSupply.add(1));
      await expect(tradingPlatform.deposit(baseToken.address, totalSupply.add(1))).to.be.revertedWith(
        "ERC20: transfer amount exceeds balance"
      );
    });
  });

  describe("When all parameters correct", () => {
    let result: ContractTransaction;
    let tradingPlatform: TradingPlatform;
    let deployer: SignerWithAddress;
    let baseToken: MockERC20;
    let userBalanceBefore: BigNumber;

    before(async () => {
      const deploy = await loadFixture(deployTradingPlatform);
      tradingPlatform = deploy.tradingPlatform;
      baseToken = deploy.baseToken;
      deployer = deploy.deployer;
      userBalanceBefore = await tradingPlatform.getUserBalance(deployer.address, baseToken.address);
      await baseToken.approve(tradingPlatform.address, baseAmount);
      result = await tradingPlatform.deposit(baseToken.address, baseAmount);
    });

    it("should not reverted", async () => {
      await expect(result).to.be.not.reverted;
    });

    it("should increment user balance", async () => {
      const userBalance = await tradingPlatform.getUserBalance(deployer.address, baseToken.address);
      expect(userBalance).to.be.eq(userBalanceBefore.add(baseAmount));
    });

    it("should send tokens from user to trading contract", async () => {
      await expect(result).to.changeTokenBalances(
        baseToken,
        [deployer, tradingPlatform.address],
        [`-${baseAmount}`, baseAmount]
      );
    });

    it("should emit Deposited event", async () => {
      await expect(result)
        .to.emit(tradingPlatform, "Deposited")
        .withArgs(deployer.address, baseToken.address, baseAmount);
    });
  });
});

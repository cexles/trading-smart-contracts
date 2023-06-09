import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { standardPrepare } from "@test-utils";
import { ContractTransaction } from "ethers";
import { MockERC20, TradingPlatform } from "@contracts";

describe("Method: removeTokensFromWhitelist", () => {
  async function deployTradingPlatform() {
    const [deployer, admin] = await ethers.getSigners();

    return await standardPrepare(deployer, admin);
  }

  describe("When one of parameters is incorrect", () => {
    it("When caller not admin", async () => {
      const { tradingPlatform, baseToken, deployer } = await loadFixture(deployTradingPlatform);
      const adminRole = await tradingPlatform.ADMIN_ROLE();
      await expect(tradingPlatform.removeTokensFromWhitelist([baseToken.address])).to.be.revertedWith(
        `AccessControl: account ${deployer.address.toLowerCase()} is missing role ${adminRole}`
      );
    });
  });

  describe("When all parameters correct", () => {
    let result: ContractTransaction;
    let tradingPlatform: TradingPlatform;
    let baseToken: MockERC20;
    let targetToken: MockERC20;
    let baseTokenWhitelistStatus: boolean;

    before(async () => {
      const deploy = await loadFixture(deployTradingPlatform);
      tradingPlatform = deploy.tradingPlatform;
      baseToken = deploy.baseToken;
      targetToken = deploy.targetToken;
      baseTokenWhitelistStatus = await tradingPlatform.getTokenStatus(baseToken.address);
      result = await tradingPlatform
        .connect(deploy.admin)
        .removeTokensFromWhitelist([baseToken.address, targetToken.address]);
    });

    it("should not reverted", async () => {
      await expect(result).to.be.not.reverted;
    });

    it("should remove token from whitelist", async () => {
      expect(baseTokenWhitelistStatus).to.be.true;
      const baseTokenNewWhitelistStatus = await tradingPlatform.getTokenStatus(baseToken.address);
      const targetTokenNewWhitelistStatus = await tradingPlatform.getTokenStatus(baseToken.address);
      expect(baseTokenNewWhitelistStatus).to.be.false;
      expect(targetTokenNewWhitelistStatus).to.be.false;
    });

    it("should emit Deposited event", async () => {
      await expect(result)
        .to.emit(tradingPlatform, "TokenRemoved")
        .withArgs(baseToken.address)
        .to.emit(tradingPlatform, "TokenRemoved")
        .withArgs(targetToken.address);
    });
  });
});

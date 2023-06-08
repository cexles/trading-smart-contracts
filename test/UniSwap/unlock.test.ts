import { IERC20 } from "@contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";

import { expect } from "chai";
import { ethers, network } from "hardhat";

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
// DAI_WHALE must be an account, not contract
const DAI_WHALE = "0x075e72a5eDf65F0A5f44699c7654C1a76941Ddc8";

describe("Test unlock accounts", () => {
  let account: SignerWithAddress;
  let dai: IERC20;
  let whale: SignerWithAddress;

  before(async () => {
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DAI_WHALE],
    });

    whale = await ethers.getSigner(DAI_WHALE);
    dai = (await ethers.getContractAt(
      "@openzeppelin/contractsV4/token/ERC20/IERC20.sol:IERC20",
      DAI
    )) as IERC20;

    account = (await ethers.getSigners())[0];
  });

  it("unlock account", async () => {
    const amount = 100n * 10n ** 18n;

    console.log("DAI balance of whale", await dai.balanceOf(DAI_WHALE));
    expect(await dai.balanceOf(DAI_WHALE)).to.gte(amount);

    await dai.connect(whale).transfer(account.address, amount);

    console.log("DAI balance of account", await dai.balanceOf(account.address));
  });
});

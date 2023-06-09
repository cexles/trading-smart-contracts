import { expect } from "chai";
import { ethers } from "hardhat";
import { loadFixture } from "@nomicfoundation/hardhat-network-helpers";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, ContractTransaction } from "ethers";
import { SwapHelperUniswapV3, IWETH, IERC20 } from "@contracts";
import { SWAP_ROUTER, FACTORY, SLIPPAGE, SECONDS_AGO, ZERO_ADDRESS } from "@test-utils";

describe("Method: swap", () => {
  const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
  const WETH9 = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2";
  const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
  const FEE = 500; // 0.5% (100% = 1000000)
  const amountIn = ethers.utils.parseUnits("1");

  async function initContractsFixture() {
    const [deployer, admin, beneficiary] = await ethers.getSigners();

    const SwapHelperV3Instance = await ethers.getContractFactory("SwapHelperUniswapV3");
    const swapHelperContract = await SwapHelperV3Instance.connect(deployer).deploy(
      SWAP_ROUTER,
      FACTORY,
      SLIPPAGE,
      SECONDS_AGO
    );

    const adminRole = await swapHelperContract.ADMIN_ROLE();
    const defaultAdminRole = await swapHelperContract.DEFAULT_ADMIN_ROLE();
    const swapperRole = await swapHelperContract.SWAPPER_ROLE();

    await swapHelperContract.grantRole(defaultAdminRole, admin.address);
    await swapHelperContract.grantRole(adminRole, admin.address);

    const weth = await ethers.getContractAt("IWETH", WETH9);
    const dai = (await ethers.getContractAt(
      "@openzeppelin/contractsV3/token/ERC20/IERC20.sol:IERC20",
      DAI
    )) as IERC20;
    const usdc = (await ethers.getContractAt(
      "@openzeppelin/contractsV3/token/ERC20/IERC20.sol:IERC20",
      USDC
    )) as IERC20;

    return { swapHelperContract, weth, dai, usdc, deployer, admin, beneficiary, swapperRole };
  }

  describe("When one of parameters is incorrect", () => {
    it("When beneficiary is zero address", async () => {
      const { swapHelperContract, admin, deployer, swapperRole } = await loadFixture(initContractsFixture);
      await swapHelperContract.connect(admin).grantRole(swapperRole, deployer.address);

      await expect(swapHelperContract.swap(ZERO_ADDRESS, WETH9, USDC, amountIn, FEE)).to.be.revertedWith(
        "beneficiary is zero address"
      );
    });

    it("When tokenIn is zero address", async () => {
      const { swapHelperContract, admin, deployer, beneficiary, swapperRole } = await loadFixture(
        initContractsFixture
      );
      await swapHelperContract.connect(admin).grantRole(swapperRole, deployer.address);

      await expect(
        swapHelperContract.swap(beneficiary.address, ZERO_ADDRESS, USDC, amountIn, FEE)
      ).to.be.revertedWith("tokenIn is zero address");
    });

    it("When tokenOut is zero address", async () => {
      const { swapHelperContract, admin, deployer, beneficiary, swapperRole } = await loadFixture(
        initContractsFixture
      );
      await swapHelperContract.connect(admin).grantRole(swapperRole, deployer.address);

      await expect(
        swapHelperContract.swap(beneficiary.address, WETH9, ZERO_ADDRESS, amountIn, FEE)
      ).to.be.revertedWith("tokenOut is zero address");
    });

    it("When tokenIn amount is zero", async () => {
      const { swapHelperContract, admin, deployer, beneficiary, swapperRole } = await loadFixture(
        initContractsFixture
      );
      await swapHelperContract.connect(admin).grantRole(swapperRole, deployer.address);

      await expect(swapHelperContract.swap(beneficiary.address, WETH9, USDC, 0, FEE)).to.be.revertedWith(
        "amountIn is not positive"
      );
    });
  });

  describe("When all parameters correct", () => {
    let beneficiaryBalanceBefore: BigNumber;
    let beneficiaryBalanceAfter: BigNumber;

    let swapHelperContract: SwapHelperUniswapV3;
    let admin: SignerWithAddress, deployer: SignerWithAddress, beneficiary: SignerWithAddress;
    let weth: IWETH;
    let usdc: IERC20;
    let swapperRole: string;

    let precision: BigNumber;
    let estimatePrice: BigNumber;
    let amountOut: BigNumber;
    let result: ContractTransaction;

    before(async () => {
      ({ swapHelperContract, admin, deployer, beneficiary, weth, usdc, swapperRole } = await loadFixture(
        initContractsFixture
      ));
      await swapHelperContract.connect(admin).grantRole(swapperRole, deployer.address);
      precision = await swapHelperContract.PRECISION();

      await weth.deposit({ value: amountIn });
      await weth.approve(swapHelperContract.address, amountIn);

      beneficiaryBalanceBefore = await usdc.balanceOf(beneficiary.address);
      estimatePrice = await swapHelperContract.getAmountOut(WETH9, USDC, amountIn, FEE, SECONDS_AGO);
      result = await swapHelperContract.swap(beneficiary.address, WETH9, USDC, amountIn, FEE);
      beneficiaryBalanceAfter = await usdc.balanceOf(beneficiary.address);
      amountOut = beneficiaryBalanceAfter.sub(beneficiaryBalanceBefore);
    });

    it("should swap tokenIn to expected tokenOut amount", () => {
      expect(amountOut).to.be.gte(estimatePrice.sub(estimatePrice.mul(SLIPPAGE).div(precision)));
    });

    it("should payer spend expected tokenIn amount", async () => {
      await expect(result).to.be.changeTokenBalance(weth, deployer.address, `-${amountIn}`);
    });

    it("should beneficiary get expected tokenOut amount", async () => {
      await expect(result).to.be.changeTokenBalance(usdc, beneficiary.address, amountOut);
    });

    describe("should emit events", () => {
      it("Event Claimed", async () => {
        await expect(result)
          .to.emit(swapHelperContract, "Swapped")
          .withArgs(beneficiary.address, WETH9, USDC, amountIn, amountOut);
      });
    });
  });
});

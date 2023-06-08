import { LiquidityProvider, IERC20 } from "@contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers, network } from "hardhat";
import { createPoolAndSetPrice, getPoolState } from "test/utils/uniHelpers";
import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { FeeAmount } from "@uniswap/v3-sdk";

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
const DAI_WHALE = "0x075e72a5eDf65F0A5f44699c7654C1a76941Ddc8";
const USDC_WHALE = "0x79E2Ba942B0e8fDB6ff3d406e930289d10B49ADe";
const FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
const SWAP_ROUTER = "0x68b3465833fb72A70ecDF485E0e4C7bD8665Fc45";

describe("LiquidityProvider", () => {
  let liquidityProvider: LiquidityProvider;
  let deployer: SignerWithAddress;
  let dai: IERC20;
  let usdc: IERC20;

  before(async () => {
    deployer = (await ethers.getSigners())[0];

    const LiquidityInstance = await ethers.getContractFactory("LiquidityProvider");
    liquidityProvider = await LiquidityInstance.deploy();
    await liquidityProvider.deployed();

    // await deployer.sendTransaction({ to: DAI_WHALE, value: ethers.utils.parseUnits("10") });
    // await deployer.sendTransaction({ to: USDC_WHALE, value: ethers.utils.parseUnits("10") });

    dai = (await ethers.getContractAt(
      "@openzeppelin/contractsV4/token/ERC20/IERC20.sol:IERC20",
      DAI
    )) as IERC20;
    usdc = (await ethers.getContractAt(
      "@openzeppelin/contractsV4/token/ERC20/IERC20.sol:IERC20",
      USDC
    )) as IERC20;

    // Unlock DAI and USDC whales
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DAI_WHALE],
    });
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [USDC_WHALE],
    });

    const daiWhale = await ethers.getSigner(DAI_WHALE);
    const usdcWhale = await ethers.getSigner(USDC_WHALE);

    // Send DAI and USDC to deployer
    const daiAmount = 1000n * 10n ** 18n;
    const usdcAmount = 1000n * 10n ** 6n;

    expect(await dai.balanceOf(daiWhale.address)).to.gte(daiAmount);
    expect(await usdc.balanceOf(usdcWhale.address)).to.gte(usdcAmount);

    await dai.connect(daiWhale).transfer(deployer.address, daiAmount);
    await usdc.connect(usdcWhale).transfer(deployer.address, usdcAmount);
  });

  it("mintNewPosition", async () => {
    const daiAmount = 100n * 10n ** 18n;
    const usdcAmount = 100n * 10n ** 6n;

    await dai.connect(deployer).transfer(liquidityProvider.address, daiAmount);
    await usdc.connect(deployer).transfer(liquidityProvider.address, usdcAmount);

    await liquidityProvider.mintNewPosition();

    console.log("DAI balance after add liquidity", await dai.balanceOf(deployer.address));
    console.log("USDC balance after add liquidity", await usdc.balanceOf(deployer.address));
  });

  it("mintNewPositionWithParams", async () => {
    const daiAmount = 100n * 10n ** 18n;
    const usdcAmount = 100n * 10n ** 6n;

    await dai.connect(deployer).transfer(liquidityProvider.address, daiAmount);
    await usdc.connect(deployer).transfer(liquidityProvider.address, usdcAmount);

    const factory = await ethers.getContractAt("IUniswapV3Factory", FACTORY);
    const poolAddress = await factory.getPool(dai.address, usdc.address, 100);
    console.log("Geted pool address: ", poolAddress);
    const poolState = await getPoolState(poolAddress);
    console.log("Geted pool state: ", poolState);

    await liquidityProvider.mintNewPositionWithParams(dai.address, usdc.address, daiAmount, usdcAmount, 100);

    console.log("token0 balance after add liquidity", await dai.balanceOf(deployer.address));
    console.log("token1 balance after add liquidity", await usdc.balanceOf(deployer.address));
  });

  it("mintNewPositionWithParams for new pair with func", async () => {
    const factory = await ethers.getContractAt("IUniswapV3Factory", FACTORY);
    const TokenInstance = await ethers.getContractFactory("MockERC20");
    const SwapHelperInstance = await ethers.getContractFactory("SwapHelperUniswapV3");

    const fee = FeeAmount.LOWEST;

    const swapHelper = await SwapHelperInstance.deploy(SWAP_ROUTER, FACTORY, 10000, 60);

    const totalSupply = ethers.utils.parseUnits("1000");
    const mintAmount0 = ethers.utils.parseUnits("100");
    const mintAmount1 = ethers.utils.parseUnits("100");

    const tokenA = await TokenInstance.deploy(18, totalSupply);
    const tokenB = await TokenInstance.deploy(18, totalSupply);

    // sort tokens
    const tokens = await swapHelper.sortTokens(tokenA.address, tokenB.address);
    const token0Address = tokens[0];
    const token0 = tokenA.address === token0Address ? tokenA : tokenB;
    const token1 = tokenA.address === token0Address ? tokenB : tokenA;

    const poolContract = await createPoolAndSetPrice(
      liquidityProvider,
      factory,
      token0,
      token1,
      fee,
      mintAmount0,
      mintAmount1,
      deployer
    );

    const poolStateAfter = await getPoolState(poolContract.address);
    console.log("Geted pool state After init: ", poolStateAfter);

    await mine(10, { interval: 10 });

    // check result pair price
    const price = await swapHelper.getAmountOut(
      token0.address,
      token1.address,
      ethers.utils.parseUnits("1"),
      fee,
      1
    );

    console.log("Result Price: ", price.toString());
  });

  it.skip("increaseLiquidityCurrentRange", async () => {
    const daiAmount = 20n * 10n ** 18n;
    const usdcAmount = 20n * 10n ** 6n;

    await dai.connect(deployer).approve(liquidityProvider.address, daiAmount);
    await usdc.connect(deployer).approve(liquidityProvider.address, usdcAmount);

    await liquidityProvider.increaseLiquidityCurrentRange(daiAmount, usdcAmount);
  });

  it("decreaseLiquidity", async () => {
    const tokenId = await liquidityProvider.tokenId();
    const liquidity = await liquidityProvider.getLiquidity(tokenId);

    await liquidityProvider.decreaseLiquidity(liquidity);

    console.log("--- decrease liquidity ---");
    console.log(`liquidity ${liquidity}`);
    console.log(`dai ${await dai.balanceOf(liquidityProvider.address)}`);
    console.log(`usdc ${await usdc.balanceOf(liquidityProvider.address)}`);
  });

  it("collectAllFees", async () => {
    await liquidityProvider.collectAllFees();

    console.log("--- collect fees ---");
    console.log(`dai ${await dai.balanceOf(liquidityProvider.address)}`);
    console.log(`usdc ${await usdc.balanceOf(liquidityProvider.address)}`);
  });
});

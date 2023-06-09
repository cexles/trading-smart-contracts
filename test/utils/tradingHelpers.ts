import { mine } from "@nomicfoundation/hardhat-network-helpers";
import { ethers } from "hardhat";
import { FeeAmount } from "@uniswap/v3-sdk";
import { ZERO_BYTES } from "./constants";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { createPoolAndSetPrice } from "./uniHelpers";
import { BigNumber, BigNumberish, BytesLike } from "ethers";
import { ERC20, TradingPlatform, ITradingPlatform } from "@contracts";

export const FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
export const SWAP_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

export const SECONDS_AGO = BigNumber.from(1);
export const PAIR_FEE = FeeAmount.LOWEST;
export const SLIPPAGE = BigNumber.from(10000); // 1% (100% = 1000000)
export const PRECISION = 1000000;

export const totalSupply = ethers.utils.parseUnits("10000000000");
export const baseAmount = ethers.utils.parseUnits("1");
export const protocolFee = 10000; // 1%

export enum Action {
  LOSS,
  PROFIT,
  DCA,
  TRAILING,
}

export async function createOrder(
  operator: SignerWithAddress,
  tradingPlatform: TradingPlatform,
  baseToken: ERC20,
  targetToken: ERC20,
  baseAmountForOrder: BigNumberish,
  aimTargetTokenAmount: BigNumberish,
  minTargetTokenAmount: BigNumberish,
  action: Action,
  data: BytesLike = ZERO_BYTES,
  expiration: BigNumberish = Math.floor(Date.now() / 1000) + 60 * 60
) {
  const order: ITradingPlatform.OrderStruct = {
    userAddress: operator.address,
    baseToken: baseToken.address,
    targetToken: targetToken.address,
    pairFee: PAIR_FEE,
    slippage: SLIPPAGE,
    baseAmount: baseAmountForOrder,
    aimTargetTokenAmount,
    minTargetTokenAmount,
    expiration,
    boundOrder: 0,
    action,
    data,
  };

  await baseToken.connect(operator).approve(tradingPlatform.address, baseAmountForOrder);
  await tradingPlatform.connect(operator).createOrder(order);
  return order;
}

export async function standardPrepare(
  operator: SignerWithAddress,
  admin: SignerWithAddress,
  feeRecipient: string = admin.address
) {
  const TokenInstance = await ethers.getContractFactory("MockERC20");
  const TradingPlatformInstance = await ethers.getContractFactory("TradingPlatform");
  const SwapHelperV3Instance = await ethers.getContractFactory("SwapHelperUniswapV3");
  const LiquidityInstance = await ethers.getContractFactory("LiquidityProvider");

  const factory = await ethers.getContractAt("IUniswapV3Factory", FACTORY);
  const liquidityProvider = await LiquidityInstance.deploy();
  const swapHelperContract = await SwapHelperV3Instance.deploy(SWAP_ROUTER, FACTORY, 10000, SECONDS_AGO);
  const tradingPlatform = await TradingPlatformInstance.deploy(
    swapHelperContract.address,
    admin.address,
    protocolFee,
    feeRecipient
  );

  const mintAmount0 = ethers.utils.parseUnits("100000");
  const mintAmount1 = ethers.utils.parseUnits("100000");

  const tokenA = await TokenInstance.deploy(18, totalSupply);
  const tokenB = await TokenInstance.deploy(18, totalSupply);
  const randomToken = await TokenInstance.deploy(18, totalSupply);

  // sort tokens
  const tokens = await swapHelperContract.sortTokens(tokenA.address, tokenB.address);
  const token0Address = tokens[0];
  const token0 = tokenA.address === token0Address ? tokenA : tokenB;
  const token1 = tokenA.address === token0Address ? tokenB : tokenA;

  const poolContract = await createPoolAndSetPrice(
    liquidityProvider,
    factory,
    token0,
    token1,
    PAIR_FEE,
    mintAmount0,
    mintAmount1,
    operator
  );

  await poolContract.increaseObservationCardinalityNext(5);

  await mine(5, { interval: 30 });

  const baseToken = token0;
  const targetToken = token1;

  await tradingPlatform.connect(admin).addTokensToWhitelist([baseToken.address, targetToken.address]);

  const adminRole = await swapHelperContract.ADMIN_ROLE();
  await swapHelperContract.grantRole(adminRole, admin.address);

  return {
    tradingPlatform,
    swapHelperContract,
    poolContract,
    baseToken,
    targetToken,
    randomToken,
    deployer: operator,
    admin,
  };
}

import { LiquidityProvider } from "@contracts";
import JSBI from "jsbi";
import { IUniswapV3Factory, MockERC20 } from "@contracts";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { BigNumber, BigNumberish } from "ethers";
import { ethers } from "hardhat";
import { FeeAmount, SqrtPriceMath, /* TickMath,*/ encodeSqrtRatioX96 } from "@uniswap/v3-sdk";

export async function createPoolAndSetPrice(
  liquidityProvider: LiquidityProvider,
  factory: IUniswapV3Factory,
  token0: MockERC20,
  token1: MockERC20,
  fee: FeeAmount,
  mintAmount0: BigNumber,
  mintAmount1: BigNumber,
  operator: SignerWithAddress
) {
  await token0.connect(operator).transfer(liquidityProvider.address, mintAmount0);
  await token1.connect(operator).transfer(liquidityProvider.address, mintAmount1);

  await factory.createPool(token0.address, token1.address, fee);
  // console.log("Created pool");

  const priceWithSDK = encodeSqrtRatioX96(
    JSBI.BigInt(mintAmount0.toString()),
    JSBI.BigInt(mintAmount1.toString())
  );
  // console.log("Initialize pool with price: ", mintAmount0.div(mintAmount1).toString());
  // console.log("Initialize pool with SQR priceWithSDK: ", priceWithSDK.toString());

  // const tick = TickMath.getTickAtSqrtRatio(priceWithSDK);
  // console.log("TICK: ", tick);

  const poolAddress = await factory.getPool(token0.address, token1.address, fee);
  // console.log("Geted pool address: ", poolAddress);

  const poolContract = await ethers.getContractAt("IUniswapV3Pool", poolAddress);
  await poolContract.initialize(priceWithSDK.toString());
  // console.log("Initialized pool");

  // console.log("Add liquidity");
  await liquidityProvider.mintNewPositionWithParams(
    token0.address,
    token1.address,
    mintAmount0,
    mintAmount1,
    fee
  );
  // console.log("minted new position");

  return poolContract;
}

export async function getPoolState(poolAddress: string) {
  const poolContract = await ethers.getContractAt("IUniswapV3Pool", poolAddress);
  const liquidity = await poolContract.liquidity();
  const slot = await poolContract.slot0();

  const PoolState = {
    liquidity,
    sqrtPriceX96: slot[0],
    tick: slot[1],
    observationIndex: slot[2],
    observationCardinality: slot[3],
    observationCardinalityNext: slot[4],
    feeProtocol: slot[5],
    unlocked: slot[6],
  };

  return PoolState;
}

export async function calculateAmount0ToSale(
  pairAddress: string,
  newToken0Amount: BigNumberish,
  newToken1Amount: BigNumberish
) {
  const poolState = await getPoolState(pairAddress);

  const newSqrtPriceX96 = encodeSqrtRatioX96(
    JSBI.BigInt(newToken0Amount.toString()),
    JSBI.BigInt(newToken1Amount.toString())
  );

  return SqrtPriceMath.getAmount0Delta(
    JSBI.BigInt(poolState.sqrtPriceX96),
    newSqrtPriceX96,
    JSBI.BigInt(poolState.liquidity),
    true
  );
}

export async function calculateAmount1ToSale(
  pairAddress: string,
  newToken0Amount: BigNumberish,
  newToken1Amount: BigNumberish
) {
  const poolState = await getPoolState(pairAddress);

  const newSqrtPriceX96 = encodeSqrtRatioX96(
    JSBI.BigInt(newToken0Amount.toString()),
    JSBI.BigInt(newToken1Amount.toString())
  );

  return SqrtPriceMath.getAmount1Delta(
    JSBI.BigInt(poolState.sqrtPriceX96),
    newSqrtPriceX96,
    JSBI.BigInt(poolState.liquidity),
    true
  );
}

export async function getPoolData(poolAddress: string) {
  const poolContract = await ethers.getContractAt("IUniswapV3Pool", poolAddress);
  const [tickSpacing, fee, liquidity, slot0] = await Promise.all([
    poolContract.tickSpacing(),
    poolContract.fee(),
    poolContract.liquidity(),
    poolContract.slot0(),
  ]);

  return {
    tickSpacing: tickSpacing,
    fee: fee,
    liquidity: liquidity,
    sqrtPriceX96: slot0[0],
    tick: slot0[1],
  };
}

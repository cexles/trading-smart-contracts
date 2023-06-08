/* eslint-disable @typescript-eslint/no-unsafe-argument */
import { BigNumberish, ethers as Ethers } from "ethers";
import { SqrtPriceMath, encodeSqrtRatioX96 } from "@uniswap/v3-sdk";
import JSBI from "jsbi";
import { HardhatEthersHelpers } from "hardhat/types";

export const FACTORY = "0x1F98431c8aD98523631AE4a59f267346ea31F984";
export const SWAP_ROUTER = "0xE592427A0AEce92De3Edee1F18E0157C05861564";

export const SECONDS_AGO = 1;
export const PAIR_FEE = 500;
export const SLIPPAGE = 10000; // 1% (100% = 1000000)
export const PRECISION = 1000000;

export async function getPoolState(poolAddress: string, ethers: typeof Ethers & HardhatEthersHelpers) {
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
  newToken1Amount: BigNumberish,
  ethers: typeof Ethers & HardhatEthersHelpers
) {
  const poolState = await getPoolState(pairAddress, ethers);

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
  newToken1Amount: BigNumberish,
  ethers: typeof Ethers & HardhatEthersHelpers
) {
  const poolState = await getPoolState(pairAddress, ethers);

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

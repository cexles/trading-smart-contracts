import { task } from "hardhat/config";
import { SECONDS_AGO, calculateAmount0ToSale, PAIR_FEE } from "utils/price-helper";
import { DEPLOY } from "config";

task("price-correction", "Correct price on UniSwap V3 pair")
  .addParam("pairAddress", "Pair address")
  .addParam("price", "New price for pair")
  .setAction(async (taskArgs: { pairAddress: string; price: number }, { ethers }) => {
    const amount0 = 10000;
    const amount1 = taskArgs.price * 10000;
    const swapHelper = DEPLOY.TRADING_PLATFORM.SWAP_HELPER || "0x99CB3439F88dFD1D9c6C4B7141a0696EcEa96ff3";

    const swapHelperContract = await ethers.getContractAt("SwapHelperUniswapV3", swapHelper);
    const poolContract = await ethers.getContractAt("IUniswapV3Pool", taskArgs.pairAddress);

    const token0 = await poolContract.token0();
    const token1 = await poolContract.token1();

    const currentPriceToken0 = await swapHelperContract.getAmountOut(
      token0,
      token1,
      ethers.utils.parseUnits("1"),
      PAIR_FEE,
      SECONDS_AGO
    );
    const currentPriceToken1 = await swapHelperContract.getAmountOut(
      token1,
      token0,
      ethers.utils.parseUnits("1"),
      PAIR_FEE,
      SECONDS_AGO
    );
    console.log("Current price token0: ", ethers.utils.formatEther(currentPriceToken0));
    console.log("Current price token1: ", ethers.utils.formatEther(currentPriceToken1));

    const amountToSale = await calculateAmount0ToSale(taskArgs.pairAddress, amount0, amount1, ethers);
    console.log("Current price: ", Number(ethers.utils.formatEther(currentPriceToken1)));
    console.log("New price: ", taskArgs.price);

    if (taskArgs.price > Number(ethers.utils.formatEther(currentPriceToken1))) {
      console.log("Amount to sell Token0(TokenB): ", amountToSale.toString());
      console.log(
        "Amount to sell Token0(TokenB) [eth]: ",
        Math.ceil(Number(ethers.utils.formatEther(amountToSale.toString())))
      );
    } else {
      console.log("Amount to buy Token0(TokenB): ", amountToSale.toString());
      console.log(
        "Amount to buy Token0(TokenB) [eth]: ",
        Math.ceil(Number(ethers.utils.formatEther(amountToSale.toString())))
      );
    }
  });

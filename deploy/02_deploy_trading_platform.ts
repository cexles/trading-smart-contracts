import { DeployFunction } from "hardhat-deploy/types";
import { typedDeployments } from "@utils";
import { DEPLOY } from "config";

const migrate: DeployFunction = async ({ deployments, getNamedAccounts }) => {
  const { deploy, get, execute } = typedDeployments(deployments);
  const { deployer } = await getNamedAccounts();
  const { TRADING_PLATFORM } = DEPLOY;

  const swapHelper = TRADING_PLATFORM.SWAP_HELPER || (await get("SwapHelperUniswapV3")).address;
  const admin = TRADING_PLATFORM.ADMIN || deployer;
  const protocolFee = TRADING_PLATFORM.PROTOCOL_FEE;
  const feeRecipient = TRADING_PLATFORM.FEE_RECIPIENT || deployer;

  await deploy("TradingPlatform", {
    from: deployer,
    args: [swapHelper, admin, protocolFee, feeRecipient],
    log: true,
  });

  await execute("TradingPlatform", { from: deployer, log: true }, "addTokensToWhitelist", [
    "0xfDaF650e710cbB5801AA0A152cf4481F70147890",
    "0x429c90F2a384dbD7A6113CC642296e914445d66e",
  ]);
};

export default migrate;

migrate.tags = ["platform", "all"];

import { DeployFunction } from "hardhat-deploy/types";
import { typedDeployments } from "@utils";
import { DEPLOY } from "config";

const migrate: DeployFunction = async ({ deployments, getNamedAccounts }) => {
  const { deploy } = typedDeployments(deployments);
  const { deployer } = await getNamedAccounts();
  const { SWAP_HELPER } = DEPLOY;

  await deploy("SwapHelperUniswapV3", {
    from: deployer,
    args: [
      SWAP_HELPER.SWAP_ROUTER,
      SWAP_HELPER.FACTORY,
      SWAP_HELPER.SLIPPAGE,
      SWAP_HELPER.SECONDS_AGO_DEFAULT,
    ],
    log: true,
  });
};

export default migrate;

migrate.tags = ["helper", "all"];

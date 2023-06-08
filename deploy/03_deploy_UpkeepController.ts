import { DeployFunction } from "hardhat-deploy/types";
import { typedDeployments } from "@utils";
import { DEPLOY } from "config";

const migrate: DeployFunction = async ({ deployments, getNamedAccounts }) => {
  const { deploy } = typedDeployments(deployments);
  const { deployer } = await getNamedAccounts();
  const { UPKEEP_CONTROLLER } = DEPLOY;

  await deploy("UpkeepController", {
    from: deployer,
    args: [
      UPKEEP_CONTROLLER.LINK_TOKEN,
      UPKEEP_CONTROLLER.AUTOMATION_REGISTRAR,
      UPKEEP_CONTROLLER.AUTOMATION_REGISTRY,
    ],
    log: true,
  });
};

migrate.tags = ["controller", "all"];

export default migrate;

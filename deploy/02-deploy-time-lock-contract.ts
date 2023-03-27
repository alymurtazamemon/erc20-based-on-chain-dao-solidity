import { DeployFunction, DeployResult } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers, network } from "hardhat";
import { developmentChains, MIN_DELAY } from "../helper-hardhat-config";
import { ContractTransaction } from "ethers";

/**
 * * Important Notes
 *
 * * In order to run `npx hardhat deploy --typecheck` command we need to add `import hardhat-deploy` in `hardhat.config.js` file.
 *
 */

const deployTimeLockContract: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    console.log(
        "\n--------------------- Deploying Time Lock Contract ---------------------\n"
    );
    const { deploy } = hre.deployments;
    const { deployer } = await hre.getNamedAccounts();
    const chainId = network.config.chainId!;

    const timeLockContract: DeployResult = await deploy("TimeLockContract", {
        from: deployer,
        log: true,
        // * It takes MIN_DELAY, proposers, executors, and admin as arguments.
        args: [MIN_DELAY, [], [], deployer],
        // * if on the development network then wait for 1 block confirmation otherwise 6 on testnets or mainnets.
        waitConfirmations: developmentChains.includes(network.name) ? 1 : 6,
    });
};

export default deployTimeLockContract;
deployTimeLockContract.tags = ["all", "time-lock"];

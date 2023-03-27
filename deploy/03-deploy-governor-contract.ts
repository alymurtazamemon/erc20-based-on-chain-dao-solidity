import { DeployFunction, DeployResult } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers, network } from "hardhat";
import { developmentChains } from "../helper-hardhat-config";
import { ContractTransaction } from "ethers";

/**
 * * Important Notes
 *
 * * In order to run `npx hardhat deploy --typecheck` command we need to add `import hardhat-deploy` in `hardhat.config.js` file.
 *
 */

const deployGovernorContract: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    console.log(
        "\n--------------------- Deploying Governor Contract ---------------------\n"
    );
    const { deploy } = hre.deployments;
    const { deployer } = await hre.getNamedAccounts();
    const chainId = network.config.chainId!;

    const governanceTokenContract = await ethers.getContract("GovernanceToken");
    const timeLockContract = await ethers.getContract("TimeLockContract");

    const governorContract: DeployResult = await deploy("GovernorContract", {
        from: deployer,
        log: true,
        args: [governanceTokenContract.address, timeLockContract.address],
        // * if on the development network then wait for 1 block confirmation otherwise 6 on testnets or mainnets.
        waitConfirmations: developmentChains.includes(network.name) ? 1 : 6,
    });
};

export default deployGovernorContract;
deployGovernorContract.tags = ["all", "governor"];

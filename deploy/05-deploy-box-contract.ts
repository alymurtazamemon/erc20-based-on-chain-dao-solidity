import { DeployFunction, DeployResult } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers, network } from "hardhat";
import { developmentChains } from "../helper-hardhat-config";
import { ContractTransaction } from "ethers";
import { Box } from "../typechain-types";

/**
 * * Important Notes
 *
 * * In order to run `npx hardhat deploy --typecheck` command we need to add `import hardhat-deploy` in `hardhat.config.js` file.
 *
 */

const deployBoxContract: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    console.log(
        "\n--------------------- Deploying Box Contract ---------------------\n"
    );
    const { deploy } = hre.deployments;
    const { deployer } = await hre.getNamedAccounts();
    const chainId = network.config.chainId!;

    const box: DeployResult = await deploy("Box", {
        from: deployer,
        log: true,
        args: [],
        // * if on the development network then wait for 1 block confirmation otherwise 6 on testnets or mainnets.
        waitConfirmations: developmentChains.includes(network.name) ? 1 : 6,
    });

    const timeLockContract = await ethers.getContract("TimeLockContract");
    const boxContract: Box = await ethers.getContractAt("Box", box.address);

    const tx: ContractTransaction = await boxContract.transferOwnership(
        timeLockContract.address
    );
    await tx.wait(1);

    console.log(
        `\nDeployed the Box Contract and Transfered the Ownership to TimeLockContract.\n`
    );
};

export default deployBoxContract;
deployBoxContract.tags = ["all", "box"];

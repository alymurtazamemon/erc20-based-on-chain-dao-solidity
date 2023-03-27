import { DeployFunction, DeployResult } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers, network } from "hardhat";
import { developmentChains } from "../helper-hardhat-config";
import { GovernanceToken } from "../typechain-types";
import { ContractTransaction } from "ethers";

/**
 * * Important Notes
 *
 * * In order to run `npx hardhat deploy --typecheck` command we need to add `import hardhat-deploy` in `hardhat.config.js` file.
 *
 */

const deployGovernanceTokenContract: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    console.log(
        "\n--------------------- Deploying Governance Token ---------------------\n"
    );
    const { deploy } = hre.deployments;
    const { deployer } = await hre.getNamedAccounts();
    const chainId = network.config.chainId!;

    const governanceToken: DeployResult = await deploy("GovernanceToken", {
        from: deployer,
        log: true,
        args: [],
        // * if on the development network then wait for 1 block confirmation otherwise 6 on testnets or mainnets.
        waitConfirmations: developmentChains.includes(network.name) ? 1 : 6,
    });

    console.log(`Delegating the voting power to deployer address...`);
    await delegate(governanceToken.address, deployer);
    console.log(`Delegated!`);
};

const delegate = async (
    governanceTokenAddress: string,
    delegatedAccount: string
) => {
    const governanceToken: GovernanceToken = await ethers.getContractAt(
        "GovernanceToken",
        governanceTokenAddress
    );

    const transactionResponse: ContractTransaction =
        await governanceToken.delegate(delegatedAccount);

    await transactionResponse.wait(1);

    // * After delegating, the delegate function will call the _moveVotingPower function that will take the snapshot by writing checkpoint. Here we are checking the length of checkpoints.
    console.log(
        `Checkpoints: ${await governanceToken.numCheckpoints(delegatedAccount)}`
    );
};

export default deployGovernanceTokenContract;
deployGovernanceTokenContract.tags = ["all", "governance-token"];

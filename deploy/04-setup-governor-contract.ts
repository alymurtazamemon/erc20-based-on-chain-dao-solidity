import { DeployFunction, DeployResult } from "hardhat-deploy/dist/types";
import { HardhatRuntimeEnvironment } from "hardhat/types";
import { ethers, network } from "hardhat";
import { ADDRESS_ZERO } from "../helper-hardhat-config";

/**
 * * Important Notes
 *
 * * In order to run `npx hardhat deploy --typecheck` command we need to add `import hardhat-deploy` in `hardhat.config.js` file.
 *
 */

const setupGovernorContract: DeployFunction = async (
    hre: HardhatRuntimeEnvironment
) => {
    console.log(
        "\n--------------------- Setup Governor Contract ---------------------\n"
    );
    const { deploy } = hre.deployments;
    const { deployer } = await hre.getNamedAccounts();
    const chainId = network.config.chainId!;

    const governor = await ethers.getContract("GovernorContract");
    const timeLock = await ethers.getContract("TimeLockContract");

    // * these are just the keccak256 hashes of diffrent roles strings.
    const proposerRole = await timeLock.PROPOSER_ROLE();
    const executorRole = await timeLock.EXECUTOR_ROLE();
    const adminRole = await timeLock.TIMELOCK_ADMIN_ROLE();

    // * only the governor contract can propose anything to timelock contract.
    console.log(`Grant the proposerRole to GovernorContract`);
    const proposerTx = await timeLock.grantRole(proposerRole, governor.address);
    await proposerTx.wait(1);
    // * ADDRESS_ZERO means anybody can be executor.
    console.log(`Grant the executorRole to Everybody`);
    const executorTx = await timeLock.grantRole(executorRole, ADDRESS_ZERO);
    await executorTx.wait(1);
    // * after it nobody can controll the timelock contract.
    console.log(`Revoke the adminRole from deployer`);
    const revokeTx = await timeLock.revokeRole(adminRole, deployer);
    await revokeTx.wait(1);
};

export default setupGovernorContract;
setupGovernorContract.tags = ["all", "governor-setup"];

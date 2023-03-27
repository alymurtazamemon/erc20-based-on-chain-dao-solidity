import { ethers, network } from "hardhat";
import { GovernorContract } from "../typechain-types";
import {
    FUNC,
    MIN_DELAY,
    NEW_STORE_VALUE,
    PROPOSAL_DESCRIPTION,
    developmentChains,
} from "../helper-hardhat-config";
import { ContractTransaction } from "ethers";
import { moveTime } from "../utils/move-time";
import { moveBlocks } from "../utils/move-blocks";

async function queueAndExecuteProposal(
    args: any[],
    functionToCall: string,
    proposalDescription: string
) {
    const governor: GovernorContract = await ethers.getContract(
        "GovernorContract"
    );
    const box = await ethers.getContract("Box");

    const encodedFunctionCall = box.interface.encodeFunctionData(
        functionToCall,
        args
    );

    const descriptionHash = ethers.utils.keccak256(
        ethers.utils.toUtf8Bytes(PROPOSAL_DESCRIPTION)
    );

    console.log(`\nQueuing the proposal...\n`);
    const queueTx: ContractTransaction = await governor.queue(
        // * takes list of target addresses.
        [box.address],
        // * takes list of values (ETHs) we want to pass to targets.
        [0],
        // * takes list of calldatas, functions with their argumetns in encoded form.
        [encodedFunctionCall],
        // * takes proposal description's hash.
        descriptionHash
    );
    await queueTx.wait(1);

    if (developmentChains.includes(network.name)) {
        await moveTime(MIN_DELAY + 1);
        await moveBlocks(1);
    }

    console.log(`\nExecuting the proposal...\n`);
    const executeTx: ContractTransaction = await governor.execute(
        // * takes list of target addresses.
        [box.address],
        // * takes list of values (ETHs) we want to pass to targets.
        [0],
        // * takes list of calldatas, functions with their argumetns in encoded form.
        [encodedFunctionCall],
        // * takes proposal description's hash.
        descriptionHash
    );
    await executeTx.wait(1);

    // * now the value inside the box contract should be updated to 40.
    const boxNewValue = await box.retrieve();
    console.log(`The new value of box contract is: ${boxNewValue.toString()}`);

    console.log(
        `\nCongratulations 🎉🎉🎉 on Successfully executing the proposal using a DAO!\n`
    );
}

queueAndExecuteProposal([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

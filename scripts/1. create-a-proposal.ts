import { ethers, network } from "hardhat";
import {
    FUNC,
    NEW_STORE_VALUE,
    PROPOSAL_DESCRIPTION,
    VOTING_DELAY,
    developmentChains,
    proposalsFile,
} from "../helper-hardhat-config";
import * as fs from "fs";
import { moveBlocks } from "../utils/move-blocks";

async function createAProposal(
    args: any[],
    functionToCall: string,
    proposalDescription: string
) {
    const governor = await ethers.getContract("GovernorContract");
    const box = await ethers.getContract("Box");

    // * This is contract function you want to call using a governot.
    const encodedFunctionCall = box.interface.encodeFunctionData(
        functionToCall,
        args
    );

    console.log(
        `\nProposing ${functionToCall} on ${box.address} with ${args}.`
    );
    console.log(`\nProposal Description:\n  ${proposalDescription}.\n`);

    const proposeTx = await governor.propose(
        // * takes list of target addresses.
        [box.address],
        // * takes list of values (ETHs) we want to pass to targets.
        [0],
        // * takes list of calldatas, functions with their argumetns in encoded form.
        [encodedFunctionCall],
        // * takes proposal description in string.
        proposalDescription
    );

    // * move the voting delay time, so we can start voting.
    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_DELAY + 1);
    }

    const proposeReceipt = await proposeTx.wait(1);
    const proposalId = proposeReceipt.events[0].args.proposalId;
    console.log(`\nProposed with proposal ID:\n  ${proposalId}`);

    const proposalState = await governor.state(proposalId);
    const proposalSnapShot = await governor.proposalSnapshot(proposalId);
    const proposalDeadline = await governor.proposalDeadline(proposalId);

    // * The state of the proposal. 1 is not passed. 0 is passed.
    console.log(`Current Proposal State: ${proposalState}`);
    // * What block # the proposal was snapshot
    console.log(`Current Proposal Snapshot: ${proposalSnapShot}`);
    // * The block number the proposal voting expires
    console.log(`Current Proposal Deadline: ${proposalDeadline}`);

    // * save the proposalId
    let proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));
    proposals[network.config.chainId!.toString()].push(proposalId.toString());
    fs.writeFileSync(proposalsFile, JSON.stringify(proposals));
}

createAProposal([NEW_STORE_VALUE], FUNC, PROPOSAL_DESCRIPTION)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

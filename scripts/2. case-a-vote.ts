import * as fs from "fs";
import { network, ethers } from "hardhat";
import {
    VOTING_PERIOD,
    developmentChains,
    proposalsFile,
} from "../helper-hardhat-config";
import { moveBlocks } from "../utils/move-blocks";

const proposalIndex = 0;

async function castAVote(proposalIndex: number) {
    const proposals = JSON.parse(fs.readFileSync(proposalsFile, "utf8"));

    // * get the proposal Id from proposals.
    const proposalId = proposals[network.config.chainId!][proposalIndex];

    // * 0 = Against, 1 = For, 2 = Abstain for this example
    const voteWay = 1;
    const reason =
        "I want to give vote in favor because I have proposed this! yaaaa It is centralized!!!";

    await vote(proposalId, voteWay, reason);
}

// * 0 = Against, 1 = For, 2 = Abstain for this example
export async function vote(
    proposalId: string,
    voteWay: number,
    reason: string
) {
    const governor = await ethers.getContract("GovernorContract");

    const voteTx = await governor.castVoteWithReason(
        proposalId,
        voteWay,
        reason
    );
    const voteTxReceipt = await voteTx.wait(1);

    console.log(`\nProposal Reason: ${voteTxReceipt.events[0].args.reason}`);

    const proposalState = await governor.state(proposalId);
    console.log(`\nCurrent Proposal State: ${proposalState}\n`);

    // * move the voting period so we can queue and execute the proposal.
    if (developmentChains.includes(network.name)) {
        await moveBlocks(VOTING_PERIOD + 1);
    }
}

castAVote(proposalIndex)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorTimelockControl.sol";

/*
 * 1) how voting power is determined.
 * we will use the GovernorVotes module, which hooks to an IVotes instance to determine the voting power of an account based on the token balance they hold when a proposal becomes active. This module requires as a constructor parameter the address of the token.
 *
 * 2) how many votes are needed for quorum.
 * we will use GovernorVotesQuorumFraction which works together with ERC20Votes to define quorum as a percentage of the total supply at the block a proposal’s voting power is retrieved. This requires a constructor parameter to set the percentage. Most Governors nowadays use 4%, so we will initialize the module with parameter 4 (this indicates the percentage, resulting in 4%).
 *
 * 3) what options people have when casting a vote and how those votes are counted.
 * we will use GovernorCountingSimple, a module that offers 3 options to voters: For, Against, and Abstain, and where only For and Abstain votes are counted towards quorum.
 *
 * 4) What GovernorTimelockControl contract does?
 * It is good practice to add a timelock to governance decisions. This allows users to exit the system if they disagree with a decision before it is executed.
 *
 * Besides these modules, Governor itself has some parameters we must set.

 * votingDelay: How long after a proposal is created should voting power be fixed. A large voting delay gives users time to unstake tokens if necessary.

 * votingPeriod: How long does a proposal remain open to votes.

 * These parameters are specified in number of blocks. Assuming block time of around 13.14 seconds, we will set votingDelay = 1 day = 6570 blocks, and votingPeriod = 1 week = 45992 blocks.

 * We can optionally set a proposal threshold as well. This restricts proposal creation to accounts who have enough voting power.
 */

contract GovernorContract is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction,
    GovernorTimelockControl
{
    constructor(
        IVotes _token,
        TimelockController _timelock
    )
        Governor("GovernorContract")
        GovernorSettings(
            1 /* 1 block voting delay */,
            5 /* 5 blocks voting period */,
            0 /* 0 Proposal Thresold so everyone can create proposal */
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4) // 4%
        GovernorTimelockControl(_timelock)
    {}

    // The following functions are overrides required by Solidity.

    function votingDelay()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }

    function quorum(
        uint256 blockNumber
    )
        public
        view
        override(IGovernor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function state(
        uint256 proposalId
    )
        public
        view
        override(Governor, GovernorTimelockControl)
        returns (ProposalState)
    {
        return super.state(proposalId);
    }

    function propose(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        string memory description
    ) public override(Governor, IGovernor) returns (uint256) {
        return super.propose(targets, values, calldatas, description);
    }

    function _execute(
        uint256 proposalId,
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) {
        super._execute(proposalId, targets, values, calldatas, descriptionHash);
    }

    function _cancel(
        address[] memory targets,
        uint256[] memory values,
        bytes[] memory calldatas,
        bytes32 descriptionHash
    ) internal override(Governor, GovernorTimelockControl) returns (uint256) {
        return super._cancel(targets, values, calldatas, descriptionHash);
    }

    function _executor()
        internal
        view
        override(Governor, GovernorTimelockControl)
        returns (address)
    {
        return super._executor();
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(Governor, GovernorTimelockControl) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/governance/TimelockController.sol";

/*
 * TimelockController uses an AccessControl setup that we need to understand in order to set up roles.
 *
 * The Proposer role is in charge of queueing operations: this is the role the Governor instance should be granted, and it should likely be the only proposer in the system.
 *
 * The Executor role is in charge of executing already available operations: we can assign this role to the special zero address to allow anyone to execute (if operations can be particularly time sensitive, the Governor should be made Executor instead).
 *
 * Lastly, there is the Admin role, which can grant and revoke the two previous roles: this is a very sensitive role that will be granted automatically to the timelock itself, and optionally to a second account, which can be used for ease of setup but should promptly renounce the role.
 */

contract TimeLockContract is TimelockController {
    constructor(
        uint256 minDelay,
        address[] memory proposers,
        address[] memory executors,
        address admin
    ) TimelockController(minDelay, proposers, executors, admin) {}
}

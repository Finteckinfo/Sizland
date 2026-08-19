// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title ReputationEngine
 * @notice Tracks disapproval counts for debtor accounts.
 *
 *   Levels (§6D):
 *     0     — clean
 *     1-4   — grey-scale overlay on profile (increasing opacity)
 *     5+    — blacklisted; blocked from creating new pledges as lender
 *
 *   Disapprovals are recorded when a lender rejects an off-chain payment claim.
 *   Only the PledgeLedger contract should call recordDisapproval.
 */
contract ReputationEngine {
    mapping(address => uint256) public disapprovals;

    uint256 public constant BLACKLIST_THRESHOLD = 5;

    address public pledgeLedger;

    event DisapprovalRecorded(address indexed account, uint256 newCount);
    event PledgeLedgerUpdated(address indexed oldLedger, address indexed newLedger);

    error OnlyPledgeLedger();
    error Blacklisted();

    modifier onlyLedger() {
        if (msg.sender != pledgeLedger) revert OnlyPledgeLedger();
        _;
    }

    constructor(address pledgeLedger_) {
        pledgeLedger = pledgeLedger_;
    }

    function recordDisapproval(address account) external onlyLedger {
        disapprovals[account]++;
        emit DisapprovalRecorded(account, disapprovals[account]);
    }

    function isBlacklisted(address account) external view returns (bool) {
        return disapprovals[account] >= BLACKLIST_THRESHOLD;
    }

    function getReputationLevel(address account) external view returns (uint256) {
        uint256 count = disapprovals[account];
        if (count >= BLACKLIST_THRESHOLD) return BLACKLIST_THRESHOLD;
        return count;
    }

    function setPledgeLedger(address newLedger) external {
        require(
            pledgeLedger == address(0) || msg.sender == pledgeLedger,
            "unauthorized"
        );
        emit PledgeLedgerUpdated(pledgeLedger, newLedger);
        pledgeLedger = newLedger;
    }
}

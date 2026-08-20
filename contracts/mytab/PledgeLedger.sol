// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title PledgeLedger
 * @notice Core state machine for peer-to-peer pledges (tabs).
 *
 *   Lifecycle:
 *     PendingCoSign → Active → Settled | Defaulted
 *                              ↓
 *                         OffChainPending → Cleared | Disputed
 *
 *   Requires debtor co-signature before activation (§6B).
 */
contract PledgeLedger is ReentrancyGuard {
    enum Status {
        PendingCoSign,
        Active,
        Settled,
        Defaulted,
        OffChainPending,
        Cleared,
        Disputed
    }

    enum Track {
        Voluntary,
        Enforced
    }

    struct Pledge {
        address lender;
        address debtor;
        uint256 amount;
        string currency;
        uint256 dueTimestamp;
        Track track;
        Status status;
        bytes32 memoHash;
        uint256 createdAt;
        uint256 settledAt;
        uint256 offChainClaimedAt;
    }

    uint256 public nextPledgeId = 1;
    mapping(uint256 => Pledge) public pledges;

    uint256 public constant OFFCHAIN_AUTO_CLEAR_PERIOD = 14 days;

    event PledgeCreated(
        uint256 indexed pledgeId,
        address indexed lender,
        address indexed debtor,
        uint256 amount,
        string currency,
        Track track
    );
    event PledgeCoSigned(uint256 indexed pledgeId, address indexed debtor);
    event PledgeDeclined(uint256 indexed pledgeId, address indexed debtor);
    event PledgeSettled(uint256 indexed pledgeId);
    event OffChainPaymentClaimed(uint256 indexed pledgeId, address indexed debtor);
    event OffChainConfirmed(uint256 indexed pledgeId, bool approved);
    event OffChainAutoCleared(uint256 indexed pledgeId);

    error NotDebtor();
    error NotLender();
    error InvalidStatus(Status expected, Status actual);
    error SelfPledge();
    error ZeroAmount();
    error AutoClearTooEarly();

    modifier onlyDebtor(uint256 pledgeId) {
        if (msg.sender != pledges[pledgeId].debtor) revert NotDebtor();
        _;
    }

    modifier onlyLender(uint256 pledgeId) {
        if (msg.sender != pledges[pledgeId].lender) revert NotLender();
        _;
    }

    modifier inStatus(uint256 pledgeId, Status expected) {
        Status actual = pledges[pledgeId].status;
        if (actual != expected) revert InvalidStatus(expected, actual);
        _;
    }

    function createPledge(
        address debtor,
        uint256 amount,
        uint256 dueTimestamp,
        Track track,
        bytes32 memoHash,
        string calldata currency
    ) external returns (uint256 pledgeId) {
        if (debtor == msg.sender) revert SelfPledge();
        if (amount == 0) revert ZeroAmount();

        pledgeId = nextPledgeId++;

        pledges[pledgeId] = Pledge({
            lender: msg.sender,
            debtor: debtor,
            amount: amount,
            currency: currency,
            dueTimestamp: dueTimestamp,
            track: track,
            status: Status.PendingCoSign,
            memoHash: memoHash,
            createdAt: block.timestamp,
            settledAt: 0,
            offChainClaimedAt: 0
        });

        emit PledgeCreated(pledgeId, msg.sender, debtor, amount, currency, track);
    }

    function coSignPledge(uint256 pledgeId)
        external
        onlyDebtor(pledgeId)
        inStatus(pledgeId, Status.PendingCoSign)
    {
        pledges[pledgeId].status = Status.Active;
        emit PledgeCoSigned(pledgeId, msg.sender);
    }

    function declinePledge(uint256 pledgeId)
        external
        onlyDebtor(pledgeId)
        inStatus(pledgeId, Status.PendingCoSign)
    {
        pledges[pledgeId].status = Status.Disputed;
        emit PledgeDeclined(pledgeId, msg.sender);
    }

    function settlePledge(uint256 pledgeId)
        external
        onlyDebtor(pledgeId)
        inStatus(pledgeId, Status.Active)
        nonReentrant
    {
        pledges[pledgeId].status = Status.Settled;
        pledges[pledgeId].settledAt = block.timestamp;
        emit PledgeSettled(pledgeId);
    }

    function claimOffChainPayment(uint256 pledgeId)
        external
        onlyDebtor(pledgeId)
        inStatus(pledgeId, Status.Active)
    {
        pledges[pledgeId].status = Status.OffChainPending;
        pledges[pledgeId].offChainClaimedAt = block.timestamp;
        emit OffChainPaymentClaimed(pledgeId, msg.sender);
    }

    function confirmOffChain(uint256 pledgeId, bool approved)
        external
        onlyLender(pledgeId)
        inStatus(pledgeId, Status.OffChainPending)
    {
        if (approved) {
            pledges[pledgeId].status = Status.Cleared;
            pledges[pledgeId].settledAt = block.timestamp;
        } else {
            pledges[pledgeId].status = Status.Disputed;
        }
        emit OffChainConfirmed(pledgeId, approved);
    }

    /**
     * @notice Auto-clear off-chain pledge after 14 days without lender response.
     *         Can be called by anyone (designed for cron worker).
     */
    function autoClearOffChain(uint256 pledgeId)
        external
        inStatus(pledgeId, Status.OffChainPending)
    {
        Pledge storage p = pledges[pledgeId];
        if (block.timestamp < p.offChainClaimedAt + OFFCHAIN_AUTO_CLEAR_PERIOD) {
            revert AutoClearTooEarly();
        }

        p.status = Status.Cleared;
        p.settledAt = block.timestamp;
        emit OffChainAutoCleared(pledgeId);
    }

    function getPledge(uint256 pledgeId) external view returns (Pledge memory) {
        return pledges[pledgeId];
    }
}

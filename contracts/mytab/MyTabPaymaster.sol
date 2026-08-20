// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title MyTabPaymaster
 * @notice Sponsors gas for MyTab smart account users (ERC-4337 Track 2).
 *
 *   This is a simplified paymaster stub. In production, integrate with
 *   a bundler-compatible paymaster (Pimlico / ZeroDev) that validates
 *   UserOperations and deducts micro-fees from stablecoin transfers.
 *
 *   The contract holds an ETH treasury that the operator tops up.
 *   Rate limits prevent abuse.
 */
contract MyTabPaymaster is Ownable {
    uint256 public maxSponsorPerTx;
    uint256 public dailyBudget;
    uint256 public spentToday;
    uint256 public lastResetDay;

    mapping(address => uint256) public userOpsToday;
    uint256 public maxOpsPerUserPerDay;

    event Sponsored(address indexed user, uint256 amount);
    event TreasuryDeposited(address indexed depositor, uint256 amount);
    event ConfigUpdated(uint256 maxSponsorPerTx, uint256 dailyBudget, uint256 maxOpsPerUser);

    error DailyBudgetExceeded();
    error UserRateLimitExceeded();
    error SponsorAmountTooHigh();
    error InsufficientTreasury();

    constructor(
        uint256 maxSponsorPerTx_,
        uint256 dailyBudget_,
        uint256 maxOpsPerUserPerDay_
    ) Ownable(msg.sender) {
        maxSponsorPerTx = maxSponsorPerTx_;
        dailyBudget = dailyBudget_;
        maxOpsPerUserPerDay = maxOpsPerUserPerDay_;
        lastResetDay = block.timestamp / 1 days;
    }

    receive() external payable {
        emit TreasuryDeposited(msg.sender, msg.value);
    }

    function sponsor(address user, uint256 gasAmount) external onlyOwner {
        _resetDayIfNeeded();

        if (gasAmount > maxSponsorPerTx) revert SponsorAmountTooHigh();
        if (spentToday + gasAmount > dailyBudget) revert DailyBudgetExceeded();
        if (userOpsToday[user] >= maxOpsPerUserPerDay) revert UserRateLimitExceeded();
        if (address(this).balance < gasAmount) revert InsufficientTreasury();

        spentToday += gasAmount;
        userOpsToday[user]++;

        emit Sponsored(user, gasAmount);
    }

    function updateConfig(
        uint256 maxSponsorPerTx_,
        uint256 dailyBudget_,
        uint256 maxOpsPerUserPerDay_
    ) external onlyOwner {
        maxSponsorPerTx = maxSponsorPerTx_;
        dailyBudget = dailyBudget_;
        maxOpsPerUserPerDay = maxOpsPerUserPerDay_;
        emit ConfigUpdated(maxSponsorPerTx_, dailyBudget_, maxOpsPerUserPerDay_);
    }

    function withdrawTreasury(address payable to, uint256 amount) external onlyOwner {
        (bool ok, ) = to.call{value: amount}("");
        require(ok, "withdraw failed");
    }

    function _resetDayIfNeeded() internal {
        uint256 today = block.timestamp / 1 days;
        if (today > lastResetDay) {
            spentToday = 0;
            lastResetDay = today;
        }
    }

    function treasuryBalance() external view returns (uint256) {
        return address(this).balance;
    }
}

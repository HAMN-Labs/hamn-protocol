// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "openzeppelin-contracts/contracts/access/Ownable.sol";
import "./PatternRegistry.sol";

/// @title RewardDistributor
/// @notice Distributes rewards to pattern creators based on usefulness × reuse_count.
/// @dev Receives protocol fees and distributes proportionally to pattern usage.
contract RewardDistributor is Ownable {
    PatternRegistry public registry;

    /// @notice Total rewards distributed per pattern.
    mapping(bytes32 => uint256) public totalRewardsDistributed;
    /// @notice Pending (claimable) rewards per pattern owner address.
    mapping(address => uint256) public pendingRewards;

    event RewardAccrued(bytes32 indexed patternId, address indexed owner, uint256 amount);
    event RewardClaimed(address indexed owner, uint256 amount);
    event FundsDeposited(address indexed depositor, uint256 amount);

    constructor(address _registry) Ownable(msg.sender) {
        registry = PatternRegistry(_registry);
    }

    /// @notice Deposit protocol fees into the reward pool.
    function deposit() external payable {
        require(msg.value > 0, "Must deposit > 0");
        emit FundsDeposited(msg.sender, msg.value);
    }

    /// @notice Calculate and accrue reward for a pattern.
    /// reward = baseReward × (usageCount / 100), capped at contract balance.
    /// @param _patternId The pattern to reward.
    /// @param _baseReward Base reward amount in wei.
    function accrueReward(bytes32 _patternId, uint256 _baseReward) external onlyOwner {
        require(registry.isRegistered(_patternId), "Pattern not found");

        (
            , // id
            address patternOwner,
            , // stake
            uint256 reputation,
            , // registrationTime
            uint256 usageCount
        ) = registry.patterns(_patternId);

        // reward ∝ usefulness (reputation) × reuse_count
        // Normalized: baseReward * (reputation / MAX_REPUTATION) * log2(1 + usageCount)
        uint256 useFactor = usageCount == 0 ? 0 : log2Approx(1 + usageCount);
        uint256 reward = (_baseReward * reputation * useFactor) / (registry.MAX_REPUTATION() * 10);

        if (reward > address(this).balance) {
            reward = address(this).balance;
        }

        if (reward > 0) {
            pendingRewards[patternOwner] += reward;
            totalRewardsDistributed[_patternId] += reward;
            emit RewardAccrued(_patternId, patternOwner, reward);
        }
    }

    /// @notice Claim all pending rewards.
    function claimRewards() external {
        uint256 amount = pendingRewards[msg.sender];
        require(amount > 0, "No rewards to claim");
        pendingRewards[msg.sender] = 0;
        payable(msg.sender).transfer(amount);
        emit RewardClaimed(msg.sender, amount);
    }

    /// @notice Approximate log2 for reward scaling. Returns log2(x) * 10.
    function log2Approx(uint256 x) internal pure returns (uint256) {
        uint256 result = 0;
        while (x > 1) {
            x >>= 1;
            result += 10;
        }
        return result;
    }

    receive() external payable {}
}

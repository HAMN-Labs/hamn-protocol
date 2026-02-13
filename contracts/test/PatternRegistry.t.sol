// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/PatternRegistry.sol";
import "../src/RewardDistributor.sol";

contract PatternRegistryTest is Test {
    PatternRegistry public registry;
    address public user1;
    address public user2;
    bytes32 public patternId;

    function setUp() public {
        registry = new PatternRegistry();
        user1 = makeAddr("user1");
        user2 = makeAddr("user2");
        patternId = keccak256("pattern1");
    }

    // ─── Registration ───────────────────────────────────────────

    function test_RegisterPattern() public {
        vm.startPrank(user1);
        vm.deal(user1, 1 ether);
        registry.registerPattern{value: 0.01 ether}(patternId);

        (bytes32 id, address pOwner, uint256 pStake, uint256 rep, , ) = registry.patterns(patternId);
        assertEq(id, patternId);
        assertEq(pOwner, user1);
        assertEq(pStake, 0.01 ether);
        assertEq(rep, 5000);
        assertTrue(registry.isRegistered(patternId));
        vm.stopPrank();
    }

    function test_RevertOnDuplicateRegistration() public {
        vm.startPrank(user1);
        vm.deal(user1, 1 ether);
        registry.registerPattern{value: 0.01 ether}(patternId);

        vm.expectRevert("Pattern already registered");
        registry.registerPattern{value: 0.01 ether}(patternId);
        vm.stopPrank();
    }

    function test_RevertOnInsufficientStake() public {
        vm.startPrank(user1);
        vm.deal(user1, 1 ether);
        vm.expectRevert("Insufficient stake");
        registry.registerPattern{value: 0.001 ether}(patternId);
        vm.stopPrank();
    }

    // ─── Usage & Reputation ─────────────────────────────────────

    function test_RecordUsageIncrementsCountAndReputation() public {
        _registerAs(user1, patternId, 0.01 ether);

        vm.prank(user2);
        registry.recordUsage(patternId);

        (, , , uint256 rep, , uint256 usage) = registry.patterns(patternId);
        assertEq(usage, 1);
        assertEq(rep, 5001);
    }

    function test_RevertUsageOnNonExistentPattern() public {
        vm.expectRevert("Pattern not found");
        registry.recordUsage(keccak256("nonexistent"));
    }

    // ─── Slashing ───────────────────────────────────────────────

    function test_SlashReducesStakeAndReputation() public {
        _registerAs(user1, patternId, 0.1 ether);

        uint256 ownerBalBefore = address(this).balance;
        registry.slashStake(patternId, 0.05 ether, "malicious data");

        (, , uint256 stake, uint256 rep, , ) = registry.patterns(patternId);
        assertEq(stake, 0.05 ether);
        assertEq(rep, 4000); // 5000 - 1000
        assertEq(address(this).balance, ownerBalBefore + 0.05 ether);
    }

    function test_SlashCapsReputationAtZero() public {
        _registerAs(user1, patternId, 1 ether);

        // Slash 6 times to drain reputation below 0
        for (uint256 i = 0; i < 6; i++) {
            registry.slashStake(patternId, 0.01 ether, "bad");
        }

        (, , , uint256 rep, , ) = registry.patterns(patternId);
        assertEq(rep, 0);
    }

    function test_OnlyOwnerCanSlash() public {
        _registerAs(user1, patternId, 0.1 ether);

        vm.prank(user2);
        vm.expectRevert();
        registry.slashStake(patternId, 0.01 ether, "unauthorized");
    }

    // ─── Config ─────────────────────────────────────────────────

    function test_SetMinStake() public {
        registry.setMinStake(0.1 ether);
        assertEq(registry.minStake(), 0.1 ether);
    }

    // ─── Helpers ────────────────────────────────────────────────

    function _registerAs(address who, bytes32 id, uint256 stake) internal {
        vm.startPrank(who);
        vm.deal(who, stake + 1 ether);
        registry.registerPattern{value: stake}(id);
        vm.stopPrank();
    }

    receive() external payable {}
}

contract RewardDistributorTest is Test {
    PatternRegistry public registry;
    RewardDistributor public distributor;
    address public user1;
    bytes32 public patternId;

    function setUp() public {
        registry = new PatternRegistry();
        distributor = new RewardDistributor(address(registry));
        user1 = makeAddr("user1");
        patternId = keccak256("pattern1");

        // Setup: register a pattern and record usage
        vm.startPrank(user1);
        vm.deal(user1, 1 ether);
        registry.registerPattern{value: 0.05 ether}(patternId);
        vm.stopPrank();

        // Record some uses to build reputation
        for (uint256 i = 0; i < 10; i++) {
            registry.recordUsage(patternId);
        }
    }

    function test_DepositFunds() public {
        vm.deal(address(this), 10 ether);
        distributor.deposit{value: 1 ether}();
        assertEq(address(distributor).balance, 1 ether);
    }

    function test_AccrueAndClaimReward() public {
        // Fund the distributor
        vm.deal(address(this), 10 ether);
        distributor.deposit{value: 5 ether}();

        // Accrue reward
        distributor.accrueReward(patternId, 1 ether);

        uint256 pending = distributor.pendingRewards(user1);
        assertTrue(pending > 0, "Should have pending rewards");

        // Claim
        uint256 balBefore = user1.balance;
        vm.prank(user1);
        distributor.claimRewards();

        assertEq(distributor.pendingRewards(user1), 0);
        assertEq(user1.balance, balBefore + pending);
    }

    function test_RevertClaimWithNoRewards() public {
        vm.prank(makeAddr("nobody"));
        vm.expectRevert("No rewards to claim");
        distributor.claimRewards();
    }

    receive() external payable {}
}

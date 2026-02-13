// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "openzeppelin-contracts/contracts/access/Ownable.sol";

contract PatternRegistry is Ownable {
    struct Pattern {
        bytes32 id;
        address owner;
        uint256 stake;
        uint256 reputation; // 0 to 10000 (representing 0.00% to 100.00%)
        uint256 registrationTime;
        uint256 usageCount;
    }

    mapping(bytes32 => Pattern) public patterns;
    mapping(bytes32 => bool) public isRegistered;
    
    uint256 public minStake = 0.01 ether;
    uint256 public constant MAX_REPUTATION = 10000;

    event PatternRegistered(bytes32 indexed id, address indexed owner, uint256 stake);
    event PatternUsed(bytes32 indexed id, address indexed user);
    event StakeSlashed(bytes32 indexed id, uint256 amount, string reason);
    event ReputationUpdated(bytes32 indexed id, uint256 newReputation);

    constructor() Ownable(msg.sender) {}

    function registerPattern(bytes32 _id) external payable {
        require(!isRegistered[_id], "Pattern already registered");
        require(msg.value >= minStake, "Insufficient stake");

        patterns[_id] = Pattern({
            id: _id,
            owner: msg.sender,
            stake: msg.value,
            reputation: 5000, // Start with 50% reputation
            registrationTime: block.timestamp,
            usageCount: 0
        });

        isRegistered[_id] = true;
        emit PatternRegistered(_id, msg.sender, msg.value);
    }

    function recordUsage(bytes32 _id) external {
        require(isRegistered[_id], "Pattern not found");
        patterns[_id].usageCount++;
        
        // Simple reputation increase logic on usage (can be more complex)
        if (patterns[_id].reputation < MAX_REPUTATION) {
            patterns[_id].reputation += 1;
            emit ReputationUpdated(_id, patterns[_id].reputation);
        }
        
        emit PatternUsed(_id, msg.sender);
    }

    function slashStake(bytes32 _id, uint256 _amount, string memory _reason) external onlyOwner {
        require(isRegistered[_id], "Pattern not found");
        require(patterns[_id].stake >= _amount, "Stake too low to slash");

        patterns[_id].stake -= _amount;
        // Decrease reputation significantly
        if (patterns[_id].reputation > 1000) {
            patterns[_id].reputation -= 1000;
        } else {
            patterns[_id].reputation = 0;
        }

        emit StakeSlashed(_id, _amount, _reason);
        emit ReputationUpdated(_id, patterns[_id].reputation);
        
        // Transfer slashed funds to owner (protocol treasury)
        payable(owner()).transfer(_amount);
    }

    function getPattern(bytes32 _id) external view returns (Pattern memory) {
        require(isRegistered[_id], "Pattern not found");
        return patterns[_id];
    }
    
    function setMinStake(uint256 _newMinStake) external onlyOwner {
        minStake = _newMinStake;
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {PatternRegistry} from "../src/PatternRegistry.sol";
import {RewardDistributor} from "../src/RewardDistributor.sol";

contract DeployScript is Script {
    function setUp() public {}

    function run() public {
        vm.startBroadcast();

        PatternRegistry registry = new PatternRegistry();
        console.log("PatternRegistry deployed at:", address(registry));

        RewardDistributor distributor = new RewardDistributor(address(registry));
        console.log("RewardDistributor deployed at:", address(distributor));

        vm.stopBroadcast();
    }
}

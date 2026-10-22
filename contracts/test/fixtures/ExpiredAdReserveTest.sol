// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {OnholdGameplayVault} from "contracts/OnholdGameplayVault.sol";

// Isolated acceptance fixture; never upgrade an active vault to this implementation.
contract ExpiredAdReserveTest is OnholdGameplayVault {
    constructor() { require(block.chainid == 97 || block.chainid == 31337, "Testnet only"); }
    function expireForTest() external onlyOwner {
        require(miningStartedAt == 0 && totalStakedWeight == 0, "Empty test vault required");
        miningStartedAt = block.timestamp - rewardsDuration;
    }
}

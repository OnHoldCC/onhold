// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {OnholdMarket} from "./OnholdMarket.sol";

contract ClaudeTestToken is ERC20, ERC20Burnable {
    uint256 public totalBurned;
    function _update(address from, address to, uint256 value) internal override {
        super._update(from, to, value);
        if (to == address(0)) totalBurned += value;
    }
    constructor(address recipient) ERC20("OnHold Test Token", "OnHold") {
        require(block.chainid == 97 || block.chainid == 31337, "Testnet only");
        _mint(recipient, 100_000_000 ether);
    }
}
// One wallet transaction deploys both contracts and funds a test-only 100 million token mining pool.
contract TestDeployment {
    ClaudeTestToken public immutable token;
    OnholdMarket public immutable market;
    constructor() {
        require(block.chainid == 97 || block.chainid == 31337, "Testnet only");
        token = new ClaudeTestToken(address(this));
        market = new OnholdMarket(msg.sender, IERC20(address(token)), msg.sender);
        token.transfer(address(market), token.totalSupply());
    }
}

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;
import {OnholdGameplayVault} from "../../OnholdGameplayVault.sol";
import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract MockGameplayVault is OnholdGameplayVault {
    /// @custom:oz-upgrades-unsafe-allow state-variable-immutable
    address public immutable mockPortal;
    bool public constant MOCK_ONLY = true;
    event MockConfiguration(uint256 minimumBid, address portal);
    event AdPriceIntervalConfigured(uint256 secondsPerPeriod);
    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor(address portal) { require(block.chainid == 97 || block.chainid == 31337, "Testnet only"); mockPortal = portal; }
    function adBuybackPortal() public view override returns(address) { return mockPortal; }
    function minimumAdBid() public pure override returns(uint256) { return 0.00001 ether; }
    function MIN_AD_BUYBACK() public pure override returns(uint256) { return 0.0001 ether; }
    function adPriceInterval() public pure override returns(uint256) { return 60; }
    function configureMockEvents() external onlyOwner {
        emit MockConfiguration(minimumAdBid(), mockPortal);
        emit AdPriceIntervalConfigured(adPriceInterval());
    }
}
contract GameplayVaultV2Test is MockGameplayVault {
    uint256 public gameplayFlag;
    constructor(address portal) MockGameplayVault(portal) {}
    function setGameplayFlag(uint256 value) external onlyOwner { gameplayFlag=value; }
}
contract SixDecimalTestToken is ERC20 {
    constructor() ERC20("Six decimals", "SIX") {}
    function decimals() public pure override returns(uint8) { return 6; }
}

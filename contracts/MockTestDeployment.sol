// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ClaudeTestToken} from "./TestDeployment.sol";
import {OnholdMarket} from "./OnholdMarket.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {IFlapSwap} from "./FlapBuyback.sol";

contract MockClaudeToken is ClaudeTestToken {
    address public immutable mockPortal;
    constructor(address recipient, address portal) ClaudeTestToken(recipient) { mockPortal = portal; }
    function mintForSwap(address recipient, uint256 amount) external {
        require(msg.sender == mockPortal, "Mock portal only");
        _mint(recipient, amount);
    }
}

contract MockSwapPortal {
    bool public constant MOCK_ONLY = true;
    uint256 public constant TOKENS_PER_BNB = 1_000_000;
    address private immutable initializer = msg.sender;
    MockClaudeToken public token;
    struct Quote { address inputToken; address outputToken; uint256 inputAmount; }
    event MockSwap(address indexed buyer, uint256 input, uint256 output, uint256 refund);
    constructor() { require(block.chainid == 97 || block.chainid == 31337, "Testnet only"); }
    function initialize(MockClaudeToken value) external {
        require(msg.sender == initializer && address(token) == address(0), "Already initialized");
        token = value;
    }
    function quoteExactInput(Quote calldata params) external view returns (uint256) {
        require(params.inputToken == address(0) && params.outputToken == address(token), "Invalid pair");
        return params.inputAmount * TOKENS_PER_BNB;
    }
    function swapExactInput(IFlapSwap.ExactInputParams calldata params) external payable returns (uint256 output) {
        require(params.inputToken == address(0) && params.outputToken == address(token) && msg.value > 0 && msg.value == params.inputAmount, "Invalid pair or input");
        output = msg.value * TOKENS_PER_BNB;
        require(output >= params.minOutputAmount, "Slippage");
        token.mintForSwap(msg.sender, output);
        // Mock execution refunds 99% to conserve scarce test BNB; it is not market pricing.
        uint256 refund = msg.value * 99 / 100;
        (bool sent,) = payable(msg.sender).call{value: refund}("");
        require(sent, "Mock refund failed");
        emit MockSwap(msg.sender, msg.value, output, refund);
    }
}

contract MockOnholdMarket is OnholdMarket {
    bool public constant MOCK_ONLY = true;
    address public immutable mockPortal;
    event MockConfiguration(uint256 minimumBid, address portal);
    event AdPriceIntervalConfigured(uint256 secondsPerPeriod);
    constructor(address initialOwner, IERC20 token, address initialVerifier, address portal)
        OnholdMarket(initialOwner, token, initialVerifier) {
        require(block.chainid == 97 || block.chainid == 31337, "Testnet only");
        mockPortal = portal;
        emit MockConfiguration(minimumAdBid(), portal);
        emit AdPriceIntervalConfigured(adPriceInterval());
    }
    function adBuybackPortal() public view override returns (address) { return mockPortal; }
    function minimumAdBid() public pure override returns (uint256) { return 0.00001 ether; }
    function MIN_AD_BUYBACK() public pure override returns (uint256) { return 0.0001 ether; }
    function adPriceInterval() public pure override returns (uint256) { return 60 seconds; }
}

contract MockTestDeployment {
    MockClaudeToken public immutable token;
    MockOnholdMarket public immutable market;
    MockSwapPortal public immutable portal;
    constructor() {
        require(block.chainid == 97 || block.chainid == 31337, "Testnet only");
        portal = new MockSwapPortal();
        token = new MockClaudeToken(address(this), address(portal));
        portal.initialize(token);
        market = new MockOnholdMarket(msg.sender, IERC20(address(token)), msg.sender, address(portal));
        token.transfer(address(market), token.totalSupply());
    }
}

// Separate deployment: signed attempt IDs permit repeated real UUIDs only on test chains.
contract RepeatUuidMockMarket is MockOnholdMarket {
    bool public constant UUID_UNIQUENESS_DISABLED = true;
    constructor(address initialOwner, IERC20 token, address initialVerifier, address portal)
        MockOnholdMarket(initialOwner, token, initialVerifier, portal) {}
    function _validateRecordNullifier(bytes32, string calldata) internal pure override {}
}

contract RepeatUuidMockTestDeployment {
    MockClaudeToken public immutable token;
    RepeatUuidMockMarket public immutable market;
    MockSwapPortal public immutable portal;
    constructor() {
        require(block.chainid == 97 || block.chainid == 31337, "Testnet only");
        portal = new MockSwapPortal();
        token = new MockClaudeToken(address(this), address(portal));
        portal.initialize(token);
        market = new RepeatUuidMockMarket(msg.sender, IERC20(address(token)), msg.sender, address(portal));
        token.transfer(address(market), token.totalSupply());
    }
}

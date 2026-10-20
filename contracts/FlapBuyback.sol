// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {VaultBaseV3} from "./flap/VaultBaseV3.sol";
import {VaultUISchema, VaultMethodSchema, FieldDescriptor, VaultDataSchema} from "./flap/IVaultSchemasV1.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

// ABI subset of Flap's pinned IPortalTradeV2; see flap/SOURCE.md.
interface IFlapSwap {
    struct ExactInputParams { address inputToken; address outputToken; uint256 inputAmount; uint256 minOutputAmount; bytes permitData; }
    function swapExactInput(ExactInputParams calldata params) external payable returns (uint256);
}
interface IFlapFeeToken { function taxProcessor() external view returns (address); }
interface IFlapFeeProcessor {
    function taxToken() external view returns (address);
    function marketAddress() external view returns (address);
    function dispatch() external;
}

contract FlapBuyback is VaultBaseV3, ReentrancyGuard {
    using SafeERC20 for IERC20;
    IERC20 public immutable taxToken;
    address public immutable keeper;
    address public constant BURN_SINK = 0x000000000000000000000000000000000000dEaD;
    uint256 public constant INTERVAL = 3 minutes;
    uint256 public constant MAX_KEEPER_GAS_REFUND = 0.0001 ether;
    uint256 public immutable MIN_BUYBACK_BALANCE;
    uint256 public accountedQuote;
    uint256 public totalReceived;
    uint256 public totalSpent;
    uint256 public totalBurned;
    uint256 public totalGasRefunded;
    uint256 public lastExecution;
    bool private swapping;
    event RevenueReceived(uint256 amount);
    event BuybackBurned(uint256 spent, uint256 burned);
    event KeeperGasRefunded(address indexed keeper, uint256 amount);

    constructor(address token, address executor) {
        require(block.chainid == 56 || block.chainid == 97 || block.chainid == 31337, "Unsupported chain");
        require(token != address(0) && executor != address(0), "Invalid setup");
        // Flap creates the vault before deploying its predicted token address.
        taxToken = IERC20(token);
        keeper = executor;
        MIN_BUYBACK_BALANCE = block.chainid == 56 ? 0.01 ether : 0.001 ether;
        lastExecution = block.timestamp;
    }
    receive() external payable { if (!swapping) _syncRevenue(); }
    function _syncRevenue() private {
        uint256 balance = address(this).balance;
        if (balance <= accountedQuote) return;
        uint256 received = balance - accountedQuote;
        accountedQuote = balance;
        totalReceived += received;
        emit RevenueReceived(received);
    }
    function vaultQuoteToken() public pure override returns (address) { return address(0); }
    function portal() external view returns (address) { return _getPortal(); }
    function execute(uint256 amount, uint256 minOutput, uint256 deadline) external nonReentrant {
        _execute(amount, minOutput, deadline, gasleft());
    }
    function settleAndExecute(uint256 amount, uint256 minOutput, uint256 deadline) external nonReentrant {
        uint256 gasAtStart = gasleft();
        require(msg.sender == keeper || msg.sender == _getGuardian(), "Keeper required");
        require(block.timestamp >= lastExecution + INTERVAL, "Too early");
        IFlapFeeProcessor processor = IFlapFeeProcessor(IFlapFeeToken(address(taxToken)).taxProcessor());
        require(processor.taxToken() == address(taxToken) && processor.marketAddress() == address(this), "Invalid fee recipient");
        processor.dispatch();
        _execute(amount, minOutput, deadline, gasAtStart);
    }
    function _execute(uint256 amount, uint256 minOutput, uint256 deadline, uint256 gasAtStart) private {
        require(msg.sender == keeper || msg.sender == _getGuardian(), "Keeper required");
        require(block.timestamp >= lastExecution + INTERVAL, "Too early");
        require(deadline >= block.timestamp && deadline <= block.timestamp + 2 minutes, "Invalid deadline");
        _syncRevenue();
        require(accountedQuote >= MIN_BUYBACK_BALANCE, "Below buyback minimum");
        require(amount >= MIN_BUYBACK_BALANCE - MAX_KEEPER_GAS_REFUND && amount <= accountedQuote - MAX_KEEPER_GAS_REFUND && minOutput > 0, "Invalid amount");
        uint256 nativeBefore = address(this).balance;
        uint256 beforeBalance = taxToken.balanceOf(address(this));
        uint256 beforeBurn = taxToken.balanceOf(BURN_SINK);
        accountedQuote -= amount;
        lastExecution = block.timestamp;
        swapping = true;
        IFlapSwap(_getPortal()).swapExactInput{value: amount}(IFlapSwap.ExactInputParams(address(0), address(taxToken), amount, minOutput, ""));
        uint256 bought = taxToken.balanceOf(address(this)) - beforeBalance;
        require(bought >= minOutput, "Insufficient output");
        taxToken.safeTransfer(BURN_SINK, bought);
        uint256 burned = taxToken.balanceOf(BURN_SINK) - beforeBurn;
        require(burned >= minOutput, "Insufficient burn");
        // Refunds and own-trade fee rebates reduce spend; they are not new creator revenue.
        uint256 spent = nativeBefore - address(this).balance;
        totalSpent += spent;
        totalBurned += burned;
        emit BuybackBurned(spent, burned);
        if (msg.sender == keeper) {
            // Measures execution gas, including dispatch; excludes intrinsic and refund-transfer gas.
            uint256 refund = (gasAtStart - gasleft()) * tx.gasprice;
            if (refund > MAX_KEEPER_GAS_REFUND) refund = MAX_KEEPER_GAS_REFUND;
            totalGasRefunded += refund;
            (bool ok,) = payable(keeper).call{value: refund}("");
            require(ok, "Gas refund failed");
            emit KeeperGasRefunded(keeper, refund);
        }
        accountedQuote = address(this).balance;
        swapping = false;
    }
    function description() public view override returns (string memory) {
        return string.concat("ONHOLD: native creator fees, less capped execution gas compensation, buy back $Claude to 0xdead every 180 seconds when funded. Burned base units: ", Strings.toString(totalBurned));
    }
    function vaultUISchema() public pure override returns (VaultUISchema memory schema) {
        schema.vaultType = "ONHOLD Buyback";
        schema.description = "BNB creator fees; minimum balance; capped keeper gas compensation after successful burn.";
        schema.methods = new VaultMethodSchema[](9);
        string[7] memory views = ["totalReceived", "totalSpent", "totalBurned", "accountedQuote", "totalGasRefunded", "MIN_BUYBACK_BALANCE", "MAX_KEEPER_GAS_REFUND"];
        for (uint256 i; i < 7; i++) {
            schema.methods[i].name = views[i];
            schema.methods[i].outputs = new FieldDescriptor[](1);
            schema.methods[i].outputs[0] = FieldDescriptor("amount", "uint256", views[i], 18);
        }
        for (uint256 i = 7; i < 9; i++) {
            schema.methods[i].name = i == 7 ? "execute" : "settleAndExecute";
            schema.methods[i].description = "Keeper or Guardian only. Spend balance less the fixed gas reserve; positive minimum output and short deadline required.";
            schema.methods[i].isWriteMethod = true;
            schema.methods[i].inputs = new FieldDescriptor[](3);
            schema.methods[i].inputs[0] = FieldDescriptor("amount", "uint256", "BNB to spend", 18);
            schema.methods[i].inputs[1] = FieldDescriptor("minOutput", "uint256", "Minimum $Claude burned", 18);
            schema.methods[i].inputs[2] = FieldDescriptor("deadline", "time", "Transaction expiry", 0);
        }
    }
}

// Implements Flap factory spec v2.2; computed dividend tokens are unused.
contract FlapBuybackFactory {
    struct LaunchValidation { uint8 tokenVersion; address quoteToken; uint16 buyTaxRate; uint16 sellTaxRate; uint16 vaultBps; uint16 deflationBps; uint16 dividendBps; uint16 lpBps; address dividendToken; uint256 minimumShareBalance; }
    address public immutable keeper;
    address public immutable vaultPortal;
    constructor(address executor) {
        require(block.chainid == 56 || block.chainid == 97 || block.chainid == 31337, "Unsupported chain");
        require(executor != address(0), "Invalid keeper");
        keeper = executor;
        // Official BNB deployments; local tests use the testnet VaultPortal identity.
        vaultPortal = block.chainid == 56 ? 0x90497450f2a706f1951b5bdda52B4E5d16f34C06 : 0x027e3704fC5C16522e9393d04C60A3ac5c0d775f;
    }
    function newVault(address token, address quoteToken, address, bytes calldata data) external returns (address) {
        require(msg.sender == vaultPortal, "VaultPortal required");
        require(quoteToken == address(0) && data.length == 0, "Native fees only");
        return address(new FlapBuyback(token, keeper));
    }
    function isQuoteTokenSupported(address quote) external pure returns (bool) { return quote == address(0); }
    function factorySpecVersion() external pure returns (string memory) { return "v2.2"; }
    function vaultDataSchema() external pure returns (VaultDataSchema memory schema) {
        schema.description = "Buy 3%, sell 3%, 100% to the native BNB buyback vault; no custom parameters.";
        schema.fields = new FieldDescriptor[](0);
    }
    function onBeforeLaunch(bytes calldata validationData) external pure returns (bool, string memory) {
        LaunchValidation memory data = abi.decode(validationData, (LaunchValidation));
        bool valid = data.quoteToken == address(0) && data.buyTaxRate == 300 && data.sellTaxRate == 300 && data.vaultBps == 10000 && data.deflationBps == 0 && data.dividendBps == 0 && data.lpBps == 0;
        return (valid, valid ? "" : "Requires native BNB, 3% buy/sell tax and 100% vault allocation");
    }
}

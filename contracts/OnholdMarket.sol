// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract OnholdMarket is Ownable, ReentrancyGuard, EIP712 {
    using SafeERC20 for IERC20;
    struct Ad {
        address advertiser;
        uint256 initialBid;
        uint256 startedAt;
        uint256 version;
        string title;
        string url;
        string description;
    }
    Ad[6] public ads;
    IERC20 public immutable claude;
    address public verifier;
    uint256 public totalAdRevenue;
    uint256 public totalClaimed;
    uint256 public totalClaims;
    uint256 public totalRecipients;
    mapping(address => bool) public hasReceived;
    mapping(bytes32 => bool) public claimed;
    bytes32 private constant CLAIM_TYPEHASH = keccak256("Claim(address recipient,bytes32 nullifier,uint256 amount,uint256 deadline)");
    event BidPlaced(uint8 indexed slot, address indexed advertiser, uint256 amount, uint256 version);
    event Claimed(address indexed recipient, bytes32 indexed nullifier, uint256 amount);
    event VerifierChanged(address indexed verifier);
    event RevenueWithdrawn(address indexed recipient, uint256 amount);

    constructor(address initialOwner, IERC20 token, address initialVerifier)
        Ownable(initialOwner) EIP712("ONHOLD", "1")
    {
        require(address(token).code.length > 0 && initialVerifier != address(0), "Invalid setup");
        claude = token;
        verifier = initialVerifier;
    }
    function currentPrice(uint8 slot) public view returns (uint256) {
        require(slot < 6, "Invalid slot");
        Ad storage ad = ads[slot];
        if (ad.initialBid == 0) return 0;
        uint256 daysElapsed = (block.timestamp - ad.startedAt) / 1 days;
        uint256 price = daysElapsed >= 256 ? 0 : ad.initialBid >> daysElapsed;
        return price == 0 ? 1 : price;
    }
    function bid(uint8 slot, uint256 expectedVersion, string calldata title, string calldata url, string calldata description) external payable nonReentrant {
        require(slot < 6, "Invalid slot");
        require(ads[slot].version == expectedVersion, "Listing changed");
        require(msg.value > currentPrice(slot), "Bid too low");
        require(bytes(title).length > 0 && bytes(title).length <= 96, "Invalid title");
        require(bytes(description).length > 0 && bytes(description).length <= 240, "Invalid description");
        bytes memory link = bytes(url);
        require(link.length > 8 && link.length <= 300 && bytes8(link) == bytes8("https://"), "HTTPS required");
        uint256 version = expectedVersion + 1;
        ads[slot] = Ad(msg.sender, msg.value, block.timestamp, version, title, url, description);
        totalAdRevenue += msg.value;
        emit BidPlaced(slot, msg.sender, msg.value, version);
    }
    function claim(address recipient, bytes32 nullifier, uint256 amount, uint256 deadline, bytes calldata signature) external nonReentrant {
        require(recipient == msg.sender && recipient != address(0), "Wrong recipient");
        require(nullifier != bytes32(0) && !claimed[nullifier], "Already claimed");
        require(amount > 0 && block.timestamp <= deadline, "Invalid claim");
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(CLAIM_TYPEHASH, recipient, nullifier, amount, deadline)));
        require(ECDSA.recover(digest, signature) == verifier, "Invalid proof");
        claimed[nullifier] = true;
        totalClaimed += amount;
        totalClaims += 1;
        if (!hasReceived[recipient]) {
            hasReceived[recipient] = true;
            totalRecipients += 1;
        }
        claude.safeTransfer(recipient, amount);
        emit Claimed(recipient, nullifier, amount);
    }
    function setVerifier(address newVerifier) external onlyOwner {
        require(newVerifier != address(0), "Invalid verifier");
        verifier = newVerifier;
        emit VerifierChanged(newVerifier);
    }
    function withdrawRevenue(address payable recipient, uint256 amount) external onlyOwner nonReentrant {
        require(recipient != address(0) && amount > 0, "Invalid withdrawal");
        (bool success,) = recipient.call{value: amount}("");
        require(success, "Transfer failed");
        emit RevenueWithdrawn(recipient, amount);
    }
}

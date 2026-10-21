// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {BanPassRenderer} from "./BanPassRenderer.sol";

// Permanent identity asset. No reward token, pool, upgrade or gameplay dependency.
contract OnholdNFT is ERC721, Ownable, EIP712, ReentrancyGuard {
    bytes32 public constant PROTOCOL_ID = keccak256("onhold.nft.v1");
    bytes32 private constant MINT_TYPEHASH = keccak256("MintPass(address recipient,bytes32 nullifier,uint8 tier,address referrer,uint256 deadline,bytes32 recordHash)");
    struct AccountRecord { string account; string uuid; string bannedAt; string plan; }
    mapping(uint256 => AccountRecord) public records;
    BanPassRenderer public immutable renderer;
    address public verifier;
    uint256 public totalMinted;
    mapping(bytes32 => bool) public claimed;
    mapping(address => bool) public hasMinted;
    mapping(uint256 => uint8) public passTier;
    mapping(uint256 => address) public mintedFor;
    mapping(uint256 => address) public passReferrer;
    mapping(address => bool) public referralBound;
    mapping(address => address) public referrerOf;
    event PassMinted(address indexed recipient, bytes32 indexed nullifier, uint256 indexed tokenId, uint8 tier, uint256 weight, address referrer);
    event PassRecorded(uint256 indexed tokenId, string account, string uuid, string bannedAt, string plan);
    event ReferralBound(address indexed invitee, address indexed referrer);
    event VerifierChanged(address indexed verifier);

    constructor(address initialOwner, address initialVerifier)
        ERC721("Claude Code Ban Pass", "CCBP") Ownable(initialOwner) EIP712("ONHOLD", "5") {
        require(initialVerifier != address(0), "Invalid verifier");
        renderer = new BanPassRenderer();
        verifier = initialVerifier;
    }

    function mintPass(address recipient, bytes32 nullifier, uint8 tier, address referrer, uint256 deadline, AccountRecord calldata record, bytes calldata signature) external nonReentrant {
        require(recipient == msg.sender && recipient != address(0), "Wrong recipient");
        require(nullifier != bytes32(0) && !claimed[nullifier], "Account already minted");
        require(tier <= 2, "Invalid tier");
        require(block.timestamp <= deadline, "Mint proof expired");
        require(referrer != recipient, "Self referral");
        require(bytes(record.account).length <= 640 && bytes(record.uuid).length == 36 && bytes(record.bannedAt).length > 0 && bytes(record.bannedAt).length <= 64 && bytes(record.plan).length <= 80, "Invalid record");
        _validateRecordNullifier(nullifier, record.uuid);
        bytes32 recordHash = keccak256(abi.encode(keccak256(bytes(record.account)), keccak256(bytes(record.uuid)), keccak256(bytes(record.bannedAt)), keccak256(bytes(record.plan))));
        bytes32 digest = _hashTypedDataV4(keccak256(abi.encode(MINT_TYPEHASH, recipient, nullifier, tier, referrer, deadline, recordHash)));
        require(ECDSA.recover(digest, signature) == verifier, "Invalid proof");
        _bindReferrer(recipient, referrer);
        claimed[nullifier] = true;
        hasMinted[recipient] = true;
        uint256 tokenId = ++totalMinted;
        passTier[tokenId] = tier;
        mintedFor[tokenId] = recipient;
        passReferrer[tokenId] = referrer;
        records[tokenId] = record;
        _safeMint(recipient, tokenId);
        emit PassMinted(recipient, nullifier, tokenId, tier, passWeight(tokenId), referrer);
        emit PassRecorded(tokenId, record.account, record.uuid, record.bannedAt, record.plan);
    }

    function _validateRecordNullifier(bytes32 nullifier, string calldata uuid) internal pure virtual {
        require(keccak256(bytes(string.concat("ONHOLD:restricted-consumer-org:v1:", uuid))) == nullifier, "Record UUID mismatch");
    }

    function passWeight(uint256 tokenId) public view returns (uint256) {
        _requireOwned(tokenId);
        return passTier[tokenId] == 1 ? 1 : passTier[tokenId] == 2 ? 3 : 0;
    }

    function bindReferrer(address referrer) external {
        require(referrer != msg.sender, "Self referral");
        _bindReferrer(msg.sender, referrer);
    }

    function _bindReferrer(address account, address referrer) private {
        if (referralBound[account]) {
            require(referrerOf[account] == referrer, "Referrer already bound");
        } else {
            referralBound[account] = true;
            referrerOf[account] = referrer;
            emit ReferralBound(account, referrer);
        }
    }

    function previewPass(uint8 tier, AccountRecord calldata record) external view returns (string memory) {
        require(tier <= 2, "Invalid tier");
        require(bytes(record.account).length <= 640 && bytes(record.uuid).length == 36 && bytes(record.bannedAt).length <= 64 && bytes(record.plan).length <= 80, "Invalid record");
        return renderer.tokenURI(0, tier, record.account, record.uuid, record.bannedAt, record.plan);
    }

    function tokenURI(uint256 tokenId) public view override returns (string memory) {
        _requireOwned(tokenId);
        AccountRecord storage record = records[tokenId];
        return renderer.tokenURI(tokenId, passTier[tokenId], record.account, record.uuid, record.bannedAt, record.plan);
    }

    function setVerifier(address newVerifier) external onlyOwner {
        require(newVerifier != address(0), "Invalid verifier");
        verifier = newVerifier;
        emit VerifierChanged(newVerifier);
    }
}

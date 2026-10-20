// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {ERC721Utils} from "@openzeppelin/contracts/token/ERC721/utils/ERC721Utils.sol";
import {ERC721Enumerable} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Enumerable.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {StakingRewards} from "./staking/StakingRewards.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {EIP712} from "@openzeppelin/contracts/utils/cryptography/EIP712.sol";
import {ECDSA} from "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {BanPassRenderer} from "./BanPassRenderer.sol";

contract OnholdPassMining is ERC721Enumerable, Ownable, StakingRewards, EIP712 {
    using EnumerableSet for EnumerableSet.UintSet;
    using SafeERC20 for IERC20;

    bytes32 public constant PROTOCOL_ID = keccak256("onhold.nft-staking.v4");
    bytes32 private constant MINT_TYPEHASH = keccak256("MintPass(address recipient,bytes32 nullifier,uint8 tier,address referrer,uint256 deadline,bytes32 recordHash)");
    struct AccountRecord { string account; string uuid; string bannedAt; string plan; }
    mapping(uint256 => AccountRecord) public records;
    BanPassRenderer public immutable renderer;
    IERC20 public immutable claude;
    address public verifier;
    uint256 public totalMinted;
    mapping(bytes32 => bool) public claimed;
    mapping(address => bool) public hasMinted;
    mapping(uint256 => uint8) public passTier;
    mapping(uint256 => address) public mintedFor;
    mapping(uint256 => address) public passReferrer;
    mapping(address => bool) public referralBound;
    mapping(address => address) public referrerOf;
    mapping(address => uint256) public referralRewards;
    mapping(address => uint256) public referralEarned;
    mapping(address => uint256) private referralRemainder;
    uint256 public totalReferralAccrued;
    mapping(uint256 => address) public stakerOf;
    mapping(address => EnumerableSet.UintSet) private stakes;
    mapping(address => uint256) public stakedWeight;
    uint256 public totalStakedWeight;
    uint256 public totalClaimed;
    uint256 public totalReferralBonus;
    uint256 public totalClaims;
    uint256 public totalRecipients;
    mapping(address => bool) public hasReceived;
    bool private stakingTransfer;

    event PassMinted(address indexed recipient, bytes32 indexed nullifier, uint256 indexed tokenId, uint8 tier, uint256 weight, address referrer);
    event PassRecorded(uint256 indexed tokenId, string account, string uuid, string bannedAt, string plan);
    event PassStaked(address indexed owner, uint256 indexed tokenId, uint256 weight);
    event PassUnstaked(address indexed owner, uint256 indexed tokenId, uint256 weight);
    event Mined(address indexed recipient, uint256 amount, uint256 bonus);
    event ReferralBound(address indexed invitee, address indexed referrer);
    event ReferralAccrued(address indexed invitee, address indexed referrer, uint256 baseReward, uint256 bonus);
    event ReferralPaid(address indexed referrer, uint256 amount);
    event VerifierChanged(address indexed verifier);

    constructor(address initialOwner, IERC20 token, address initialVerifier)
        ERC721("Claude Code Ban Pass", "CCBP") Ownable(initialOwner) StakingRewards(token) EIP712("ONHOLD", "5")
    {
        require(address(token).code.length > 0 && initialVerifier != address(0), "Invalid setup");
        claude = token;
        renderer = new BanPassRenderer();
        verifier = initialVerifier;
    }

    function mintPass(address recipient, bytes32 nullifier, uint8 tier, address referrer, uint256 deadline, AccountRecord calldata record, bytes calldata signature) external nonReentrant {
        require(recipient == msg.sender && recipient != address(0), "Wrong recipient");
        require(nullifier != bytes32(0) && !claimed[nullifier], "Account already minted");
        require(tier == 1 || tier == 2, "Invalid tier");
        require(block.timestamp <= deadline, "Mint proof expired");
        require(referrer != recipient, "Self referral");
        require(bytes(record.account).length <= 640 && bytes(record.uuid).length == 36 && bytes(record.bannedAt).length > 0 && bytes(record.bannedAt).length <= 64 && bytes(record.plan).length <= 80, "Invalid record");
        require(keccak256(bytes(string.concat("ONHOLD:restricted-consumer-org:v1:", record.uuid))) == nullifier, "Record UUID mismatch");
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

    function passWeight(uint256 tokenId) public view returns (uint256) {
        _requireOwned(tokenId);
        return passTier[tokenId] == 1 ? 1 : 3;
    }

    function effectiveWeight(address account) public view returns (uint256) {
        return stakingWeightOf(account);
    }

    function totalEffectiveWeight() external view returns (uint256) { return totalStakingWeight(); }

    function stakedBalanceOf(address account) external view returns (uint256) { return stakes[account].length(); }
    function stakedTokenByIndex(address account, uint256 index) external view returns (uint256) { return stakes[account].at(index); }

    function stake(uint256 tokenId) external nonReentrant {
        require(ownerOf(tokenId) == msg.sender, "Not NFT owner");
        uint256 weight = passWeight(tokenId);
        if (!referralBound[msg.sender]) _bindReferrer(msg.sender, address(0));
        _stake(weight);
        stakingTransfer = true;
        _transfer(msg.sender, address(this), tokenId);
        stakingTransfer = false;
        stakes[msg.sender].add(tokenId);
        stakerOf[tokenId] = msg.sender;
        stakedWeight[msg.sender] += weight;
        totalStakedWeight += weight;
        emit PassStaked(msg.sender, tokenId, weight);
    }

    function unstake(uint256 tokenId) external nonReentrant {
        require(stakerOf[tokenId] == msg.sender, "Not staker");
        uint256 weight = passWeight(tokenId);
        _withdraw(weight);
        stakedWeight[msg.sender] -= weight;
        totalStakedWeight -= weight;
        stakes[msg.sender].remove(tokenId);
        delete stakerOf[tokenId];
        stakingTransfer = true;
        _transfer(address(this), msg.sender, tokenId);
        stakingTransfer = false;
        ERC721Utils.checkOnERC721Received(msg.sender, address(this), msg.sender, tokenId, "");
        emit PassUnstaked(msg.sender, tokenId, weight);
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

    function _afterRewardPaid(address account, uint256 amount) internal override {
        address referrer = referrerOf[account];
        if (referrer != address(0)) {
            // Carry sub-wei fractions so splitting claims cannot change the aggregate bonus.
            uint256 numerator = amount * 15 + referralRemainder[account];
            uint256 bonus = numerator / 100;
            referralRemainder[account] = numerator % 100;
            require(totalReferralAccrued + bonus <= referralBudget, "Referral budget exceeded");
            referralRewards[referrer] += bonus;
            referralEarned[referrer] += bonus;
            totalReferralAccrued += bonus;
            emit ReferralAccrued(account, referrer, amount, bonus);
        }
        _recordPayment(account, amount);
        emit Mined(account, amount, 0);
    }

    function claimReferralRewards() external nonReentrant {
        uint256 bonus = referralRewards[msg.sender];
        if (bonus == 0) return;
        referralRewards[msg.sender] = 0;
        totalReferralBonus += bonus;
        _recordPayment(msg.sender, bonus);
        rewardsToken.safeTransfer(msg.sender, bonus);
        emit ReferralPaid(msg.sender, bonus);
    }

    function _recordPayment(address account, uint256 amount) private {
        totalClaimed += amount;
        totalClaims++;
        if (!hasReceived[account]) { hasReceived[account] = true; totalRecipients++; }
    }

    function _update(address to, uint256 tokenId, address auth) internal override returns (address) {
        require(stakingTransfer || (to != address(this) && _ownerOf(tokenId) != address(this)), "Use stake or unstake");
        return super._update(to, tokenId, auth);
    }

    function previewPass(uint8 tier, AccountRecord calldata record) external view returns (string memory) {
        require(tier == 1 || tier == 2, "Invalid tier");
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

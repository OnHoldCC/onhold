// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {EnumerableSet} from "@openzeppelin/contracts/utils/structs/EnumerableSet.sol";
import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";
import {ERC1967Proxy} from "@openzeppelin/contracts/proxy/ERC1967/ERC1967Proxy.sol";
import {VaultRewards} from "./staking/VaultRewards.sol";
import {IFlapSwap} from "./FlapBuyback.sol";

interface IOnholdNFT is IERC721 {
    function passWeight(uint256 id) external view returns(uint256);
    function referralBound(address wallet) external view returns(bool);
    function referrerOf(address wallet) external view returns(address);
}

// Only gameplay is upgradeable. Asset contracts are external and keep their addresses.
contract OnholdGameplayVault is OwnableUpgradeable, UUPSUpgradeable, VaultRewards {
    using EnumerableSet for EnumerableSet.UintSet;
    using SafeERC20 for IERC20;
    bytes32 public constant PROTOCOL_ID = keccak256("onhold.gameplay.v1");
    IOnholdNFT public nft;
    mapping(uint256 => address) public stakerOf;
    mapping(address => EnumerableSet.UintSet) private stakes;
    mapping(address => uint256) public stakedWeight;
    uint256 public totalStakedWeight;
    mapping(address => uint256) public referralRewards;
    mapping(address => uint256) public referralEarned;
    mapping(address => uint256) private referralRemainder;
    uint256 public totalReferralAccrued;
    uint256 public totalClaimed;
    uint256 public totalReferralBonus;
    uint256 public totalClaims;
    uint256 public totalRecipients;
    mapping(address => bool) public hasReceived;
    event PassStaked(address indexed owner, uint256 indexed tokenId, uint256 weight);
    event PassUnstaked(address indexed owner, uint256 indexed tokenId, uint256 weight);
    event Mined(address indexed recipient, uint256 amount, uint256 bonus);
    event ReferralAccrued(address indexed invitee, address indexed referrer, uint256 baseReward, uint256 bonus);
    event ReferralPaid(address indexed referrer, uint256 amount);
    event AssetsConfigured(address indexed nft, address indexed token);

    /// @custom:oz-upgrades-unsafe-allow constructor
    constructor() { _disableInitializers(); }

    function initialize(address initialOwner, IOnholdNFT identity, IERC20 token) external initializer {
        require(block.chainid == 56 || block.chainid == 97 || block.chainid == 31337, "Unsupported chain");
        require(address(identity).code.length > 0 && address(identity) != address(token), "Invalid NFT");
        require(identity.supportsInterface(type(IERC721).interfaceId), "ERC721 required");
        __Ownable_init(initialOwner);
        __VaultRewards_init(token);
        nft = identity;
        adKeeper = initialOwner;
        emit AssetsConfigured(address(identity), address(token));
    }
    function _authorizeUpgrade(address) internal override onlyOwner {}
    function claude() public view returns(IERC20) { return rewardsToken; }
    function referralBound(address account) external view returns(bool) { return nft.referralBound(account); }
    function referrerOf(address account) public view returns(address) { return nft.referrerOf(account); }
    function totalEffectiveWeight() external view returns(uint256) { return totalStakingWeight(); }
    function effectiveWeight(address account) external view returns(uint256) { return stakingWeightOf(account); }
    function stakedBalanceOf(address account) external view returns(uint256) { return stakes[account].length(); }
    function stakedTokenByIndex(address account, uint256 index) external view returns(uint256) { return stakes[account].at(index); }
    function stake(uint256 tokenId) external nonReentrant {
        require(nft.ownerOf(tokenId) == msg.sender, "Not NFT owner");
        require(nft.referralBound(msg.sender), "Bind NFT referral first");
        uint256 weight = nft.passWeight(tokenId);
        if (weight > 0) _stake(weight);
        stakes[msg.sender].add(tokenId);
        stakerOf[tokenId] = msg.sender;
        stakedWeight[msg.sender] += weight;
        totalStakedWeight += weight;
        nft.transferFrom(msg.sender, address(this), tokenId);
        require(nft.ownerOf(tokenId) == address(this), "NFT custody failed");
        emit PassStaked(msg.sender, tokenId, weight);
    }
    function unstake(uint256 tokenId) external nonReentrant {
        require(stakerOf[tokenId] == msg.sender, "Not staker");
        uint256 weight = nft.passWeight(tokenId);
        if (weight > 0) _withdraw(weight);
        stakedWeight[msg.sender] -= weight;
        totalStakedWeight -= weight;
        stakes[msg.sender].remove(tokenId);
        delete stakerOf[tokenId];
        nft.safeTransferFrom(address(this), msg.sender, tokenId);
        emit PassUnstaked(msg.sender, tokenId, weight);
    }
    function _afterRewardPaid(address account, uint256 amount) internal override {
        address referrer = referrerOf(account);
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

    struct Ad {
        address advertiser;
        uint256 initialBid;
        uint256 startedAt;
        uint256 version;
        string url;
        string description;
        string avatar;
        string[] tags;
    }
    Ad[6] public ads;
    uint256 public constant MIN_BID = 0.001 ether;
    uint256 public constant MAX_TAGS = 10;
    uint256 public constant MAX_TAG_CHARACTERS = 10;
    uint256 public totalAdRevenue;
    uint256 public teamRevenue;
    uint256 public adBuybackReserve;
    uint256 public totalAdReinvested;
    uint256 public constant AD_BUYBACK_INTERVAL = 3 minutes;
    uint256 public lastAdBuyback;
    address public adKeeper;
    event BidPlaced(uint8 indexed slot, address indexed advertiser, uint256 amount, uint256 version);
    event AdPublished(uint8 indexed slot, uint256 indexed version, address advertiser, uint256 amount, uint256 startedAt, string url, string description, string avatar, string[] tags);
    event RevenueWithdrawn(address indexed recipient, uint256 amount);
    event AdRevenueSplit(uint256 teamAmount, uint256 reserveAmount);
    event AdRewardsReinvested(uint256 spent, uint256 tokensAdded);
    event AdKeeperChanged(address indexed keeper);

    receive() external payable {}
    function adBuybackPortal() public view virtual returns (address) {
        return block.chainid == 56 ? 0xe2cE6ab80874Fa9Fa2aAE65D277Dd6B8e65C9De0 : 0x5bEacaF7ABCbB3aB280e80D007FD31fcE26510e9;
    }
    function minimumAdBid() public pure virtual returns (uint256) { return MIN_BID; }
    function MIN_AD_BUYBACK() public view virtual returns (uint256) { return block.chainid == 56 ? 0.01 ether : 0.001 ether; }
    function adPriceInterval() public pure virtual returns (uint256) { return 1 days; }
    function setAdKeeper(address keeper) external onlyOwner {
        require(keeper != address(0), "Invalid keeper");
        adKeeper = keeper;
        emit AdKeeperChanged(keeper);
    }
    function reinvestAdRevenue(uint256 amount, uint256 minOutput, uint256 deadline) external nonReentrant {
        require(msg.sender == adKeeper, "Keeper required");
        require(miningStartedAt != 0 && block.timestamp < miningStartedAt + rewardsDuration, "Mining inactive");
        require(block.timestamp >= lastAdBuyback + AD_BUYBACK_INTERVAL, "Too early");
        require(amount >= MIN_AD_BUYBACK() && amount <= adBuybackReserve && minOutput > 0, "Invalid amount");
        require(deadline >= block.timestamp && deadline <= block.timestamp + 2 minutes, "Invalid deadline");
        adBuybackReserve -= amount;
        lastAdBuyback = block.timestamp;
        uint256 nativeBefore = address(this).balance;
        uint256 tokensBefore = rewardsToken.balanceOf(address(this));
        IFlapSwap(adBuybackPortal()).swapExactInput{value: amount}(IFlapSwap.ExactInputParams(address(0), address(rewardsToken), amount, minOutput, ""));
        uint256 bought = rewardsToken.balanceOf(address(this)) - tokensBefore;
        require(bought >= minOutput, "Insufficient output");
        uint256 spent = nativeBefore - address(this).balance;
        require(spent > 0 && spent <= amount, "Invalid spend");
        adBuybackReserve += amount - spent;
        totalAdReinvested += bought;
        _addMiningRewards(bought);
        emit AdRewardsReinvested(spent, bought);
    }
    function currentPrice(uint8 slot) public view returns (uint256) {
        require(slot < 6, "Invalid slot");
        Ad storage ad = ads[slot];
        if (ad.initialBid == 0) return 0;
        uint256 periodsElapsed = (block.timestamp - ad.startedAt) / adPriceInterval();
        uint256 price = periodsElapsed >= 256 ? 0 : ad.initialBid >> periodsElapsed;
        return price == 0 ? 1 : price;
    }
    function requiredBid(uint8 slot) public view returns (uint256) {
        uint256 price = currentPrice(slot);
        uint256 replacement = price + price / 10 + (price % 10 == 0 ? 0 : 1);
        uint256 minimum = minimumAdBid();
        return replacement < minimum ? minimum : replacement;
    }
    function bid(uint8 slot, uint256 expectedVersion, string calldata url, string calldata description, string calldata avatar, string[] calldata tags) external payable nonReentrant {
        require(slot < 6, "Invalid slot");
        require(ads[slot].version == expectedVersion, "Listing changed");
        require(msg.value >= minimumAdBid(), "Minimum bid not met");
        require(msg.value >= requiredBid(slot), "Bid too low");
        require(characterCount(description) > 0 && characterCount(description) <= 80, "Invalid description");
        if (bytes(avatar).length > 0) require(bytes(avatar).length <= 300 && bytes8(bytes(avatar)) == bytes8("https://"), "Invalid avatar");
        bytes memory link = bytes(url);
        require(link.length > 8 && link.length <= 300 && bytes8(link) == bytes8("https://"), "HTTPS required");
        require(tags.length <= MAX_TAGS, "Invalid tags");
        for (uint256 i; i < tags.length; i++) {
            uint256 count = characterCount(tags[i]);
            require(count > 0 && count <= MAX_TAG_CHARACTERS, "Invalid tags");
            for (uint256 j; j < i; j++) require(keccak256(bytes(tags[i])) != keccak256(bytes(tags[j])), "Duplicate tag");
        }
        uint256 version = expectedVersion + 1;
        Ad storage ad = ads[slot];
        ad.advertiser = msg.sender;
        ad.initialBid = msg.value;
        ad.startedAt = block.timestamp;
        ad.version = version;
        ad.url = url;
        ad.description = description;
        ad.avatar = avatar;
        delete ad.tags;
        for (uint256 i; i < tags.length; i++) ad.tags.push(tags[i]);
        totalAdRevenue += msg.value;
        uint256 teamAmount = msg.value / 2;
        teamRevenue += teamAmount;
        adBuybackReserve += msg.value - teamAmount;
        emit AdRevenueSplit(teamAmount, msg.value - teamAmount);
        emit BidPlaced(slot, msg.sender, msg.value, version);
        _publishAd(slot);
    }
    function _publishAd(uint8 slot) private {
        Ad storage ad = ads[slot];
        emit AdPublished(slot, ad.version, ad.advertiser, ad.initialBid, ad.startedAt, ad.url, ad.description, ad.avatar, ad.tags);
    }
    function adTags(uint8 slot) external view returns (string[] memory) {
        require(slot < 6, "Invalid slot");
        return ads[slot].tags;
    }
    function characterCount(string calldata text) private pure returns (uint256 count) {
        bytes calldata value = bytes(text);
        require(value.length <= 320, "Text too long");
        for (uint256 i; i < value.length; count++) {
            uint8 first = uint8(value[i]);
            uint256 size = first < 0x80 ? 1 : first >= 0xc2 && first <= 0xdf ? 2 : first >= 0xe0 && first <= 0xef ? 3 : first >= 0xf0 && first <= 0xf4 ? 4 : 0;
            require(size > 0 && i + size <= value.length, "Invalid UTF8");
            for (uint256 j = 1; j < size; j++) require(uint8(value[i+j]) >= 0x80 && uint8(value[i+j]) <= 0xbf, "Invalid UTF8");
            if (size >= 3) {
                uint8 second = uint8(value[i+1]);
                require(!(first == 0xe0 && second < 0xa0) && !(first == 0xed && second >= 0xa0) && !(first == 0xf0 && second < 0x90) && !(first == 0xf4 && second > 0x8f), "Invalid UTF8");
            }
            i += size;
        }
    }
    function withdrawRevenue(address payable recipient, uint256 amount) external onlyOwner nonReentrant {
        require(recipient != address(0) && amount > 0, "Invalid withdrawal");
        require(amount <= teamRevenue, "Team revenue exceeded");
        teamRevenue -= amount;
        (bool success,) = recipient.call{value: amount}("");
        require(success, "Transfer failed");
        emit RevenueWithdrawn(recipient, amount);
    }
}

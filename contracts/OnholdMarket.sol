// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {OnholdPassMining} from "./OnholdPassMining.sol";
import {IFlapSwap} from "./FlapBuyback.sol";

contract OnholdMarket is OnholdPassMining {
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
    uint256 public constant MIN_BID = 0.01 ether;
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

    constructor(address initialOwner, IERC20 token, address initialVerifier)
        OnholdPassMining(initialOwner, token, initialVerifier) {
        require(block.chainid == 56 || block.chainid == 97 || block.chainid == 31337, "Unsupported chain");
        adKeeper = initialOwner;
    }
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
        uint256 tokensBefore = claude.balanceOf(address(this));
        IFlapSwap(adBuybackPortal()).swapExactInput{value: amount}(IFlapSwap.ExactInputParams(address(0), address(claude), amount, minOutput, ""));
        uint256 bought = claude.balanceOf(address(this)) - tokensBefore;
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
        require(tags.length <= 10, "Invalid tags");
        uint256 tagCharacters;
        for (uint256 i; i < tags.length; i++) {
            uint256 count = characterCount(tags[i]);
            require(count > 0, "Invalid tags");
            tagCharacters += count;
            for (uint256 j; j < i; j++) require(keccak256(bytes(tags[i])) != keccak256(bytes(tags[j])), "Duplicate tag");
        }
        require(tagCharacters <= 10, "Tags exceed 10 characters");
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

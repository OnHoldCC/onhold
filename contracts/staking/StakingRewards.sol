// SPDX-License-Identifier: MIT
// Copyright (c) 2019 Synthetix
// Adapted from synthetix@2.27.2. See SOURCE.md and upstream/LICENSE for provenance and changes.
pragma solidity ^0.8.24;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

abstract contract StakingRewards is ReentrancyGuard {
    using SafeERC20 for IERC20;

    /* ========== STATE VARIABLES ========== */

    IERC20 public immutable rewardsToken;
    uint256 public constant MINING_POOL = 100_000_000 ether;
    uint256 public constant BASE_MINING_POOL = MINING_POOL * 100 / 115;
    uint256 public constant REFERRAL_POOL = MINING_POOL - BASE_MINING_POOL;
    uint256 public constant rewardsDuration = 365 days;
    uint256 public baseMiningBudget = BASE_MINING_POOL;
    uint256 public referralBudget = REFERRAL_POOL;
    struct Emission { uint256 startedAt; uint256 released; uint256 remaining; }
    Emission[] private emissions;
    uint256 private constant PRECISION = 1e24;
    uint256 public miningStartedAt;
    uint256 public lastUpdateTime;
    uint256 public rewardPerTokenStored;
    uint256 public totalAllocated;
    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    uint256 private _totalSupply;
    mapping(address => uint256) private _balances;

    constructor(IERC20 token) {
        require(address(token).code.length > 0, "Invalid reward token");
        rewardsToken = token;
    }

    /* ========== VIEWS ========== */

    // These are staking weights; ERC721 balanceOf/totalSupply keep their NFT meanings.
    function totalStakingWeight() public view returns (uint256) { return _totalSupply; }
    function stakingWeightOf(address account) public view returns (uint256) { return _balances[account]; }

    function lastTimeRewardApplicable() public view returns (uint256) {
        if (miningStartedAt == 0) return 0;
        uint256 end = miningStartedAt + rewardsDuration;
        return block.timestamp < end ? block.timestamp : end;
    }

    function rewardPerToken() public view returns (uint256) {
        if (_totalSupply == 0) {
            return rewardPerTokenStored;
        }
        // Cumulative release preserves division remainders across checkpoints.
        return rewardPerTokenStored +
            (scheduledRelease(lastTimeRewardApplicable()) - scheduledRelease(lastUpdateTime)) * PRECISION / _totalSupply;
    }

    function earned(address account) public view returns (uint256) {
        return _balances[account] * (rewardPerToken() - userRewardPerTokenPaid[account]) / PRECISION + rewards[account];
    }

    function periodFinish() external view returns (uint256) {
        return miningStartedAt == 0 ? 0 : miningStartedAt + rewardsDuration;
    }

    function getRewardForDuration() public view returns (uint256) {
        return baseMiningBudget;
    }

    function rewardRate() external view returns (uint256) {
        if (miningStartedAt == 0 || block.timestamp >= miningStartedAt + rewardsDuration) return 0;
        Emission storage current = emissions[emissions.length - 1];
        return current.remaining / (miningStartedAt + rewardsDuration - current.startedAt);
    }

    function dailyEmission() external view returns (uint256) {
        if (miningStartedAt == 0 || _totalSupply == 0 || block.timestamp >= miningStartedAt + rewardsDuration) return 0;
        Emission storage current = emissions[emissions.length - 1];
        return current.remaining * 1 days / (miningStartedAt + rewardsDuration - current.startedAt);
    }

    function scheduledRelease(uint256 timestamp) public view returns (uint256) {
        if (miningStartedAt == 0 || timestamp <= miningStartedAt) return 0;
        uint256 end = miningStartedAt + rewardsDuration;
        if (timestamp >= end) return baseMiningBudget;
        uint256 index = emissions.length - 1;
        if (timestamp < emissions[index].startedAt) {
            uint256 low;
            uint256 high = emissions.length;
            while (low < high) {
                uint256 mid = (low + high) / 2;
                if (emissions[mid].startedAt <= timestamp) low = mid + 1;
                else high = mid;
            }
            index = low - 1;
        }
        Emission storage current = emissions[index];
        return current.released + current.remaining * (timestamp - current.startedAt) / (end - current.startedAt);
    }

    /* ========== MUTATIVE FUNCTIONS ========== */

    // Asset custody is handled by the NFT adapter. There is no public ERC20 amount-staking entry point.
    function _stake(uint256 amount) internal updateReward(msg.sender) {
        require(amount > 0, "Cannot stake 0");
        if (miningStartedAt == 0) {
            require(rewardsToken.balanceOf(address(this)) >= MINING_POOL, "Mining pool not funded");
            miningStartedAt = block.timestamp;
            lastUpdateTime = block.timestamp;
            emissions.push(Emission(block.timestamp, 0, baseMiningBudget));
            emit MiningStarted(block.timestamp);
        }
        _totalSupply += amount;
        _balances[msg.sender] += amount;
        emit Staked(msg.sender, amount);
    }

    function _withdraw(uint256 amount) internal updateReward(msg.sender) {
        require(amount > 0, "Cannot withdraw 0");
        _totalSupply -= amount;
        _balances[msg.sender] -= amount;
        emit Withdrawn(msg.sender, amount);
    }

    function getReward() public nonReentrant updateReward(msg.sender) {
        uint256 reward = rewards[msg.sender];
        if (reward > 0) {
            rewards[msg.sender] = 0;
            _afterRewardPaid(msg.sender, reward);
            rewardsToken.safeTransfer(msg.sender, reward);
            emit RewardPaid(msg.sender, reward);
        }
    }

    /* ========== MODIFIERS ========== */

    modifier updateReward(address account) {
        if (_totalSupply != 0) totalAllocated += scheduledRelease(lastTimeRewardApplicable()) - scheduledRelease(lastUpdateTime);
        rewardPerTokenStored = rewardPerToken();
        lastUpdateTime = lastTimeRewardApplicable();
        if (account != address(0)) {
            rewards[account] = earned(account);
            userRewardPerTokenPaid[account] = rewardPerTokenStored;
        }
        emit RewardsCheckpoint(account, rewardPerTokenStored, lastUpdateTime, totalAllocated, _balances[account], userRewardPerTokenPaid[account], rewards[account]);
        _;
    }

    function _afterRewardPaid(address account, uint256 amount) internal virtual;

    function _addMiningRewards(uint256 amount) internal updateReward(address(0)) {
        require(amount > 0 && miningStartedAt != 0 && block.timestamp < miningStartedAt + rewardsDuration, "Mining inactive");
        uint256 released = scheduledRelease(block.timestamp);
        uint256 base = amount * 100 / 115;
        baseMiningBudget += base;
        referralBudget += amount - base;
        // Settle the old schedule before increasing only the future release rate.
        emissions.push(Emission(block.timestamp, released, baseMiningBudget - released));
        emit MiningRewardsAdded(amount, baseMiningBudget, referralBudget, block.timestamp, released, baseMiningBudget - released);
    }

    /* ========== EVENTS ========== */

    event RewardsCheckpoint(address indexed account, uint256 rewardPerToken, uint256 updatedAt, uint256 allocated, uint256 balance, uint256 paid, uint256 pending);
    event Staked(address indexed user, uint256 amount);
    event Withdrawn(address indexed user, uint256 amount);
    event RewardPaid(address indexed user, uint256 reward);
    event MiningStarted(uint256 timestamp);
    event MiningRewardsAdded(uint256 amount, uint256 baseBudget, uint256 referralBudget, uint256 timestamp, uint256 released, uint256 remaining);
}

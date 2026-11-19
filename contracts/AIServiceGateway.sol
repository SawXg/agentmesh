// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable2Step, Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";

interface IBurnableERC20 is IERC20 {
    function burn(uint256 amount) external;
    function burnFrom(address account, uint256 amount) external;
}

/// @title AIServiceGateway
/// @notice Service gateway managing pay-per-query access to decentralized AI agents.
/// @dev Burns 50% of incoming token fees and routes 50% to the community/node reward pool.
contract AIServiceGateway is Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IBurnableERC20;

    IBurnableERC20 public immutable token;
    address public rewardPool;
    uint256 public queryFee; // Base fee per AI query in token wei

    // Statistics
    uint256 public totalQueriesServed;
    uint256 public totalTokensBurned;
    uint256 public totalRewardsRouted;

    event QueriesPurchased(
        address indexed user,
        uint256 queryCount,
        uint256 burnedAmount,
        uint256 rewardAmount
    );
    event FeeUpdated(uint256 newFee);
    event RewardPoolUpdated(address newRewardPool);

    error InvalidZeroAddress();
    error InvalidQueryCount();
    error InvalidFeeAmount();

    constructor(
        address _tokenAddress,
        address _rewardPool,
        uint256 _initialFee,
        address _initialOwner
    ) Ownable(_initialOwner) {
        if (_tokenAddress == address(0) || _rewardPool == address(0) || _initialOwner == address(0)) {
            revert InvalidZeroAddress();
        }
        if (_initialFee == 0) revert InvalidFeeAmount();

        token = IBurnableERC20(_tokenAddress);
        rewardPool = _rewardPool;
        queryFee = _initialFee;
    }

    /// @notice Pay token fee to purchase AI execution credits
    /// @param queryCount Number of execution queries to buy
    function payForQueries(uint256 queryCount) external nonReentrant {
        if (queryCount == 0) revert InvalidQueryCount();

        uint256 totalCost = queryCount * queryFee;
        uint256 burnAmount = totalCost / 2;
        uint256 rewardAmount = totalCost - burnAmount;

        // Update tracking metrics
        totalQueriesServed += queryCount;
        totalTokensBurned += burnAmount;
        totalRewardsRouted += rewardAmount;

        // Execute burn directly from caller (requires allowance)
        token.burnFrom(msg.sender, burnAmount);

        // Route remaining 50% to community reward pool
        token.safeTransferFrom(msg.sender, rewardPool, rewardAmount);

        emit QueriesPurchased(msg.sender, queryCount, burnAmount, rewardAmount);
    }

    /// @notice Update the fee per query
    /// @param _newFee New fee in token wei
    function setQueryFee(uint256 _newFee) external onlyOwner {
        if (_newFee == 0) revert InvalidFeeAmount();
        queryFee = _newFee;
        emit FeeUpdated(_newFee);
    }

    /// @notice Update the community reward pool destination
    /// @param _newRewardPool Address of the new reward pool
    function setRewardPool(address _newRewardPool) external onlyOwner {
        if (_newRewardPool == address(0)) revert InvalidZeroAddress();
        rewardPool = _newRewardPool;
        emit RewardPoolUpdated(_newRewardPool);
    }
}

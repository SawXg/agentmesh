// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {IERC20} from "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {Ownable2Step, Ownable} from "@openzeppelin/contracts/access/Ownable2Step.sol";

/// @title TestnetFaucet
/// @notice Self-serve testnet faucet distributing 100 AUN per 24 hours to early testers.
contract TestnetFaucet is Ownable2Step, ReentrancyGuard {
    using SafeERC20 for IERC20;

    IERC20 public immutable token;
    uint256 public constant CLAIM_AMOUNT = 100 ether; // 100 AUN per claim
    uint256 public constant COOLDOWN_PERIOD = 24 hours;

    mapping(address => uint256) public lastClaimedTimestamp;

    event TokensClaimed(address indexed recipient, uint256 amount);
    event FaucetDrained(address indexed owner, uint256 amount);

    error ClaimCooldownActive(uint256 timeRemaining);
    error InsufficientFaucetBalance();
    error InvalidZeroAddress();

    constructor(address _tokenAddress, address _initialOwner) Ownable(_initialOwner) {
        if (_tokenAddress == address(0) || _initialOwner == address(0)) revert InvalidZeroAddress();
        token = IERC20(_tokenAddress);
    }

    /// @notice Allows any user to claim 100 test AUN once every 24 hours
    function claimTokens() external nonReentrant {
        uint256 lastClaim = lastClaimedTimestamp[msg.sender];
        if (block.timestamp < lastClaim + COOLDOWN_PERIOD) {
            revert ClaimCooldownActive((lastClaim + COOLDOWN_PERIOD) - block.timestamp);
        }

        if (token.balanceOf(address(this)) < CLAIM_AMOUNT) {
            revert InsufficientFaucetBalance();
        }

        lastClaimedTimestamp[msg.sender] = block.timestamp;
        token.safeTransfer(msg.sender, CLAIM_AMOUNT);

        emit TokensClaimed(msg.sender, CLAIM_AMOUNT);
    }

    /// @notice View time remaining until next claim for a given address
    function getTimeUntilNextClaim(address account) external view returns (uint256) {
        uint256 lastClaim = lastClaimedTimestamp[account];
        if (block.timestamp >= lastClaim + COOLDOWN_PERIOD) {
            return 0;
        }
        return (lastClaim + COOLDOWN_PERIOD) - block.timestamp;
    }

    /// @notice Emergency recovery of remaining tokens by owner
    function withdrawRemainingTokens() external onlyOwner {
        uint256 bal = token.balanceOf(address(this));
        token.safeTransfer(msg.sender, bal);
        emit FaucetDrained(msg.sender, bal);
    }
}

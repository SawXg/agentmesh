// SPDX-License-Identifier: MIT
pragma solidity 0.8.28;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import {ERC20Burnable} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import {ERC20Permit} from "@openzeppelin/contracts/token/ERC20/extensions/ERC20Permit.sol";

/// @title AgentUtilityToken (AUN)
/// @notice Core utility token for the decentralized AI Agent & Service mesh.
/// @dev Implements standard ERC20, EIP-2612 gasless permits, and burn mechanics.
contract AgentUtilityToken is ERC20, ERC20Burnable, ERC20Permit {
    uint256 public constant TOTAL_SUPPLY = 100_000_000 ether; // 100 Million Tokens

    error InvalidZeroAddress();

    /// @notice Deployer creates fixed supply into initial recipient (treasury/vesting/distributor)
    /// @param initialRecipient The address receiving the initial token supply
    constructor(address initialRecipient) 
        ERC20("Agent Utility Network", "AUN") 
        ERC20Permit("Agent Utility Network") 
    {
        if (initialRecipient == address(0)) revert InvalidZeroAddress();
        _mint(initialRecipient, TOTAL_SUPPLY);
    }
}

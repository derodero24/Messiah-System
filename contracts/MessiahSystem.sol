//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";

import "./MessiahTokens.sol";

contract MessiahSystem {
    // Time period before Messiah Tokens can be claimed.
    uint256 private constant FREEZING_TIME = 2 weeks;

    // info
    uint256 public deploymentTimestamp;
    address public mainOriginalTokenAddress; // ERC721
    address public subOriginalTokenAddress; // ERC20
    address public subMessiahTokenAddress; // ERC20
    address[] public bannedAddresses; // 運営アカウント

    mapping(address => bool) public hasClaimed; // サブトークンをclaim済みか

    /* ########## Constructor ########## */

    constructor(
        address _mainOriginalTokenAddress,
        address _subOriginalTokenAddress
    ) {
        // TODO: 十分な票が集まったタイミングでMessiahSystemデプロイ
        // -> サブトークンはあとからデプロイしたほうがいい？
        deploymentTimestamp = block.timestamp;
        mainOriginalTokenAddress = _mainOriginalTokenAddress;
        _setSubToken(_subOriginalTokenAddress);
    }

    /* ########## Modifiers ########## */

    /* ########## External Functions ########## */

    function claimSubToken() external {
        require(
            subOriginalTokenAddress != address(0),
            "Sub token doesn't set yet."
        );
        require(
            block.timestamp > deploymentTimestamp + FREEZING_TIME,
            "This operation cannot be executed yet."
        );
        require(hasClaimed[msg.sender] == false, "You are already claimed.");
        uint256 amount = _fetchClaimableAmount(
            subOriginalTokenAddress,
            msg.sender
        );
        MessiahToken20(subMessiahTokenAddress).transfer(msg.sender, amount);
    }

    /* ########## Private Functions ########## */

    function _setSubToken(address originalTokenAddress) private {
        // TODO: オリジナルトークンのスナップショット保存
        require(
            subOriginalTokenAddress == address(0),
            "Sub token has already set."
        );
        MessiahToken20 messiahToken = new MessiahToken20(
            _fetchTokenName(originalTokenAddress),
            _fetchTokenSymbol(originalTokenAddress),
            _fetchTokenDecimals(originalTokenAddress)
        );
        messiahToken.mint(
            address(this),
            _fetchTotalSupply(originalTokenAddress)
        );
        subOriginalTokenAddress = originalTokenAddress;
        subMessiahTokenAddress = address(messiahToken);
    }

    /* ########## Oracle Functions ########## */

    function _fetchTokenName(address tokenAddress)
        private
        view
        returns (string memory)
    {
        return ERC20(tokenAddress).name();
    }

    function _fetchTokenSymbol(address tokenAddress)
        private
        view
        returns (string memory)
    {
        return ERC20(tokenAddress).symbol();
    }

    function _fetchTokenDecimals(address tokenAddress)
        private
        view
        returns (uint8)
    {
        return ERC20(tokenAddress).decimals();
    }

    function _fetchTotalSupply(address tokenAddress)
        private
        pure
        returns (uint256)
    {
        return 100_000_000;
    }

    function _fetchClaimableAmount(address tokenAddress, address claimer)
        private
        pure
        returns (uint256)
    {
        return 100;
    }
}

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";

import "./MessiahTokens.sol";

contract MessiahSystem {
    // Time period before Messiah Tokens can be claimed.
    uint256 private constant FREEZING_TIME = 2 weeks;

    uint256 public deploymentTimestamp;
    address public mainOriginalTokenAddress;
    address public mainMessiahTokenAddress;
    mapping(address => address) public toOriginalToken20;
    mapping(address => address) public toOriginalToken721;
    mapping(address => address) public toMessiahToken20;
    mapping(address => address) public toMessiahToken721;

    constructor(address originalTokenAddress) {
        // deploy main Messiah Token
        _deployMessiahToken721(originalTokenAddress);
        // set information
        deploymentTimestamp = block.timestamp;
        mainOriginalTokenAddress = originalTokenAddress;
        mainMessiahTokenAddress = toMessiahToken721[originalTokenAddress];
    }

    function _deployMessiahToken20(address originalTokenAddress)
        internal
        beforeDeploy20(originalTokenAddress)
    {
        MessiahToken20 messiahToken = new MessiahToken20(
            ERC20(originalTokenAddress).name(),
            ERC20(originalTokenAddress).symbol(),
            ERC20(originalTokenAddress).decimals()
        );
        toMessiahToken20[originalTokenAddress] = address(messiahToken);
        toOriginalToken20[address(messiahToken)] = originalTokenAddress;
    }

    function _deployMessiahToken721(address originalTokenAddress)
        internal
        beforeDeploy721(originalTokenAddress)
    {
        MessiahToken721 messiahToken = new MessiahToken721(
            ERC721(originalTokenAddress).name(),
            ERC721(originalTokenAddress).symbol()
        );
        toMessiahToken721[originalTokenAddress] = address(messiahToken);
        toOriginalToken721[address(messiahToken)] = originalTokenAddress;
    }

    function swapToMessiahToken20(address originalTokenAddress, uint256 amount)
        public
        afterDeploy20(originalTokenAddress)
        afterFreezingTime
    {
        ERC20(originalTokenAddress).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        MessiahToken20(toMessiahToken20[originalTokenAddress]).transfer(
            msg.sender,
            amount
        );
    }

    function swapToMessiahToken721(
        address originalTokenAddress,
        uint256 tokenId
    ) public afterDeploy721(originalTokenAddress) afterFreezingTime {
        // get original token
        ERC721 originalToken = ERC721(originalTokenAddress);
        originalToken.safeTransferFrom(msg.sender, address(this), tokenId);

        // send messiah token
        MessiahToken721 messiahToken = MessiahToken721(
            toMessiahToken721[originalTokenAddress]
        );
        if (!messiahToken.exists(tokenId)) {
            messiahToken.safeMint(address(this), tokenId);
        }
        messiahToken.setTokenURI(tokenId, originalToken.tokenURI(tokenId));
        messiahToken.safeTransferFrom(address(this), msg.sender, tokenId);
    }

    function swapToOriginalToken20(address messiahTokenAddress, uint256 amount)
        public
    {
        MessiahToken20(messiahTokenAddress).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        ERC20(toOriginalToken20[messiahTokenAddress]).transfer(
            msg.sender,
            amount
        );
    }

    function swapToOriginalToken721(
        address messiahTokenAddress,
        uint256 tokenId
    ) public {
        MessiahToken721(messiahTokenAddress).safeTransferFrom(
            msg.sender,
            address(this),
            tokenId
        );
        ERC721(toOriginalToken721[messiahTokenAddress]).safeTransferFrom(
            address(this),
            msg.sender,
            tokenId
        );
    }

    function greet() public pure returns (string memory) {
        return "hello";
    }

    modifier beforeDeploy20(address originalTokenAddress) {
        require(
            toMessiahToken20[originalTokenAddress] == address(0),
            "Messiah Token has already been deployed."
        );
        _;
    }

    modifier beforeDeploy721(address originalTokenAddress) {
        require(
            toMessiahToken721[originalTokenAddress] == address(0),
            "Messiah Token has already been deployed."
        );
        _;
    }

    modifier afterDeploy20(address originalTokenAddress) {
        require(
            toMessiahToken20[originalTokenAddress] != address(0),
            "Messiah Token does not deployed."
        );
        _;
    }

    modifier afterDeploy721(address originalTokenAddress) {
        require(
            toMessiahToken721[originalTokenAddress] != address(0),
            "Messiah Token does not deployed."
        );
        _;
    }

    modifier afterFreezingTime() {
        require(
            block.timestamp > deploymentTimestamp + FREEZING_TIME,
            "This operation cannot be executed yet."
        );
        _;
    }
}

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";

import "./MessiahTokens.sol";

contract MessiahSystem {
    enum Standard {
        ERC20,
        ERC721
    }

    struct TokenInfo {
        Standard standard;
        address addr;
    }

    // Time period before Messiah Tokens can be claimed.
    uint256 private constant FREEZING_TIME = 2 weeks;

    // info
    uint256 public deploymentTimestamp;
    address public mainTokenAddress;
    address[] public bannedAddresses; // 運営アカウント

    // Related tokens
    mapping(address => TokenInfo) public toOriginalTokenInfo;
    mapping(address => TokenInfo) public toMessiahTokenInfo;

    constructor(address mainTokenAddress) {
        deploymentTimestamp = block.timestamp;
        mainTokenAddress = mainTokenAddress;
    }

    modifier afterFreezingTime() {
        require(
            block.timestamp > deploymentTimestamp + FREEZING_TIME,
            "This operation cannot be executed yet."
        );
        _;
    }

    modifier beforeDeployMessiahTokenFor(address originalTokenAddress) {
        require(
            toMessiahTokenInfo[originalTokenAddress].addr == address(0),
            "Messiah Token has already been deployed."
        );
        _;
    }

    modifier afterDeployMessiahTokenFor(address originalTokenAddress) {
        require(
            toMessiahTokenInfo[originalTokenAddress].addr != address(0),
            "Messiah Token does not deployed yet."
        );
        _;
    }

    modifier existMessiahToken(address messiahTokenAddress) {
        require(
            toOriginalTokenInfo[messiahTokenAddress].addr != address(0),
            "Incorrect address for Messiah Token."
        );
        _;
    }

    function swapToMessiahToken(
        address originalTokenAddress,
        uint256 amountOrTokenId
    ) external afterFreezingTime {
        TokenInfo memory messiahTokenInfo = toMessiahTokenInfo[
            originalTokenAddress
        ];
        if (messiahTokenInfo.standard == Standard.ERC20) {
            _swapToMessiahToken20(originalTokenAddress, amountOrTokenId);
        } else if (messiahTokenInfo.standard == Standard.ERC721) {
            _swapToMessiahToken721(originalTokenAddress, amountOrTokenId);
        }
    }

    function swapToOriginalToken(
        address messiahTokenAddress,
        uint256 amountOrTokenId
    ) external afterFreezingTime {
        TokenInfo memory originalTokenInfo = toMessiahTokenInfo[
            messiahTokenAddress
        ];
        if (originalTokenInfo.standard == Standard.ERC20) {
            _swapToOriginalToken20(messiahTokenAddress, amountOrTokenId);
        } else if (originalTokenInfo.standard == Standard.ERC721) {
            _swapToOriginalToken721(messiahTokenAddress, amountOrTokenId);
        }
    }

    function _deployMessiahToken20(address originalTokenAddress)
        internal
        beforeDeployMessiahTokenFor(originalTokenAddress)
    {
        MessiahToken20 messiahToken = new MessiahToken20(
            ERC20(originalTokenAddress).name(),
            ERC20(originalTokenAddress).symbol(),
            ERC20(originalTokenAddress).decimals()
        );
        toOriginalTokenInfo[address(messiahToken)] = TokenInfo(
            Standard.ERC20,
            originalTokenAddress
        );
        toMessiahTokenInfo[originalTokenAddress] = TokenInfo(
            Standard.ERC20,
            address(messiahToken)
        );
    }

    function _deployMessiahToken721(address originalTokenAddress)
        internal
        beforeDeployMessiahTokenFor(originalTokenAddress)
    {
        MessiahToken721 messiahToken = new MessiahToken721(
            ERC721(originalTokenAddress).name(),
            ERC721(originalTokenAddress).symbol()
        );
        toOriginalTokenInfo[address(messiahToken)] = TokenInfo(
            Standard.ERC721,
            originalTokenAddress
        );
        toMessiahTokenInfo[originalTokenAddress] = TokenInfo(
            Standard.ERC721,
            address(messiahToken)
        );
    }

    function _swapToMessiahToken20(address originalTokenAddress, uint256 amount)
        internal
        afterDeployMessiahTokenFor(originalTokenAddress)
    {
        // Check token standard
        TokenInfo memory messiahTokenInfo = toMessiahTokenInfo[
            originalTokenAddress
        ];
        require(messiahTokenInfo.standard == Standard.ERC20, "Not ERC20");

        // receive original token
        ERC20(originalTokenAddress).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        // send messiah token
        MessiahToken20(messiahTokenInfo.addr).transfer(msg.sender, amount);
    }

    function _swapToMessiahToken721(
        address originalTokenAddress,
        uint256 tokenId
    ) internal afterDeployMessiahTokenFor(originalTokenAddress) {
        // Check token standard
        TokenInfo memory messiahTokenInfo = toMessiahTokenInfo[
            originalTokenAddress
        ];
        require(messiahTokenInfo.standard == Standard.ERC721, "Not ERC721");

        // receive original token
        ERC721 originalToken = ERC721(originalTokenAddress);
        originalToken.safeTransferFrom(msg.sender, address(this), tokenId);

        // send messiah token
        MessiahToken721 messiahToken = MessiahToken721(messiahTokenInfo.addr);
        if (!messiahToken.exists(tokenId)) {
            messiahToken.safeMint(address(this), tokenId);
        }
        messiahToken.setTokenURI(tokenId, originalToken.tokenURI(tokenId));
        messiahToken.safeTransferFrom(address(this), msg.sender, tokenId);
    }

    function _swapToOriginalToken20(address messiahTokenAddress, uint256 amount)
        internal
        existMessiahToken(messiahTokenAddress)
    {
        // Check token standard
        TokenInfo memory originalTokenInfo = toMessiahTokenInfo[
            messiahTokenAddress
        ];
        require(originalTokenInfo.standard == Standard.ERC20, "Not ERC20");
        // swap
        MessiahToken20(messiahTokenAddress).transferFrom(
            msg.sender,
            address(this),
            amount
        );
        ERC20(originalTokenInfo.addr).transfer(msg.sender, amount);
    }

    function _swapToOriginalToken721(
        address messiahTokenAddress,
        uint256 tokenId
    ) internal existMessiahToken(messiahTokenAddress) {
        // Check token standard
        TokenInfo memory originalTokenInfo = toMessiahTokenInfo[
            messiahTokenAddress
        ];
        require(originalTokenInfo.standard == Standard.ERC721, "Not ERC721");

        // swap
        MessiahToken721(messiahTokenAddress).safeTransferFrom(
            msg.sender,
            address(this),
            tokenId
        );
        ERC721(originalTokenInfo.addr).safeTransferFrom(
            address(this),
            msg.sender,
            tokenId
        );
    }
}

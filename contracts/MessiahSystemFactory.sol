//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "./MessiahSystem.sol";

contract MessiahSystemFactory {
    struct MessiahInfo {
        address messiahSystemAddress;
        address messiahTokenAddress;
    }

    mapping(address => MessiahInfo) public messiahInfo;

    function deployMessiah(address originalTokenAddress)
        external
        returns (MessiahInfo memory)
    {
        // Deploy Messiah Contract
        // TODO: ERC721トークンのアドレスかをチェック
        require(
            messiahInfo[originalTokenAddress].messiahSystemAddress ==
                address(0),
            "Messiah for the token has already been deployed."
        );

        // Deploy Messiah Token
        ERC20 originalToken = ERC20(originalTokenAddress);
        MessiahToken721 newMessiahToken = new MessiahToken721(
            originalToken.name(),
            originalToken.symbol()
        );

        // Deploy Messiah System
        MessiahSystem newMessiahSystem = new MessiahSystem(
            originalTokenAddress,
            newMessiahToken
        );
        messiahInfo[originalTokenAddress] = MessiahInfo(
            address(newMessiahSystem),
            address(newMessiahToken)
        );

        // Return Messiah Information
        return messiahInfo[originalTokenAddress];
    }
}

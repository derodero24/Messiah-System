//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";

import "./MessiahSystem.sol";
import "./MessiahTokens.sol";

contract MessiahSystemFactory {
    mapping(address => address) public messiahSystemAddress;

    function deployMessiah(address originalTokenAddress)
        external
        returns (address)
    {
        // Deploy Messiah Contract
        // TODO: ERC721トークンのアドレスかをチェック
        require(
            messiahSystemAddress[originalTokenAddress] == address(0),
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
        messiahSystemAddress[originalTokenAddress] = address(newMessiahSystem);

        // Return Messiah Information
        return messiahSystemAddress[originalTokenAddress];
    }
}

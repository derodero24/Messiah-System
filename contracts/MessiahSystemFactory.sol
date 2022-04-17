//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";

import "./MessiahSystem.sol";

contract MessiahSystemFactory {
    mapping(address => address) public messiahSystemAddress;

    function deployMessiahSystem(address originalTokenAddress)
        external
        returns (address)
    {
        // Deploy Messiah System
        // TODO: ERC721トークンのアドレスかをチェック
        require(
            messiahSystemAddress[originalTokenAddress] == address(0),
            "Messiah for the token has already been deployed."
        );
        MessiahSystem ms = new MessiahSystem(originalTokenAddress);
        messiahSystemAddress[originalTokenAddress] = address(ms);

        // Return Messiah Information
        return messiahSystemAddress[originalTokenAddress];
    }
}

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";

import "./MessiahSystem.sol";

contract MessiahSystemFactory {
    mapping(address => address) public messiahSystemAddress;

    function deployMessiahSystem(
        address mainTokenAddress, // ERC721
        address subTokenAddress // ERC20
    ) external returns (address) {
        require(
            messiahSystemAddress[mainTokenAddress] == address(0),
            "Messiah for the token has already been deployed."
        );
        MessiahSystem ms = new MessiahSystem(mainTokenAddress, subTokenAddress);
        messiahSystemAddress[mainTokenAddress] = address(ms);

        // Return Messiah Information
        return messiahSystemAddress[mainTokenAddress];
    }
}

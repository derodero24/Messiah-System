//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";

import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorSettings.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorCountingSimple.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";

contract MessiahSystem is
    Governor,
    GovernorSettings,
    GovernorCountingSimple,
    GovernorVotes,
    GovernorVotesQuorumFraction
{
    address public originalToken;
    address public mainMessiahToken;
    mapping(address => address) private _messiahToken20List;
    mapping(address => address) private _messiahToken721List;

    constructor(address _originalToken, IVotes _token)
        Governor("MessiahSystem")
        GovernorSettings(
            1, /* Voting Delay -> 1 block */
            45818, /* Voting Period -> 1 week */
            0 /* Proposal Threshold -> 0 token */
        )
        GovernorVotes(_token)
        GovernorVotesQuorumFraction(4)
    {
        originalToken = _originalToken;
        mainMessiahToken = address(_token);
    }

    function greet() public pure returns (string memory) {
        return "hello";
    }

    // function deployMessiahToken20(
    //     address originalTokenAddress,
    //     string memory name,
    //     string memory symbol
    // ) public {
    //     require(
    //         _messiahToken20Address[originalTokenAddress] == address(0),
    //         "Alternative for the token has already been deployed."
    //     );
    //     MessiahToken20 newToken = new MessiahToken20(name, symbol);
    //     _messiahToken20Address[originalTokenAddress] = address(newToken);
    // }

    // function deployMessiahToken721(
    //     address originalTokenAddress,
    //     string memory name,
    //     string memory symbol
    // ) public {
    //     require(
    //         _messiahToken721Address[originalTokenAddress] == address(0),
    //         "Alternative for the token has already been deployed."
    //     );
    //     MessiahToken721 newToken = new MessiahToken721(name, symbol);
    //     _messiahToken721Address[originalTokenAddress] = address(newToken);
    // }

    // The following functions are overrides required by Solidity.

    function votingDelay()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return super.votingDelay();
    }

    function votingPeriod()
        public
        view
        override(IGovernor, GovernorSettings)
        returns (uint256)
    {
        return super.votingPeriod();
    }

    function quorum(uint256 blockNumber)
        public
        view
        override(IGovernor, GovernorVotesQuorumFraction)
        returns (uint256)
    {
        return super.quorum(blockNumber);
    }

    function getVotes(address account, uint256 blockNumber)
        public
        view
        override(IGovernor, GovernorVotes)
        returns (uint256)
    {
        return super.getVotes(account, blockNumber);
    }

    function proposalThreshold()
        public
        view
        override(Governor, GovernorSettings)
        returns (uint256)
    {
        return super.proposalThreshold();
    }
}

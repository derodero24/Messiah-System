//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.9;

import "hardhat/console.sol";
import "./MessiahTokens.sol";
import "@openzeppelin/contracts/governance/Governor.sol";
import "@openzeppelin/contracts/governance/compatibility/GovernorCompatibilityBravo.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotes.sol";
import "@openzeppelin/contracts/governance/extensions/GovernorVotesQuorumFraction.sol";

contract MessiahSystem {
    address public originalToken;
    address public mainMessiahToken;
    mapping(address => address) private _messiahToken20List;
    mapping(address => address) private _messiahToken721List;

    constructor(address _originalToken, IVotes _token) {
        originalToken = _originalToken;
        mainMessiahToken = address(_token);
    }

    function greet() public pure returns (string memory) {
        return "hello";
    }

    // function votingDelay() public pure override returns (uint256) {
    //     return 6575; // 1 day
    // }

    // function votingPeriod() public pure override returns (uint256) {
    //     return 46027; // 1 week
    // }

    // function proposalThreshold() public pure override returns (uint256) {
    //     return 0;
    // }

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

    // // The functions below are overrides required by Solidity.

    // function quorum(uint256 blockNumber)
    //     public
    //     view
    //     override(IGovernor, GovernorVotesQuorumFraction)
    //     returns (uint256)
    // {
    //     return super.quorum(blockNumber);
    // }

    // function getVotes(address account, uint256 blockNumber)
    //     public
    //     view
    //     override(IGovernor, GovernorVotes)
    //     returns (uint256)
    // {
    //     return super.getVotes(account, blockNumber);
    // }

    // function state(uint256 proposalId)
    //     public
    //     view
    //     override(Governor, IGovernor)
    //     returns (ProposalState)
    // {
    //     return super.state(proposalId);
    // }

    // function propose(
    //     address[] memory targets,
    //     uint256[] memory values,
    //     bytes[] memory calldatas,
    //     string memory description
    // ) public override(Governor, GovernorCompatibilityBravo) returns (uint256) {
    //     return super.propose(targets, values, calldatas, description);
    // }
}

//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";

import "./MessiahTokens.sol";

contract MessiahSystem {
    struct Proposal {
        bytes32 id;
        uint256 timestamp;
        address proposer;
        string title;
        string description;
        address[] candidates;
        uint256 totalVotes;
    }

    struct Candidate {
        address addr;
        string name;
        string url;
    }

    // constants
    uint256 private constant VOTING_PERIOD = 1 weeks;

    // info
    uint256 public deploymentTimestamp;
    address public mainOriginalTokenAddress; // ERC721
    address public subOriginalTokenAddress; // ERC20
    address public subMessiahTokenAddress; // ERC20

    address[] public blacklist; // 運営アカウント
    bytes32[] public proposalIds;

    mapping(bytes32 => Proposal) public proposalMap;
    mapping(bytes32 => mapping(address => Candidate)) public candidateMap;
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

    function propose(string memory title, string memory description)
        external
        returns (bytes32)
    {
        return _propose(msg.sender, title, description);
    }

    function runForProposal(
        bytes32 proposalId,
        string memory name,
        string memory url
    ) external {
        // 立候補
        Proposal memory proposal = proposalMap[proposalId];
        require(proposal.id != 0, "Invalid proposal ID.");
        require(
            block.timestamp < proposal.timestamp + VOTING_PERIOD,
            "This operation cannot be executed any more."
        );
        proposalMap[proposalId].candidates.push(msg.sender);
        candidateMap[proposalId][msg.sender] = Candidate(msg.sender, name, url);
    }

    // function vote(bytes32 proposalId, address candidate) external {
    //     require(proposalMap[proposalId].id != 0, "Invalid proposal ID.");
    //     require(
    //         candidateMap[proposalId][candidate].addr != address(0),
    //         "Invalid candidate address."
    //     );
    //     proposalMap[proposalId].totalVotes++;
    // }

    function claimSubToken() external {
        require(
            subOriginalTokenAddress != address(0),
            "Sub token doesn't set yet."
        );
        // require(
        //     block.timestamp > deploymentTimestamp + FREEZING_TIME,
        //     "This operation cannot be executed yet."
        // );
        require(hasClaimed[msg.sender] == false, "You are already claimed.");
        uint256 amount = _fetchClaimableAmount(
            subOriginalTokenAddress,
            msg.sender
        );
        hasClaimed[msg.sender] = true;
        MessiahToken20(subMessiahTokenAddress).transfer(msg.sender, amount);
    }

    /* ########## Private Functions ########## */

    function _propose(
        address proposer,
        string memory title,
        string memory description
    ) private returns (bytes32) {
        uint256 timestamp = block.timestamp;
        bytes32 id = keccak256(
            abi.encodePacked(timestamp, proposer, title, description)
        );
        address[] memory candidates;
        Proposal memory proposal = Proposal(
            id,
            timestamp,
            proposer,
            title,
            description,
            candidates,
            0
        );
        proposalIds.push(id);
        proposalMap[id] = proposal;
        return id;
    }

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

    function _fetchTokenBalance(address tokenAddress, address account)
        private
        view
        returns (uint256)
    {
        return ERC20(tokenAddress).balanceOf(account);
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

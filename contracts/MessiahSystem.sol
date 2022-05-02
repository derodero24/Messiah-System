//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";

import "./MessiahTokens.sol";

contract MessiahSystem {
    /* ########## Event ########## */
    event Propose(address indexed proposer, uint256 proposalId);

    /* ########## Enum/Struct ########## */
    // enum Vote {
    //     For,
    //     Against,
    // }

    struct Proposal {
        uint256 id;
        uint256 timestamp;
        address proposer;
        string title;
        string description;
        uint256 totalVotes;
    }

    struct Candidate {
        address addr;
        string name;
        string url;
    }

    /* ########## Variable ########## */

    // constant
    uint256 public constant VOTING_PERIOD = 1 weeks;
    uint256 public constant DATA_PER_PAGE = 100;

    // info
    uint256 public deploymentTimestamp;
    address public mainOriginalTokenAddress; // ERC721
    address public subOriginalTokenAddress; // ERC20
    address public subMessiahTokenAddress; // ERC20

    // Proposal管理 (proposal ID -> info)
    uint256[] private _proposalIds;
    mapping(uint256 => Proposal) public proposals;

    // Candidate管理 (proposal ID -> proposer address -> info)
    mapping(uint256 => address[]) private _candidateAddresses;
    mapping(uint256 => mapping(address => Candidate)) public candidates;

    // Vote管理 (proposal ID -> voter address -> info)
    // mapping(uint256 => mapping(address => Candidate)) public VoteMap;

    address[] public blacklist; // 運営アカウント
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

    /* ########## Pure/View External Functions ########## */

    function getProposals(uint256 page)
        external
        view
        returns (Proposal[] memory)
    {
        // Proposal一覧
        uint256 originalLength = _proposalIds.length;
        if (originalLength <= DATA_PER_PAGE * (page - 1)) {
            return new Proposal[](0);
        }

        uint256 returnLength = DATA_PER_PAGE;
        if (originalLength < DATA_PER_PAGE * (page + 1)) {
            returnLength = originalLength - DATA_PER_PAGE * (page - 1);
        }

        Proposal[] memory returnArray = new Proposal[](returnLength);
        for (uint256 i = 0; i < returnLength; i++) {
            returnArray[i] = proposals[
                _proposalIds[DATA_PER_PAGE * (page - 1) + i]
            ];
        }
        return returnArray;
    }

    function getCandidates(uint256 proposalId, uint256 page)
        external
        view
        returns (Candidate[] memory)
    {
        // 立候補者一覧
        uint256 originalLength = _candidateAddresses[proposalId].length;
        if (originalLength <= DATA_PER_PAGE * (page - 1)) {
            return new Candidate[](0);
        }

        uint256 returnLength = DATA_PER_PAGE;
        if (originalLength < DATA_PER_PAGE * (page + 1)) {
            returnLength = originalLength - DATA_PER_PAGE * (page - 1);
        }

        Candidate[] memory returnArray = new Candidate[](returnLength);
        for (uint256 i = 0; i < returnLength; i++) {
            returnArray[i] = candidates[proposalId][
                _candidateAddresses[proposalId][DATA_PER_PAGE * (page - 1) + i]
            ];
        }
        return returnArray;
    }

    /* ########## not Pure/View External Functions ########## */

    function propose(string memory title, string memory description) external {
        _propose(msg.sender, title, description);
    }

    function runForProposal(
        uint256 proposalId,
        string memory name,
        string memory url
    ) external {
        // 立候補
        Proposal memory proposal = proposals[proposalId];
        require(proposal.timestamp != 0, "Invalid proposal ID.");
        require(
            block.timestamp < proposal.timestamp + VOTING_PERIOD,
            "This operation cannot be executed any more."
        );
        require(
            candidates[proposalId][msg.sender].addr == address(0),
            "You've already run for this proposal."
        );
        _candidateAddresses[proposalId].push(msg.sender);
        candidates[proposalId][msg.sender] = Candidate(msg.sender, name, url);
    }

    // function vote(bytes32 proposalId, address candidate) external {
    //     require(proposals[proposalId].id != 0, "Invalid proposal ID.");
    //     require(
    //         candidates[proposalId][candidate].addr != address(0),
    //         "Invalid candidate address."
    //     );
    //     proposals[proposalId].totalVotes++;
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
        require(hasClaimed[msg.sender] == false, "You've already claimed.");
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
    ) private {
        uint256 timestamp = block.timestamp;
        uint256 id = _createProposalId(timestamp, proposer, title, description);
        Proposal memory proposal = Proposal(
            id,
            timestamp,
            proposer,
            title,
            description,
            0
        );
        _proposalIds.push(id);
        proposals[id] = proposal;
        emit Propose(proposer, id);
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

    function _createProposalId(
        uint256 timestamp,
        address proposer,
        string memory title,
        string memory description
    ) private pure returns (uint256) {
        return
            uint256(
                keccak256(
                    abi.encodePacked(timestamp, proposer, title, description)
                )
            );
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

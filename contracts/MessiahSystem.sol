//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";

import "./MessiahTokens.sol";

contract MessiahSystem {
    /* ########## Event ########## */
    event Propose(address indexed proposer, uint256 proposalId);

    /* ########## Enum/Struct ########## */
    enum VOTE {
        FOR,
        AGAINST,
        ABSTAIN
    }

    struct Proposal {
        uint256 id;
        uint256 timestamp;
        address proposer;
        string title;
        string description;
        uint256 reward;
        bool canceled;
    }

    struct Submission {
        uint256 proposalId;
        address submitter;
        string url;
        string comment;
    }

    struct VoteInfo {
        uint256 proposalId;
        uint256 totalFor; // 賛成
        uint256 totalAgainst; // 反対
        uint256 totalAbstain; // 棄権
    }

    /* ########## Variable ########## */

    // constant
    uint256 public constant FREEZING_PERIOD = 0; // TODO:2 weeks;
    uint256 public constant VOTING_PERIOD = 1 weeks;
    uint256 public constant DATA_PER_PAGE = 100;

    // info
    uint256 public deploymentTimestamp;
    address public mainOriginalTokenAddress; // ERC721
    address public subOriginalTokenAddress; // ERC20
    address public subMessiahTokenAddress; // ERC20

    // Proposal (proposal ID -> info)
    uint256[] private _proposalIds;
    mapping(uint256 => Proposal) public proposals;

    // Submission (proposal ID -> submitter address -> info)
    mapping(uint256 => address[]) private _submitters;
    mapping(uint256 => mapping(address => Submission)) public submissions;

    // Vote (proposal ID -> voter address -> info)
    // mapping(uint256 => mapping(address => Worker)) public VoteMap;

    // Others
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

    modifier afterFreezing() {
        // 資産ロック解除後の処理
        require(
            block.timestamp > deploymentTimestamp + FREEZING_PERIOD,
            "This operation cannot be executed yet."
        );
        _;
    }

    modifier onlyForValidProposal(uint256 proposalId) {
        // 有効なProposalに対する処理
        require(proposals[proposalId].id != 0, "Invalid proposal ID.");
        require(
            proposals[proposalId].canceled == false,
            "The proposal has already canseled."
        );
        require(
            block.timestamp < proposals[proposalId].timestamp + VOTING_PERIOD,
            "This operation cannot be executed any more."
        );
        _;
    }

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

    function getSubmissions(uint256 proposalId, uint256 page)
        external
        view
        returns (Submission[] memory)
    {
        // 提出一覧
        uint256 originalLength = _submitters[proposalId].length;
        if (originalLength <= DATA_PER_PAGE * (page - 1)) {
            return new Submission[](0);
        }

        uint256 returnLength = DATA_PER_PAGE;
        if (originalLength < DATA_PER_PAGE * (page + 1)) {
            returnLength = originalLength - DATA_PER_PAGE * (page - 1);
        }

        Submission[] memory returnArray = new Submission[](returnLength);
        for (uint256 i = 0; i < returnLength; i++) {
            returnArray[i] = submissions[proposalId][
                _submitters[proposalId][DATA_PER_PAGE * (page - 1) + i]
            ];
        }
        return returnArray;
    }

    /* ########## not Pure/View External Functions ########## */

    function propose(
        string memory title,
        string memory description,
        uint256 reward
    ) external afterFreezing {
        _propose(msg.sender, title, description, reward);
    }

    function cancelProposal(uint256 proposalId)
        external
        onlyForValidProposal(proposalId)
    {
        proposals[proposalId].canceled = true;
    }

    function submitProduct(
        uint256 proposalId,
        string memory url,
        string memory comment
    ) external onlyForValidProposal(proposalId) {
        // 提出
        _submitters[proposalId].push(msg.sender);
        submissions[proposalId][msg.sender] = Submission(
            proposalId,
            msg.sender,
            url,
            comment
        );
    }

    // function vote(uint256 proposalId, address worker)
    //     external
    //     onlyForValidProposal(proposalId)
    // {
    //     // 投票
    //     // require();
    //     // TODO: 提案の採択, 報酬の支払い, 両方に対応
    //     // proposals[proposalId].totalVotes++;
    // }

    function claimReward(uint256 proposalId) external {
        // 報酬をclaim
        // Proposal memory proposal = proposals[proposalId];
        // MessiahToken20(subMessiahTokenAddress).transfer(_to, proposal.reward);
    }

    function claimMessiahToken() external afterFreezing {
        require(
            subOriginalTokenAddress != address(0),
            "Sub token doesn't set yet."
        );
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
        string memory description,
        uint256 reward
    ) private {
        uint256 timestamp = block.timestamp;
        uint256 id = uint256(
            keccak256(
                abi.encode(timestamp, proposer, title, description, reward)
            )
        );
        _proposalIds.push(id);
        proposals[id] = Proposal(
            id,
            timestamp,
            proposer,
            title,
            description,
            reward,
            false
        );
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

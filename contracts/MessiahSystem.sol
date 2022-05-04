//SPDX-License-Identifier: MIT
pragma solidity ^0.8.9;

import "hardhat/console.sol";

import "./MessiahTokens.sol";

contract MessiahSystem {
    /* ########## Event ########## */
    event Propose(address indexed proposer, uint256 proposalId);
    event Submit(address indexed submitter, uint256 submissionId);
    event Vote(address indexed voter, uint256 targetId, Option option);

    /* ########## Enum ########## */
    enum ProposalState {
        VOTING,
        DEVELOPING,
        COMPLETED,
        DEFEATED,
        CANCELED
    }

    enum Option {
        UNVOTED,
        FOR,
        AGAINST,
        ABSTAIN
    }

    /* ########## Struct ########## */

    struct Proposal {
        uint256 id;
        uint256 timestamp; // 提案時刻
        address proposer; // 提案者
        string title; // タイトル
        string description; // 説明
        uint256 reward; // 報酬額
        address resolver; // 最終的にrewardを受け取った人
        ProposalState state; // 状態
    }

    struct Submission {
        uint256 id;
        uint256 proposalId; // 対象のProposal ID
        address submitter; // 提出者
        string url; // 参考URL
        string comment; // コメント
    }

    struct Tally {
        uint256 totalFor; // 賛成
        uint256 totalAgainst; // 反対
        uint256 totalAbstain; // 棄権
    }

    /* ########## Variable ########## */

    // constant
    uint256 public constant FREEZING_PERIOD = 1 weeks; // TODO: 1 weeks;
    uint256 public constant VOTING_PERIOD = 1 weeks; // TODO: 1 weeks;
    uint256 public constant DATA_PER_PAGE = 100;

    // info
    uint256 public deploymentTimestamp;
    address public mainOriginalTokenAddress; // ERC721
    address public subOriginalTokenAddress; // ERC20
    MessiahToken20 public messiahToken; // ERC20

    // Proposal (proposal ID -> info)
    uint256[] private _proposalIds;
    mapping(uint256 => Proposal) public proposals;

    // Submission (proposal ID -> submissin ID -> info)
    mapping(uint256 => uint256[]) private _submissionIds;
    mapping(uint256 => Submission) public submissions;

    // Vote (account/proposal/submission ID -> info)
    mapping(uint256 => Tally) public tallies;
    mapping(uint256 => mapping(address => Option)) public votes;

    // Blacklist (運営アカウント)
    address[] private _blacklist;
    mapping(address => bool) public isBlacklisted;

    // Others
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

    modifier beforeFreezing() {
        // 資産ロック解除前の処理
        require(
            block.timestamp < deploymentTimestamp + FREEZING_PERIOD,
            "This operation cannot execute any more"
        );
        _;
    }

    modifier afterFreezing() {
        // 資産ロック解除後の処理
        require(
            block.timestamp > deploymentTimestamp + FREEZING_PERIOD,
            "This operation cannot be executed yet"
        );
        _;
    }

    modifier onlyForActiveProposal(uint256 proposalId) {
        // 有効なProposalに対する処理
        require(proposals[proposalId].id != 0, "Invalid proposal ID");
        _updateProposalState(proposalId);
        require(
            proposals[proposalId].state == ProposalState.VOTING ||
                proposals[proposalId].state == ProposalState.DEVELOPING,
            "This proposal is not active"
        );
        _;
    }

    /* ########## Pure/View Public/External Functions ########## */

    function accountId(address account) public pure returns (uint256) {
        return uint256(keccak256(abi.encode(account)));
    }

    function getBlacklist(uint256 page)
        external
        view
        returns (address[] memory)
    {
        // 運営アカウント一覧
        uint256 originalLength = _blacklist.length;
        if (originalLength <= DATA_PER_PAGE * (page - 1)) {
            return new address[](0);
        }

        uint256 returnLength = DATA_PER_PAGE;
        if (originalLength < DATA_PER_PAGE * (page + 1)) {
            returnLength = originalLength - DATA_PER_PAGE * (page - 1);
        }

        address[] memory returnArray = new address[](returnLength);
        for (uint256 i = 0; i < returnLength; i++) {
            returnArray[i] = _blacklist[DATA_PER_PAGE * (page - 1) + i];
        }
        return returnArray;
    }

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
        uint256 originalLength = _submissionIds[proposalId].length;
        if (originalLength <= DATA_PER_PAGE * (page - 1)) {
            return new Submission[](0);
        }

        uint256 returnLength = DATA_PER_PAGE;
        if (originalLength < DATA_PER_PAGE * (page + 1)) {
            returnLength = originalLength - DATA_PER_PAGE * (page - 1);
        }

        Submission[] memory returnArray = new Submission[](returnLength);
        for (uint256 i = 0; i < returnLength; i++) {
            returnArray[i] = submissions[
                _submissionIds[proposalId][DATA_PER_PAGE * (page - 1) + i]
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
        onlyForActiveProposal(proposalId)
    {
        require(
            proposals[proposalId].proposer == msg.sender,
            "This operation can be excuted by only proposer"
        );
        proposals[proposalId].state = ProposalState.CANCELED;
    }

    function submit(
        uint256 proposalId,
        string memory url,
        string memory comment
    ) external onlyForActiveProposal(proposalId) {
        // 提出
        require(
            proposals[proposalId].state == ProposalState.DEVELOPING,
            "Cannot submit now"
        );
        uint256 id = uint256(keccak256(abi.encode(proposalId, msg.sender)));
        _submissionIds[proposalId].push(id);
        submissions[id] = Submission(id, proposalId, msg.sender, url, comment);
        emit Submit(msg.sender, id);
    }

    function voteForBlacklist(address account, Option option)
        external
        beforeFreezing
    {
        _vote(accountId(account), option);
        // ブラックリスト入り判定
        if (!isBlacklisted[account]) {
            uint256 id = accountId(account);
            if (_isAccepted(id)) {
                _blacklist.push(account);
                isBlacklisted[account] = true;
            }
        }
    }

    function voteForProposal(uint256 proposalId, Option option)
        external
        onlyForActiveProposal(proposalId)
    {
        require(
            proposals[proposalId].state == ProposalState.VOTING,
            "Cannot vote now"
        );
        _vote(proposalId, option);
    }

    function voteForSubmission(uint256 submissionId, Option option) external {
        Submission memory submission = submissions[submissionId];
        require(submission.id != 0, "Invalid submission ID");
        require(
            proposals[submission.proposalId].state == ProposalState.DEVELOPING,
            "Cannot vote now"
        );
        _vote(submissionId, option);
    }

    function claimReward(uint256 submissionId) external {
        // 報酬をclaim
        Submission memory submission = submissions[submissionId];
        Proposal memory proposal = proposals[submission.proposalId];
        require(submission.id != 0, "Invalid submission ID");
        require(proposal.state == ProposalState.DEVELOPING, "Cannot vote now");
        require(_isAccepted(submissionId), "Not accepted");
        require(
            msg.sender == submission.submitter,
            "Can claim only by submitter"
        );
        proposals[submission.proposalId].resolver = msg.sender;
        messiahToken.transfer(msg.sender, proposal.reward);
    }

    function claimMessiahToken() external afterFreezing {
        require(
            subOriginalTokenAddress != address(0),
            "Sub token doesn't set yet"
        );
        require(isBlacklisted[msg.sender] == false, "You are blacklisted");
        require(hasClaimed[msg.sender] == false, "You've already claimed");
        uint256 amount = _fetchClaimableAmount(
            subOriginalTokenAddress,
            msg.sender
        );
        hasClaimed[msg.sender] = true;
        messiahToken.transfer(msg.sender, amount);
    }

    /* ########## Private Functions ########## */

    function _updateProposalState(uint256 proposalId) private {
        // Proposalのステート更新
        if (
            block.timestamp > proposals[proposalId].timestamp + VOTING_PERIOD &&
            proposals[proposalId].state == ProposalState.VOTING
        ) {
            if (_isAccepted(proposalId)) {
                proposals[proposalId].state = ProposalState.DEVELOPING;
            } else {
                proposals[proposalId].state = ProposalState.DEFEATED;
            }
        }
    }

    function _isAccepted(uint256 targetId) private view returns (bool) {
        // 採択されるか
        uint256 totalFor = tallies[targetId].totalFor;
        uint256 totalAgainst = tallies[targetId].totalAgainst;
        uint256 totalAbstain = tallies[targetId].totalAbstain;
        // (投票数がtotalSupplyの4%以上) かつ (賛成 > 反対)
        uint256 total = totalFor + totalAgainst + totalAbstain;
        // TODO
        // return
        //     (total * 100) / _fetchTotalSupply(mainOriginalTokenAddress) >= 4 &&
        //     totalFor > totalAgainst;
        return total > 0 && totalFor > totalAgainst;
    }

    function _propose(
        address proposer,
        string memory title,
        string memory description,
        uint256 reward
    ) private {
        require(
            reward <= messiahToken.balanceOf(address(this)),
            "Reward exceed the balance of this contract"
        );
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
            address(0),
            ProposalState.VOTING
        );
        emit Propose(proposer, id);
    }

    function _vote(uint256 targetId, Option option) private {
        // 投票 (提案の採択, 報酬の支払い, 両方に対応)
        uint256 balance = _fetchTokenBalance(
            mainOriginalTokenAddress,
            msg.sender
        );
        // Reset tally
        Option lastOption = votes[targetId][msg.sender];
        if (lastOption == Option.FOR) tallies[targetId].totalFor -= balance;
        else if (lastOption == Option.AGAINST)
            tallies[targetId].totalAgainst -= balance;
        else if (lastOption == Option.ABSTAIN)
            tallies[targetId].totalAbstain -= balance;
        // Update tally
        votes[targetId][msg.sender] = option;
        if (option == Option.FOR) tallies[targetId].totalFor += balance;
        else if (option == Option.AGAINST)
            tallies[targetId].totalAgainst += balance;
        else if (option == Option.ABSTAIN)
            tallies[targetId].totalAbstain += balance;
        // Emit event
        emit Vote(msg.sender, targetId, option);
    }

    function _setSubToken(address originalTokenAddress) private {
        // TODO: オリジナルトークンのスナップショット保存
        require(
            subOriginalTokenAddress == address(0),
            "Sub token has already set"
        );
        subOriginalTokenAddress = originalTokenAddress;
        messiahToken = new MessiahToken20(
            _fetchTokenName(originalTokenAddress),
            _fetchTokenSymbol(originalTokenAddress),
            _fetchTokenDecimals(originalTokenAddress)
        );
        messiahToken.mint(
            address(this),
            _fetchTotalSupply(originalTokenAddress)
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
        return 100;
    }

    function _fetchClaimableAmount(address tokenAddress, address claimer)
        private
        pure
        returns (uint256)
    {
        return 10;
    }
}

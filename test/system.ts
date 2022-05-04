import { assert, AssertionError, expect } from 'chai';
import { constants } from 'ethers/lib/index';
import { ethers } from 'hardhat';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import {
  MessiahSystem,
  MessiahSystemFactory,
  MessiahToken20,
  SimpleERC20,
  SimpleERC721,
} from '../typechain-types';

const ProposalState = {
  VOTING: 0,
  DEVELOPING: 1,
  COMPLETED: 2,
  DEFEATED: 3,
  CANCELED: 4,
} as const;

const Option = {
  UNVOTED: 0,
  FOR: 1,
  AGAINST: 2,
  ABSTAIN: 3,
} as const;

describe('System', () => {
  // Shared variables
  let signers: SignerWithAddress[];
  let mainToken: SimpleERC721;
  let subToken: SimpleERC20;
  let messiahToken: MessiahToken20;
  let factory: MessiahSystemFactory;
  let system: MessiahSystem;
  let proposal: MessiahSystem.ProposalStruct;
  let submission: MessiahSystem.SubmissionStruct;

  before(async () => {
    // Test signers
    signers = await ethers.getSigners();

    // Main Token (ERC721)
    mainToken = await ethers.getContractFactory('SimpleERC721').then(factory =>
      factory
        .deploy('Main', 'MT')
        .then(contract => contract.deployed())
        .then(token => {
          token.safeMint(signers[0].address, 0);
          token.safeMint(signers[0].address, 1);
          token.safeMint(signers[1].address, 2);
          token.safeMint(signers[2].address, 3);
          return token;
        })
    );

    // Sub Token (ERC20)
    subToken = await ethers.getContractFactory('SimpleERC20').then(factory =>
      factory
        .deploy('Sub', 'ST')
        .then(contract => contract.deployed())
        .then(token => {
          token.mint(signers[0].address, 100);
          return token;
        })
    );

    // Messiah System Factory
    factory = await ethers
      .getContractFactory('MessiahSystemFactory')
      .then(factory => factory.deploy().then(contract => contract.deployed()));
  });

  it('Deploy new Messiah System', async () => {
    await factory.deployMessiahSystem(mainToken.address, subToken.address);
    const messiahSystemAddress = await factory.messiahSystemAddress(
      mainToken.address
    );
    system = await ethers
      .getContractFactory('MessiahSystem')
      .then(factory => factory.attach(messiahSystemAddress));
  });

  it('Check token addresses', async () => {
    expect(await system.mainOriginalTokenAddress()).to.not.equal(
      constants.AddressZero
    );
    expect(await system.subOriginalTokenAddress()).to.not.equal(
      constants.AddressZero
    );
    expect(await system.messiahToken()).to.not.equal(constants.AddressZero);
  });

  it('Vote for blacklist', async () => {
    await system
      .connect(signers[0])
      .voteForBlacklist(signers[10].address, Option.FOR);
    await system
      .connect(signers[1])
      .voteForBlacklist(signers[10].address, Option.AGAINST);
    await system
      .connect(signers[2])
      .voteForBlacklist(signers[10].address, Option.ABSTAIN);

    const tally = await system.tallies(
      await system.accountId(signers[10].address)
    );
    expect(tally.totalFor).to.equal(2);
    expect(tally.totalAgainst).to.equal(1);
    expect(tally.totalAbstain).to.equal(1);
  });

  it('Cannot claim messsiah token yet', async () => {
    // Should be error
    try {
      await system.connect(signers[0]).claimMessiahToken();
      assert.fail();
    } catch (e) {
      if (e instanceof AssertionError) assert.fail();
    }
  });

  it('Wait until end freezing...', async () => {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 8_000));
  });

  it('Claim messsiah token', async () => {
    messiahToken = await ethers
      .getContractFactory('MessiahToken20')
      .then(async factory => factory.attach(await system.messiahToken()));
    expect(await messiahToken.balanceOf(signers[0].address)).to.equal(0);
    await system.connect(signers[0]).claimMessiahToken();
    expect(await messiahToken.balanceOf(signers[0].address)).to.not.equal(0);
  });

  it('Cannot claim messsiah token again', async () => {
    // Should be error
    try {
      await system.connect(signers[0]).claimMessiahToken();
      assert.fail();
    } catch (e) {
      if (e instanceof AssertionError) assert.fail();
    }
  });

  it('Blacklist account cannot claim messsiah token.', async () => {
    messiahToken = await ethers
      .getContractFactory('MessiahToken20')
      .then(async factory => factory.attach(await system.messiahToken()));
    expect(await messiahToken.balanceOf(signers[10].address)).to.equal(0);
    try {
      await system.connect(signers[10]).claimMessiahToken();
      assert.fail();
    } catch (e) {
      if (e instanceof AssertionError) assert.fail();
    }
    expect(await messiahToken.balanceOf(signers[10].address)).to.equal(0);
  });

  it('No proposal yet', async () => {
    const proposals = await system.getProposals(1);
    expect(proposals.length).to.equal(0);
  });

  it('Propose something', async () => {
    const receipt = await (
      await system.connect(signers[0]).propose('title', 'Some proposal', 10)
    ).wait();
    const proposalId = receipt.events?.[0].args?.proposalId;
    expect(proposalId.toString()).to.not.equal('0');
    proposal = await system.proposals(proposalId);
    expect(proposal.proposer).to.equal(signers[0].address);
    expect(proposal.title).to.equal('title');
    expect(proposal.description).to.equal('Some proposal');
    expect(proposal.reward).to.equal(10);
    expect(proposal.state).to.equal(ProposalState.VOTING);
  });

  it('Get all proposals', async () => {
    let proposals: MessiahSystem.ProposalStructOutput[] = [];
    let next, page;
    while (next === undefined || next.length !== 0) {
      next = await system.getProposals(page || 1);
      proposals = proposals.concat(next);
      page = (page || 1) + 1;
    }
    expect(proposals.length).to.equal(1);
    expect(proposals[0].id).to.equal(proposal.id);
    expect(proposals[0].timestamp).to.equal(proposal.timestamp);
    expect(proposals[0].proposer).to.equal(proposal.proposer);
    expect(proposals[0].title).to.equal(proposal.title);
    expect(proposals[0].description).to.equal(proposal.description);
    expect(proposals[0].reward).to.equal(proposal.reward);
    expect(proposals[0].state).to.equal(proposal.state);
  });

  it('Vote for the proposal', async () => {
    await system.connect(signers[0]).voteForProposal(proposal.id, Option.FOR);
    await system
      .connect(signers[1])
      .voteForProposal(proposal.id, Option.AGAINST);
    await system
      .connect(signers[2])
      .voteForProposal(proposal.id, Option.ABSTAIN);
    // Check own
    expect(
      await system.connect(signers[0]).votes(proposal.id, signers[0].address)
    ).to.equal(Option.FOR);
    // Check others
    expect(
      await system.connect(signers[0]).votes(proposal.id, signers[1].address)
    ).to.equal(Option.AGAINST);
    // Check tally
    const tally = await system.tallies(proposal.id);
    expect(tally.totalFor).to.equal(2);
    expect(tally.totalAgainst).to.equal(1);
    expect(tally.totalAbstain).to.equal(1);
  });

  it('Can change votes', async () => {
    await system.connect(signers[2]).voteForProposal(proposal.id, Option.FOR);
    const tally = await system.tallies(proposal.id);
    expect(tally.totalFor).to.equal(3);
    expect(tally.totalAgainst).to.equal(1);
    expect(tally.totalAbstain).to.equal(0);
  });

  it('Cannot submit product yet', async () => {
    // Should be error
    try {
      await system
        .connect(signers[0])
        .submit(proposal.id, 'https://...', 'brabrabra...');
      assert.fail();
    } catch (e) {
      if (e instanceof AssertionError) assert.fail();
    }
  });

  it('Wait until end proposal voting...', async () => {
    await new Promise<void>(resolve => setTimeout(() => resolve(), 8_000));
  });

  it('Submit product', async () => {
    const receipt = await (
      await system
        .connect(signers[0])
        .submit(proposal.id, 'https://...', 'brabrabra...')
    ).wait();
    const submissionId = receipt.events?.[0].args?.submissionId;
    submission = await system.submissions(submissionId);
    expect(submission.id).to.equal(submissionId);
    expect(submission.proposalId).to.equal(proposal.id);
    expect(submission.submitter).to.equal(signers[0].address);
    expect(submission.url).to.equal('https://...');
    expect(submission.comment).to.equal('brabrabra...');
  });

  it('Get all submissions', async () => {
    let submissions: MessiahSystem.SubmissionStructOutput[] = [];
    let next, page;
    while (next === undefined || next.length !== 0) {
      next = await system.getSubmissions(proposal.id, page || 1);
      submissions = submissions.concat(next);
      page = (page || 1) + 1;
    }
    expect(submissions.length).to.equal(1);
    expect(submissions[0].proposalId).to.equal(submission.proposalId);
    expect(submissions[0].submitter).to.equal(submission.submitter);
    expect(submissions[0].url).to.equal(submission.url);
    expect(submissions[0].comment).to.equal(submission.comment);
  });

  it('Vote for the submission', async () => {
    await system
      .connect(signers[0])
      .voteForSubmission(submission.id, Option.FOR);
    await system
      .connect(signers[1])
      .voteForSubmission(submission.id, Option.AGAINST);
    await system
      .connect(signers[2])
      .voteForSubmission(submission.id, Option.ABSTAIN);
    // Check own
    expect(
      await system.connect(signers[0]).votes(submission.id, signers[0].address)
    ).to.equal(Option.FOR);
    // Check others
    expect(
      await system.connect(signers[0]).votes(submission.id, signers[1].address)
    ).to.equal(Option.AGAINST);
    // Check tally
    const tally = await system.tallies(submission.id);
    expect(tally.totalFor).to.equal(2);
    expect(tally.totalAgainst).to.equal(1);
    expect(tally.totalAbstain).to.equal(1);
  });

  it('Claim reward', async () => {
    expect(await messiahToken.balanceOf(signers[0].address)).to.equal(10);
    await system.claimReward(submission.id);
    expect(await messiahToken.balanceOf(signers[0].address)).to.equal(
      10 + parseInt(proposal.reward.toString())
    );
  });

  it('Cannnot cancel the proposal by unproposer', async () => {
    // Should be error
    try {
      await system.connect(signers[1]).cancelProposal(proposal.id);
      assert.fail();
    } catch (e) {
      if (e instanceof AssertionError) assert.fail();
    }
  });

  it('Cancel the proposal', async () => {
    await system.connect(signers[0]).cancelProposal(proposal.id);
    proposal = await system.proposals(proposal.id);
    expect(proposal.state).to.equal(4);
  });

  it('Cannot submit/vote to the canceled proposal', async () => {
    // Should be error
    try {
      await system.submit(proposal.id, 'https://...', 'New submission');
      assert.fail();
    } catch (e) {
      if (e instanceof AssertionError) assert.fail();
    }
    try {
      await system.voteForProposal(proposal.id, Option.FOR);
      assert.fail();
    } catch (e) {
      if (e instanceof AssertionError) assert.fail();
    }
  });
});

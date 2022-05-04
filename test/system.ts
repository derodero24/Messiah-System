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

describe('System', () => {
  // Shared variables
  let signers: SignerWithAddress[];
  let mainToken: SimpleERC721;
  let subToken: SimpleERC20;
  let newSubToken: MessiahToken20;
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
          token.safeMint(signers[0].address, 1);
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

  it('Chack token addresses', async () => {
    expect(await system.mainOriginalTokenAddress()).to.not.equal(
      constants.AddressZero
    );
    expect(await system.subOriginalTokenAddress()).to.not.equal(
      constants.AddressZero
    );
    expect(await system.subMessiahTokenAddress()).to.not.equal(
      constants.AddressZero
    );
  });

  it('Claim messsiah token', async () => {
    const newSubTokenAddress = await system.subMessiahTokenAddress();
    newSubToken = await ethers
      .getContractFactory('MessiahToken20')
      .then(factory => factory.attach(newSubTokenAddress));
    expect(await newSubToken.balanceOf(signers[0].address)).to.equal(0);
    await system.connect(signers[0]).claimMessiahToken();
    expect(await newSubToken.balanceOf(signers[0].address)).to.not.equal(0);
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

  it('No proposal yet', async () => {
    const proposals = await system.getProposals(1);
    expect(proposals.length).to.equal(0);
  });

  it('Propose something', async () => {
    const receipt = await (
      await system.connect(signers[0]).propose('title', 'Some proposal', 100)
    ).wait();
    const proposalId = receipt.events?.[0].args?.proposalId;
    expect(proposalId.toString()).to.not.equal('0');
    proposal = await system.proposals(proposalId);
    expect(proposal.proposer).to.equal(signers[0].address);
    expect(proposal.title).to.equal('title');
    expect(proposal.description).to.equal('Some proposal');
    expect(proposal.reward).to.equal(100);
    expect(proposal.state).to.equal(0);
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
      await system
        .connect(signers[0])
        .submit(proposal.id, 'https://...', 'New submission');
      assert.fail();
    } catch (e) {
      if (e instanceof AssertionError) assert.fail();
    }
  });
});

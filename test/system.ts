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
  let candidate: MessiahSystem.CandidateStruct;

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

  it('Chake token addresses', async () => {
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

  it('Claim new sub token', async () => {
    const newSubTokenAddress = await system.subMessiahTokenAddress();
    newSubToken = await ethers
      .getContractFactory('MessiahToken20')
      .then(factory => factory.attach(newSubTokenAddress));
    expect(await newSubToken.balanceOf(signers[0].address)).to.equal(0);
    await system.connect(signers[0]).claimSubToken();
    expect(await newSubToken.balanceOf(signers[0].address)).to.not.equal(0);
  });

  it('Cannot claim new sub token again', async () => {
    // Should be error
    try {
      await system.connect(signers[0]).claimSubToken();
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
      await system.propose('title', 'Some proposal')
    ).wait();
    const proposalId = receipt.events?.[0].args?.proposalId;
    expect(proposalId.toString()).to.not.equal('0');

    proposal = await system.proposals(proposalId);
    expect(proposal.proposer).to.equal(signers[0].address);
    expect(proposal.title).to.equal('title');
    expect(proposal.description).to.equal('Some proposal');
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
    expect(proposals[0].timestamp.toString()).to.not.equal('0');
    expect(proposals[0].proposer).to.equal(signers[0].address);
    expect(proposals[0].title).to.equal('title');
    expect(proposals[0].description).to.equal('Some proposal');
    expect(proposals[0].totalVotes).to.equal(0);
  });

  it('No candidate yet', async () => {
    const candidates = await system.getCandidates(proposal.id, 1);
    expect(candidates.length).to.equal(0);
  });

  it('Run for proposal', async () => {
    await system
      .connect(signers[0])
      .runForProposal(proposal.id, 'First proposer', 'https://...');
    candidate = await system.candidates(proposal.id, signers[0].address);
    expect(candidate.addr).to.equal(signers[0].address);
    expect(candidate.name).to.equal('First proposer');
    expect(candidate.url).to.equal('https://...');
  });

  it('Cannot run for same proposal again', async () => {
    // Should be error
    try {
      await system
        .connect(signers[0])
        .runForProposal(proposal.id, 'Same proposer', 'http://...');
      assert.fail();
    } catch (e) {
      if (e instanceof AssertionError) assert.fail();
    }
  });

  it('Get all candidates', async () => {
    let candidates: MessiahSystem.CandidateStructOutput[] = [];
    let next, page;
    while (next === undefined || next.length !== 0) {
      next = await system.getCandidates(proposal.id, page || 1);
      candidates = candidates.concat(next);
      page = (page || 1) + 1;
    }
    expect(candidates.length).to.equal(1);
    expect(candidates[0].addr).to.equal(signers[0].address);
    expect(candidates[0].name).to.equal('First proposer');
    expect(candidates[0].url).to.equal('https://...');
  });
});

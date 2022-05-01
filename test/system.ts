import { assert, AssertionError, expect } from 'chai';
import { BigNumber, constants } from 'ethers/lib/index';
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

  it('Propose something', async () => {
    const receipt = await (
      await system.propose('title', 'Some proposal')
    ).wait();

    const proposalId: BigNumber = receipt.events?.[0].args?.proposalId;
    expect(proposalId.toString()).to.not.equal('0');

    const proposal = await system.connect(signers[0]).proposalMap(proposalId);
    expect(proposal.proposer).to.equal(signers[0].address);
    expect(proposal.title).to.equal('title');
    expect(proposal.description).to.equal('Some proposal');
  });
});

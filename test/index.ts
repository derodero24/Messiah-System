import { expect } from 'chai';
import { constants } from 'ethers/lib/index';
import { getAddress } from 'ethers/lib/utils';
import { ethers } from 'hardhat';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import {
  ERC20,
  ERC721,
  MessiahSystem,
  MessiahSystemFactory,
} from '../typechain-types';

describe('Greeter', () => {
  let originalToken20: ERC20;
  let originalToken721: ERC721;
  let user1: SignerWithAddress, user2: SignerWithAddress;
  let messiahSystemFactory: MessiahSystemFactory;
  let messiahSystem: MessiahSystem;

  // let sampleToken1: ERC20;

  before(async () => {
    // Prepare original tokens
    const _ERC20 = await ethers.getContractFactory('ERC20');
    originalToken20 = await _ERC20.deploy('Original', 'ORG');
    await originalToken20.deployed();
    const _ERC721 = await ethers.getContractFactory('ERC721');
    originalToken721 = await _ERC721.deploy('Original', 'ORG');
    await originalToken721.deployed();

    // Test users
    [user1, user2] = await ethers.getSigners();

    // Deploy factory contract
    const _MessiahSystemFactory = await ethers.getContractFactory(
      'MessiahSystemFactory'
    );
    messiahSystemFactory = await _MessiahSystemFactory.deploy();
    await messiahSystemFactory.deployed();
  });

  it('Deploy new Messiah System', async () => {
    // before deploy
    const targetAddress = originalToken721.address;
    let messiahInfo = await messiahSystemFactory.messiahInfo(targetAddress);
    expect(messiahInfo.messiahSystemAddress).to.equal(constants.AddressZero);
    expect(messiahInfo.messiahTokenAddress).to.equal(constants.AddressZero);

    // after deploy
    await messiahSystemFactory.deployMessiah(targetAddress);
    messiahInfo = await messiahSystemFactory.messiahInfo(targetAddress);
    expect(messiahInfo.messiahSystemAddress).to.not.equal(
      constants.AddressZero
    );
    expect(messiahInfo.messiahTokenAddress).to.not.equal(constants.AddressZero);

    // check greet function
    const _MessiahSystem = await ethers.getContractFactory('MessiahSystem');
    messiahSystem = _MessiahSystem.attach(messiahInfo.messiahSystemAddress);
    expect(await messiahSystem.greet()).to.equal('hello');
  }).timeout(60_000); // set 60 second timeout
});

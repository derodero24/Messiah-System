import { assert, AssertionError, expect } from 'chai';
import { ethers } from 'hardhat';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import {
  MessiahSystemFactory,
  SimpleERC20,
  SimpleERC721,
} from '../typechain-types';

describe('Factory', () => {
  // Shared variables
  let signers: SignerWithAddress[];
  let mainToken: SimpleERC721;
  let subToken: SimpleERC20;
  let factory: MessiahSystemFactory;

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

  it('Before deploy Messiah-System', async function () {
    const messiahSystemAddress = await factory.messiahSystemAddress(
      mainToken.address
    );
    expect(messiahSystemAddress).to.equal(ethers.constants.AddressZero);
  });

  it('After deploy Messiah-System', async function () {
    await factory.deployMessiahSystem(mainToken.address, subToken.address);
    const messiahSystemAddress = await factory.messiahSystemAddress(
      mainToken.address
    );
    expect(messiahSystemAddress).to.not.equal(ethers.constants.AddressZero);
  });

  it('Cannot deploy same Messiah-System', async function () {
    // Should be error
    try {
      await factory.deployMessiahSystem(mainToken.address, subToken.address);
      assert.fail();
    } catch (e) {
      if (e instanceof AssertionError) assert.fail();
    }
  });
});

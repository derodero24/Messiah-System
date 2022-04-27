import { expect } from 'chai';
import { ethers } from 'hardhat';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { MessiahSystemFactory, MessiahToken721 } from '../typechain-types';

describe('Factory', () => {
  // Shared variables
  let signers: SignerWithAddress[];
  let token: MessiahToken721;
  let factory: MessiahSystemFactory;

  before(async () => {
    // Test signers
    signers = await ethers.getSigners();

    // NFT
    const _MessiahToken721 = await ethers.getContractFactory('MessiahToken721');
    token = await _MessiahToken721
      .deploy('MainNFT', 'MNFT')
      .then(contract => contract.deployed())
      .then(token => {
        token.safeMint(signers[0].address, 1);
        return token;
      });

    // MessiahSystemFactory
    const _MessiahSystemFactory = await ethers.getContractFactory(
      'MessiahSystemFactory'
    );
    factory = await _MessiahSystemFactory
      .deploy()
      .then(contract => contract.deployed());
  });

  it('before deploy Messiah-System', async function () {
    const messiahSystemAddress = await factory.messiahSystemAddress(
      token.address
    );
    expect(messiahSystemAddress).to.equal(ethers.constants.AddressZero);
  });

  it('after deploy Messiah-System', async function () {
    await factory.deployMessiahSystem(token.address);
    const messiahSystemAddress = await factory.messiahSystemAddress(
      token.address
    );
    expect(messiahSystemAddress).to.not.equal(ethers.constants.AddressZero);
  });
});

import { expect } from 'chai';
import { ethers } from 'hardhat';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { MessiahToken721 } from '../typechain-types';

describe('Token', () => {
  // Shared variables
  let signers: SignerWithAddress[];
  let token: MessiahToken721;

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
        token.safeMint(signers[1].address, 2);
        token.safeMint(signers[2].address, 3);
        token.safeMint(signers[2].address, 4);
        return token;
      });
  });

  it('Vote by NFT owners', async function () {
    // signers[0] (has 1 NFT) -> signers[2]
    await token.connect(signers[0]).delegate(signers[2].address);

    // signers[1] (has 1 NFT) -> signers[2]
    await token.connect(signers[1]).delegate(signers[2].address);
    await token.connect(signers[1]).delegate(signers[1].address); // overwrite

    // signers[2] (has 2 NFTs) -> signers[0]
    await token.connect(signers[2]).delegate(signers[0].address);

    // signers[3] (has 0 NFT) -> signers[1]
    await token.connect(signers[3]).delegate(signers[1].address);

    // voting results
    expect(await token.getVotes(signers[0].address)).to.equal(2);
    expect(await token.getVotes(signers[1].address)).to.equal(1);
    expect(await token.getVotes(signers[2].address)).to.equal(1);
    expect(await token.getVotes(signers[3].address)).to.equal(0);
  });

  it('Votes are discarded when send NFTs', async function () {
    // transfer 1 NFT from signers[2] to signers[4]
    // signers[4] has not voted yet
    await token
      .connect(signers[2])
      .transferFrom(signers[2].address, signers[4].address, 3);

    // voting results
    expect(await token.getVotes(signers[0].address)).to.equal(1);
    expect(await token.getVotes(signers[1].address)).to.equal(1);
    expect(await token.getVotes(signers[2].address)).to.equal(1);
    expect(await token.getVotes(signers[3].address)).to.equal(0);
  });

  it("Vote changed to new owner's choice", async function () {
    // signers[5] (has 0 NFT) -> signers[3]
    await token.connect(signers[5]).delegate(signers[3].address);

    // transfer 1 NFT from signers[2] to signers[5]
    await token
      .connect(signers[2])
      .transferFrom(signers[2].address, signers[5].address, 4);

    // voting results
    expect(await token.getVotes(signers[0].address)).to.equal(0);
    expect(await token.getVotes(signers[1].address)).to.equal(1);
    expect(await token.getVotes(signers[2].address)).to.equal(1);
    expect(await token.getVotes(signers[3].address)).to.equal(1);
  });
});

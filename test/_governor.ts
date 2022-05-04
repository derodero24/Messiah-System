import { expect } from 'chai';
import { ethers } from 'hardhat';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import { MessiahGovernor, MessiahToken721 } from '../typechain-types';

describe('Governor', () => {
  // Shared variables
  let signers: SignerWithAddress[];
  let token: MessiahToken721;
  let governor: MessiahGovernor;

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

    // Governor
    const _MessiahGovernor = await ethers.getContractFactory('MessiahGovernor');
    governor = await _MessiahGovernor
      .deploy(token.address)
      .then(contract => contract.deployed());

    //
    // const _ERC20 = await ethers.getContractFactory('SimpleERC20');
    // relatedFT = await _ERC20
    //   .deploy('RelatedFT', 'RFT')
    //   .then(contract => contract.deployed())
    //   .then(token => {
    //     token.mint(signers[0].address, 100);
    //     token.mint(signers[1].address, 200);
    //     return token;
    //   });
  });

  it('propose and execute a proposal', async function () {
    const now = await ethers.provider
      .getBlock('latest')
      .then(block => block.timestamp);
    console.log('now:', now);

    const calldata = new ethers.utils.AbiCoder().encode([], []);

    // const txn = await governor[
    //   'propose(address[],uint256[],string[],bytes[],string)'
    // ]([this.token.address], [0], ['totalSupply()'], [calldata], 'Send no ETH');

    const txn = await governor
      .connect(signers[0])
      .propose([token.address], [0], [calldata], 'Send no ETH');

    const receipt = await txn.wait();
    const event_args = receipt.events?.[0].args;

    const proposalId = event_args?.proposalId;
    const proposer = event_args?.proposer;
    const description = event_args?.description;

    console.log('proposalId:', proposalId);
    console.log('proposer:', proposer);
    console.log('description:', description);
    console.log('signers[0]:', signers[0].address);
    console.log((await governor.proposalSnapshot(proposalId)).toString());
    console.log(
      (await governor.proposalSnapshot(signers[0].address)).toString()
    );

    // check proposal id exists
    // expect(await governor.proposalSnapshot(proposalId).toString()).to.eql('0');

    // await hre.network.provider.send('evm_mine');

    // await this.governor.castVote(proposalId, 1);

    // // check we have voted
    // expect(
    //   (await this.governor.proposals(proposalId)).forVotes.toString()
    // ).to.eql('4');

    // await this.governor['queue(uint256)'](proposalId);

    // now = await hre.waffle.provider
    //   .getBlock('latest')
    //   .then(block => block.timestamp);
    // await hre.network.provider.request({
    //   method: 'evm_setNextBlockTimestamp',
    //   params: [now + 11],
    // });

    // await this.governor['execute(uint256)'](proposalId);

    // // check it executed
    // expect((await this.governor.proposals(proposalId)).executed).to.eql(true);
  });
});

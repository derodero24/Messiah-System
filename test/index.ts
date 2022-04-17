import { expect } from 'chai';
import { constants } from 'ethers/lib/index';
import { ethers } from 'hardhat';

import { SignerWithAddress } from '@nomiclabs/hardhat-ethers/signers';

import {
  MessiahSystem,
  MessiahSystem__factory,
  MessiahSystemFactory,
  MessiahSystemFactory__factory,
  MessiahToken20,
  MessiahToken20__factory,
  MessiahToken721,
  MessiahToken721__factory,
  SimpleERC20,
  SimpleERC20__factory,
  SimpleERC721,
  SimpleERC721__factory,
} from '../typechain-types';

describe('Greeter', () => {
  // Contract Factories
  let _ERC20: SimpleERC20__factory;
  let _ERC721: SimpleERC721__factory;
  let _MessiahSystemFactory: MessiahSystemFactory__factory;
  let _MessiahSystem: MessiahSystem__factory;
  let _MessiahToken721: MessiahToken721__factory;
  let _MessiahToken20: MessiahToken20__factory;

  // Shared variables
  let signers: SignerWithAddress[];
  let mainNFT: SimpleERC721, relatedFT: SimpleERC20;
  let messiahSystemFactory: MessiahSystemFactory;
  let messiahSystem: MessiahSystem;
  let mainMessiahToken: MessiahToken721, relatedMessiahToken: MessiahToken20;

  before(async () => {
    // Contract Factories
    _ERC20 = await ethers.getContractFactory('SimpleERC20');
    _ERC721 = await ethers.getContractFactory('SimpleERC721');
    _MessiahSystemFactory = await ethers.getContractFactory(
      'MessiahSystemFactory'
    );
    _MessiahSystem = await ethers.getContractFactory('MessiahSystem');
    _MessiahToken721 = await ethers.getContractFactory('MessiahToken721');
    _MessiahToken20 = await ethers.getContractFactory('MessiahToken20');

    // Test signers
    signers = await ethers.getSigners();

    // Prepare original tokens
    mainNFT = await _ERC721
      .deploy('MainNFT', 'MNFT')
      .then(contract => contract.deployed())
      .then(token => {
        token.safeMint(signers[0].address, 1);
        token.safeMint(signers[1].address, 2);
        return token;
      });
    relatedFT = await _ERC20
      .deploy('RelatedFT', 'RFT')
      .then(contract => contract.deployed())
      .then(token => {
        token.mint(signers[0].address, 100);
        token.mint(signers[1].address, 200);
        return token;
      });

    // Deploy factory contract
    messiahSystemFactory = await _MessiahSystemFactory
      .deploy()
      .then(contract => contract.deployed());
  });

  it('Deploy new Messiah System', async () => {
    // before deploy
    const targetAddress = mainNFT.address;
    let messiahSystemAddress = await messiahSystemFactory.messiahSystemAddress(
      targetAddress
    );
    expect(messiahSystemAddress).to.equal(constants.AddressZero);

    // after deploy
    await messiahSystemFactory.deployMessiah(targetAddress);
    messiahSystemAddress = await messiahSystemFactory.messiahSystemAddress(
      targetAddress
    );
    expect(messiahSystemAddress).to.not.equal(constants.AddressZero);
    messiahSystem = _MessiahSystem.attach(messiahSystemAddress);
  });

  it('Fetch Messiah System infomation', async () => {
    // check greet function
    const mainMessiahTokenAddress = await messiahSystem.mainMessiahToken();
    expect(mainMessiahTokenAddress).to.not.equal(constants.AddressZero);
    mainMessiahToken = _MessiahToken721.attach(mainMessiahTokenAddress);

    // console.log(blockNumber);
    // console.log(await (await mainNFT.balanceOf(signers[0].address)).toString());
    // console.log(await mainNFT.name());
    // console.log(await mainNFT.safeMint(signers[0].address, 1));
    // console.log(await (await mainNFT.balanceOf(signers[0].address)).toString());
    // console.log(
    //   await (await relatedFT.balanceOf(signers[0].address)).toString()
    // );
    // console.log(await relatedFT.mint());
    // console.log(await mainMessiahToken.getPastTotalSupply(blockNumber));

    expect(await messiahSystem.greet()).to.equal('hello');
  });
});

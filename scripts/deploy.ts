import { ethers } from 'hardhat';

async function main() {
  // MessiahSystemFactory
  await ethers
    .getContractFactory('MessiahSystemFactory')
    .then(factory => factory.deploy().then(contract => contract.deployed()))
    .then(contract =>
      console.log('MessiahSystemFactory deployed to:', contract.address)
    );

  // Main token
  await ethers
    .getContractFactory('SimpleERC721')
    .then(factory =>
      factory.deploy('Main', 'MAIN').then(contract => contract.deployed())
    )
    .then(token => console.log('SimpleERC721 deployed to:', token.address));

  // Sub token
  await ethers
    .getContractFactory('SimpleERC20')
    .then(factory =>
      factory.deploy('Sub', 'SUB').then(contract => contract.deployed())
    )
    .then(token => console.log('SimpleERC20 deployed to:', token.address));
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

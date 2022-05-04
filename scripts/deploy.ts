import { ethers } from 'hardhat';

async function main() {
  const operator = '0xb199c3D287a207A215DF500ffA06C58F26000713';
  const signers = await ethers.getSigners();

  // Send Ether
  await signers[0].sendTransaction({
    to: operator,
    value: ethers.utils.parseEther('1.0'),
  });

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
    .then(token => {
      token.safeMint(operator, 0);
      console.log('SimpleERC721 deployed to:', token.address);
    });

  // Sub token
  await ethers
    .getContractFactory('SimpleERC20')
    .then(factory =>
      factory.deploy('Sub', 'SUB').then(contract => contract.deployed())
    )
    .then(token => {
      token.mint(operator, 10);
      console.log('SimpleERC20 deployed to:', token.address);
    });
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

import { ethers } from 'hardhat';

async function main() {
  const accounts = [
    '0xb199c3D287a207A215DF500ffA06C58F26000713',
    '0xE3D094a5C68732C9E5D6574AC4071dC0d8bE151E',
    '0xE3D094a5C68732C9E5D6574AC4071dC0d8bE151E',
    '0xE3D094a5C68732C9E5D6574AC4071dC0d8bE151E',
    '0xE3D094a5C68732C9E5D6574AC4071dC0d8bE151E',
    '0xE3D094a5C68732C9E5D6574AC4071dC0d8bE151E',
  ];
  const signers = await ethers.getSigners();

  // Send Ether
  await signers[0].sendTransaction({
    to: accounts[0],
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
      factory.deploy('AsmaH', 'ASMA').then(contract => contract.deployed())
    )
    .then(token => {
      accounts.map((account, idx) => token.safeMint(account, idx));
      console.log('SimpleERC721 deployed to:', token.address);
    });

  // Sub token
  await ethers
    .getContractFactory('SimpleERC20')
    .then(factory =>
      factory.deploy('AstH', 'ASH').then(contract => contract.deployed())
    )
    .then(token => {
      token.mint(accounts[0], 800000);
      token.mint(accounts[1], 100000);
      token.mint(accounts[2], 50000);
      token.mint(accounts[3], 50000);
      console.log('SimpleERC20 deployed to:', token.address);
    });
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

import { ethers } from 'hardhat';

async function main() {
  const accounts = [
    '0x84f81f38Dc4022E07cd2E0a53d2300bf261cE3E4',
    '0x6aB12FfB76594E2e74eff3FD005E167968c08513',
    '0x9B1Eb2675936b3e34A4d348F3e578fF4Cf712a07',
    '0xbDe3fc03A1d368ad635aa1be17fEd5E55c801Ed5',
    '0xD7457Ff5a1600f79098f22F44297Cf616F2bFA57',
    '0x7a45E14e948B8072956590c6b9fa58DA099F1431',
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
    .then((factory) => factory.deploy().then((contract) => contract.deployed()))
    .then((contract) =>
      console.log('MessiahSystemFactory deployed to:', contract.address)
    );

  // Main token
  await ethers
    .getContractFactory('SimpleERC721')
    .then((factory) =>
      factory.deploy('AsmaH', 'ASMA').then((contract) => contract.deployed())
    )
    .then((token) => {
      accounts.map((account, idx) => token.safeMint(account, idx));
      console.log('SimpleERC721 deployed to:', token.address);
    });

  // Sub token
  await ethers
    .getContractFactory('SimpleERC20')
    .then((factory) =>
      factory.deploy('AstH', 'ASH').then((contract) => contract.deployed())
    )
    .then((token) => {
      token.mint(accounts[0], 800000);
      token.mint(accounts[1], 100000);
      token.mint(accounts[2], 50000);
      token.mint(accounts[3], 50000);
      console.log('SimpleERC20 deployed to:', token.address);
    });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

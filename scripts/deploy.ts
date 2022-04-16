import { ethers } from 'hardhat';

async function main() {
  const MessiahSystemFactory = await ethers.getContractFactory(
    'MessiahSystemFactory'
  );
  const messiahSystemFactory = await MessiahSystemFactory.deploy();
  await messiahSystemFactory.deployed();
  console.log('Greeter deployed to:', messiahSystemFactory.address);
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

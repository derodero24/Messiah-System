import { ethers } from 'hardhat';

async function main() {
  // const MessiahSystemFactory = await ethers.getContractFactory(
  //   'MessiahSystemFactory'
  // );
  // const messiahSystemFactory = await MessiahSystemFactory.deploy();
  // await messiahSystemFactory.deployed();
  // console.log('Greeter deployed to:', messiahSystemFactory.address);

  const MessiahToken721 = await ethers.getContractFactory('MessiahToken721');
  const messiahToken721 = await MessiahToken721.deploy('MessiahToken2', 'MT2');
  await messiahToken721.deployed();
  await messiahToken721.safeMint(
    '0xb199c3D287a207A215DF500ffA06C58F26000713',
    1
  );
  await messiahToken721.safeMint(
    '0xb199c3D287a207A215DF500ffA06C58F26000713',
    2
  );
  await messiahToken721.safeMint(
    '0xE3D094a5C68732C9E5D6574AC4071dC0d8bE151E',
    3
  );
  console.log('MessiahToken721 deployed to:', messiahToken721.address);

  const MessiahGovernor = await ethers.getContractFactory('MessiahGovernor');
  const messiahGovernor = await MessiahGovernor.deploy(messiahToken721.address);
  await messiahGovernor.deployed();
  console.log('MessiahGovernor deployed to:', messiahGovernor.address);

  // MessiahToken721 deployed to: 0x64626bF4e7b7D9fBc53aa5C2F482d4c8d67924DD
  // MessiahGovernor deployed to: 0xb72581c82CbBe2023663faC7a4462bdB389414D0

  // MessiahToken721 = await ethers.getContractFactory('MessiahToken721');
  // await MessiahToken721.attach(
  //   '0x64626bF4e7b7D9fBc53aa5C2F482d4c8d67924DD'
  // ).transferFrom(
  //   '0xb199c3D287a207A215DF500ffA06C58F26000713',
  //   '0xE3D094a5C68732C9E5D6574AC4071dC0d8bE151E',
  //   1000
  // );
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});

import 'solidity-coverage';
import '@nomiclabs/hardhat-waffle';
import '@typechain/hardhat';

import * as dotenv from 'dotenv';
import { HardhatUserConfig, task } from 'hardhat/config';

dotenv.config();
const { RINKEBY_URL, PRIVATE_KEY } = process.env;

// Custom hardhat command
task('accounts', 'Prints the list of accounts', async (_taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();
  for (const account of accounts) {
    console.log(account.address);
  }
});

const config: HardhatUserConfig = {
  solidity: '0.8.9',
  networks: {
    rinkeby: {
      url: RINKEBY_URL,
      accounts: [`0x${PRIVATE_KEY}`],
    },
    shibuya: {
      url: 'https://rpc.shibuya.astar.network:8545',
      chainId: 81,
      accounts: [`0x${PRIVATE_KEY}`],
    },
  },
};

export default config;

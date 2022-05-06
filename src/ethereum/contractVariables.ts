import { BigNumber } from 'ethers';

import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';

import { MessiahSystem, MessiahSystemFactory } from '../../typechain-types';

export const MessiahSystemFactoryAddress =
  '0x904C812bF06c9bDb325ADE79Da87096af49F7E5f';

export type Wallet =
  | {
      provider: Web3Provider;
      signer: JsonRpcSigner;
      address: string;
      contract: {
        messiahSystemFactory: MessiahSystemFactory;
        messiahSystem?: MessiahSystem;
      };
    }
  | undefined;

export type Tally = {
  totalFor: BigNumber; // 賛成
  totalAgainst: BigNumber; // 反対
  totalAbstain: BigNumber; // 棄権
};

export const ProposalState = {
  VOTING: 0,
  DEVELOPING: 1,
  COMPLETED: 2,
  DEFEATED: 3,
  CANCELED: 4,
} as const;

export const Option = {
  UNVOTED: 0,
  FOR: 1,
  AGAINST: 2,
  ABSTAIN: 3,
} as const;

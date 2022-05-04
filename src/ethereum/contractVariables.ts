import { JsonRpcSigner, Web3Provider } from '@ethersproject/providers';

import { MessiahSystem, MessiahSystemFactory } from '../../typechain-types';

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

import { BigNumberish, Contract } from 'ethers';
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ExternalProvider,
  JsonRpcSigner,
  Provider,
  Web3Provider,
} from '@ethersproject/providers';

import { MessiahSystem, MessiahSystemFactory } from '../../typechain-types';
import messiahSystem from './abi/MessiahSystem.json';
import messiahSystemFactory from './abi/MessiahSystemFactory.json';

declare global {
  interface Window {
    ethereum: Provider & ExternalProvider;
  }
}

type Wallet =
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

export const WalletContext = createContext({
  wallet: undefined as Wallet,
  connectWallet: () => {},
  checkMessiahExists: async erc721Add => null as string,
  deployMessiahSystem: async (_erc721Addr: string, _erc20Addr: string) => {},
  updateContract: async messiahSystemAddressInput => {},
  getProposals: async (_page: number) =>
    [] as MessiahSystem.ProposalStructOutput[],
  submitProposal: async (
    _title: string,
    _description: string,
    _reward: number
  ) => {},
  voteForBlacklist: (_account: string, _option: BigNumberish) => {},
  voteForProposal: (_proposalId: BigNumberish, _option: BigNumberish) => {},
  voteForSubmission: (_submissionId: BigNumberish, _option: BigNumberish) => {},
});

const contractAddress = '0x5d06B61384b8dd54A35506addE6a691E11D27831';

export default function WalletProvider(props: { children: ReactNode }) {
  const [wallet, setWallet] = useState<Wallet>();
  const [walletAddress, setWalletAddress] = useState('');
  const [messiahSystemAddress, setMessiahSystemAddress] = useState('');

  const connectWallet = useCallback(() => {
    if (window.ethereum?.isMetaMask) {
      window.ethereum
        .request?.({ method: 'eth_requestAccounts' })
        .then((accounts: string[]) => {
          onAccountsChanged(accounts);
        })
        .catch(error => {
          console.log('An error occurred while connecting MetaMask:', error);
        });
    } else {
      console.log('MetaMask is not installed.');
    }
  }, []);

  const onAccountsChanged = (addresses: string[]) => {
    if (!addresses.length) {
      setWallet(undefined);
    } else {
      const provider = new Web3Provider(window.ethereum);
      const signer = provider.getSigner();

      const messiahSystemFactoryContract = new Contract(
        contractAddress,
        messiahSystemFactory.abi,
        signer
      ) as MessiahSystemFactory;

      let messiahSystemContract;

      if (messiahSystemAddress) {
        messiahSystemContract = new Contract(
          messiahSystemAddress,
          messiahSystem.abi,
          signer
        ) as MessiahSystem;
      } else {
        messiahSystemContract = undefined;
      }

      setWalletAddress(addresses[0]);

      setWallet({
        provider,
        signer,
        address: addresses[0],
        contract: {
          messiahSystemFactory: messiahSystemFactoryContract,
          messiahSystem: messiahSystemContract,
        },
      });
    }
  };

  useEffect(() => {
    // Connect on page load
    connectWallet();
  }, [connectWallet]);

  useEffect(() => {
    if (!wallet) return;
    window.ethereum.on('accountsChanged', onAccountsChanged);
    window.ethereum.on('chainChanged', () => window.location.reload());
  }, [wallet]);

  const checkMessiahExists = async (erc721Add: string) => {
    const res =
      await wallet?.contract.messiahSystemFactory.messiahSystemAddress(
        erc721Add
      );
    return res;
  };

  const deployMessiahSystem = async (erc721Add: string, erc20Add: string) => {
    await wallet?.contract.messiahSystemFactory.deployMessiahSystem(
      erc721Add,
      erc20Add
    );
  };

  const updateContract = async (messiahSystemAddressInput: string) => {
    console.log(messiahSystemAddressInput);
    setMessiahSystemAddress(messiahSystemAddressInput);

    const provider = new Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const messiahSystemFactoryContract = new Contract(
      contractAddress,
      messiahSystemFactory.abi,
      signer
    ) as MessiahSystemFactory;

    const messiahSystemContract = new Contract(
      messiahSystemAddressInput,
      messiahSystem.abi,
      signer
    ) as MessiahSystem;

    setWallet({
      provider,
      signer,
      address: walletAddress,
      contract: {
        messiahSystemFactory: messiahSystemFactoryContract,
        messiahSystem: messiahSystemContract,
      },
    });
  };

  const getProposals = async (page: number) => {
    if (!wallet?.contract.messiahSystem) return [];
    return wallet.contract.messiahSystem.getProposals(page);
  };

  const submitProposal = async (
    title: string,
    description: string,
    reward: number
  ) => {
    await wallet?.contract.messiahSystem?.propose(title, description, reward);
  };

  const voteForBlacklist = async (account: string, option: BigNumberish) => {
    await wallet?.contract.messiahSystem?.voteForBlacklist(account, option);
  };

  const voteForProposal = async (
    proposalId: BigNumberish,
    option: BigNumberish
  ) => {
    await wallet?.contract.messiahSystem?.voteForProposal(proposalId, option);
  };

  const voteForSubmission = async (
    submissionId: BigNumberish,
    option: BigNumberish
  ) => {
    await wallet?.contract.messiahSystem?.voteForSubmission(
      submissionId,
      option
    );
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connectWallet,
        checkMessiahExists,
        deployMessiahSystem,
        updateContract,
        getProposals,
        submitProposal,
        voteForBlacklist,
        voteForProposal,
        voteForSubmission,
      }}
    >
      {props.children}
    </WalletContext.Provider>
  );
}

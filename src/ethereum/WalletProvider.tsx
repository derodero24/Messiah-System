import { BigNumber, BigNumberish, Contract } from 'ethers';
import {
  createContext,
  ReactNode,
  useCallback,
  useEffect,
  useState,
} from 'react';

import {
  ExternalProvider,
  Provider,
  Web3Provider,
} from '@ethersproject/providers';

import { MessiahSystem, MessiahSystemFactory } from '../../typechain-types';
import messiahSystem from './abi/MessiahSystem.json';
import messiahSystemFactory from './abi/MessiahSystemFactory.json';
import {
  MessiahSystemFactoryAddress,
  Tally,
  Wallet,
} from './contractVariables';

declare global {
  interface Window {
    ethereum: Provider & ExternalProvider;
  }
}

export const WalletContext = createContext({
  wallet: undefined as Wallet,
  connectWallet: () => {},
  checkMessiahExists: async (_erc721Add: string) => '' as undefined | string,
  deployMessiahSystem: async (_erc721Addr: string, _erc20Addr: string) => {},
  updateContract: async (_addr: string) => {},
  // Getter
  getBlacklist: async (_page: number) => [] as string[],
  getProposals: async (_page: number) =>
    [] as MessiahSystem.ProposalStructOutput[],
  getSubmissions: async (_proposalId: BigNumberish, _page: number) =>
    [] as MessiahSystem.SubmissionStructOutput[],
  getTally: async (_id: BigNumberish) => undefined as undefined | Tally,
  // Propose
  submitProposal: async (
    _title: string,
    _description: string,
    _reward: number
  ) => {},
  // Submit
  submitProduct: async (
    _proposalId: BigNumberish,
    _url: string,
    _comment: string
  ) => {},
  // Vote
  voteForBlacklist: (_account: string, _option: BigNumberish) => {},
  voteForProposal: (_proposalId: BigNumberish, _option: BigNumberish) => {},
  voteForSubmission: (_submissionId: BigNumberish, _option: BigNumberish) => {},
  // Claim
  claimMessiahToken: async () => {},
  claimReward: async (_proposalId: BigNumberish) => {},
  // Others
  convertToAccountId: async (_account: string) =>
    undefined as undefined | BigNumber,
  checkOwnVote: async (_targetId: BigNumberish) =>
    undefined as undefined | number,
  hasClaimed: async () => undefined as undefined | boolean,
  isBlacklisted: async (_account: string) => undefined as undefined | boolean,
  // Test
  endFreezing: async () => {},
  endVoting: async (_proposalId: BigNumberish) => {},
});

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
        MessiahSystemFactoryAddress,
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
      MessiahSystemFactoryAddress,
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

  /* ########## Getter ########## */
  const getBlacklist = async (page: number) => {
    if (!wallet?.contract.messiahSystem) return [];
    return wallet.contract.messiahSystem.getBlacklist(page);
  };

  const getProposals = async (page: number) => {
    if (!wallet?.contract.messiahSystem) return [];
    return wallet.contract.messiahSystem.getProposals(page);
  };

  const getSubmissions = async (proposalId: BigNumberish, page: number) => {
    if (!wallet?.contract.messiahSystem) return [];
    return wallet.contract.messiahSystem.getSubmissions(proposalId, page);
  };

  const getTally = async (targetId: BigNumberish) => {
    return wallet?.contract.messiahSystem?.tallies(targetId).then(
      res =>
        ({
          totalFor: res.totalFor,
          totalAgainst: res.totalAgainst,
          totalAbstain: res.totalAbstain,
        } as Tally)
    );
  };

  /* ########## Propose ########## */
  const submitProposal = async (
    title: string,
    description: string,
    reward: number
  ) => {
    await wallet?.contract.messiahSystem?.propose(title, description, reward);
  };

  /* ########## Submit ########## */
  const submitProduct = async (
    proposalId: BigNumberish,
    url: string,
    comment: string
  ) => {
    await wallet?.contract.messiahSystem?.submit(proposalId, url, comment);
  };

  /* ########## Vote ########## */
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

  /* ########## Claim ########## */
  const claimMessiahToken = async () => {
    await wallet?.contract.messiahSystem?.claimMessiahToken();
  };

  const claimReward = async (proposalId: BigNumberish) => {
    await wallet?.contract.messiahSystem?.claimReward(proposalId);
  };

  /* ########## Others ########## */

  const convertToAccountId = async (account: string) => {
    return wallet?.contract.messiahSystem?.accountId(account);
  };

  const checkOwnVote = async (targetId: BigNumberish) => {
    // 自分の投票内容をチェック
    return wallet?.contract.messiahSystem?.votes(targetId, wallet.address);
  };

  const hasClaimed = async () => {
    // Messiah Tokenをclaim済みか
    return wallet?.contract.messiahSystem?.hasClaimed(wallet.address);
  };

  const isBlacklisted = async (account: string) => {
    // Blacklist入りしているアドレスか
    return wallet?.contract.messiahSystem?.isBlacklisted(account);
  };

  /* ########## Test ########## */
  const endFreezing = async () => {
    // Blacklist入りしているアドレスか
    await wallet?.contract.messiahSystem?.endFreezing();
  };

  const endVoting = async (proposalId: BigNumberish) => {
    // Blacklist入りしているアドレスか
    await wallet?.contract.messiahSystem?.endVoting(proposalId);
  };

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connectWallet,
        checkMessiahExists,
        deployMessiahSystem,
        updateContract,
        getBlacklist,
        getProposals,
        getSubmissions,
        getTally,
        submitProposal,
        submitProduct,
        voteForBlacklist,
        voteForProposal,
        voteForSubmission,
        claimMessiahToken,
        claimReward,
        convertToAccountId,
        checkOwnVote,
        hasClaimed,
        isBlacklisted,
        endFreezing,
        endVoting,
      }}
    >
      {props.children}
    </WalletContext.Provider>
  );
}

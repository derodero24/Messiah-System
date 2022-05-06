import { BigNumber, BigNumberish, constants, Contract } from 'ethers';
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
  // Factory
  connectMessiahSystem: async (_erc721Add: string) => false,
  disconnectMessiahSystem: () => {},
  deployMessiahSystem: async (_erc721Addr: string, _erc20Addr: string) => false,
  // Getter
  getMessiahTokenAddress: async () => undefined as string | undefined,
  getBlacklist: async (_page: number) => [] as string[],
  getProposals: async (_page: number) =>
    [] as MessiahSystem.ProposalStructOutput[],
  getSubmissions: async (_proposalId: BigNumberish, _page: number) =>
    [] as MessiahSystem.SubmissionStructOutput[],
  getTally: async (_account: BigNumberish) => undefined as undefined | Tally,
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
  updateProposalState: async () => {},
  endFreezing: async () => {},
  endVoting: async (_proposalId: BigNumberish) => {},
});

export default function WalletProvider(props: { children: ReactNode }) {
  const [wallet, setWallet] = useState<Wallet>();
  const [walletAddress, setWalletAddress] = useState('');
  const [messiahSystemAddress, setMessiahSystemAddress] = useState('');

  const onAccountsChanged = useCallback((addresses: string[]) => {
    if (!addresses.length) setWalletAddress('');
    else setWalletAddress(addresses[0]);
  }, []);

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
  }, [onAccountsChanged]);

  /* ########## Factory ########## */

  const connectMessiahSystem = useCallback(
    async (erc721Add: string) => {
      return (
        wallet?.contract.messiahSystemFactory
          .messiahSystemAddress(erc721Add)
          .then(address => {
            console.log('address:', address);
            if (address !== constants.AddressZero) {
              setMessiahSystemAddress(address);
              return true;
            } else {
              return false;
            }
          }) || false
      );
    },
    [wallet?.contract.messiahSystemFactory]
  );

  const disconnectMessiahSystem = useCallback(() => {
    setMessiahSystemAddress('');
  }, []);

  const deployMessiahSystem = useCallback(
    async (erc721Add: string, erc20Add: string) => {
      try {
        await wallet?.contract.messiahSystemFactory.deployMessiahSystem(
          erc721Add,
          erc20Add
        );
        return true;
      } catch (error) {
        console.log(error);
        return false;
      }
    },
    [wallet?.contract.messiahSystemFactory]
  );

  /* ########## Getter ########## */
  const getMessiahTokenAddress = useCallback(async () => {
    return wallet?.contract.messiahSystem?.messiahToken();
  }, [wallet?.contract.messiahSystem]);

  const getBlacklist = useCallback(
    async (page: number) => {
      if (!wallet?.contract.messiahSystem) return [];
      return wallet.contract.messiahSystem.getBlacklist(page);
    },
    [wallet?.contract.messiahSystem]
  );

  const getProposals = useCallback(
    async (page: number) => {
      if (!wallet?.contract.messiahSystem) return [];
      return wallet.contract.messiahSystem.getProposals(page);
    },
    [wallet?.contract.messiahSystem]
  );

  const getSubmissions = useCallback(
    async (proposalId: BigNumberish, page: number) => {
      if (!wallet?.contract.messiahSystem) return [];
      return wallet.contract.messiahSystem.getSubmissions(proposalId, page);
    },
    [wallet?.contract.messiahSystem]
  );

  const getTally = useCallback(
    async (_id: BigNumberish) => {
      // アドレスの場合はIDに変換
      const id =
        typeof _id === 'string'
          ? await wallet?.contract.messiahSystem?.accountId(_id)
          : _id;
      if (!id) return undefined;

      return wallet?.contract.messiahSystem?.tallies(id).then(
        res =>
          res &&
          ({
            totalFor: res.totalFor,
            totalAgainst: res.totalAgainst,
            totalAbstain: res.totalAbstain,
          } as Tally)
      );
    },
    [wallet?.contract.messiahSystem]
  );

  /* ########## Propose ########## */
  const submitProposal = useCallback(
    async (title: string, description: string, reward: number) => {
      await wallet?.contract.messiahSystem?.propose(title, description, reward);
    },
    [wallet?.contract.messiahSystem]
  );

  /* ########## Submit ########## */
  const submitProduct = useCallback(
    async (proposalId: BigNumberish, url: string, comment: string) => {
      await wallet?.contract.messiahSystem?.submit(proposalId, url, comment);
    },
    [wallet?.contract.messiahSystem]
  );

  /* ########## Vote ########## */
  const voteForBlacklist = useCallback(
    async (account: string, option: BigNumberish) => {
      await wallet?.contract.messiahSystem?.voteForBlacklist(account, option);
    },
    [wallet?.contract.messiahSystem]
  );

  const voteForProposal = useCallback(
    async (proposalId: BigNumberish, option: BigNumberish) => {
      await wallet?.contract.messiahSystem?.voteForProposal(proposalId, option);
    },
    [wallet?.contract.messiahSystem]
  );

  const voteForSubmission = useCallback(
    async (submissionId: BigNumberish, option: BigNumberish) => {
      await wallet?.contract.messiahSystem?.voteForSubmission(
        submissionId,
        option
      );
    },
    [wallet?.contract.messiahSystem]
  );

  /* ########## Claim ########## */
  const claimMessiahToken = useCallback(async () => {
    await wallet?.contract.messiahSystem?.claimMessiahToken();
  }, [wallet?.contract.messiahSystem]);

  const claimReward = useCallback(
    async (proposalId: BigNumberish) => {
      await wallet?.contract.messiahSystem?.claimReward(proposalId);
    },
    [wallet?.contract.messiahSystem]
  );

  /* ########## Others ########## */

  const convertToAccountId = useCallback(
    async (account: string) => {
      return wallet?.contract.messiahSystem?.accountId(account);
    },
    [wallet?.contract.messiahSystem]
  );

  const checkOwnVote = useCallback(
    async (targetId: BigNumberish) => {
      // 自分の投票内容をチェック
      return wallet?.contract.messiahSystem?.votes(targetId, wallet.address);
    },
    [wallet]
  );

  const hasClaimed = useCallback(async () => {
    // Messiah Tokenをclaim済みか
    return wallet?.contract.messiahSystem?.hasClaimed(wallet.address);
  }, [wallet]);

  const isBlacklisted = useCallback(
    async (account: string) => {
      // Blacklist入りしているアドレスか
      return wallet?.contract.messiahSystem?.isBlacklisted(account);
    },
    [wallet?.contract.messiahSystem]
  );

  /* ########## Test ########## */
  const updateProposalState = useCallback(async () => {
    await wallet?.contract.messiahSystem?.updateProposalState();
  }, [wallet?.contract.messiahSystem]);

  const endFreezing = useCallback(async () => {
    // Blacklist入りしているアドレスか
    await wallet?.contract.messiahSystem?.endFreezing();
  }, [wallet?.contract.messiahSystem]);

  const endVoting = useCallback(
    async (proposalId: BigNumberish) => {
      // Blacklist入りしているアドレスか
      await wallet?.contract.messiahSystem?.endVoting(proposalId);
    },
    [wallet?.contract.messiahSystem]
  );

  useEffect(() => {
    // ページロード時
    connectWallet(); // ウォレット接続
    setMessiahSystemAddress(localStorage.getItem('MessiahAddress') || ''); // ローカルストレージ読み込み
  }, [connectWallet]);

  useEffect(() => {
    // ウォレット/コントラクト情報更新時にウォレット更新
    if (!walletAddress) {
      setWallet(undefined);
      return;
    }

    const provider = new Web3Provider(window.ethereum);
    const signer = provider.getSigner();

    const messiahSystemFactoryContract = new Contract(
      MessiahSystemFactoryAddress,
      messiahSystemFactory.abi,
      signer
    ) as MessiahSystemFactory;

    const messiahSystemContract = messiahSystemAddress
      ? (new Contract(
          messiahSystemAddress,
          messiahSystem.abi,
          signer
        ) as MessiahSystem)
      : undefined;

    setWallet({
      provider,
      signer,
      address: walletAddress,
      contract: {
        messiahSystemFactory: messiahSystemFactoryContract,
        messiahSystem: messiahSystemContract,
      },
    });
  }, [walletAddress, messiahSystemAddress]);

  useEffect(() => {
    // ウォレット更新時にローカルストレージ更新
    if (!wallet?.contract.messiahSystem) return;
    localStorage.setItem(
      'MessiahAddress',
      wallet.contract.messiahSystem.address
    );
  }, [wallet?.contract.messiahSystem]);

  useEffect(() => {
    // ウォレット更新時にイベントリスナーセット
    if (!wallet) return;
    window.ethereum.on('accountsChanged', onAccountsChanged);
    window.ethereum.on('chainChanged', () => window.location.reload());
  }, [wallet, onAccountsChanged]);

  return (
    <WalletContext.Provider
      value={{
        wallet,
        connectWallet,
        connectMessiahSystem,
        disconnectMessiahSystem,
        deployMessiahSystem,
        updateProposalState,
        getMessiahTokenAddress,
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

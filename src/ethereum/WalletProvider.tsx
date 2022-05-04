import { Contract } from 'ethers';
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

import { MessiahSystemFactory } from '../../typechain-types';
import abi from './abi/abi.json';

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
        messiahSystemFactory:MessiahSystemFactory;
      };
    }
  | undefined;

export const WalletContext = createContext({
  wallet: undefined as Wallet,
  connectWallet: () => {},
  checkMessiahExists: async(erc721Add) => null as string,
  deployMessiahSystem: async(erc721Add, erc20Add) =>{},
});

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export default function WalletProvider(props: { children: ReactNode }) {
  const [wallet, setWallet] = useState<Wallet>();

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
      const messiahSystemFactory = new Contract(
        contractAddress,
        abi.abi,
        signer
      ) as MessiahSystemFactory;
      setWallet({
        provider,
        signer,
        address: addresses[0],
        contract: { messiahSystemFactory },
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

  const checkMessiahExists = async(erc721Add:string)=>{
    const res = await wallet?.contract.messiahSystemFactory.messiahSystemAddress(erc721Add);
    return res;
  }

  const deployMessiahSystem = async(erc721Add:string, erc20Add:string)=>{
    await wallet?.contract.messiahSystemFactory.deployMessiahSystem(erc721Add, erc20Add);
  }

  return (
    <WalletContext.Provider value={{ wallet, connectWallet, checkMessiahExists, deployMessiahSystem }}>
      {props.children}
    </WalletContext.Provider>
  );
}
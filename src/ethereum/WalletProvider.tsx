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

import { Greeter } from '../../typechain-types';
import GreeterInfo from './abi/Greeter.json';

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
        greeter: Greeter;
      };
    }
  | undefined;

export const WalletContext = createContext({
  wallet: undefined as Wallet,
  connectWallet: () => {},
});

const contractAddress = '0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0';

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
      const greeter = new Contract(
        contractAddress,
        GreeterInfo.abi,
        signer
      ) as Greeter;
      setWallet({
        provider,
        signer,
        address: addresses[0],
        contract: { greeter },
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

  return (
    <WalletContext.Provider value={{ wallet, connectWallet }}>
      {props.children}
    </WalletContext.Provider>
  );
}

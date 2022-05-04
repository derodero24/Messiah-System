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

import { MessiahSystemFactory, MessiahSystem} from '../../typechain-types';
import messiahSystemFactory from './abi/MessiahSystemFactory.json';
import messiahSystem from "./abi/MessiahSystem.json";
import { DataArrayTwoTone, Description } from '@mui/icons-material';

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
        messiahSystem?:MessiahSystem;
      };
    }
  | undefined;

export const WalletContext = createContext({
  wallet: undefined as Wallet,
  connectWallet: () => {},
  checkMessiahExists: async(erc721Add) => null as string,
  deployMessiahSystem: async(erc721Add, erc20Add) =>{},
  updateContract:async(messiahSystemAddressInput)=>{},
  getProposal:async(paga)=>null as string,
  submitProposal:async(title, description, reward)=>{},
});

const contractAddress = '0x5FbDB2315678afecb367f032d93F642f64180aa3';

export default function WalletProvider(props: { children: ReactNode }) {
  const [wallet, setWallet] = useState<Wallet>();
  const [walletAddress, setWalletAddress] = useState("");
  const [messiahSystemAddress, setMessiahSystemAddress] = useState("");

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

      if(messiahSystemAddress){
        messiahSystemContract = new Contract(
          messiahSystemAddress,
          messiahSystem.abi,
          signer
        ) as MessiahSystem;
      }
      else{
        messiahSystemContract = undefined;
      }

      setWalletAddress(addresses[0]);

      setWallet({
        provider,
        signer,
        address: addresses[0],
        contract: { messiahSystemFactory: messiahSystemFactoryContract, messiahSystem:messiahSystemContract},
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

  const updateContract = async(messiahSystemAddressInput:string)=>{
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
        contract: { messiahSystemFactory: messiahSystemFactoryContract, messiahSystem:messiahSystemContract},
      });
  }

  const getProposal = async(page:number)=>{
    const data = await wallet?.contract.messiahSystem?.getProposals(page);
    return data;
  }

  const submitProposal = async(title:string, description:string, reward:number)=>{
    const res = await wallet?.contract.messiahSystem?.propose(title, description, reward);
  }

  return (
    <WalletContext.Provider value={{ wallet, connectWallet, checkMessiahExists, deployMessiahSystem, updateContract, getProposal, submitProposal }}>
      {props.children}
    </WalletContext.Provider>
  );
}
import { useContext } from 'react';

import { WalletContext } from './ethereum/WalletProvider';
import TabPages from './TabPages';

export default function App(): JSX.Element {
  const { wallet, connectWallet } = useContext(WalletContext);

  if (!wallet) {
    return <button onClick={connectWallet}>Connect Wallet</button>;
  }

  return <TabPages />;
}

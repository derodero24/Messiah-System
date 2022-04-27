import { useContext, useEffect, useState } from 'react';

import { WalletContext } from './ethereum/WalletProvider';
import TabPages from './tab_page';

export default function App(): JSX.Element {
  const { wallet, connectWallet } = useContext(WalletContext);
  const [text, setText] = useState('');
  const [greet, setGreet] = useState('');

  const setGreeting = async () => {
    wallet?.contract.greeter
      .setGreeting(text)
      .then(setGreetingTx => setGreetingTx.wait())
      .then(() => wallet?.contract.greeter.greet())
      .then(_greet => setGreet(_greet));
  };

  useEffect(() => {
    wallet?.contract.greeter.greet().then(_greet => setGreet(_greet));
  }, [wallet]);

  if (!wallet) {
    return <button onClick={connectWallet}>Connect Wallet</button>;
  }

  return (
    <>
      <TabPages />
    </>
  );
}

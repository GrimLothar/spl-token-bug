import './App.css';
import React, { useEffect, useState } from 'react';
import { Connection, PublicKey, clusterApiUrl } from '@solana/web3.js';
import { Program, Provider, web3 } from '@project-serum/anchor';
import { AccountLayout, TOKEN_PROGRAM_ID } from "@solana/spl-token";

// Set our network to devnet.
const network = clusterApiUrl('devnet');

// Controls how we want to acknowledge when a transaction is "done".
const opts = {
  preflightCommitment: "processed"
}

const App = () => {
  const [walletAddress, setWalletAddress] = useState(null);
  const [inputValue, setInputValue] = useState('');

  const checkIfWalletIsConnected = async () => {
    try{
      const { solana } = window;

      if(solana){
        if(solana.isPhantom){
          console.log('Phantom wallet found')

          const response = await solana.connect({ onlyIfTrusted:true})
          console.log('Connected with public key:', response.publicKey.toString())

          setWalletAddress(response.publicKey.toString())
        }
      } else{
        alert('Get a wallet!')
      }

    } catch(error){
      console.error(error)
    }
  }

  const connectWallet = async () => {
    const { solana } = window;

    if(solana){
      const response = await solana.connect()
      console.log('Connected with public key:', response.publicKey.toString())
      setWalletAddress(response.publicKey.toString())
    }
  }

  const getTokens = async () => {
    const provider = getProvider();

    const tokenAccounts = await provider.connection.getTokenAccountsByOwner(
      provider.wallet.publicKey,
      {
        programId: TOKEN_PROGRAM_ID,
      }
    );
  
    console.log("Token                                         Balance");
    console.log("------------------------------------------------------------");
    tokenAccounts.value.forEach((e) => {
      const accountInfo = AccountLayout.decode(e.account.data);
      console.log(`${new PublicKey(accountInfo.mint)}   ${accountInfo.amount}`);
      console.log(accountInfo)
    })

  }

  const getProvider = () => {
    const connection = new Connection(network, opts.preflightCommitment);
    const provider = new Provider(
      connection, window.solana, opts.preflightCommitment,
    );
    return provider;
  }

  const renderNotConnectedContainer = () => (
    <button className="cta-button connect-wallet-button" onClick={connectWallet}>Connect to Wallet</button>
  )

  const renderConnectedContainer = () => {
    // If we hit this, it means the program account hasn't been initialized.
    return(
    <div className="connected-container">
          <form
      onSubmit={(event) => {
        event.preventDefault();
        getTokens()
      }}
    >
      <button type="submit" className="cta-button">Submit</button>
    </form>
  </div>
    )
  }

  useEffect(() => {
    const onLoad = async () => {
      await checkIfWalletIsConnected()
    }
    window.addEventListener('load', onLoad)
    return () => window.removeEventListener('load', onLoad)
  }, [])
  
  return (
    <div className="App">
      <div className={walletAddress ? 'authed-container' : 'container'} >
        <div className="header-container">
          <p className="header">Bug</p>
          {!walletAddress && renderNotConnectedContainer()}
          {walletAddress && renderConnectedContainer()}
        </div>
      </div>
    </div>
  );
};

export default App;

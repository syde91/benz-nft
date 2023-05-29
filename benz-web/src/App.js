import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import ABI from './ABI.json';

// Assume you have the ABI and contract address for the NFT smart contract
const contractAddress = '0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B'; // NFT contract address

const App = () => {
  const [web3, setWeb3] = useState(null);
  const [connectedAccount, setConnectedAccount] = useState(null);
  const [nric, setNric] = useState('');
  const [receipt, setReceipt] = useState('');
  const [nftImageUrl, setNftImageUrl] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if MetaMask is installed
    if (window.ethereum) {
      const web3 = new Web3(window.ethereum);
      setWeb3(web3);
    } else {
      setError('Please install MetaMask to use this app.');
    }
  }, []);

  const connectWallet = async () => {
    try {
      if (typeof window.ethereum !== 'undefined') {
        const ethereum = window.ethereum;

        // Request access to the user's accounts
        ethereum.request({ method: 'eth_requestAccounts' })
          .then((accounts) => {
            setConnectedAccount(accounts[0]);
          })
          .catch((error) => {
            console.error('Error requesting accounts:', error);
          });
      } else {
        console.error('MetaMask not detected');
      }
    } catch (err) {
      setError('Failed to connect to the wallet.');
    }
  };

  const generateReceipt = async () => {
    try {
      const url = 'localhost:8090/generate-receipt';
      let nric = nric; // Static value for NRIC
      let wallet_id = connectedAccount[0]; // Static value for wallet ID

      var requestBody = {
        nric,
        wallet_id
      };

      fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        },
        body: JSON.stringify(requestBody),
      })
        .then((response) => response.json())
        .then((responseData) => {
          const receivedReceipt = responseData.receipt;
          setReceipt(receivedReceipt);

          // Call the mintNFT function with the received receipt
          mintNFT(receivedReceipt);
        })
        .catch((error) => {
          setError('Failed to connect to the Backend.');
          return
        });
    } catch (err) {
      console.log(err)
      setError('Failed to generate Receipt', err);
    }
  };


  const mintNFT = async (receipt) => {
    try {
      const web3In = new Web3(window.ethereum);
      const contract = new web3In.eth.Contract(ABI, contractAddress);

      // Prepare the transaction data for the claimNFT function
      const claimNFTData = contract.methods.mintNFT(receipt).encodeABI();

      // Send the transaction using the `request` method
      const transactionHash = await window.ethereum.request({
        method: 'eth_sendTransaction',
        params: [
          {
            from: window.ethereum.selectedAddress,
            to: contractAddress,
            data: claimNFTData,
          },
        ],
      });
    } catch (err) {
      console.log(err)
      setError('Failed to mint the NFT.', err);
    }
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      {error && <p>Error: {error}</p>}
      <p>Connected Account: {connectedAccount}</p>
      {!connectedAccount && (
        <button onClick={connectWallet}>Connect Wallet</button>
      )}
      {connectedAccount && (
        <>
          <input
            type="text"
            value={nric}
            onChange={(e) => setNric(e.target.value)}
            placeholder="Enter NRIC"
          />
          <button onClick={generateReceipt}>Mint NFT</button>
        </>
      )}
      {nftImageUrl && (
        <div>
          <h3>NFT Image</h3>
          <img src={nftImageUrl} alt="NFT" />
        </div>
      )}
    </div>
  );
};

export default App;

import { ethers } from './ethers-5.2.esm.min.js';
import { fundMeContractAbi, contractAddress } from './constants.js';
let provider, signer, contract;

const contractBalance = document.getElementById('contractBalance');
const ethAmountField = document.getElementById('ethAmount');
const connectBtn = document.getElementById('connect');
const fundBtn = document.getElementById('fund');
const withdrawBtn = document.getElementById('withdraw');

if (typeof window.ethereum !== "undefined") {
  isConnected();
}

async function isConnected() {
  const accounts = await window.ethereum.request({method: 'eth_accounts'});
  if (accounts.length) {
    connectBtn.innerHTML = 'Connected!';
    provider = new ethers.providers.Web3Provider(window.ethereum);
    signer = provider.getSigner();
    contract = new ethers.Contract(contractAddress, fundMeContractAbi, signer);
    connectBtn.removeEventListener('click', connect);
    await changeBalance();
  }
}

async function changeBalance() {
  if (provider && contract) {
    contractBalance.innerHTML = ethers.utils.formatEther(await provider.getBalance(contract.address)) + ' ETH';
  }
}

async function connect() {
  if (typeof window.ethereum !== "undefined") {
    try {
      const connection = await window.ethereum.request({ method: "eth_requestAccounts"});
      connectBtn.innerHTML = 'Connected!';
    } catch (error) {
      console.log(error);
    }
  } else {
    connectBtn.innerHTML = 'Please install metamask';
  }
}

async function fund() {
  const ethAmount = ethAmountField?.value;

  if (typeof window.ethereum !== "undefined") {
    try {
      const transactionResponse = await contract.fund({value: ethers.utils.parseEther(ethAmount)});
      await listenForTransactionMine(transactionResponse, provider);
      await changeBalance();
    } catch (error) {
      console.log(error);
    }
    console.log('Done');
  }
}

async function withdraw() {
  if (typeof window.ethereum !== "undefined") {
    try {
      const transactionResponse = await contract.withdraw();
      await listenForTransactionMine(transactionResponse, provider);
      await changeBalance();
    } catch (error) {
      console.log(error);
    }
    console.log('Done');
  }
}

function listenForTransactionMine(transactionResponse, provider) {
  console.log(`Mining ${transactionResponse.hash}...`);
  return new Promise((resolve, reject) => {
    provider.once(transactionResponse.hash, (transactionReceipt) => {
      console.log(`Completed with ${transactionReceipt.confirmations} confirmations`);
      resolve();
    })
  });
}

connectBtn.addEventListener('click', connect);
fundBtn.addEventListener('click', fund);
withdrawBtn.addEventListener('click', withdraw);

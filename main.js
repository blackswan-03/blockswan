'use strict';

// import blockchain.js & elliptic libraries
const { BlockChain, Transaction } = require('./blockchain');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// initialize keys
const myKey = ec.keyFromPrivate(
  'bb08b66b7c470d92b36c050f9936b29d76166c437bebd8dee770f42a3bbad8d4'
);
const myWalletAddress = myKey.getPublic('hex');

// initialize blockchain
let blockswan = new BlockChain();

// make transaction
const tx1 = new Transaction(myWalletAddress, 'public key goes here', 10);
tx1.signTransaction(myKey);
blockswan.addTransaction(tx1);

// mine transaction
console.log('\n Starting the miner...');
blockswan.minePendingTransactions(myWalletAddress);

// show wallet balance
console.log(
  '\n Balance of Andrew is',
  blockswan.getBalanceOfAddress(myWalletAddress)
);

// attempt to corrupt the chain
blockswan.chain[1].transactions[0].amount = 1;

// confirm validity of chain
console.log('Is chain valid?', blockswan.isChainValid());

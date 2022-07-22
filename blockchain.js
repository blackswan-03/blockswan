'use strict';

// import hashing and key functions
const SHA256 = require('crypto-js/sha256');
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// define transaction data
class Transaction {
  constructor(fromAddress, toAddress, amount) {
    this.fromAddress = fromAddress;
    this.toAddress = toAddress;
    this.amount = amount;
  }

  // calculate hashes of transactions
  calculateHash() {
    return SHA256(this.fromAddress + this.toAddress + this.amount).toString;
  }

  // use keys to sign transactions
  signTransaction(signingKey) {
    // prevent the use of other people's wallets
    if (signingKey.getPublic('hex') !== this.fromAddress) {
      throw new Error('You cannot sign transactions for other wallets!');
    }

    const hashTx = this.calculateHash();
    const sig = signingKey.sign(hashTx, 'base64');
    this.signature = sig.toDER('hex');
  }

  // validate keys
  isValid() {
    // make exception for mining rewards
    if (this.fromAddress === null) return true;

    if (!this.signature || this.signature.length === 0) {
      throw new Error('No signature in this transaction');
    }

    const publicKey = ec.keyFromPublic(this.fromAddress, 'hex');
    return publicKey.verify(this.calculateHash(), this.signature);
  }
}

// Create and define a block
// index = position of block on chain
// timestamp = when block was created
// data = data associated with block
// previousHash = hash of previous block
class Block {
  constructor(timestamp, transactions, previousHash = '') {
    this.timestamp = timestamp;
    this.transactions = transactions;
    this.previousHash = previousHash;
    this.hash = this.calculateHash(); // hash of block
    this.nonce = 0; // random number that doesn't directly affect the block
  }

  // use properties to calculate hash
  calculateHash() {
    return SHA256(
      this.index +
        this.previousHash +
        this.timestamp +
        JSON.stringify(this.data) +
        this.nonce
    ).toString(); // to prevent creating an object
  }

  // mining method
  mineBlock(difficulty) {
    while (
      this.hash.substring(0, difficulty) !== Array(difficulty + 1).join('0')
    ) {
      this.nonce++;
      this.hash = this.calculateHash();
    }

    console.log('Block mined: ' + this.hash);
  }

  // verify all transactions in current block
  hasValidTransactions() {
    for (const tx of this.transactions) {
      if (!tx.isValid()) {
        return false;
      }
    }

    return true;
  }
}

// main blockchain code
class BlockChain {
  constructor() {
    this.chain = [this.createGenesisBlock()];
    this.difficulty = 2;
    this.pendingTransactions = [];
    this.miningReward = 100;
  }

  // create first block manually
  createGenesisBlock() {
    return new Block('7/21/2022', 'Genesis block', '0');
  }

  // find the latest block
  getLatestBlock() {
    return this.chain[this.chain.length - 1];
  }

  // handle mining transactions and push new block
  minePendingTransactions(miningRewardAddress) {
    // mining reward transaction
    const rewardTx = new Transaction(
      null,
      miningRewardAddress,
      this.miningReward
    );
    this.pendingTransactions.push(rewardTx);

    let block = new Block(Date.now(), this.pendingTransactions);
    block.mineBlock(this.difficulty);

    console.log('Block successfully mined!');
    this.chain.push(block);

    this.pendingTransactions = [
      new Transaction(null, miningRewardAddress, this.miningReward),
    ];
  }

  // add transaction to array
  addTransaction(transaction) {
    // confirm addresses exist
    if (!transaction.fromAddress || !transaction.toAddress) {
      throw new Error('Transaction must include from and to addresses');
    }

    // verify transaction is valid
    if (!transaction.isValid()) {
      throw new Error('Cannot add invalid transactions to chain');
    }

    this.pendingTransactions.push(transaction);
  }

  // check balance of an address
  getBalanceOfAddress(address) {
    let balance = 0;

    for (const block of this.chain) {
      for (const trans of block.transactions) {
        if (trans.fromAddress === address) {
          balance -= trans.amount;
        }

        // if else statement?
        if (trans.toAddress === address) {
          balance += trans.amount;
        }
      }
    }

    return balance;
  }

  // blockchain validator
  isChainValid() {
    for (let i = 1; i < this.chain.length; i++) {
      const currentBlock = this.chain[i];
      const previousBlock = this.chain[i - 1];

      if (!currentBlock.hasValidTransactions()) {
        return false;
      }

      if (currentBlock.hash !== currentBlock.calculateHash()) {
        return false;
      }

      // "else if" statement here?
      if (currentBlock.previousHash !== previousBlock.hash) {
        return false;
      }
    }

    return true;
  }
}

module.exports.BlockChain = BlockChain;
module.exports.Transaction = Transaction;

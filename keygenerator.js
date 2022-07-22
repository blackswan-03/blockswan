'use strict';

// import elliptic to generate keys
const EC = require('elliptic').ec;
const ec = new EC('secp256k1');

// generate keys
const key = ec.genKeyPair();
const publicKey = key.getPublic('hex');
const privateKey = key.getPrivate('hex');

// log keys
console.log();
console.log('Private key:', privateKey);
console.log();
console.log('Public key:', publicKey);

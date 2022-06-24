"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var utils = require("./utils").utils;
var algosdk = require("algosdk");
var bip39 = require("bip39");
var ethers = require("ethers");
// paths based on BIP 44 standard
var ETH_PATH = "m/44'/60'/0'/0/0";
var ALGO_PATH = "m/44'/283'/0'/0/0";
var NEAR_PATH = "m/44'/397'/0'/0/0";
var MultiChainWallets = /** @class */ (function () {
    function MultiChainWallets() {
    }
    MultiChainWallets.generateMnemonic = function () {
        // generates random mnemonic
        var mnemonic = bip39.generateMnemonic();
        return mnemonic;
    };
    MultiChainWallets.generateHDWallets = function (mnemonic) {
        // create base node using above mnemonic and then child node based on paths
        var node = ethers.utils.HDNode.fromMnemonic(mnemonic);
        var ethNode = node.derivePath(ETH_PATH);
        var algoNode = node.derivePath(ALGO_PATH);
        var nearNode = node.derivePath(NEAR_PATH);
        // create algo wallet
        var algoMnemonic = algosdk.mnemonicFromSeed(Buffer.from(algoNode.privateKey.slice(2), "hex"));
        var algoWallet = utils.getWallet("algo", algoMnemonic);
        var ethrWallet = utils.getWallet("ethr", ethNode.mnemonic.phrase);
        var nearWallet = utils.getWallet("near", nearNode.mnemonic.phrase);
        return { algo: algoWallet, ethr: ethrWallet, near: nearWallet };
    };
    return MultiChainWallets;
}());
exports.default = MultiChainWallets;

"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var nearAPI = require('near-api-js');
var nearSeedPhrase = require('near-seed-phrase');
var _ = require('lodash');
var bs58 = require('bs58');
var nacl = require('tweetnacl');
var crypto = require('crypto');
function implicitAccountId(publicKey) {
    return bs58.decode(publicKey.replace('ed25519:', '')).toString('hex');
}
var utils = /** @class */ (function () {
    function utils() {
    }
    utils.createWallet = function () {
        var _a = nearSeedPhrase.generateSeedPhrase(), seedPhrase = _a.seedPhrase, secretKey = _a.secretKey, publicKey = _a.publicKey;
        var accountId = implicitAccountId(publicKey);
        return {
            mnemonic: seedPhrase,
            privateKey: secretKey,
            publicKey: publicKey,
            address: accountId
        };
    };
    utils.getWallet = function (seedPhrase) {
        var _a = nearSeedPhrase.parseSeedPhrase(seedPhrase), secretKey = _a.secretKey, publicKey = _a.publicKey;
        var accountId = implicitAccountId(publicKey);
        return {
            mnemonic: seedPhrase,
            privateKey: secretKey,
            publicKey: publicKey,
            address: accountId
        };
    };
    utils.createPrivateKey = function () {
        throw new Error('Not implemented');
    };
    /**
     * Get the public key from a private key
     *
     * @param privateKey With a leading `0x`
     */
    utils.getPublicKey = function (privateKey) {
        throw new Error('Not implemented');
    };
    /**
     * Get the address from a private key
     *
     * @param privateKey With a leading `0x`
     */
    utils.getAddress = function (privateKey) {
        throw new Error('Not implemented');
    };
    /**
     * Sign a message
     *
     * @param privateKey With a leading `0x`
     * @param message Message to sign
     */
    utils.signMessage = function (privateKey, message) {
        return __awaiter(this, void 0, void 0, function () {
            var KeyPair, keyPair, messageBuffer, hash, signature;
            return __generator(this, function (_a) {
                KeyPair = nearAPI.KeyPair;
                keyPair = KeyPair.fromString(privateKey);
                messageBuffer = Buffer.from(message);
                hash = crypto.createHash('sha256').update(messageBuffer).digest();
                signature = keyPair.sign(hash);
                return [2 /*return*/, '0x' + Buffer.from(signature.signature).toString('hex')];
            });
        });
    };
    /**
     * Recover an address from a message and signature
     *
     * @param message
     * @param signature
     */
    utils.recoverAddress = function (message, signature) {
        throw new Error('Not supported due to NEAR\'s multi-key per account architecture');
    };
    /**
     * Verify a signature matches a given DID.
     *
     * This checks the blockchain to ensure the signature matches a valid public key
     * attached to the on chain DID.
     *
     * @param message
     * @param signature  (hex encoded)
     * @param did
     */
    utils.verifySignature = function (message, signature, did, config) {
        if (config === void 0) { config = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var accountId, messageBuffer, hash, sigBuffer, implicitBuffer, implicitPublicKey, imlicitMatch, Account, near, nearAccount, accessKeys, e_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        accountId = did.replace('did:near:', '');
                        messageBuffer = Buffer.from(message);
                        hash = crypto.createHash('sha256').update(messageBuffer).digest();
                        sigBuffer = Buffer.from(signature.replace('0x', ''), 'hex');
                        implicitBuffer = Buffer.from(accountId, 'hex');
                        implicitPublicKey = bs58.encode(implicitBuffer);
                        try {
                            imlicitMatch = nacl.sign.detached.verify(hash, sigBuffer, bs58.decode(implicitPublicKey));
                            if (imlicitMatch) {
                                // Message was signed by public key associated with this DID
                                return [2 /*return*/, true];
                            }
                        }
                        catch (err) {
                            // publicKey may not be bs58 if it's a non-implicit account
                            // in this case, simply continue
                        }
                        Account = nearAPI.Account;
                        return [4 /*yield*/, utils.getNear(config)];
                    case 1:
                        near = _a.sent();
                        nearAccount = new Account(near.connection, accountId);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, nearAccount.getAccessKeys()];
                    case 3:
                        accessKeys = _a.sent();
                        return [2 /*return*/, accessKeys.some(function (it) {
                                var publicKey = it.public_key.replace('ed25519:', '');
                                return nacl.sign.detached.verify(hash, sigBuffer, bs58.decode(publicKey));
                            })];
                    case 4:
                        e_1 = _a.sent();
                        console.error(e_1);
                        return [2 /*return*/, false];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    utils.getNear = function (config) {
        return __awaiter(this, void 0, void 0, function () {
            var Near, networkId, nodeUrl, walletUrl, near;
            return __generator(this, function (_a) {
                config = _.merge({
                    networkId: 'default',
                    nodeUrl: 'https://rpc.testnet.near.org',
                    walletUrl: 'https://wallet.testnet.near.org',
                    helperUrl: 'https://helper.testnet.near.org',
                }, config);
                Near = nearAPI.Near;
                networkId = config.networkId, nodeUrl = config.nodeUrl, walletUrl = config.walletUrl;
                near = new Near({
                    networkId: networkId, nodeUrl: nodeUrl, walletUrl: walletUrl,
                    deps: { keyStore: new nearAPI.keyStores.InMemoryKeyStore() }
                });
                return [2 /*return*/, near];
            });
        });
    };
    return utils;
}());
exports.default = utils;

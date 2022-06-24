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
var algosdk = require('algosdk');
function stringToArray(string) {
    return Buffer.from(string.substring(2, string.length), 'hex').toJSON().data;
}
var utils = /** @class */ (function () {
    function utils() {
    }
    utils.createWallet = function () {
        var wallet = algosdk.generateAccount();
        var mnemonic = algosdk.secretKeyToMnemonic(wallet.sk);
        var privateKey = '0x' + Buffer.from(wallet.sk).toString('hex');
        return {
            mnemonic: mnemonic,
            privateKey: privateKey,
            publicKey: wallet.addr,
            address: wallet.addr
        };
    };
    utils.getWallet = function (mnemonic) {
        var wallet = algosdk.mnemonicToSecretKey(mnemonic);
        var privateKey = '0x' + Buffer.from(wallet.sk).toString('hex');
        return {
            mnemonic: mnemonic,
            privateKey: privateKey,
            publicKey: wallet.addr,
            address: wallet.addr
        };
    };
    utils.getPublicKey = function (privateKey) {
        var sk = algosdk.secretKeyToMnemonic(stringToArray(privateKey));
        var wallet = algosdk.mnemonicToSecretKey(sk);
        return wallet.addr;
    };
    utils.getAddress = function (privateKey) {
        var sk = algosdk.secretKeyToMnemonic(stringToArray(privateKey));
        var wallet = algosdk.mnemonicToSecretKey(sk);
        return wallet.addr;
    };
    utils.signMessage = function (privateKey, message) {
        return __awaiter(this, void 0, void 0, function () {
            var encodedMessage, sk, wallet, signature, stringFromSignature;
            return __generator(this, function (_a) {
                encodedMessage = new TextEncoder().encode(message);
                sk = algosdk.secretKeyToMnemonic(stringToArray(privateKey));
                wallet = algosdk.mnemonicToSecretKey(sk);
                signature = algosdk.signBytes(encodedMessage, wallet.sk);
                stringFromSignature = '0x' + Buffer.from(signature).toString('hex');
                return [2 /*return*/, stringFromSignature];
            });
        });
    };
    utils.recoverAddress = function () {
        throw new Error('Not implemented');
    };
    utils.verifySignature = function (message, signature, did) {
        return __awaiter(this, void 0, void 0, function () {
            var bufferFromSignatureString, encodedMessage, address;
            return __generator(this, function (_a) {
                bufferFromSignatureString = Buffer.from(signature.substring(2, signature.length), 'hex');
                encodedMessage = new TextEncoder().encode(message);
                address = did.replace('did:algo:', '');
                return [2 /*return*/, algosdk.verifyBytes(encodedMessage, bufferFromSignatureString, address)];
            });
        });
    };
    return utils;
}());
exports.default = utils;

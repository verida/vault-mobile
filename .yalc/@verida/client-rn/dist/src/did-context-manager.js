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
var storage_link_1 = require("@verida/storage-link");
var did_document_1 = require("@verida/did-document");
/**
 * Manage all the available storage contexts for all the DIDs being requested,
 *
 * Can force creating a new storage context for the authenticated account.
 */
/**
 * @category
 * Modules
 */
var DIDContextManager = /** @class */ (function () {
    function DIDContextManager(network, didClient) {
        this.didContexts = {};
        this.network = network;
        this.didClient = didClient;
    }
    DIDContextManager.prototype.setAccount = function (account) {
        this.account = account;
    };
    DIDContextManager.prototype.getContextDatabaseServer = function (did, contextName, forceCreate) {
        if (forceCreate === void 0) { forceCreate = true; }
        return __awaiter(this, void 0, void 0, function () {
            var contextConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDIDContextConfig(did, contextName, forceCreate)];
                    case 1:
                        contextConfig = _a.sent();
                        return [2 /*return*/, contextConfig.services.databaseServer];
                }
            });
        });
    };
    DIDContextManager.prototype.getContextStorageServer = function (did, contextName, forceCreate) {
        if (forceCreate === void 0) { forceCreate = true; }
        return __awaiter(this, void 0, void 0, function () {
            var contextConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDIDContextConfig(did, contextName, forceCreate)];
                    case 1:
                        contextConfig = _a.sent();
                        if (!contextConfig.services.storageServer) {
                            throw new Error("Storage server not specified");
                        }
                        return [2 /*return*/, contextConfig.services.storageServer];
                }
            });
        });
    };
    DIDContextManager.prototype.getContextMessageServer = function (did, contextName, forceCreate) {
        if (forceCreate === void 0) { forceCreate = true; }
        return __awaiter(this, void 0, void 0, function () {
            var contextConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDIDContextConfig(did, contextName, forceCreate)];
                    case 1:
                        contextConfig = _a.sent();
                        return [2 /*return*/, contextConfig.services.messageServer];
                }
            });
        });
    };
    DIDContextManager.prototype.getDIDContextHashConfig = function (did, contextHash) {
        return __awaiter(this, void 0, void 0, function () {
            var storageConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.didContexts[contextHash]) {
                            return [2 /*return*/, this.didContexts[contextHash]];
                        }
                        return [4 /*yield*/, storage_link_1.StorageLink.getLink(this.network, this.didClient, did, contextHash, false)];
                    case 1:
                        storageConfig = _a.sent();
                        if (!storageConfig) {
                            throw new Error("Unable to locate requested storage context for this user");
                        }
                        this.didContexts[contextHash] = storageConfig;
                        return [2 /*return*/, storageConfig];
                }
            });
        });
    };
    DIDContextManager.prototype.getDIDContextConfig = function (did, contextName, forceCreate) {
        return __awaiter(this, void 0, void 0, function () {
            var contextHash, storageConfig, accountDid, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (contextName.substring(0, 2) == '0x') {
                            contextHash = contextName;
                        }
                        else {
                            contextHash = did_document_1.DIDDocument.generateContextHash(did, contextName);
                        }
                        if (this.didContexts[contextHash]) {
                            return [2 /*return*/, this.didContexts[contextHash]];
                        }
                        if (!this.account) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.account.did()];
                    case 1:
                        accountDid = _a.sent();
                        if (!(accountDid == did)) return [3 /*break*/, 7];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 6, , 7]);
                        return [4 /*yield*/, this.account.storageConfig(contextName, forceCreate)];
                    case 3:
                        //const now = (new Date()).getTime()
                        storageConfig = _a.sent();
                        if (!(storageConfig === null || storageConfig === void 0 ? void 0 : storageConfig.isLegacyDid)) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.account.did()];
                    case 4:
                        did = _a.sent();
                        if (contextName.substring(0, 2) != '0x') {
                            contextHash = did_document_1.DIDDocument.generateContextHash(did, contextName);
                        }
                        _a.label = 5;
                    case 5: return [3 /*break*/, 7];
                    case 6:
                        err_1 = _a.sent();
                        throw new Error("Unable to locate requested storage context (" + contextName + ") for this DID (" + did + "): " + err_1.message);
                    case 7:
                        if (!!storageConfig) return [3 /*break*/, 9];
                        return [4 /*yield*/, storage_link_1.StorageLink.getLink(this.network, this.didClient, did, contextName, true)];
                    case 8:
                        storageConfig = _a.sent();
                        _a.label = 9;
                    case 9:
                        if (!storageConfig) {
                            if (forceCreate) {
                                throw new Error("Unable to force creation of storage context for this DID");
                            }
                            else {
                                throw new Error("Unable to locate requested storage context (" + contextName + ") for this DID (" + did + ") -- Storage context doesn't exist (try force create?)");
                            }
                        }
                        this.didContexts[contextHash] = storageConfig;
                        return [2 /*return*/, storageConfig];
                }
            });
        });
    };
    return DIDContextManager;
}());
exports.default = DIDContextManager;
//# sourceMappingURL=did-context-manager.js.map
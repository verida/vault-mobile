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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("@verida/types");
var did_client_1 = require("@verida/did-client");
var vda_name_client_1 = require("@verida/vda-name-client");
var context_1 = __importDefault(require("./context/context"));
var did_context_manager_1 = __importDefault(require("./did-context-manager"));
var schema_1 = __importDefault(require("./context/schema"));
var config_1 = __importDefault(require("./config"));
var axios_1 = __importDefault(require("axios"));
var axios_2 = __importDefault(require("axios"));
var vda_common_1 = require("@verida/vda-common");
var _ = require("lodash");
/**
 * @category
 * Modules
 */
var Client = /** @class */ (function () {
    /**
     * Create a client connection to the Verida network
     *
     * @param userConfig ClientConfig Configuration for establishing a connection to the Verida network
     */
    function Client(userConfig) {
        this.network = userConfig.network
            ? userConfig.network
            : config_1.default.network;
        var defaultConfig = config_1.default.environments[this.network]
            ? config_1.default.environments[this.network]
            : {};
        this.config = _.merge(defaultConfig, userConfig);
        this.didClient = new did_client_1.DIDClient(userConfig.didClientConfig ? userConfig.didClientConfig : {
            network: this.network
        });
        var rpcUrl = this.didClient.getRpcUrl();
        var blockchainAnchor = vda_common_1.DefaultNetworkBlockchainAnchors[this.network];
        this.nameClient = new vda_name_client_1.VeridaNameClient({
            blockchainAnchor: blockchainAnchor,
            web3Options: {
                rpcUrl: rpcUrl
            }
        });
        this.didContextManager = new did_context_manager_1.default(this.network, this.didClient);
        schema_1.default.setSchemaPaths(this.config.schemaPaths);
    }
    /**
     * Connect an Account to this client.
     *
     * Sets the account owner who can then create storage contexts,
     * authenticate with databases, send messages etc.
     *
     * @param account AccountInterface
     */
    Client.prototype.connect = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.isConnected()) {
                            throw new Error("Account is already connected.");
                        }
                        this.account = account;
                        _a = this;
                        return [4 /*yield*/, this.account.did()];
                    case 1:
                        _a.did = _b.sent();
                        this.didContextManager.setAccount(this.account);
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Check if an account is connected to this client.
     *
     * @returns boolean True of an account is connected
     */
    Client.prototype.isConnected = function () {
        return typeof this.account != "undefined";
    };
    Client.prototype.getNetwork = function () {
        return this.network;
    };
    /**
     * Open a storage context for the current account.
     *
     * @param contextName string Name of the `context` to open.
     * @param forceCreate boolean If the `context` doesn't already exist for the connected account, create it. Depending on the type of `Account` connected, this may open a prompt for the user to confirm (and sign).
     * @returns Context | undefined
     */
    Client.prototype.openContext = function (contextName, forceCreate) {
        if (forceCreate === void 0) { forceCreate = true; }
        return __awaiter(this, void 0, void 0, function () {
            var contextConfig, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (forceCreate) {
                            if (!this.account) {
                                throw new Error("Unable to force create a storage context when not connected");
                            }
                        }
                        if (!!this.did) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.account.storageConfig(contextName, forceCreate)];
                    case 1:
                        // Attempt to fetch storage config from this account object if no DID specified
                        // This is helpful in the account-web-vault that doesn't load the DID until it receives a request from the vault mobile app
                        contextConfig = _b.sent();
                        _a = this;
                        return [4 /*yield*/, this.account.did()];
                    case 2:
                        _a.did = _b.sent();
                        _b.label = 3;
                    case 3:
                        if (!this.did) {
                            throw new Error("No DID specified and no authenticated user");
                        }
                        if (!!contextConfig) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.didContextManager.getDIDContextConfig(this.did, contextName, forceCreate)];
                    case 4:
                        contextConfig = _b.sent();
                        _b.label = 5;
                    case 5:
                        if (!contextConfig) {
                            throw new Error("Unable to locate requested storage context for requested DID. Force create?");
                        }
                        // @todo cache the storage contexts
                        return [2 /*return*/, new context_1.default(this, contextName, this.didContextManager, this.account)];
                }
            });
        });
    };
    /**
     *
     * @param contextName The name of the context OR a context hash (starting with 0x)
     * @param did
     * @returns
     */
    Client.prototype.openExternalContext = function (contextName, did) {
        return __awaiter(this, void 0, void 0, function () {
            var contextConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.parseDid(did)];
                    case 1:
                        did = _a.sent();
                        return [4 /*yield*/, this.didContextManager.getDIDContextConfig(did, contextName, false)];
                    case 2:
                        contextConfig = _a.sent();
                        if (!contextConfig) {
                            throw new Error("Unable to locate requested storage context for requested DID.");
                        }
                        // @todo cache the storage contexts
                        return [2 /*return*/, new context_1.default(this, contextName, this.didContextManager, this.account)];
                }
            });
        });
    };
    /**
     * Get the storage configuration of an application context for a given DID.
     *
     * This provides the public details about the database, storage and messaging endpoints stored on did-client/did-document  for the requested `did`.
     *
     * @param did
     * @param contextName The name of the context OR a context hash (starting with 0x)
     * @returns SecureContextConfig | undefined
     */
    Client.prototype.getContextConfig = function (did, contextName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.parseDid(did)];
                    case 1:
                        did = _a.sent();
                        return [2 /*return*/, this.didContextManager.getDIDContextConfig(did, contextName, false)];
                }
            });
        });
    };
    Client.prototype.getConfig = function () {
        return this.config;
    };
    Client.prototype.getPublicProfile = function (did, contextName, profileName, fallbackContext, ignoreCache, networkFallback) {
        if (profileName === void 0) { profileName = "basicProfile"; }
        if (fallbackContext === void 0) { fallbackContext = "Verida: Vault"; }
        if (ignoreCache === void 0) { ignoreCache = false; }
        if (networkFallback === void 0) { networkFallback = true; }
        return __awaiter(this, void 0, void 0, function () {
            var fetchUri, response, err_1, profile, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.config.readOnlyDataApiUri) return [3 /*break*/, 4];
                        fetchUri = this.config.readOnlyDataApiUri + "/" + this.network + "/" + did + "/" + contextName + "/profile_public/" + profileName + "?ignoreCache=" + ignoreCache;
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, axios_2.default.get(fetchUri)];
                    case 2:
                        response = _a.sent();
                        return [2 /*return*/, response.data];
                    case 3:
                        err_1 = _a.sent();
                        if (err_1.response && err_1.response.data && err_1.response.data.status == 'fail') {
                            if (fallbackContext && fallbackContext != contextName) {
                                // try the fallback context
                                return [2 /*return*/, this.getPublicProfile(did, fallbackContext, profileName, null, ignoreCache)];
                            }
                        }
                        return [3 /*break*/, 4];
                    case 4:
                        if (!networkFallback) return [3 /*break*/, 8];
                        _a.label = 5;
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this.openPublicProfile(did, contextName, profileName, fallbackContext)];
                    case 6:
                        profile = _a.sent();
                        if (profile) {
                            return [2 /*return*/, profile.getMany({}, {})];
                        }
                        return [3 /*break*/, 8];
                    case 7:
                        err_2 = _a.sent();
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Open the public profile of any user in read only mode.
     *
     * Every application context has the ability to have it's own public profiles.
     *
     * You most likely want to request the `Verida: Vault` context.
     *
     * @param did
     * @param contextName
     * @returns `<Profile | undefined>`
     */
    Client.prototype.openPublicProfile = function (did, contextName, profileName, fallbackContext) {
        if (profileName === void 0) { profileName = "basicProfile"; }
        if (fallbackContext === void 0) { fallbackContext = "Verida: Vault"; }
        return __awaiter(this, void 0, void 0, function () {
            var context, error_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.parseDid(did)];
                    case 1:
                        did = _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 7]);
                        return [4 /*yield*/, this.openExternalContext(contextName, did)];
                    case 3:
                        context = (_a.sent());
                        return [3 /*break*/, 7];
                    case 4:
                        error_1 = _a.sent();
                        if (!fallbackContext) return [3 /*break*/, 6];
                        return [4 /*yield*/, this.openPublicProfile(did, fallbackContext, profileName, null)];
                    case 5: return [2 /*return*/, _a.sent()];
                    case 6: return [3 /*break*/, 7];
                    case 7:
                        if (!context) {
                            throw new Error("Account (" + did + ") does not have a public profile for " + contextName);
                        }
                        return [2 /*return*/, context.openProfile(profileName, did)];
                }
            });
        });
    };
    /**
     * Get the valid data signatures for a given database record.
     *
     * Iterates through all the signatures attached to a database record and validates each signature.
     *
     * Only returns the signatures that are valid.
     *
     * @param data A single database record
     * @param did An optional did to filter the results by
     * @returns string[] Array of DIDs that have validly signed the data
     */
    Client.prototype.getValidDataSignatures = function (data, did) {
        return __awaiter(this, void 0, void 0, function () {
            var _data, validSignatures, _a, _b, _i, sigIndex, signature, signerParts, sNetwork, sDid, sContext, signerDid, didDocument, matchSig, validSig;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!data.signatures) {
                            // no signatures
                            return [2 /*return*/, []];
                        }
                        if (!did) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.parseDid(did)];
                    case 1:
                        did = _c.sent();
                        _c.label = 2;
                    case 2:
                        _data = _.merge({}, data);
                        delete _data["signatures"];
                        delete _data["_rev"];
                        // Don't include versioned schema in signature verification data
                        if (_data['schema']) {
                            _data['schema'] = schema_1.default.getVersionlessSchemaName(_data['schema']);
                        }
                        validSignatures = [];
                        _a = [];
                        for (_b in data.signatures)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        sigIndex = _a[_i];
                        signature = data.signatures[sigIndex];
                        signerParts = sigIndex.match(/did:vda:([^]*):([^]*)\?context=(.*)$/);
                        if (!signerParts || signerParts.length != 4) {
                            return [3 /*break*/, 5];
                        }
                        sNetwork = signerParts[1];
                        sDid = signerParts[2];
                        sContext = signerParts[3];
                        signerDid = "did:vda:" + sNetwork + ":" + sDid;
                        if (!(!did || signerDid.toLowerCase() == did.toLowerCase())) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.didClient.get(signerDid)];
                    case 4:
                        didDocument = _c.sent();
                        if (!didDocument) {
                            return [3 /*break*/, 5];
                        }
                        matchSig = typeof (signature) == 'string' ? signature : signature['secp256k1'];
                        validSig = didDocument.verifyContextSignature(_data, this.network, sContext, matchSig, true);
                        if (validSig) {
                            validSignatures.push(signerDid);
                        }
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [2 /*return*/, validSignatures];
                }
            });
        });
    };
    Client.prototype.destroyAccount = function () {
        return __awaiter(this, void 0, void 0, function () {
            var didDocument, doc, contextNames, _a, _b, _i, i, keyAgreement, matches, contextHash, contextName, err_3, _c, _d, _e, c, didClient;
            return __generator(this, function (_f) {
                switch (_f.label) {
                    case 0:
                        // Check user authenticated
                        if (!this.account) {
                            throw new Error('Account must be connected to get context name from hash');
                        }
                        // @ts-ignore
                        if (!this.account.getDidClient) {
                            throw new Error('Account object is not capable of deleting DID');
                        }
                        return [4 /*yield*/, this.didClient.get(this.did)];
                    case 1:
                        didDocument = _f.sent();
                        doc = didDocument.export();
                        contextNames = [];
                        _a = [];
                        for (_b in doc.keyAgreement)
                            _a.push(_b);
                        _i = 0;
                        _f.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        i = _a[_i];
                        keyAgreement = doc.keyAgreement[i];
                        matches = keyAgreement.match(/=(0x[^&]*)/);
                        if (!(matches.length == 2)) return [3 /*break*/, 6];
                        contextHash = matches[1];
                        _f.label = 3;
                    case 3:
                        _f.trys.push([3, 5, , 6]);
                        return [4 /*yield*/, this.getContextNameFromHash(contextHash, didDocument)];
                    case 4:
                        contextName = _f.sent();
                        contextNames.push(contextName);
                        return [3 /*break*/, 6];
                    case 5:
                        err_3 = _f.sent();
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7:
                        _c = [];
                        for (_d in contextNames)
                            _c.push(_d);
                        _e = 0;
                        _f.label = 8;
                    case 8:
                        if (!(_e < _c.length)) return [3 /*break*/, 11];
                        c = _c[_e];
                        return [4 /*yield*/, this.destroyContext(contextNames[c])];
                    case 9:
                        _f.sent();
                        _f.label = 10;
                    case 10:
                        _e++;
                        return [3 /*break*/, 8];
                    case 11: return [4 /*yield*/, this.account.getDIDClient()];
                    case 12:
                        didClient = _f.sent();
                        return [4 /*yield*/, didClient.destroy()
                            // Logout the account
                        ];
                    case 13:
                        _f.sent();
                        // Logout the account
                        this.account = undefined;
                        this.did = undefined;
                        this.didContextManager = new did_context_manager_1.default(this.network, this.didClient);
                        return [2 /*return*/];
                }
            });
        });
    };
    Client.prototype.destroyContext = function (contextName) {
        return __awaiter(this, void 0, void 0, function () {
            var timestamp, did, didDocument, endpointInfo, endpointUris, promises, _a, _b, _i, e, endpointUri, consentMessage, signature, results, resultIndex, failureCount, promiseResults, e, endpoint, result;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // Check user authenticated
                        if (!this.account) {
                            throw new Error('Account must be connected to get context name from hash');
                        }
                        timestamp = parseInt(((new Date()).getTime() / 1000.0).toString());
                        return [4 /*yield*/, this.account.did()];
                    case 1:
                        did = (_c.sent()).toLowerCase();
                        return [4 /*yield*/, this.didClient.get(this.did)
                            // @ts-ignore
                        ];
                    case 2:
                        didDocument = _c.sent();
                        endpointInfo = didDocument.locateServiceEndpoint(contextName, types_1.SecureContextEndpointType.DATABASE);
                        if (!endpointInfo) {
                            throw new Error('Context not found in DID Document');
                        }
                        endpointUris = endpointInfo.serviceEndpoint;
                        promises = [];
                        _a = [];
                        for (_b in endpointUris)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 3;
                    case 3:
                        if (!(_i < _a.length)) return [3 /*break*/, 6];
                        e = _a[_i];
                        endpointUri = endpointUris[e];
                        endpointUri = endpointUri.substring(0, endpointUri.length - 1); // strip trailing slash
                        consentMessage = "Delete context (" + contextName + ") from server: \"" + endpointUri + "\"?\n\n" + did + "\n" + timestamp;
                        return [4 /*yield*/, this.account.sign(consentMessage)];
                    case 4:
                        signature = _c.sent();
                        promises.push(axios_1.default.post(endpointUri + "/user/destroyContext", {
                            did: did,
                            timestamp: timestamp,
                            signature: signature,
                            contextName: contextName
                        }));
                        _c.label = 5;
                    case 5:
                        _i++;
                        return [3 /*break*/, 3];
                    case 6: return [4 /*yield*/, Promise.allSettled(promises)];
                    case 7:
                        results = _c.sent();
                        resultIndex = 0;
                        failureCount = 0;
                        promiseResults = {};
                        for (e in endpointUris) {
                            endpoint = endpointUris[e].toString();
                            result = results[resultIndex++];
                            promiseResults[endpoint] = result;
                            if (result.status !== 'fulfilled') {
                                failureCount++;
                            }
                        }
                        // Remove the context from the DID document
                        return [4 /*yield*/, this.account.unlinkStorage(contextName)];
                    case 8:
                        // Remove the context from the DID document
                        _c.sent();
                        return [2 /*return*/, promiseResults];
                }
            });
        });
    };
    Client.prototype.getContextNameFromHash = function (contextHash, didDocument) {
        return __awaiter(this, void 0, void 0, function () {
            var services, service, timestamp, did, endpoints, _a, _b, _i, e, endpointUri, consentMessage, signature, response, err_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        // Check user authenticated
                        if (!this.account) {
                            throw new Error('Account must be connected to get context name from hash');
                        }
                        if (!!didDocument) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.didClient.get(this.did)];
                    case 1:
                        // @ts-ignore
                        didDocument = (_c.sent());
                        _c.label = 2;
                    case 2:
                        services = didDocument.export().service;
                        service = services.find(function (item) { return item.id.match(contextHash) && item.type == 'VeridaDatabase'; });
                        if (!service) {
                            throw new Error("Unable to locate service associated with context hash " + contextHash);
                        }
                        timestamp = parseInt(((new Date()).getTime() / 1000.0).toString());
                        return [4 /*yield*/, this.account.did()];
                    case 3:
                        did = (_c.sent()).toLowerCase();
                        endpoints = service.serviceEndpoint;
                        _a = [];
                        for (_b in endpoints)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 4;
                    case 4:
                        if (!(_i < _a.length)) return [3 /*break*/, 10];
                        e = _a[_i];
                        endpointUri = endpoints[e];
                        endpointUri = endpointUri.substring(0, endpointUri.length - 1); // strip trailing slash
                        consentMessage = "Obtain context hash (" + contextHash + ") for server: \"" + endpointUri + "\"?\n\n" + did + "\n" + timestamp;
                        return [4 /*yield*/, this.account.sign(consentMessage)];
                    case 5:
                        signature = _c.sent();
                        _c.label = 6;
                    case 6:
                        _c.trys.push([6, 8, , 9]);
                        return [4 /*yield*/, axios_1.default.post(endpointUri + "/user/contextHash", {
                                did: did,
                                timestamp: timestamp,
                                signature: signature,
                                contextHash: contextHash
                            })];
                    case 7:
                        response = _c.sent();
                        if (response.data.status == 'success') {
                            return [2 /*return*/, response.data.result.contextName];
                        }
                        return [3 /*break*/, 9];
                    case 8:
                        err_4 = _c.sent();
                        return [3 /*break*/, 9];
                    case 9:
                        _i++;
                        return [3 /*break*/, 4];
                    case 10: throw new Error("Unable to access any endpoints associated with context hash " + contextHash);
                }
            });
        });
    };
    /**
     * Get a Schama instance by URL.
     *
     * @param schemaUri URL of the schema
     * @returns Schema A schema object
     */
    Client.prototype.getSchema = function (schemaUri) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, schema_1.default.getSchema(schemaUri)];
            });
        });
    };
    /**
     * Converts a string that may be either a valid DID or a valid Verida username into
     * a Verida username.
     *
     * @param didOrUsername DID string or Verida username string (ending in `.vda`)
     * @returns
     */
    Client.prototype.parseDid = function (didOrUsername) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!didOrUsername.match(/\.vda$/)) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.getDID(didOrUsername)];
                    case 1: 
                    // Have a Verida username. Perform on-chain lookup.
                    // @throws Error if the username doesn't exist
                    return [2 /*return*/, _a.sent()];
                    case 2: return [2 /*return*/, didOrUsername];
                }
            });
        });
    };
    /**
     * Get the DID linked to a username
     *
     * @param username
     * @returns
     */
    Client.prototype.getDID = function (username) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.nameClient.getDID(username)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Get an array of usernames linked to a DID
     *
     * @param did
     * @returns
     */
    Client.prototype.getUsernames = function (did) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.nameClient.getUsernames(did)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return Client;
}());
exports.default = Client;
//# sourceMappingURL=client.js.map
"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var base_1 = __importDefault(require("../../base"));
var db_encrypted_1 = __importDefault(require("./db-encrypted"));
var db_public_1 = __importDefault(require("./db-public"));
var endpoint_1 = __importDefault(require("./endpoint"));
var _ = require("lodash");
/**
 * @todo
 *
 * base -> database (new wrapper with same interface, handles sync between endpoints, exposes a single endpoint database) -> endpoints (old database with client and public database suport)
 */
/**
 * @emits EndpointUnavailable
 * @emits EndpointWarning
 */
var StorageEngineVerida = /** @class */ (function (_super) {
    __extends(StorageEngineVerida, _super);
    // @todo: specify device id // deviceId: string="Test device"
    function StorageEngineVerida(context, dbRegistry, contextConfig) {
        var _this = _super.call(this, context, dbRegistry, contextConfig) || this;
        var engine = _this;
        _this.endpoints = {};
        var _loop_1 = function (i) {
            var endpointUri = contextConfig.services.databaseServer.endpointUri[i];
            this_1.endpoints[endpointUri] = new endpoint_1.default(this_1, this_1.storageContext, this_1.contextConfig, endpointUri);
            // Catch and re-throw endpoint warnings
            this_1.endpoints[endpointUri].on('EndpointWarning', function (message) {
                engine.emit('EndpointWarning', endpointUri, message);
            });
        };
        var this_1 = this;
        for (var i in contextConfig.services.databaseServer.endpointUri) {
            _loop_1(i);
        }
        return _this;
    }
    StorageEngineVerida.prototype.locateAvailableEndpoint = function (endpoints, checkStatus) {
        if (checkStatus === void 0) { checkStatus = true; }
        return __awaiter(this, void 0, void 0, function () {
            var failedEndpoints, endpointCount, primaryIndex, primaryEndpointUri, status_1, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        failedEndpoints = [];
                        endpointCount = Object.keys(endpoints).length;
                        if (endpointCount == 0) {
                            throw new Error('No endpoints specified');
                        }
                        primaryIndex = Math.trunc((new Date()).getTime() / 1000 / 60 / 60) % endpointCount;
                        primaryEndpointUri = Object.keys(endpoints)[primaryIndex];
                        if (!checkStatus) {
                            return [2 /*return*/, endpoints[primaryEndpointUri]];
                        }
                        _a.label = 1;
                    case 1:
                        if (!(failedEndpoints.length < Object.keys(endpoints).length)) return [3 /*break*/, 6];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, endpoints[primaryEndpointUri].getStatus()];
                    case 3:
                        status_1 = _a.sent();
                        if (status_1.data.status != 'success') {
                            throw new Error('Storage node is not available');
                        }
                        return [2 /*return*/, endpoints[primaryEndpointUri]];
                    case 4:
                        err_1 = _a.sent();
                        // endpoint is not available, so set it to fail
                        this.emit('EndpointUnavailable', primaryEndpointUri);
                        failedEndpoints.push(primaryEndpointUri);
                        primaryIndex++;
                        primaryIndex = primaryIndex % Object.keys(endpoints).length;
                        primaryEndpointUri = Object.keys(endpoints)[primaryIndex];
                        return [3 /*break*/, 5];
                    case 5: return [3 /*break*/, 1];
                    case 6: throw new Error('Unable to locate an available endpoint');
                }
            });
        });
    };
    /**
     * Get an active endpoint
     */
    StorageEngineVerida.prototype.getActiveEndpoint = function (checkStatus, clearActive) {
        if (checkStatus === void 0) { checkStatus = true; }
        if (clearActive === void 0) { clearActive = false; }
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (clearActive) {
                            this.activeEndpoint = undefined;
                        }
                        if (this.activeEndpoint) {
                            return [2 /*return*/, this.activeEndpoint];
                        }
                        _a = this;
                        return [4 /*yield*/, this.locateAvailableEndpoint(this.endpoints, checkStatus)];
                    case 1:
                        _a.activeEndpoint = _b.sent();
                        return [2 /*return*/, this.activeEndpoint];
                }
            });
        });
    };
    StorageEngineVerida.prototype.getEndpoint = function (endpintUri) {
        return this.endpoints[endpintUri];
    };
    StorageEngineVerida.prototype.getEndpoints = function () {
        return this.endpoints;
    };
    StorageEngineVerida.prototype.connectAccount = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            var promises, i, endpoint, results, finalEndpoints, resultIndex, i, endpoint, result, _a, _b, err_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _c.trys.push([0, 5, , 6]);
                        return [4 /*yield*/, _super.prototype.connectAccount.call(this, account)];
                    case 1:
                        _c.sent();
                        promises = [];
                        for (i in this.endpoints) {
                            endpoint = this.endpoints[i];
                            promises.push(endpoint.connectAccount(account));
                        }
                        return [4 /*yield*/, Promise.allSettled(promises)];
                    case 2:
                        results = _c.sent();
                        finalEndpoints = {};
                        resultIndex = 0;
                        for (i in this.endpoints) {
                            endpoint = this.endpoints[i];
                            result = results[resultIndex++];
                            if (result.status == 'fulfilled') {
                                finalEndpoints[i] = endpoint;
                            }
                            else {
                                this.emit('EndpointUnavailable', i);
                            }
                        }
                        this.endpoints = finalEndpoints;
                        // Select an active endpoint. No need to check status as invalid endpoints already removed above.
                        _a = this;
                        return [4 /*yield*/, this.getActiveEndpoint(false)];
                    case 3:
                        // Select an active endpoint. No need to check status as invalid endpoints already removed above.
                        _a.activeEndpoint = _c.sent();
                        _b = this;
                        return [4 /*yield*/, this.account.did()];
                    case 4:
                        _b.accountDid = (_c.sent()).toLowerCase();
                        //console.log(`connectAccount(${this.accountDid}): ${(new Date()).getTime()-now}`)
                        // call checkReplication() to ensure replication is working correctly on all
                        // the endpoints and perform any necessary auto-repair actions
                        // no need to async?
                        this.checkReplication();
                        return [3 /*break*/, 6];
                    case 5:
                        err_2 = _c.sent();
                        if (err_2.name == "ContextNotFoundError") {
                            return [2 /*return*/];
                        }
                        throw err_2;
                    case 6: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Open a database either that may or may not be owned by this usesr
     *
     * @param databaseName
     * @param options
     * @returns {Database}
     */
    StorageEngineVerida.prototype.openDatabase = function (databaseName, options) {
        return __awaiter(this, void 0, void 0, function () {
            var config, contextName, did, endpoint, endpointUris, endpoints, _a, _b, _i, i, endpointUri, endpoint_2, err_3, storageContextKey, encryptionKey, db, db, storageContextKey, encryptionKey, db, err_4;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        config = _.merge({
                            permissions: {
                                read: "owner",
                                write: "owner",
                            },
                            did: this.accountDid,
                            readOnly: false,
                            verifyEncryptionKey: true
                        }, options);
                        contextName = config.contextName ? config.contextName : this.storageContext;
                        // Default to user's account did if not specified
                        if (typeof (config.isOwner) == 'undefined') {
                            config.isOwner = config.did == this.accountDid;
                        }
                        config.saveDatabase = config.isOwner; // always save this database to registry if user is the owner
                        did = config.did.toLowerCase();
                        // If permissions require "owner" access, connect the current user
                        if ((config.permissions.read == "owner" ||
                            config.permissions.write == "owner") &&
                            !config.readOnly) {
                            if (!config.readOnly && !this.keyring) {
                                throw new Error("Unable to open database. Permissions require \"owner\" access, but no account connected.");
                            }
                            if (!config.readOnly && config.isOwner && !this.keyring) {
                                throw new Error("Unable to open database. Permissions require \"owner\" access, but account is not owner.");
                            }
                            if (!config.readOnly &&
                                !config.isOwner &&
                                config.permissions.read == "owner") {
                                throw new Error("Unable to open database. Permissions require \"owner\" access to read, but account is not owner.");
                            }
                        }
                        if (!!config.isOwner) return [3 /*break*/, 12];
                        // Not the owner, so need the endpoints to have been specified in the config
                        if (!config.endpoints) {
                            throw new Error("Unable to determine endpoints for this user (" + did + ") and this context (" + contextName + ")");
                        }
                        endpointUris = (typeof (config.endpoints) == 'object' ? config.endpoints : [config.endpoints]);
                        endpoints = {};
                        _a = [];
                        for (_b in endpointUris)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 10];
                        i = _a[_i];
                        endpointUri = endpointUris[i];
                        endpoint_2 = new endpoint_1.default(this, this.storageContext, this.contextConfig, endpointUri);
                        if (!(config.permissions.read == "public")) return [3 /*break*/, 3];
                        // connect account using a public endpoint
                        return [4 /*yield*/, endpoint_2.setUsePublic()];
                    case 2:
                        // connect account using a public endpoint
                        _c.sent();
                        endpoints[endpointUri] = endpoint_2;
                        return [3 /*break*/, 9];
                    case 3:
                        if (!this.account) return [3 /*break*/, 8];
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, endpoint_2.connectAccount(this.account, false)];
                    case 5:
                        _c.sent();
                        endpoints[endpointUri] = endpoint_2;
                        return [3 /*break*/, 7];
                    case 6:
                        err_3 = _c.sent();
                        if (err_3.message.match('Unable to connect')) {
                            // storage node is unavailable, so ignore
                        }
                        else {
                            throw err_3;
                        }
                        return [3 /*break*/, 7];
                    case 7: return [3 /*break*/, 9];
                    case 8:
                        // Unknown if this endpoint is valid, so include it in the pool and the status
                        // will be checked
                        endpoints[endpointUri] = endpoint_2;
                        _c.label = 9;
                    case 9:
                        _i++;
                        return [3 /*break*/, 1];
                    case 10: return [4 /*yield*/, this.locateAvailableEndpoint(endpoints, this.account ? true : false)];
                    case 11:
                        // If we have an account we would have already attempted to connect to the storage node
                        // and removed it if it was unavailable, so don't need to check the endpoint status
                        endpoint = _c.sent();
                        return [3 /*break*/, 14];
                    case 12: return [4 /*yield*/, this.getActiveEndpoint()];
                    case 13:
                        endpoint = _c.sent();
                        _c.label = 14;
                    case 14:
                        // force read only access if the current user doesn't have write access
                        if (!config.isOwner) {
                            if (config.permissions.write == "owner") {
                                // Only the owner can write, so set to read only
                                config.readOnly = true;
                            }
                            else if (config.permissions.write == "users" &&
                                config.permissions.writeList &&
                                config.permissions.writeList.indexOf(config.did) == -1) {
                                // This user doesn't have explicit write access
                                config.readOnly = true;
                            }
                        }
                        if (!(config.permissions.read == "owner" &&
                            config.permissions.write == "owner")) return [3 /*break*/, 17];
                        if (!this.keyring) {
                            throw new Error("Unable to open database. Permissions require \"owner\" access, but no account connected.");
                        }
                        return [4 /*yield*/, this.keyring.getStorageContextKey(databaseName)];
                    case 15:
                        storageContextKey = _c.sent();
                        encryptionKey = storageContextKey.secretKey;
                        db = new db_encrypted_1.default({
                            databaseName: databaseName,
                            did: did,
                            storageContext: contextName,
                            signContext: config.signingContext,
                            permissions: config.permissions,
                            readOnly: config.readOnly,
                            encryptionKey: encryptionKey,
                            endpoint: endpoint,
                            isOwner: config.isOwner,
                            saveDatabase: config.saveDatabase,
                            verifyEncryptionKey: config.verifyEncryptionKey,
                            plugins: config.plugins ? config.plugins : []
                        }, this);
                        return [4 /*yield*/, db.init()];
                    case 16:
                        _c.sent();
                        return [2 /*return*/, db];
                    case 17:
                        if (!(config.permissions.read == "public")) return [3 /*break*/, 19];
                        // If we aren't the owner of this database use the public credentials
                        // to access this database
                        if (!config.isOwner) {
                            if (config.permissions.write != "public") {
                                config.readOnly = true;
                            }
                        }
                        db = new db_public_1.default({
                            databaseName: databaseName,
                            did: did,
                            storageContext: contextName,
                            signContext: config.signingContext,
                            permissions: config.permissions,
                            readOnly: config.readOnly,
                            endpoint: endpoint,
                            isOwner: config.isOwner,
                            saveDatabase: config.saveDatabase,
                            plugins: config.plugins ? config.plugins : []
                        }, this);
                        return [4 /*yield*/, db.init()];
                    case 18:
                        _c.sent();
                        return [2 /*return*/, db];
                    case 19:
                        if (!(config.permissions.read == "users" ||
                            config.permissions.write == "users")) return [3 /*break*/, 25];
                        if (config.isOwner && !this.keyring) {
                            throw new Error("Unable to open database as the owner. No account connected.");
                        }
                        if (!config.isOwner && !config.encryptionKey) {
                            throw new Error("Unable to open external database. No encryption key in config.");
                        }
                        return [4 /*yield*/, this.keyring.getStorageContextKey(databaseName)];
                    case 20:
                        storageContextKey = _c.sent();
                        encryptionKey = config.encryptionKey
                            ? config.encryptionKey
                            : storageContextKey.secretKey;
                        db = new db_encrypted_1.default({
                            databaseName: databaseName,
                            did: did,
                            storageContext: contextName,
                            signContext: config.signingContext,
                            permissions: config.permissions,
                            readOnly: config.readOnly,
                            encryptionKey: encryptionKey,
                            endpoint: endpoint,
                            isOwner: config.isOwner,
                            saveDatabase: config.saveDatabase,
                            verifyEncryptionKey: config.verifyEncryptionKey,
                            plugins: config.plugins ? config.plugins : []
                        }, this);
                        _c.label = 21;
                    case 21:
                        _c.trys.push([21, 23, , 24]);
                        return [4 /*yield*/, db.init()];
                    case 22:
                        _c.sent();
                        return [3 /*break*/, 24];
                    case 23:
                        err_4 = _c.sent();
                        if ((err_4.status == 401 && err_4.code == 90) || err_4.message.match('Permission denied')) {
                            throw new Error("Unable to open database. Invalid credentials supplied.");
                        }
                        throw err_4;
                    case 24: return [2 /*return*/, db];
                    case 25: throw new Error("Unable to open database. Invalid permissions configuration.");
                }
            });
        });
    };
    StorageEngineVerida.prototype.logout = function () {
        _super.prototype.logout.call(this);
        for (var i in this.endpoints) {
            this.endpoints[i].logout();
        }
    };
    /**
     * Call checkReplication() on all the endpoints
     */
    StorageEngineVerida.prototype.checkReplication = function (databaseName) {
        return __awaiter(this, void 0, void 0, function () {
            var promises, i, endpoint;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        for (i in this.endpoints) {
                            endpoint = this.endpoints[i];
                            promises.push(endpoint.checkReplication(databaseName));
                        }
                        // No need for await as this can occur in the background
                        return [4 /*yield*/, Promise.all(promises)
                            //console.log(`checkReplication(${databaseName}): ${(new Date()).getTime()-now}`)
                        ];
                    case 1:
                        // No need for await as this can occur in the background
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Call createDb() on all the endpoints
     */
    StorageEngineVerida.prototype.createDb = function (databaseName, did, permissions) {
        return __awaiter(this, void 0, void 0, function () {
            var promises, i, endpoint, retry, results, resultIndex, failureCount, i, endpoint, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        for (i in this.endpoints) {
                            endpoint = this.endpoints[i];
                            retry = (typeof (this.accountDid) !== 'undefined' && did.toLowerCase() == this.accountDid.toLowerCase());
                            promises.push(endpoint.createDb(databaseName, permissions, retry));
                        }
                        return [4 /*yield*/, Promise.allSettled(promises)];
                    case 1:
                        results = _a.sent();
                        resultIndex = 0;
                        failureCount = 0;
                        for (i in this.endpoints) {
                            endpoint = this.endpoints[i];
                            result = results[resultIndex++];
                            if (result.status !== 'fulfilled') {
                                failureCount++;
                            }
                        }
                        if (failureCount == Object.keys(this.endpoints).length) {
                            throw new Error("Unable to create database (" + databaseName + ") on remote nodes");
                        }
                        // Call check replication to ensure this new database gets replicated across all nodes
                        return [4 /*yield*/, this.checkReplication(databaseName)];
                    case 2:
                        // Call check replication to ensure this new database gets replicated across all nodes
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Call updateDb() on all the endpoints
     */
    StorageEngineVerida.prototype.updateDatabase = function (databaseName, options) {
        return __awaiter(this, void 0, void 0, function () {
            var promises, i, endpoint, results, resultIndex, failureCount, i, endpoint, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        promises = [];
                        for (i in this.endpoints) {
                            endpoint = this.endpoints[i];
                            promises.push(endpoint.updateDatabase(databaseName, options));
                        }
                        return [4 /*yield*/, Promise.allSettled(promises)];
                    case 1:
                        results = _a.sent();
                        resultIndex = 0;
                        failureCount = 0;
                        for (i in this.endpoints) {
                            endpoint = this.endpoints[i];
                            result = results[resultIndex++];
                            if (result.status !== 'fulfilled') {
                                failureCount++;
                            }
                        }
                        if (failureCount == Object.keys(this.endpoints).length) {
                            throw new Error("Unable to update database (" + databaseName + ") on remote nodes");
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Call deleteDatabase() on all the endpoints
     */
    StorageEngineVerida.prototype.deleteDatabase = function (databaseName, config) {
        return __awaiter(this, void 0, void 0, function () {
            var promises, i, endpoint, results, resultIndex, failureCount, i, endpoint, result, dbRegistry;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.closeDatabase(this.accountDid, databaseName)
                        //const now = (new Date()).getTime()
                    ];
                    case 1:
                        _a.sent();
                        promises = [];
                        for (i in this.endpoints) {
                            endpoint = this.endpoints[i];
                            promises.push(endpoint.deleteDatabase(databaseName));
                        }
                        return [4 /*yield*/, Promise.allSettled(promises)];
                    case 2:
                        results = _a.sent();
                        resultIndex = 0;
                        failureCount = 0;
                        for (i in this.endpoints) {
                            endpoint = this.endpoints[i];
                            result = results[resultIndex++];
                            if (result.status !== 'fulfilled') {
                                failureCount++;
                            }
                        }
                        if (failureCount == Object.keys(this.endpoints).length) {
                            throw new Error("Unable to delete database (" + databaseName + ") on remote nodes");
                        }
                        dbRegistry = this.context.getDbRegistry();
                        return [4 /*yield*/, dbRegistry.removeDb(databaseName, this.accountDid, this.storageContext)
                            //console.log(`createDb(${databaseName}, ${did}): ${(new Date()).getTime()-now}`)
                        ];
                    case 3:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    StorageEngineVerida.prototype.info = function () {
        var _a;
        return __awaiter(this, void 0, void 0, function () {
            var endpoints, databases, _b, _c, _i, e, endpoint, usage, keys;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        endpoints = {};
                        databases = {};
                        _b = [];
                        for (_c in this.endpoints)
                            _b.push(_c);
                        _i = 0;
                        _d.label = 1;
                    case 1:
                        if (!(_i < _b.length)) return [3 /*break*/, 5];
                        e = _b[_i];
                        endpoint = this.endpoints[e];
                        return [4 /*yield*/, endpoint.getUsage(false)];
                    case 2:
                        usage = _d.sent();
                        endpoints[endpoint.toString()] = {
                            endpointUri: endpoint.toString(),
                            usage: usage
                        };
                        if (!(Object.keys(databases).length == 0)) return [3 /*break*/, 4];
                        return [4 /*yield*/, endpoint.getDatabases(false)];
                    case 3:
                        databases = _d.sent();
                        _d.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [4 /*yield*/, this.keyring.getKeys()];
                    case 6:
                        keys = _d.sent();
                        return [2 /*return*/, {
                                name: this.storageContext,
                                activeEndpoint: (_a = this.activeEndpoint) === null || _a === void 0 ? void 0 : _a.toString(),
                                endpoints: endpoints,
                                databases: databases,
                                keys: keys
                            }];
                }
            });
        });
    };
    StorageEngineVerida.prototype.closeDatabase = function (did, databaseName) {
        return __awaiter(this, void 0, void 0, function () {
            var e;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: 
                    // delete from cache
                    return [4 /*yield*/, this.context.clearDatabaseCache(did, databaseName)];
                    case 1:
                        // delete from cache
                        _a.sent();
                        for (e in this.endpoints) {
                            this.endpoints[e].disconnectDatabase(did, databaseName);
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return StorageEngineVerida;
}(base_1.default));
exports.default = StorageEngineVerida;
//# sourceMappingURL=engine.js.map
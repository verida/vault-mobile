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
var events_1 = require("events");
var datastore_1 = __importDefault(require("./datastore"));
var profile_1 = require("./profiles/profile");
var engine_1 = __importDefault(require("./engines/verida/database/engine"));
var engine_2 = __importDefault(require("./engines/verida/messaging/engine"));
var db_registry_1 = __importDefault(require("./db-registry"));
var engine_3 = __importDefault(require("./engines/verida/notification/engine"));
var _ = require("lodash");
var DATABASE_ENGINES = {
    VeridaDatabase: engine_1.default,
};
var MESSAGING_ENGINES = {
    VeridaMessage: engine_2.default,
};
var NOTIFICATION_ENGINES = {
    VeridaNotification: engine_3.default,
};
/**
 * An application context is a silo'd container of data for a specific application.
 *
 * It supports:
 *
 * - Database storage (encrypted, public, permissioned, queries, indexes)
 * - Messaging (between users and applications)
 * - Block storage (large files such as images and video) -- Coming soon
 */
/**
 * @category
 * Modules
 */
var Context = /** @class */ (function (_super) {
    __extends(Context, _super);
    /**
     * Instantiate a new context.
     *
     * **Do not use directly**. Use `client.openContext()` or `Network.connect()`.
     *
     * @param client {Client}
     * @param contextName {string}
     * @param didContextManager {DIDContextManager}
     * @param account {AccountInterface}
     */
    function Context(client, contextName, didContextManager, account) {
        var _this = _super.call(this) || this;
        _this.databaseEngines = {};
        _this.databaseCache = {};
        _this.client = client;
        _this.contextName = contextName;
        _this.didContextManager = didContextManager;
        _this.account = account;
        _this.dbRegistry = new db_registry_1.default(_this);
        return _this;
    }
    Context.prototype.getContextConfig = function (did, forceCreate, customContextName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!!did) return [3 /*break*/, 2];
                        if (!this.account) {
                            throw new Error("No DID specified and no authenticated user");
                        }
                        return [4 /*yield*/, this.account.did()];
                    case 1:
                        did = _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, this.didContextManager.getDIDContextConfig(did, customContextName ? customContextName : this.contextName, forceCreate)];
                }
            });
        });
    };
    Context.prototype.getContextName = function () {
        return this.contextName;
    };
    Context.prototype.getAccount = function () {
        return this.account;
    };
    Context.prototype.getDidContextManager = function () {
        return this.didContextManager;
    };
    Context.prototype.getClient = function () {
        return this.client;
    };
    Context.prototype.disconnect = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.account) return [3 /*break*/, 2];
                        return [4 /*yield*/, this.account.disconnect(this.contextName)];
                    case 1:
                        _a.sent();
                        this.account = undefined;
                        return [2 /*return*/, true];
                    case 2: return [2 /*return*/, false];
                }
            });
        });
    };
    /**
     * Get a storage engine for a given DID and this contextName
     *
     * @param did
     * @returns {BaseStorageEngine}
     */
    Context.prototype.getDatabaseEngine = function (did, createContext) {
        return __awaiter(this, void 0, void 0, function () {
            var contextConfig, engineType, engine, databaseEngine, context;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.databaseEngines[did]) {
                            return [2 /*return*/, this.databaseEngines[did]];
                        }
                        return [4 /*yield*/, this.getContextConfig(did, createContext)];
                    case 1:
                        contextConfig = _a.sent();
                        engineType = contextConfig.services.databaseServer.type;
                        if (!DATABASE_ENGINES[engineType]) {
                            throw new Error("Unsupported database engine type specified: " + engineType);
                        }
                        engine = DATABASE_ENGINES[engineType];
                        databaseEngine = new engine(this, this.dbRegistry, contextConfig);
                        if (!this.account) return [3 /*break*/, 3];
                        return [4 /*yield*/, databaseEngine.connectAccount(this.account)];
                    case 2:
                        _a.sent();
                        _a.label = 3;
                    case 3:
                        context = this;
                        databaseEngine.on('EndpointUnavailable', function (endpointUri) {
                            context.emit('EndpointWarning', endpointUri);
                        });
                        databaseEngine.on('EndpointWarning', function (endpointUri, message) {
                            context.emit('EndpointWarning', endpointUri, message);
                        });
                        // cache storage engine for this did and context
                        this.databaseEngines[did] = databaseEngine;
                        return [2 /*return*/, databaseEngine];
                }
            });
        });
    };
    /**
     * Get a messaging instance for this application context.
     *
     * Allows you to send and receive messages as the currently connected account.
     *
     * @returns {Messaging} Messaging instance
     */
    Context.prototype.getMessaging = function (messageConfig) {
        if (messageConfig === void 0) { messageConfig = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var did, contextConfig, engineType, engine;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.messagingEngine) {
                            return [2 /*return*/, this.messagingEngine];
                        }
                        if (!this.account) {
                            throw new Error("Unable to open messaging. No authenticated user.");
                        }
                        return [4 /*yield*/, this.account.did()];
                    case 1:
                        did = _a.sent();
                        return [4 /*yield*/, this.getContextConfig(did, true)];
                    case 2:
                        contextConfig = _a.sent();
                        engineType = contextConfig.services.messageServer.type;
                        if (!MESSAGING_ENGINES[engineType]) {
                            throw new Error("Unsupported messaging engine type specified: " + engineType);
                        }
                        engine = MESSAGING_ENGINES[engineType];
                        this.messagingEngine = new engine(this, messageConfig);
                        return [4 /*yield*/, this.messagingEngine.connectAccount(this.account)];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.messagingEngine];
                }
            });
        });
    };
    Context.prototype.getNotification = function (did, contextName) {
        return __awaiter(this, void 0, void 0, function () {
            var contextConfig, engineType, engine, _a, _b, _c;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!this.account) {
                            throw new Error("Unable to open notification. No authenticated user.");
                        }
                        return [4 /*yield*/, this.didContextManager.getDIDContextConfig(did, contextName, false)];
                    case 1:
                        contextConfig = _d.sent();
                        if (!contextConfig || !contextConfig.services.notificationServer) {
                            // User doesn't have a notification service
                            return [2 /*return*/];
                        }
                        engineType = contextConfig.services.notificationServer.type;
                        if (!NOTIFICATION_ENGINES[engineType]) {
                            throw new Error("Unsupported messaging engine type specified: " + engineType);
                        }
                        engine = NOTIFICATION_ENGINES[engineType];
                        _a = this;
                        _b = engine.bind;
                        _c = [void 0, this.contextName];
                        return [4 /*yield*/, this.account.keyring(this.contextName)];
                    case 2:
                        _a.notificationEngine = new (_b.apply(engine, _c.concat([_d.sent(), contextName,
                            did,
                            contextConfig.services.notificationServer.endpointUri])))();
                        return [2 /*return*/, this.notificationEngine];
                }
            });
        });
    };
    /**
     * Get a user's profile.
     *
     * @param profileName string Name of the Verida profile schema to load
     * @param did string DID of the profile to get. Leave blank to fetch a read/write profile for the currently authenticated user
     * @returns {Profile}
     */
    Context.prototype.openProfile = function (profileName, did) {
        if (profileName === void 0) { profileName = "basicProfile"; }
        return __awaiter(this, void 0, void 0, function () {
            var ownAccount;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        ownAccount = false;
                        if (!!did) return [3 /*break*/, 2];
                        if (!this.account) {
                            throw new Error("Unable to get profile. No DID specified and no account connected.");
                        }
                        return [4 /*yield*/, this.account.did()];
                    case 1:
                        did = _a.sent();
                        ownAccount = true;
                        return [3 /*break*/, 4];
                    case 2: return [4 /*yield*/, this.getClient().parseDid(did)];
                    case 3:
                        did = _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/, new profile_1.Profile(this, did, profileName, ownAccount)];
                }
            });
        });
    };
    /**
     * Open a database owned by this account.
     *
     * @param databaseName {string} Name of the database to open
     * @param options {DatabaseOpenConfig} Optional database configuration
     *
     * @returns {Promise<Database>}
     */
    Context.prototype.openDatabase = function (databaseName, config) {
        if (config === void 0) { config = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var accountDid, _a, cacheKey, instance, promise, _b, _c;
            var _this = this;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (!this.account) {
                            throw new Error("Unable to open database. No authenticated user.");
                        }
                        return [4 /*yield*/, this.account.did()];
                    case 1:
                        accountDid = _d.sent();
                        if (!!config.did) return [3 /*break*/, 2];
                        config.did = accountDid;
                        return [3 /*break*/, 4];
                    case 2:
                        _a = config;
                        return [4 /*yield*/, this.getClient().parseDid(config.did)];
                    case 3:
                        _a.did = _d.sent();
                        _d.label = 4;
                    case 4:
                        config.did = config.did.toLowerCase();
                        cacheKey = config.did + "/" + databaseName + "/internal";
                        if (this.databaseCache[cacheKey] && !config.ignoreCache) {
                            return [2 /*return*/, this.databaseCache[cacheKey]];
                        }
                        instance = this;
                        promise = new Promise(function (resolve, rejects) { return __awaiter(_this, void 0, void 0, function () {
                            var databaseEngine, database, err_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _a.trys.push([0, 5, , 6]);
                                        return [4 /*yield*/, instance.getDatabaseEngine(config.did, config.createContext)];
                                    case 1:
                                        databaseEngine = _a.sent();
                                        if (!config.signingContext) {
                                            config.signingContext = instance;
                                        }
                                        return [4 /*yield*/, databaseEngine.openDatabase(databaseName, config)];
                                    case 2:
                                        database = _a.sent();
                                        if (!(config.saveDatabase !== false)) return [3 /*break*/, 4];
                                        return [4 /*yield*/, instance.dbRegistry.saveDb(database, false)];
                                    case 3:
                                        _a.sent();
                                        _a.label = 4;
                                    case 4:
                                        instance.databaseCache[cacheKey] = database;
                                        //console.log(`openDatabase(${databaseName}, ${config.did}): ${(new Date()).getTime()-now}`)
                                        resolve(database);
                                        return [3 /*break*/, 6];
                                    case 5:
                                        err_1 = _a.sent();
                                        rejects(err_1);
                                        return [3 /*break*/, 6];
                                    case 6: return [2 /*return*/];
                                }
                            });
                        }); });
                        _b = this.databaseCache;
                        _c = cacheKey;
                        return [4 /*yield*/, promise];
                    case 5:
                        _b[_c] = (_d.sent());
                        return [2 /*return*/, this.databaseCache[cacheKey]];
                }
            });
        });
    };
    /**
     * Open an external database owned by an account that isn't the currently connected account.
     *
     * @param databaseName {string} Name of the database to open
     * @param did {string} DID of the external account that owns the database
     * @param options {DatabaseOpenConfig} Optional database configuration
     * @returns {Database}
     */
    Context.prototype.openExternalDatabase = function (databaseName, did, config) {
        if (config === void 0) { config = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var cacheKey, contextConfig, client, context, databaseEngine, database;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getClient().parseDid(did)];
                    case 1:
                        did = _a.sent();
                        did = did.toLowerCase();
                        cacheKey = did.replace(/did:vda:[a-z]*:/, '') + "/" + databaseName + "/external";
                        if (this.databaseCache[cacheKey] && !config.ignoreCache) {
                            return [2 /*return*/, this.databaseCache[cacheKey]];
                        }
                        if (!!config.endpoints) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getContextConfig(did, false, config.contextName ? config.contextName : this.contextName)];
                    case 2:
                        contextConfig = _a.sent();
                        config.endpoints = contextConfig.services.databaseServer.endpointUri;
                        if (contextConfig.isLegacyDid) {
                            did = config.did = did.replace('polpos', 'mainnet');
                        }
                        _a.label = 3;
                    case 3:
                        config = _.merge({
                            did: did,
                            signingContext: this,
                            permissions: {
                                read: "users",
                                write: "users",
                            },
                        }, config);
                        config.isOwner = false;
                        config.saveDatabase = false;
                        if (!(config.contextName && config.contextName != this.contextName)) return [3 /*break*/, 6];
                        client = this.getClient();
                        return [4 /*yield*/, client.openExternalContext(config.contextName, did)];
                    case 4:
                        context = _a.sent();
                        config.signingContext = this;
                        return [4 /*yield*/, context.openDatabase(databaseName, config)];
                    case 5: return [2 /*return*/, _a.sent()];
                    case 6: return [4 /*yield*/, this.getDatabaseEngine(did)];
                    case 7:
                        databaseEngine = _a.sent();
                        return [4 /*yield*/, databaseEngine.openDatabase(databaseName, config)];
                    case 8:
                        database = _a.sent();
                        // Add to cache of databases
                        this.databaseCache[cacheKey] = database;
                        return [2 /*return*/, database];
                }
            });
        });
    };
    Context.prototype.deleteDatabase = function (databaseName) {
        return __awaiter(this, void 0, void 0, function () {
            var accountDid, databaseEngine;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.account) {
                            throw new Error("Unable to delete database. No authenticated user.");
                        }
                        return [4 /*yield*/, this.account.did()];
                    case 1:
                        accountDid = _a.sent();
                        return [4 /*yield*/, this.getDatabaseEngine(accountDid, false)];
                    case 2:
                        databaseEngine = _a.sent();
                        return [4 /*yield*/, databaseEngine.deleteDatabase(databaseName)];
                    case 3: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Open a dataastore owned by this account.
     *
     * @param schemaUri {string} URI of the schema to open (ie: https://common.schemas.verida.io/health/activity/latest/schema.json)
     * @param config {DatastoreOpenConfig} Optional datastore configuration
     * @returns {Datastore}
     */
    Context.prototype.openDatastore = function (schemaUri, config) {
        if (config === void 0) { config = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!this.account) {
                    throw new Error("Unable to open datastore. No authenticated user.");
                }
                // @todo: Should this also call _init to confirm everything is good?
                return [2 /*return*/, new datastore_1.default(schemaUri, this, config)];
            });
        });
    };
    /**
     * Open an external datastore owned by an account that isn't the currently connected account.
     *
     * @param schemaUri {string} URI of the schema to open (ie: https://common.schemas.verida.io/health/activity/latest/schema.json)
     * @param did {string} DID of the external account that owns the database
     * @param options {DatabaseOpenConfig} Optional database configuration
     * @returns {Datastore}
     */
    Context.prototype.openExternalDatastore = function (schemaUri, did, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getClient().parseDid(did)];
                    case 1:
                        did = _a.sent();
                        options = _.merge({
                            did: did,
                            external: true,
                        }, options);
                        // @todo: Should this also call _init to confirm everything is good?
                        return [2 /*return*/, new datastore_1.default(schemaUri, this, options)];
                }
            });
        });
    };
    Context.prototype.getDbRegistry = function () {
        return this.dbRegistry;
    };
    /**
     * Get the status of this context for databases, their connected endpoints and databases
     *
     * @returns
     */
    Context.prototype.info = function () {
        return __awaiter(this, void 0, void 0, function () {
            var accountDid, engine, databases;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.account) {
                            throw new Error("Unable to open database. No authenticated user.");
                        }
                        return [4 /*yield*/, this.account.did()];
                    case 1:
                        accountDid = _a.sent();
                        return [4 /*yield*/, this.getDatabaseEngine(accountDid, false)];
                    case 2:
                        engine = _a.sent();
                        return [4 /*yield*/, engine.info()];
                    case 3:
                        databases = _a.sent();
                        return [2 /*return*/, {
                                databases: databases
                            }];
                }
            });
        });
    };
    Context.prototype.getAuthContext = function (authConfig, authType) {
        return __awaiter(this, void 0, void 0, function () {
            var did, contextConfig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.account) {
                            throw new Error("No authenticated user");
                        }
                        return [4 /*yield*/, this.account.did()];
                    case 1:
                        did = _a.sent();
                        return [4 /*yield*/, this.getContextConfig(did, false)];
                    case 2:
                        contextConfig = _a.sent();
                        if (!authConfig) {
                            authConfig = {
                                force: false
                            };
                        }
                        return [2 /*return*/, this.account.getAuthContext(this.contextName, contextConfig, authConfig, authType)];
                }
            });
        });
    };
    /**
     * Emits `progress` event when adding the endpoint has progressed (ie: replicating databases to the new endpoint).
     *
     * @param engineType
     * @param endpointUri
     */
    Context.prototype.addEndpoint = function (engineType, endpointUri) {
        return __awaiter(this, void 0, void 0, function () {
            var did, engine, success;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.account) {
                            throw new Error('Unable to add endpoint. No account connected.');
                        }
                        if (!(engineType == 'database')) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.account.did()];
                    case 1:
                        did = _a.sent();
                        return [4 /*yield*/, this.getDatabaseEngine(did, false)];
                    case 2:
                        engine = _a.sent();
                        return [4 /*yield*/, engine.addEndpoint(this, endpointUri)];
                    case 3:
                        success = _a.sent();
                        if (!success) {
                            throw new Error("Adding endpoint failed with unknown error");
                        }
                        return [3 /*break*/, 5];
                    case 4: throw new Error("Adding endpoint for " + engineType + " is not supported");
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Close this context.
     *
     * Closes all open database connections, returns resources, cancels event listeners
     */
    Context.prototype.close = function (options) {
        if (options === void 0) { options = {
            clearLocal: true
        }; }
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _i, d, database;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = [];
                        for (_b in this.databaseCache)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        d = _a[_i];
                        return [4 /*yield*/, this.databaseCache[d]];
                    case 2:
                        database = _c.sent();
                        return [4 /*yield*/, database.close(options)];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5:
                        // The DbRegistry database has been closed. Reset to a clean instance so
                        // it will be re-opened if necessary
                        this.dbRegistry = new db_registry_1.default(this);
                        return [2 /*return*/];
                }
            });
        });
    };
    Context.prototype.clearDatabaseCache = function (did, databaseName) {
        return __awaiter(this, void 0, void 0, function () {
            var types, _a, _b, _i, t, cacheKey, err_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        types = ['internal', 'external'];
                        _a = [];
                        for (_b in types)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        t = _a[_i];
                        cacheKey = did.toLowerCase() + "/" + databaseName + "/" + types[t];
                        if (!this.databaseCache[cacheKey]) return [3 /*break*/, 6];
                        _c.label = 2;
                    case 2:
                        _c.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.databaseCache[cacheKey].close({
                                clearLocal: true
                            })];
                    case 3:
                        _c.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_2 = _c.sent();
                        return [3 /*break*/, 5];
                    case 5:
                        delete this.databaseCache[cacheKey];
                        _c.label = 6;
                    case 6:
                        _i++;
                        return [3 /*break*/, 1];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return Context;
}(events_1.EventEmitter));
exports.default = Context;
//# sourceMappingURL=context.js.map
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
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
var base_db_1 = __importDefault(require("./base-db"));
var encryption_utils_1 = __importDefault(require("@verida/encryption-utils"));
var pouchdb_replication_react_native_1 = __importDefault(require("@verida/pouchdb-replication-react-native"));
var pouchdb_mapreduce_1 = __importDefault(require("pouchdb-mapreduce"));
var react_native_sqlite_2_1 = __importDefault(require("react-native-sqlite-2"));
var pouchdb_adapter_react_native_sqlite_1 = __importDefault(require("pouchdb-adapter-react-native-sqlite"));
var SQLiteAdapter = (0, pouchdb_adapter_react_native_sqlite_1.default)(react_native_sqlite_2_1.default);
var CryptoPouch = __importStar(require("crypto-pouch"));
var PouchDBFind = __importStar(require("pouchdb-find"));
var pouchdb_adapter_http_1 = __importDefault(require("pouchdb-adapter-http"));
var pouchdb_core_react_native_1 = __importDefault(require("@craftzdog/pouchdb-core-react-native"));
var pouchdb_core_react_native_2 = __importDefault(require("@craftzdog/pouchdb-core-react-native"));
pouchdb_core_react_native_1.default.plugin(pouchdb_adapter_http_1.default)
    .plugin(pouchdb_replication_react_native_1.default)
    .plugin(pouchdb_mapreduce_1.default)
    .plugin(PouchDBFind)
    .plugin(SQLiteAdapter);
pouchdb_core_react_native_2.default
    .plugin(pouchdb_adapter_http_1.default)
    .plugin(pouchdb_replication_react_native_1.default)
    .plugin(pouchdb_mapreduce_1.default)
    .plugin(PouchDBFind)
    .plugin(SQLiteAdapter)
    .plugin(CryptoPouch);
/**
 * @category
 * Modules
 */
var EncryptedDatabase = /** @class */ (function (_super) {
    __extends(EncryptedDatabase, _super);
    /**
     *
     */
    function EncryptedDatabase(config, engine) {
        var _this = _super.call(this, config, engine) || this;
        _this._closing = false;
        _this._syncError = null;
        _this.encryptionKey = config.encryptionKey;
        // PouchDB sync object
        _this._sync = null;
        return _this;
    }
    EncryptedDatabase.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _i, _a, plugin, now, password, saltString, salt;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.db) {
                            return [2 /*return*/];
                        }
                        if (this.config.plugins) {
                            for (_i = 0, _a = this.config.plugins; _i < _a.length; _i++) {
                                plugin = _a[_i];
                                pouchdb_core_react_native_2.default.plugin(plugin);
                            }
                        }
                        now = (new Date()).getTime();
                        return [4 /*yield*/, _super.prototype.init.call(this)];
                    case 1:
                        _b.sent();
                        //console.log(`Db.init-1(${this.databaseName}): ${(new Date()).getTime()-now}`)
                        this._localDbEncrypted = new pouchdb_core_react_native_1.default(this.databaseHash);
                        this._localDb = new pouchdb_core_react_native_2.default(this.databaseHash);
                        password = (this.password = Buffer.from(this.encryptionKey).toString("hex"));
                        saltString = encryption_utils_1.default.hash(password + "/" + this.databaseHash);
                        salt = Buffer.from(saltString, "hex");
                        return [4 /*yield*/, this._localDb.crypto({
                                password: password,
                                salt: salt,
                                iterations: 1000,
                                // Setting to 1,000 -- Any higher and it takes too long on mobile devices
                            })];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, this.initSync()];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    EncryptedDatabase.prototype.initSync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var databaseName, instance, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        databaseName = this.databaseName;
                        instance = this;
                        // Do a once off sync to ensure the local database pulls all data from remote server
                        // before commencing live syncronisation between the two databases
                        return [4 /*yield*/, this._localDbEncrypted.replicate
                                .from(this.db, {
                                // Dont sync design docs
                                filter: function (doc) {
                                    return doc._id.indexOf("_design") !== 0;
                                },
                            })
                                .on("error", function (err) {
                                console.error("Unknown error occurred with replication snapshot from remote database: " + databaseName);
                                console.error(err);
                            })
                                .on("denied", function (err) {
                                console.error("Permission denied with replication snapshot from remote database: " + databaseName + ")");
                                console.error(err);
                            })
                                .on("complete", function (info) {
                                //console.log(`Db.init-3(${databaseName}): ${(new Date()).getTime()-now}`)
                                // Commence two-way, continuous, retrivable sync
                                instance.sync();
                                //console.log(`Db.init-4(${databaseName}): ${(new Date()).getTime()-now}`)
                            })];
                    case 1:
                        // Do a once off sync to ensure the local database pulls all data from remote server
                        // before commencing live syncronisation between the two databases
                        _a.sent();
                        if (!this.config.verifyEncryptionKey) return [3 /*break*/, 7];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 7]);
                        return [4 /*yield*/, this.getMany()];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 7];
                    case 4:
                        err_1 = _a.sent();
                        if (!(err_1.message == "Unsupported state or unable to authenticate data" ||
                            err_1.message == "Could not decrypt!")) return [3 /*break*/, 6];
                        // Clear the instantiated PouchDb instances and throw a more useful exception
                        return [4 /*yield*/, this.close()];
                    case 5:
                        // Clear the instantiated PouchDb instances and throw a more useful exception
                        _a.sent();
                        throw new Error("Invalid encryption key supplied");
                    case 6: 
                    // Unknown error, rethrow
                    throw err_1;
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Restarts the remote database syncing
     *
     * This will clear all sync event listeners.
     * It will retain event listeners on the actual database (subscribed via `changes()`)
     *
     * @returns PouchDB Sync object
     */
    EncryptedDatabase.prototype.sync = function () {
        if (this._sync) {
            // Cancel any existing sync
            this._sync.cancel();
            this._syncError = null;
        }
        var instance = this;
        var databaseName = this.databaseName;
        this._sync = pouchdb_core_react_native_1.default.sync(this._localDbEncrypted, this.db, {
            live: true,
            retry: false,
            timeout: 5000,
            // Dont sync design docs
            filter: function (doc) {
                return doc._id.indexOf("_design") !== 0;
            },
        })
            .on("change", function (info) {
            instance._syncStatus = 'change';
            instance._syncInfo = info;
        })
            .on("paused", function (err) {
            instance._syncStatus = 'paused';
            instance._syncInfo = err;
        })
            .on("active", function () {
            instance._syncStatus = 'active';
            instance._syncInfo = undefined;
        })
            .on("complete", function (info) {
            instance._syncStatus = 'complete';
            instance._syncInfo = info;
        })
            .on("error", function (err) {
            return __awaiter(this, void 0, void 0, function () {
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            instance._syncStatus = 'error';
                            instance._syncError = err;
                            return [4 /*yield*/, instance.replaceEndpoint()];
                        case 1:
                            _a.sent();
                            return [2 /*return*/];
                    }
                });
            });
        })
            .on("denied", function (err) {
            instance._syncStatus = 'denied';
            instance._syncError = err;
            instance.replaceEndpoint();
        });
        return this._sync;
    };
    /**
     * Subscribe to sync events
     *
     * See https://pouchdb.com/api.html#sync
     *
     * ie:
     *
     * ```
     * const listener = database.onSync('error', (err) => { console.log(err) })
     * listener.cancel()
     * ```
     *
     * @param event
     * @param handler
     */
    EncryptedDatabase.prototype.onSync = function (event, handler) {
        if (!this._sync) {
            throw new Error("Unable to create sync event handler. Syncronization is not enabled.");
        }
        return this._sync.on(event, handler);
    };
    /**
     * Close a database.
     *
     * This will remove all event listeners.
     */
    EncryptedDatabase.prototype.close = function (options) {
        if (options === void 0) { options = {
            clearLocal: false
        }; }
        return __awaiter(this, void 0, void 0, function () {
            var err_2, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.closing) {
                            return [2 /*return*/];
                        }
                        this.closing = true;
                        if (!(this._sync === null)) return [3 /*break*/, 2];
                        // No sync object indicates this database is closed
                        return [4 /*yield*/, this.engine.closeDatabase(this.did, this.databaseName)];
                    case 1:
                        // No sync object indicates this database is closed
                        _a.sent();
                        this.emit('closed', this.databaseName);
                        return [2 /*return*/];
                    case 2: return [4 /*yield*/, this.finalizeSync()];
                    case 3:
                        _a.sent();
                        if (!options.clearLocal) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.destroy({
                                localOnly: true
                            })
                            // Return, because destroy will close all database connections
                        ];
                    case 4:
                        _a.sent();
                        // Return, because destroy will close all database connections
                        return [2 /*return*/];
                    case 5:
                        _a.trys.push([5, 7, , 8]);
                        return [4 /*yield*/, this._localDbEncrypted.close()];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        err_2 = _a.sent();
                        return [3 /*break*/, 8];
                    case 8:
                        _a.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, this.db.close()];
                    case 9:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        err_3 = _a.sent();
                        return [3 /*break*/, 11];
                    case 11: return [4 /*yield*/, this.engine.closeDatabase(this.did, this.databaseName)];
                    case 12:
                        _a.sent();
                        this.emit('closed', this.databaseName);
                        return [2 /*return*/];
                }
            });
        });
    };
    EncryptedDatabase.prototype.finalizeSync = function () {
        return __awaiter(this, void 0, void 0, function () {
            var instance_1, promise, result, err_4, result, err_5;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this._sync) {
                            return [2 /*return*/];
                        }
                        if (!(this._sync && this._syncStatus != 'paused' && this._syncStatus != 'complete')) return [3 /*break*/, 2];
                        instance_1 = this;
                        promise = new Promise(function (resolve) {
                            instance_1._sync.on('paused', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    resolve();
                                    return [2 /*return*/];
                                });
                            }); });
                            instance_1._sync.on('complete', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    resolve();
                                    return [2 /*return*/];
                                });
                            }); });
                            instance_1._sync.on('error', function () { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    // If we have an error, that's okay, because the final replication will
                                    // fix any issues or replace the endpoint if required
                                    resolve();
                                    return [2 /*return*/];
                                });
                            }); });
                        });
                        // console.log('waiting for sync to complete', this._syncStatus, this._sync.pull.state, this._sync.push.state)
                        // Wait until sync completes
                        return [4 /*yield*/, promise];
                    case 1:
                        // console.log('waiting for sync to complete', this._syncStatus, this._sync.pull.state, this._sync.push.state)
                        // Wait until sync completes
                        _a.sent();
                        _a.label = 2;
                    case 2: 
                    // Cancel the current sync
                    return [4 /*yield*/, this._sync.cancel()];
                    case 3:
                        // Cancel the current sync
                        _a.sent();
                        this._sync = null;
                        this._syncError = null;
                        _a.label = 4;
                    case 4:
                        _a.trys.push([4, 6, , 12]);
                        return [4 /*yield*/, pouchdb_core_react_native_1.default.replicate(this._localDbEncrypted, this.db, {
                                live: false,
                                retry: false,
                                timeout: 5000, // 5 second timeout
                            })
                            // replication completed successfully
                        ];
                    case 5:
                        result = _a.sent();
                        return [3 /*break*/, 12];
                    case 6:
                        err_4 = _a.sent();
                        // Replication has failed, this is likely because the endpoint is down
                        // We need to connect to a different endpoint
                        return [4 /*yield*/, this.replaceEndpoint()
                            // Try again
                        ];
                    case 7:
                        // Replication has failed, this is likely because the endpoint is down
                        // We need to connect to a different endpoint
                        _a.sent();
                        _a.label = 8;
                    case 8:
                        _a.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, pouchdb_core_react_native_1.default.replicate(this._localDbEncrypted, this.db, {
                                live: false,
                                retry: false,
                                timeout: 5000, // 5 second timeout
                            })];
                    case 9:
                        result = _a.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        err_5 = _a.sent();
                        console.log(err_5);
                        throw new Error("Unable to sync data with network when closing database " + this.databaseName);
                    case 11: return [3 /*break*/, 12];
                    case 12: return [2 /*return*/];
                }
            });
        });
    };
    EncryptedDatabase.prototype.destroy = function (options) {
        if (options === void 0) { options = {
            localOnly: false
        }; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.isOwner && !options.localOnly) {
                            throw new Error("Unable to update users for a database you don't own");
                        }
                        return [4 /*yield*/, this.finalizeSync()
                            // Actually perform database deletion
                        ];
                    case 1:
                        _a.sent();
                        // Actually perform database deletion
                        return [4 /*yield*/, this._destroy(options)];
                    case 2:
                        // Actually perform database deletion
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    EncryptedDatabase.prototype._destroy = function (options) {
        if (options === void 0) { options = {
            localOnly: false
        }; }
        return __awaiter(this, void 0, void 0, function () {
            var err_6, err_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        // Destroy the local pouch database (this deletes this._local and this._localDbEncrypted as they share the same underlying data source)
                        return [4 /*yield*/, this._localDbEncrypted.destroy()];
                    case 1:
                        // Destroy the local pouch database (this deletes this._local and this._localDbEncrypted as they share the same underlying data source)
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_6 = _a.sent();
                        return [3 /*break*/, 3];
                    case 3:
                        _a.trys.push([3, 7, , 8]);
                        if (!!options.localOnly) return [3 /*break*/, 5];
                        // Only delete remote database if required
                        return [4 /*yield*/, this.engine.deleteDatabase(this.databaseName)];
                    case 4:
                        // Only delete remote database if required
                        _a.sent();
                        _a.label = 5;
                    case 5: return [4 /*yield*/, this.close({
                            clearLocal: false
                        })];
                    case 6:
                        _a.sent();
                        return [3 /*break*/, 8];
                    case 7:
                        err_7 = _a.sent();
                        console.log(err_7);
                        return [3 /*break*/, 8];
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    EncryptedDatabase.prototype.updateUsers = function (readList, writeList) {
        if (readList === void 0) { readList = []; }
        if (writeList === void 0) { writeList = []; }
        return __awaiter(this, void 0, void 0, function () {
            var options;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        if (!this.isOwner) {
                            throw new Error("Unable to update users for a database you don't own");
                        }
                        this.permissions.readList = readList;
                        this.permissions.writeList = writeList;
                        options = {
                            permissions: this.permissions,
                        };
                        return [4 /*yield*/, this.engine.updateDatabase(this.databaseName, options)];
                    case 2:
                        _a.sent();
                        if (!(this.config.saveDatabase !== false)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.engine.getDbRegistry().saveDb(this)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    EncryptedDatabase.prototype.getDb = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this._localDb];
                }
            });
        });
    };
    EncryptedDatabase.prototype.getRemoteEncrypted = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.db];
                }
            });
        });
    };
    EncryptedDatabase.prototype.getLocalEncrypted = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this._localDbEncrypted];
                }
            });
        });
    };
    EncryptedDatabase.prototype.getEncryptionKey = function () {
        return this.encryptionKey;
    };
    EncryptedDatabase.prototype.info = function () {
        return __awaiter(this, void 0, void 0, function () {
            var sync, info;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        sync = {};
                        if (this._sync) {
                            sync.canceled = this._sync.canceled;
                            sync.pull = {
                                status: this._sync.pull.state,
                                canceled: this._sync.pull.canceled,
                            };
                            sync.push = {
                                status: this._sync.push.state,
                                canceled: this._sync.push.canceled,
                            };
                        }
                        info = {
                            type: "VeridaDatabase",
                            privacy: "encrypted",
                            did: this.did,
                            endpoint: this.endpoint.toString(),
                            permissions: this.permissions,
                            storageContext: this.storageContext,
                            databaseName: this.databaseName,
                            databaseHash: this.databaseHash,
                            encryptionKey: this.encryptionKey,
                            sync: sync,
                        };
                        return [2 /*return*/, info];
                }
            });
        });
    };
    EncryptedDatabase.prototype.registryEntry = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, {
                                dbHash: this.databaseHash,
                                dbName: this.databaseName,
                                endpointType: "VeridaDatabase",
                                did: this.did,
                                contextName: this.storageContext,
                                permissions: this.permissions,
                                encryptionKey: {
                                    type: "x25519-xsalsa20-poly1305",
                                    key: this.password,
                                },
                                endpoint: this.endpoint.toString()
                            }];
                }
            });
        });
    };
    return EncryptedDatabase;
}(base_db_1.default));
exports.default = EncryptedDatabase;
//# sourceMappingURL=db-encrypted.js.map
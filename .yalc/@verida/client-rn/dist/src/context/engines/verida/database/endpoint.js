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
var events_1 = require("events");
var client_1 = __importDefault(require("./client"));
var utils_1 = __importDefault(require("./utils"));
var types_1 = require("@verida/types");
var pouchdb_core_react_native_1 = __importDefault(require("@craftzdog/pouchdb-core-react-native"));
var pouchdb_adapter_http_1 = __importDefault(require("pouchdb-adapter-http"));
var pouchdb_replication_react_native_1 = __importDefault(require("@verida/pouchdb-replication-react-native"));
var pouchdb_mapreduce_1 = __importDefault(require("pouchdb-mapreduce"));
var PouchDBFind = __importStar(require("pouchdb-find"));
pouchdb_core_react_native_1.default
    .plugin(pouchdb_adapter_http_1.default)
    .plugin(pouchdb_replication_react_native_1.default)
    .plugin(pouchdb_mapreduce_1.default)
    .plugin(PouchDBFind);
/**
 * @emits EndpointWarning
 */
var Endpoint = /** @class */ (function (_super) {
    __extends(Endpoint, _super);
    function Endpoint(storageEngine, contextName, contextConfig, endpointUri) {
        var _this = _super.call(this) || this;
        _this.usePublic = false;
        _this.databases = {};
        _this.storageEngine = storageEngine;
        _this.contextName = contextName;
        _this.endpointUri = endpointUri;
        _this.contextConfig = contextConfig;
        _this.client = new client_1.default(_this, contextName, endpointUri);
        return _this;
    }
    Endpoint.prototype.setUsePublic = function () {
        return __awaiter(this, void 0, void 0, function () {
            var response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.client.getPublicUser()];
                    case 1:
                        response = _a.sent();
                        this.couchDbHost = response.data.user.dsn;
                        this.usePublic = true;
                        return [2 /*return*/];
                }
            });
        });
    };
    Endpoint.prototype.toString = function () {
        return this.endpointUri;
    };
    Endpoint.prototype.connectAccount = function (account, isOwner) {
        if (isOwner === void 0) { isOwner = true; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.account = account;
                        // @todo: is this needed or not? if we do this, then we will always auth with public databases
                        return [4 /*yield*/, this.authenticate(isOwner)];
                    case 1:
                        // @todo: is this needed or not? if we do this, then we will always auth with public databases
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Endpoint.prototype.connectDb = function (did, databaseName, permissions, isOwner) {
        return __awaiter(this, void 0, void 0, function () {
            var databaseHash, dbConfig, isPublicWrite, instance_1, db, info, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        databaseHash = utils_1.default.buildDatabaseHash(databaseName, this.contextName, did);
                        //console.log(`connectDb(${databaseName} / ${databaseHash} / ${this.endpointUri})`)
                        if (this.databases[databaseHash]) {
                            return [2 /*return*/, this.databases[databaseHash]];
                        }
                        if (!this.couchDbHost) {
                            throw new Error("Unable to connect to database (" + databaseName + "). No CouchDB host.");
                        }
                        dbConfig = {
                            skip_setup: true
                        };
                        isPublicWrite = (permissions.write == types_1.DatabasePermissionOptionsEnum.PUBLIC);
                        if (this.auth && !this.usePublic) {
                            instance_1 = this;
                            dbConfig['fetch'] = function (url, opts) {
                                return __awaiter(this, void 0, void 0, function () {
                                    var accessToken, result;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, instance_1.getAccessToken()];
                                            case 1:
                                                accessToken = _a.sent();
                                                opts.headers.set('Authorization', "Bearer " + accessToken);
                                                return [4 /*yield*/, pouchdb_core_react_native_1.default.fetch(url, opts)];
                                            case 2:
                                                result = _a.sent();
                                                if (!(result.status == 401)) return [3 /*break*/, 7];
                                                // Unauthorized, most likely due to an invalid access token
                                                // Fetch new credentials and try again
                                                return [4 /*yield*/, instance_1.authenticate(isOwner)];
                                            case 3:
                                                // Unauthorized, most likely due to an invalid access token
                                                // Fetch new credentials and try again
                                                _a.sent();
                                                return [4 /*yield*/, instance_1.getAccessToken()];
                                            case 4:
                                                accessToken = _a.sent();
                                                opts.headers.set('Authorization', "Bearer " + accessToken);
                                                return [4 /*yield*/, pouchdb_core_react_native_1.default.fetch(url, opts)
                                                    // Ping database to ensure replication is active
                                                    // No need to await
                                                    // Retry if auth error if we are the database owner
                                                ];
                                            case 5:
                                                result = _a.sent();
                                                // Ping database to ensure replication is active
                                                // No need to await
                                                // Retry if auth error if we are the database owner
                                                return [4 /*yield*/, instance_1.client.pingDatabases([databaseHash], isPublicWrite, did, instance_1.contextName, isOwner)];
                                            case 6:
                                                // Ping database to ensure replication is active
                                                // No need to await
                                                // Retry if auth error if we are the database owner
                                                _a.sent();
                                                if (result.status == 401) {
                                                    throw new Error("Permission denied to access server: " + instance_1.toString());
                                                }
                                                // Return an authorized result
                                                return [2 /*return*/, result];
                                            case 7: 
                                            // Return an authorized result
                                            return [2 /*return*/, result];
                                        }
                                    });
                                });
                            };
                        }
                        db = new pouchdb_core_react_native_1.default(this.couchDbHost + "/" + databaseHash, dbConfig);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 6, , 10]);
                        return [4 /*yield*/, db.info()];
                    case 2:
                        info = _a.sent();
                        if (!(info.error && info.error == "not_found")) return [3 /*break*/, 5];
                        if (!isOwner) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.storageEngine.createDb(databaseName, did, permissions)];
                    case 3:
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4: throw new Error("Database not found: " + databaseName + " / " + databaseHash);
                    case 5:
                        if (info && info.error == "forbidden") {
                            throw new Error("Permission denied to access remote database.");
                        }
                        return [3 /*break*/, 10];
                    case 6:
                        err_1 = _a.sent();
                        if (!isOwner) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.storageEngine.createDb(databaseName, did, permissions)];
                    case 7:
                        _a.sent();
                        return [3 /*break*/, 9];
                    case 8: throw new Error("Database (" + databaseName + " / " + databaseHash + ") not found on " + this.endpointUri + ": " + err_1.message);
                    case 9: return [3 /*break*/, 10];
                    case 10:
                        this.databases[databaseHash] = db;
                        // Ping database to ensure replication is active
                        // No need to await
                        // Retry if auth error if we are the database owner
                        if (!this.usePublic) {
                            this.client.pingDatabases([databaseHash], isPublicWrite, did, this.contextName, isOwner);
                        }
                        return [2 /*return*/, db];
                }
            });
        });
    };
    Endpoint.prototype.disconnectDatabase = function (did, databaseName) {
        return __awaiter(this, void 0, void 0, function () {
            var databaseHash;
            return __generator(this, function (_a) {
                databaseHash = utils_1.default.buildDatabaseHash(databaseName, this.contextName, did);
                if (this.databases[databaseHash]) {
                    delete this.databases[databaseHash];
                }
                return [2 /*return*/];
            });
        });
    };
    /**
     * Re-authenticate this endpoint and update the credentials
     * for the database.
     *
     * This is called by the internal fetch() methods when they detect an invalid access token
     *
     * @ todo: redo
     */
    Endpoint.prototype.authenticate = function (isOwner) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, auth, err_2;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!this.account) {
                            // No account connected, so can't reconnect database
                            throw new Error("Unable to connect to " + this.endpointUri + ". Access token has expired and unable to refresh as no account is connected.");
                        }
                        if (!(!isOwner && this.account)) return [3 /*break*/, 3];
                        _a = this;
                        return [4 /*yield*/, this.buildExternalAuth()];
                    case 1:
                        _a.auth = _b.sent();
                        return [4 /*yield*/, this.client.setAuthContext(this.auth)];
                    case 2:
                        _b.sent();
                        this.couchDbHost = this.auth.host;
                        return [2 /*return*/];
                    case 3:
                        _b.trys.push([3, 5, , 9]);
                        return [4 /*yield*/, this.account.getAuthContext(this.contextName, this.contextConfig, {
                                endpointUri: this.endpointUri,
                                invalidAccessToken: true
                            })
                            //console.log(`endpoint.getAuthContext(${this.endpointUri}): ${(new Date()).getTime()-now}`)
                        ];
                    case 4:
                        //const now = (new Date()).getTime()
                        // Attempt to re-authenticate using the refresh token and ignoring the access token (its invalid)
                        auth = _b.sent();
                        return [3 /*break*/, 9];
                    case 5:
                        err_2 = _b.sent();
                        if (!(err_2.name == 'ContextAuthorizationError')) return [3 /*break*/, 7];
                        return [4 /*yield*/, this.account.getAuthContext(this.contextName, this.contextConfig, {
                                endpointUri: this.endpointUri,
                                force: true
                            })];
                    case 6:
                        // The refresh token is invalid
                        // Force a new connection, this will cause a new single sign in popup if in a web environment
                        // and using account-web-vault
                        auth = _b.sent();
                        return [3 /*break*/, 8];
                    case 7: throw err_2;
                    case 8: return [3 /*break*/, 9];
                    case 9:
                        this.auth = auth;
                        return [4 /*yield*/, this.client.setAuthContext(this.auth)];
                    case 10:
                        _b.sent();
                        this.couchDbHost = this.auth.host;
                        return [2 /*return*/];
                }
            });
        });
    };
    Endpoint.prototype.setAuth = function (auth) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        this.auth = auth;
                        return [4 /*yield*/, this.client.setAuthContext(this.auth)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Endpoint.prototype.getStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.client.getStatus()];
            });
        });
    };
    Endpoint.prototype.getAccessToken = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.auth.accessToken];
            });
        });
    };
    Endpoint.prototype.setAuthContext = function (authContext) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.client.setAuthContext(authContext);
                return [2 /*return*/];
            });
        });
    };
    Endpoint.prototype.createDb = function (databaseName, permissions, retry) {
        return __awaiter(this, void 0, void 0, function () {
            var options, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        options = {
                            permissions: permissions
                        };
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 4, , 5]);
                        return [4 /*yield*/, this.client.createDatabase(databaseName, options, retry)];
                    case 2:
                        _a.sent();
                        // There's an odd timing issue that needs a deeper investigation
                        return [4 /*yield*/, utils_1.default.sleep(1000)];
                    case 3:
                        // There's an odd timing issue that needs a deeper investigation
                        _a.sent();
                        return [3 /*break*/, 5];
                    case 4:
                        err_3 = _a.sent();
                        throw new Error("User doesn't exist or unable to create user database (" + databaseName + " / " + this.endpointUri + ")");
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Endpoint.prototype.updateDatabase = function (databaseName, options) {
        return __awaiter(this, void 0, void 0, function () {
            var err_4, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.updateDatabase(databaseName, options)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_4 = _a.sent();
                        message = err_4.message;
                        if (err_4.response && err_4.response.data && err_4.response.data.message) {
                            message = err_4.response.data.message;
                        }
                        throw new Error("Unable to update database configuration (" + databaseName + "): " + message);
                    case 3: return [4 /*yield*/, this.storageEngine.checkReplication()];
                    case 4:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Endpoint.prototype.deleteDatabase = function (databaseName) {
        return __awaiter(this, void 0, void 0, function () {
            var err_5, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.deleteDatabase(databaseName)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 3];
                    case 2:
                        err_5 = _a.sent();
                        message = err_5.message;
                        if (err_5.response && err_5.response.data && err_5.response.data.message) {
                            message = err_5.response.data.message;
                        }
                        throw new Error(this.endpointUri + ": Unable to delete database (" + databaseName + "): " + message);
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    Endpoint.prototype.checkReplication = function (databaseName) {
        return __awaiter(this, void 0, void 0, function () {
            var err_6, message;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 3]);
                        return [4 /*yield*/, this.client.checkReplication(databaseName)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        err_6 = _a.sent();
                        message = err_6.response ? err_6.response.data.message : err_6.message;
                        //console.log(`Replication checks failed on ${this.endpointUri}: ${message}`)
                        this.storageEngine.emit('EndpointWarning', "Replication checks failed on " + this.endpointUri + ": " + message);
                        return [3 /*break*/, 3];
                    case 3: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * When connecting to a CouchDB server for an external user, the current user may not
     * have access to read/write.
     *
     * Take the external user's `endpointUri` that points to their CouchDB server. Establish
     * a connection to the Verida Middleware (DatastoreServerClient) as the current user
     * (accountDid) and create a new account if required.
     *
     * Return the current user's DSN which provides authenticated access to the external
     * user's CouchDB server for the current user.
     *
     * @returns {string}
     */
    Endpoint.prototype.buildExternalAuth = function () {
        return __awaiter(this, void 0, void 0, function () {
            var auth;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.account) {
                            throw new Error('Unable to connect to external storage node. No account connected.');
                        }
                        return [4 /*yield*/, this.account.getAuthContext(this.contextName, this.contextConfig, {
                                endpointUri: this.endpointUri
                            })];
                    case 1:
                        auth = _a.sent();
                        return [2 /*return*/, auth
                            /*const client = new DatastoreServerClient(this.storageContext, this.contextConfig);
                            await client.setAccount(this.account!);
                        
                            const auth = await client.getContextAuth();
                            return auth*/
                        ];
                }
            });
        });
    };
    Endpoint.prototype.getUsage = function (retry) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.client.getUsage(retry)];
            });
        });
    };
    Endpoint.prototype.getDatabases = function (retry) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.client.getDatabases(retry)];
            });
        });
    };
    Endpoint.prototype.getDatabaseInfo = function (databaseName, retry) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.client.getDatabaseInfo(databaseName, retry)];
            });
        });
    };
    Endpoint.prototype.logout = function () {
        this.client = new client_1.default(this, this.contextName, this.endpointUri);
    };
    return Endpoint;
}(events_1.EventEmitter));
exports.default = Endpoint;
//# sourceMappingURL=endpoint.js.map
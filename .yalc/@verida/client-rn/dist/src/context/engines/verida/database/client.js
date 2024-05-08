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
exports.DatastoreServerClient = void 0;
var axios_1 = __importDefault(require("axios"));
/**
 * @category
 * Modules
 */
var DatastoreServerClient = /** @class */ (function () {
    function DatastoreServerClient(endpoint, storageContext, serviceEndpoint, authContext) {
        this.endpoint = endpoint;
        this.authContext = authContext;
        this.storageContext = storageContext;
        this.serviceEndpoint = serviceEndpoint;
    }
    DatastoreServerClient.prototype.setAuthContext = function (authContext) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.authContext = authContext;
                return [2 /*return*/];
            });
        });
    };
    DatastoreServerClient.prototype.getPublicUser = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getAxios().get(this.serviceEndpoint + "auth/public")];
            });
        });
    };
    DatastoreServerClient.prototype.getStatus = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getAxios().get(this.serviceEndpoint + "status")];
            });
        });
    };
    /**
     *
     * @param databaseName
     * @param config
     * @param retry Retry if an authentication error occurs
     * @returns
     */
    DatastoreServerClient.prototype.createDatabase = function (databaseName, config, retry) {
        if (config === void 0) { config = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 5]);
                        return [4 /*yield*/, this.getAxios(this.authContext.accessToken).post(this.serviceEndpoint + "user/createDatabase", {
                                databaseName: databaseName,
                                options: config,
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        err_1 = _a.sent();
                        if (!(err_1.response && err_1.response.status == 401 && retry)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.reAuth()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.createDatabase(databaseName, config, false)];
                    case 4: throw err_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DatastoreServerClient.prototype.checkReplication = function (databaseName, retry) {
        if (retry === void 0) { retry = true; }
        return __awaiter(this, void 0, void 0, function () {
            var opts, err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 5]);
                        opts = {};
                        if (databaseName) {
                            opts.databaseName = databaseName;
                        }
                        return [4 /*yield*/, this.getAxios(this.authContext.accessToken).post(this.serviceEndpoint + "user/checkReplication", opts)];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        err_2 = _a.sent();
                        if (!(err_2.response && err_2.response.status == 401 && retry)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.reAuth()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.checkReplication(databaseName, false)];
                    case 4: throw err_2;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DatastoreServerClient.prototype.updateDatabase = function (databaseName, config, retry) {
        if (config === void 0) { config = {}; }
        if (retry === void 0) { retry = true; }
        return __awaiter(this, void 0, void 0, function () {
            var err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 5]);
                        return [4 /*yield*/, this.getAxios(this.authContext.accessToken).post(this.serviceEndpoint + "user/updateDatabase", {
                                databaseName: databaseName,
                                options: config,
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        err_3 = _a.sent();
                        if (!(err_3.response && err_3.response.status == 401 && retry)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.reAuth()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.updateDatabase(databaseName, config, false)];
                    case 4: throw err_3;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DatastoreServerClient.prototype.deleteDatabase = function (databaseName, retry) {
        if (retry === void 0) { retry = true; }
        return __awaiter(this, void 0, void 0, function () {
            var err_4;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 5]);
                        return [4 /*yield*/, this.getAxios(this.authContext.accessToken).post(this.serviceEndpoint + "user/deleteDatabase", {
                                databaseName: databaseName
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        err_4 = _a.sent();
                        if (!(err_4.response && err_4.response.status == 401 && retry)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.reAuth()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.deleteDatabase(databaseName, false)];
                    case 4: throw err_4;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DatastoreServerClient.prototype.pingDatabases = function (databaseHashes, isWritePublic, did, contextName, retry) {
        if (retry === void 0) { retry = true; }
        return __awaiter(this, void 0, void 0, function () {
            var err_5;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 5]);
                        return [4 /*yield*/, this.getAxios(this.authContext.accessToken).post(this.serviceEndpoint + "user/pingDatabase", {
                                databaseHashes: databaseHashes,
                                isWritePublic: isWritePublic,
                                did: did,
                                contextName: contextName
                            })];
                    case 1: return [2 /*return*/, _a.sent()];
                    case 2:
                        err_5 = _a.sent();
                        if (!(err_5.response && err_5.response.status == 401 && retry)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.reAuth()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.pingDatabases(databaseHashes, isWritePublic, did, contextName, false)];
                    case 4: return [3 /*break*/, 5];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DatastoreServerClient.prototype.getUsage = function (retry) {
        return __awaiter(this, void 0, void 0, function () {
            var result, err_6;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 5]);
                        return [4 /*yield*/, this.getAxios(this.authContext.accessToken).post(this.serviceEndpoint + "user/usage")];
                    case 1:
                        result = _a.sent();
                        if (result.data.status !== 'success') {
                            throw new Error(this.serviceEndpoint + ": Unable to get usage info (" + result.data.message + ")");
                        }
                        return [2 /*return*/, result.data.result];
                    case 2:
                        err_6 = _a.sent();
                        if (!(err_6.response && err_6.response.status == 401 && retry)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.reAuth()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.getUsage(false)];
                    case 4: throw err_6;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DatastoreServerClient.prototype.getDatabases = function (retry) {
        return __awaiter(this, void 0, void 0, function () {
            var result, err_7;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 5]);
                        return [4 /*yield*/, this.getAxios(this.authContext.accessToken).post(this.serviceEndpoint + "user/databases")];
                    case 1:
                        result = _a.sent();
                        if (result.data.status !== 'success') {
                            throw new Error(this.serviceEndpoint + ": Unable to get database list (" + result.data.message + ")");
                        }
                        return [2 /*return*/, result.data.result];
                    case 2:
                        err_7 = _a.sent();
                        if (!(err_7.response && err_7.response.status == 401 && retry)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.reAuth()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.getDatabases(false)];
                    case 4: throw err_7;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DatastoreServerClient.prototype.getDatabaseInfo = function (databaseName, retry) {
        return __awaiter(this, void 0, void 0, function () {
            var result, err_8;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 2, , 5]);
                        return [4 /*yield*/, this.getAxios(this.authContext.accessToken).post(this.serviceEndpoint + "user/databaseInfo", {
                                databaseName: databaseName
                            })];
                    case 1:
                        result = _a.sent();
                        if (result.data.status !== 'success') {
                            throw new Error(this.serviceEndpoint + ": Unable to get database info (" + result.data.message + ")");
                        }
                        return [2 /*return*/, result.data.result];
                    case 2:
                        err_8 = _a.sent();
                        if (!(err_8.response && err_8.response.status == 401 && retry)) return [3 /*break*/, 4];
                        return [4 /*yield*/, this.reAuth()];
                    case 3:
                        _a.sent();
                        return [2 /*return*/, this.getDatabaseInfo(databaseName, retry)];
                    case 4: throw err_8;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DatastoreServerClient.prototype.reAuth = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.endpoint.authenticate(true)];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    DatastoreServerClient.prototype.getAxios = function (accessToken) {
        var config = {
            headers: {
                // @todo: Application-Name needs to become Storage-Context
                "Application-Name": this.storageContext,
            },
            timeout: 5000,
        };
        if (accessToken) {
            config.headers['Authorization'] = "Bearer " + accessToken;
        }
        return axios_1.default.create(config);
    };
    return DatastoreServerClient;
}());
exports.DatastoreServerClient = DatastoreServerClient;
exports.default = DatastoreServerClient;
//# sourceMappingURL=client.js.map
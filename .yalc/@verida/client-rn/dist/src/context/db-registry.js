"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
var _ = require("lodash");
var encryption_utils_1 = __importDefault(require("@verida/encryption-utils"));
/**
 * Maintain a registry of all databases owned by the current user
 * in a given context
 */
/**
 * @category
 * Modules
 */
var DbRegistry = /** @class */ (function () {
    function DbRegistry(context) {
        this.context = context;
    }
    /**
     *
     * @param {*} dbName
     * @param {*} did
     * @param {*} appName
     * @param {*} permissions
     * @param {*} encryptionKey Buffer representing the encryption key
     * @param {*} options
     */
    DbRegistry.prototype.saveDb = function (database, checkPermissions) {
        if (checkPermissions === void 0) { checkPermissions = true; }
        return __awaiter(this, void 0, void 0, function () {
            var dbEntry, databaseId, dbData, doc, saved, saved;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, database.registryEntry()];
                    case 2:
                        dbEntry = _a.sent();
                        databaseId = this.buildDatabaseId(dbEntry.dbName, dbEntry.did, dbEntry.contextName);
                        dbData = __assign({ _id: databaseId }, dbEntry);
                        delete dbData["id"];
                        return [4 /*yield*/, this.dbStore.getOne({
                                _id: databaseId,
                            })];
                    case 3:
                        doc = _a.sent();
                        if (!!doc) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.dbStore.save(dbData, {
                                forceInsert: true,
                            })];
                    case 4:
                        saved = _a.sent();
                        if (!saved) {
                            console.error(this.dbStore.errors);
                        }
                        return [2 /*return*/];
                    case 5:
                        if (!(checkPermissions && !_.isEqual(dbData.permissions, doc.permissions))) return [3 /*break*/, 7];
                        doc.permissions = dbData.permissions;
                        return [4 /*yield*/, this.dbStore.save(doc)];
                    case 6:
                        saved = _a.sent();
                        if (!saved) {
                            console.error(this.dbStore.errors);
                        }
                        return [2 /*return*/];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    DbRegistry.prototype.removeDb = function (databaseName, did, contextName) {
        return __awaiter(this, void 0, void 0, function () {
            var row, result;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.get(databaseName, did, contextName)];
                    case 2:
                        row = _a.sent();
                        if (!row) {
                            return [2 /*return*/, false];
                        }
                        return [4 /*yield*/, this.dbStore.delete(row._id)];
                    case 3:
                        result = _a.sent();
                        return [2 /*return*/, true];
                }
            });
        });
    };
    DbRegistry.prototype.getMany = function (filter, options) {
        if (filter === void 0) { filter = {}; }
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.dbStore.getMany(filter, options)];
                }
            });
        });
    };
    DbRegistry.prototype.get = function (dbName, did, contextName) {
        return __awaiter(this, void 0, void 0, function () {
            var dbId, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        dbId = this.buildDatabaseId(dbName, did, contextName);
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.dbStore.get(dbId)];
                    case 3: return [2 /*return*/, _a.sent()];
                    case 4:
                        err_1 = _a.sent();
                        if (err_1.reason == "missing") {
                            // may not be found
                            return [2 /*return*/];
                        }
                        throw err_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    DbRegistry.prototype.buildDatabaseId = function (dbName, did, contextName) {
        var text = [did.toLowerCase(), contextName, dbName].join("/");
        return "v" + encryption_utils_1.default.hash(text).substr(2);
    };
    /*
      @todo: Support updating permissions on a user database
      async updatePermissions(dbName, config) {
      }*/
    DbRegistry.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.dbStore) {
                            return [2 /*return*/];
                        }
                        _a = this;
                        return [4 /*yield*/, this.context.openDatastore("https://core.schemas.verida.io/storage/database/v0.1.0/schema.json", {
                                saveDatabase: false,
                            })];
                    case 1:
                        _a.dbStore = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return DbRegistry;
}());
exports.default = DbRegistry;
//# sourceMappingURL=db-registry.js.map
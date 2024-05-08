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
exports.migrateDatabase = exports.migrateContext = void 0;
var _ = require("lodash");
var events_1 = require("events");
/**
 *
 * Note: May need the ability to force override the DID if migrating data between testnet -> mainnet?
 *
 * @param sourceContext
 * @param destinationContext
 */
function migrateContext(sourceContext, destinationContext) {
    var eventManager = new events_1.EventEmitter();
    _migrateContext(sourceContext, destinationContext, eventManager);
    return eventManager;
}
exports.migrateContext = migrateContext;
function _migrateContext(sourceContext, destinationContext, eventManager) {
    return __awaiter(this, void 0, void 0, function () {
        var sourceAccount, sourceDid, sourceDbEngine, sourceDbInfo, sourceDatabases, _a, _b, _i, i, sourceDbInfo_1, sourceConfig, sourceDb, destinationConfig, destinationDb, err_1;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    sourceAccount = sourceContext.getAccount();
                    return [4 /*yield*/, sourceAccount.did()];
                case 1:
                    sourceDid = _c.sent();
                    return [4 /*yield*/, sourceContext.getDatabaseEngine(sourceDid)];
                case 2:
                    sourceDbEngine = _c.sent();
                    return [4 /*yield*/, sourceDbEngine.info()];
                case 3:
                    sourceDbInfo = _c.sent();
                    sourceDatabases = sourceDbInfo.databases;
                    eventManager.emit('start', sourceDatabases);
                    _a = [];
                    for (_b in sourceDatabases)
                        _a.push(_b);
                    _i = 0;
                    _c.label = 4;
                case 4:
                    if (!(_i < _a.length)) return [3 /*break*/, 13];
                    i = _a[_i];
                    sourceDbInfo_1 = sourceDatabases[i];
                    // Don't migrate the special storage_database that is internally managed to maintain
                    // a list of all the databases in a context
                    if (sourceDbInfo_1.databaseName == 'storage_database') {
                        eventManager.emit('migrated', sourceDbInfo_1, parseInt(i) + 1, sourceDatabases.length);
                        return [3 /*break*/, 12];
                    }
                    _c.label = 5;
                case 5:
                    _c.trys.push([5, 11, , 12]);
                    sourceConfig = {
                        permissions: sourceDbInfo_1.permissions,
                        verifyEncryptionKey: false
                    };
                    return [4 /*yield*/, sourceContext.openDatabase(sourceDbInfo_1.databaseName, sourceConfig)];
                case 6:
                    sourceDb = _c.sent();
                    destinationConfig = {
                        permissions: sourceDbInfo_1.permissions,
                        verifyEncryptionKey: false
                    };
                    return [4 /*yield*/, destinationContext.openDatabase(sourceDbInfo_1.databaseName, destinationConfig)
                        // Migrate data
                    ];
                case 7:
                    destinationDb = _c.sent();
                    // Migrate data
                    return [4 /*yield*/, migrateDatabase(sourceDb, destinationDb)
                        // Close databases
                    ];
                case 8:
                    // Migrate data
                    _c.sent();
                    // Close databases
                    return [4 /*yield*/, sourceDb.close()];
                case 9:
                    // Close databases
                    _c.sent();
                    return [4 /*yield*/, destinationDb.close()
                        // Emit success event
                    ];
                case 10:
                    _c.sent();
                    // Emit success event
                    eventManager.emit('migrated', sourceDbInfo_1, parseInt(i) + 1, sourceDatabases.length);
                    return [3 /*break*/, 12];
                case 11:
                    err_1 = _c.sent();
                    eventManager.emit('error', err_1.message);
                    return [2 /*return*/];
                case 12:
                    _i++;
                    return [3 /*break*/, 4];
                case 13:
                    eventManager.emit('complete');
                    return [2 /*return*/];
            }
        });
    });
}
function migrateDatabase(sourceDb, destinationDb) {
    return __awaiter(this, void 0, void 0, function () {
        var limit, skip, records, _a, _b, _i, r, record, err_2;
        return __generator(this, function (_c) {
            switch (_c.label) {
                case 0:
                    limit = 1;
                    skip = 0;
                    _c.label = 1;
                case 1:
                    if (!true) return [3 /*break*/, 9];
                    return [4 /*yield*/, sourceDb.getMany({}, {
                            limit: limit,
                            skip: skip
                        })];
                case 2:
                    records = _c.sent();
                    _a = [];
                    for (_b in records)
                        _a.push(_b);
                    _i = 0;
                    _c.label = 3;
                case 3:
                    if (!(_i < _a.length)) return [3 /*break*/, 8];
                    r = _a[_i];
                    record = records[r];
                    // Delete revision info so the record saves correctly
                    delete record['_rev'];
                    _c.label = 4;
                case 4:
                    _c.trys.push([4, 6, , 7]);
                    return [4 /*yield*/, destinationDb.save(records[r])];
                case 5:
                    _c.sent();
                    return [3 /*break*/, 7];
                case 6:
                    err_2 = _c.sent();
                    if (err_2.status != 409) {
                        throw err_2;
                    }
                    return [3 /*break*/, 7];
                case 7:
                    _i++;
                    return [3 /*break*/, 3];
                case 8:
                    if (records.length == 0 || records.length < limit) {
                        // All data migrated
                        return [3 /*break*/, 9];
                    }
                    skip += limit;
                    return [3 /*break*/, 1];
                case 9: return [2 /*return*/];
            }
        });
    });
}
exports.migrateDatabase = migrateDatabase;
//# sourceMappingURL=migration.js.map
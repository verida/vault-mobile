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
var _ = require("lodash");
var schema_1 = __importDefault(require("./schema"));
/**
 * A datastore wrapper around a given database and schema.
 *
 * @property {array} errors Array of most recent errors.
 * @property {string} schemaName Name of the schema used on this Datastore.
 */
/**
 * @category
 * Modules
 */
var Datastore = /** @class */ (function () {
    /**
     * Create a new Datastore.
     *
     * **Do not instantiate directly.**
     */
    function Datastore(schemaName, context, config) {
        if (config === void 0) { config = {}; }
        /**
         * A list of the latest database errors.
         *
         * Any errors from saving a record will be available on this public object.
         *
         * The errors remain until they are replaced by any new errors.
         */
        this.errors = {};
        this.schemaName = schemaName;
        this.context = context;
        this.config = config;
        this.db = null;
    }
    /**
     * Save data to an application schema.
     *
     * @param {object} data Data to be saved. Will be validated against the schema associated with this Datastore.
     * @param {object} [options] Database options that will be passed through to [PouchDB.put()](https://pouchdb.com/api.html#create_document)
     * @fires Database#beforeInsert Event fired before inserting a new record
     * @fires Database#beforeUpdate Event fired before updating a new record
     * @fires Database#afterInsert Event fired after inserting a new record
     * @fires Database#afterUpdate Event fired after updating a new record
     * @example
     * let result = await datastore.save({
     *  "firstName": "John",
     *  "lastName": "Doe"
     * });
     *
     * if (!result) {
     *  console.errors(datastore.errors);
     * } else {
     *  console.log("Successfully saved");
     * }
     * @returns {boolean} Boolean indicating if the save was successful. If not successful `this.errors` will be populated.
     */
    Datastore.prototype.save = function (data, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var valid;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        data.schema = this.schemaPath;
                        return [4 /*yield*/, this.schema.validate(data)];
                    case 2:
                        valid = _a.sent();
                        if (!valid) {
                            this.errors = this.schema.errors;
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, this.db.save(data, options)];
                }
            });
        });
    };
    /**
     * Fetch a list of records from this Datastore.
     *
     * Only returns records that belong to this Datastore's schema.
     *
     * Example filters and options:
     *
     * ```
     * let filter = {
     *      organization: 'Google'
     * };
     *
     * let options = {
     *      limit: 20,
     *      skip: 0,
     *      sort: ['firstName'
     * };
     * ```
     *
     * @param {object} [customFilter] An optional database query filter to restrict the results passed through to [PouchDB.find()](https://pouchdb.com/api.html#query_index)
     * @param {object} [options] Optional database options that will be passed through to [PouchDB.find()](https://pouchdb.com/api.html#query_index)
     * @example
     * let results = datastore.getMany({
     *  name: 'John'
     * });
     *
     * console.log(results);
     * @returns {object[]} An array of database records.
     */
    Datastore.prototype.getMany = function (customFilter, options) {
        if (customFilter === void 0) { customFilter = {}; }
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var filter;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        filter = _.merge({
                            schema: this.schemaPath,
                        }, customFilter);
                        return [2 /*return*/, this.db.getMany(filter, options)];
                }
            });
        });
    };
    /**
     * Get a single database record that matches.
     *
     * @param {object} [customFilter] An optional database query filter to restrict the results passed through to [PouchDB.find()](https://pouchdb.com/api.html#query_index)
     * @param {object} [options] Optional database options that will be passed through to [PouchDB.find()](https://pouchdb.com/api.html#query_index)
     * @returns {object | undefined} A database record
     */
    Datastore.prototype.getOne = function (customFilter, options) {
        if (customFilter === void 0) { customFilter = {}; }
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var results;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getMany(customFilter, options)];
                    case 1:
                        results = _a.sent();
                        if (results && results.length) {
                            return [2 /*return*/, results[0]];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Get a record by ID.
     *
     * @param {string} key Unique ID of the record to fetch
     * @param {object} [options] Database options that will be passed through to [PouchDB.get()](https://pouchdb.com/api.html#fetch_document)
     */
    Datastore.prototype.get = function (key, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.db.get(key, options)];
                }
            });
        });
    };
    /**
     * Delete a record by ID.
     *
     * @param {string} docId Unique ID of the record to delete
     */
    Datastore.prototype.delete = function (docId) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.db.delete(docId)];
                }
            });
        });
    };
    Datastore.prototype.deleteAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.db.deleteAll()];
                }
            });
        });
    };
    /**
     * Get the underlying database instance associated with this datastore.
     *
     * **Note: Do not use unless you know what you're doing as you can easily corrupt a database by breaking schema data.**
     */
    Datastore.prototype.getDb = function () {
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
    /**
     * Bind to changes to this datastore
     *
     * @param {function} cb Callback function that fires when new data is received
     * @param {object} options Options to be passed to the listener. See https://pouchdb.com/api.html#changes
     * @returns {object} Returns an object with a `.cancel()` method to cancel the listener
     */
    Datastore.prototype.changes = function (cb, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDb()];
                    case 1:
                        db = _a.sent();
                        return [2 /*return*/, db.changes(cb, options)];
                }
            });
        });
    };
    Datastore.prototype.getSchema = function () {
        return this.schema;
    };
    /**
     * Initialize this datastore instance before use.
     *
     * @todo: move this into context.openDatastore???
     */
    Datastore.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, schemaJson, dbName, _b, _c, indexes;
            return __generator(this, function (_d) {
                switch (_d.label) {
                    case 0:
                        if (this.db) {
                            return [2 /*return*/];
                        }
                        _a = this;
                        return [4 /*yield*/, schema_1.default.getSchema(this.schemaName)];
                    case 1:
                        _a.schema = _d.sent();
                        return [4 /*yield*/, this.schema.getSchemaJson()];
                    case 2:
                        schemaJson = _d.sent();
                        dbName = this.config.databaseName
                            ? this.config.databaseName
                            : schemaJson.database.name;
                        this.schemaPath = schemaJson["$id"];
                        if (!this.config.external) return [3 /*break*/, 4];
                        _b = this;
                        return [4 /*yield*/, this.context.openExternalDatabase(dbName, this.config.did, this.config)];
                    case 3:
                        _b.db = _d.sent();
                        return [3 /*break*/, 6];
                    case 4:
                        _c = this;
                        return [4 /*yield*/, this.context.openDatabase(dbName, this.config)];
                    case 5:
                        _c.db = _d.sent();
                        _d.label = 6;
                    case 6:
                        indexes = schemaJson.database.indexes;
                        if (!indexes) return [3 /*break*/, 8];
                        return [4 /*yield*/, this.ensureIndexes(indexes)];
                    case 7:
                        _d.sent();
                        _d.label = 8;
                    case 8: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * @todo: Support removing indexes that were deleted from the spec
     * @todo: Validate indexes
     *
     * @param indexes
     */
    Datastore.prototype.ensureIndexes = function (indexes) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b, _i, indexName, indexFields, db;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = [];
                        for (_b in indexes)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 1;
                    case 1:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        indexName = _a[_i];
                        indexFields = indexes[indexName];
                        return [4 /*yield*/, this.db.getDb()];
                    case 2:
                        db = _c.sent();
                        return [4 /*yield*/, db.createIndex({
                                fields: indexFields,
                                name: indexName,
                            })];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 1];
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update the list of valid users for this datastore.
     *
     * @param readList {string[]} List of DID's that can read from this datastore.
     * @param writeList {writeList[]} List of DID's that can write to this datastore.
     */
    Datastore.prototype.updateUsers = function (readList, writeList) {
        if (readList === void 0) { readList = []; }
        if (writeList === void 0) { writeList = []; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.db.updateUsers(readList, writeList)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Datastore.prototype.close = function (options) {
        if (options === void 0) { options = {
            clearLocal: false
        }; }
        return __awaiter(this, void 0, void 0, function () {
            var db;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDb()];
                    case 1:
                        db = _a.sent();
                        return [4 /*yield*/, db.close(options)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    return Datastore;
}());
exports.default = Datastore;
//# sourceMappingURL=datastore.js.map
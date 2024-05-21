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
var EventEmitter = require("events");
var _ = require("lodash");
var uuid_1 = require("uuid");
var utils_1 = __importDefault(require("./utils"));
var utils_2 = require("../../../utils");
var PouchDBFind = __importStar(require("pouchdb-find"));
var PouchDBLib = __importStar(require("pouchdb"));
var PouchDB = PouchDBLib.default;
PouchDB.plugin(PouchDBFind);
/**
 * @category
 * Modules
 */
var BaseDb = /** @class */ (function (_super) {
    __extends(BaseDb, _super);
    function BaseDb(config, engine) {
        var _this = _super.call(this) || this;
        _this.dbConnections = {};
        _this.endpoint = config.endpoint;
        _this.databaseName = config.databaseName;
        _this.did = config.did.toLowerCase();
        _this.storageContext = config.storageContext;
        _this.engine = engine;
        _this.isOwner = config.isOwner;
        _this.signContext = config.signContext;
        _this.databaseHash = utils_1.default.buildDatabaseHash(_this.databaseName, _this.storageContext, _this.did);
        // Signing user will be the logged in user
        _this.signData = config.signData === false ? false : true;
        _this.signContextName = _this.signContext.getContextName();
        _this.config = _.merge({}, config);
        _this.permissions = _.merge({
            read: "owner",
            write: "owner",
            readList: [],
            writeList: [],
        }, _this.config.permissions ? _this.config.permissions : {});
        _this.readOnly = _this.config.readOnly ? true : false;
        _this.db = null;
        return _this;
    }
    BaseDb.prototype.getEngine = function () {
        return this.engine;
    };
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
    BaseDb.prototype.save = function (data, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var db, defaults, insert, existingDoc, err_1, response;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDb()];
                    case 1:
                        db = _a.sent();
                        if (this.readOnly) {
                            throw new Error("Unable to save. Database is read only.");
                        }
                        defaults = {
                            forceInsert: false,
                            forceUpdate: false, // Force updating record if it already exists
                        };
                        options = _.merge(defaults, options);
                        insert = false;
                        // Set inserted at if not defined
                        // (Assuming it's not defined as we have an insert)
                        if (data._id === undefined || options.forceInsert) {
                            insert = true;
                        }
                        if (!(options.forceUpdate &&
                            data._id !== undefined &&
                            data._rev === undefined)) return [3 /*break*/, 5];
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.get(data._id)];
                    case 3:
                        existingDoc = _a.sent();
                        if (existingDoc) {
                            data._rev = existingDoc._rev;
                            insert = false;
                        }
                        return [3 /*break*/, 5];
                    case 4:
                        err_1 = _a.sent();
                        // Record may not exist, which is fine
                        if (err_1.name != "not_found") {
                            throw err_1;
                        }
                        return [3 /*break*/, 5];
                    case 5:
                        if (!insert) return [3 /*break*/, 7];
                        return [4 /*yield*/, this._beforeInsert(data)];
                    case 6:
                        data = _a.sent();
                        /**
                         * Fired before a new record is inserted.
                         *
                         * @event Database#beforeInsert
                         * @param {object} data Data that was saved
                         */
                        this.emit("beforeInsert", data);
                        return [3 /*break*/, 9];
                    case 7: return [4 /*yield*/, this._beforeUpdate(data)];
                    case 8:
                        data = _a.sent();
                        /**
                         * Fired before a new record is updated.
                         *
                         * @event Database#beforeUpdate
                         * @param {object} data Data that was saved
                         */
                        this.emit("beforeUpdate", data);
                        _a.label = 9;
                    case 9: return [4 /*yield*/, db.put(data, options)];
                    case 10:
                        response = _a.sent();
                        if (insert) {
                            this._afterInsert(data, options);
                            /**
                             * Fired after a new record is inserted.
                             *
                             * @event Database#afterInsert
                             * @param {object} data Data that was saved
                             */
                            this.emit("afterInsert", data, response);
                        }
                        else {
                            this._afterUpdate(data, options);
                            /**
                             * Fired after a new record is updated.
                             *
                             * @event Database#afterUpdate
                             * @param {object} data Data that was saved
                             */
                            this.emit("afterUpdate", data, response);
                        }
                        return [2 /*return*/, response];
                }
            });
        });
    };
    /**
     * Get many rows from the database.
     *
     * @param {object} filter Optional query filter matching CouchDB find() syntax.
     * @param {object} options Options passed to CouchDB find().
     * @param {object} options.raw Returns the raw CouchDB result, otherwise just returns the documents
     */
    BaseDb.prototype.getMany = function (filter, options) {
        if (filter === void 0) { filter = {}; }
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var db, defaults, raw, docs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDb()];
                    case 1:
                        db = _a.sent();
                        filter = filter || {};
                        defaults = {
                            limit: 20,
                        };
                        options = _.merge(defaults, options);
                        filter = this.applySortFix(filter, options.sort || {});
                        raw = options.raw || false;
                        delete options["raw"];
                        if (filter) {
                            options.selector = _.merge(options.selector, filter);
                        }
                        return [4 /*yield*/, db.find(options)];
                    case 2:
                        docs = _a.sent();
                        if (docs) {
                            return [2 /*return*/, raw ? docs : docs.docs];
                        }
                        // CouchDb returned something falsey
                        return [2 /*return*/, []];
                }
            });
        });
    };
    BaseDb.prototype.delete = function (doc, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var defaults;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.readOnly) {
                            throw "Unable to delete. Read only.";
                        }
                        return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        defaults = {};
                        options = _.merge(defaults, options);
                        if (!(typeof doc === "string")) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.get(doc)];
                    case 2:
                        // Document is a string representing a document ID
                        // so fetch the actual document
                        doc = _a.sent();
                        _a.label = 3;
                    case 3:
                        doc._deleted = true;
                        return [2 /*return*/, this.save(doc, options)];
                }
            });
        });
    };
    BaseDb.prototype.deleteAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var rows, rowId, _a, _b, _i;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.getMany()];
                    case 1:
                        rows = _c.sent();
                        if (rows.length == 0) {
                            return [2 /*return*/];
                        }
                        _a = [];
                        for (_b in rows)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 5];
                        rowId = _a[_i];
                        return [4 /*yield*/, this.delete(rows[rowId]["_id"])];
                    case 3:
                        _c.sent();
                        _c.label = 4;
                    case 4:
                        _i++;
                        return [3 /*break*/, 2];
                    case 5: return [4 /*yield*/, this.deleteAll()];
                    case 6:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    BaseDb.prototype.get = function (docId, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var db, defaults;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getDb()];
                    case 1:
                        db = _a.sent();
                        defaults = {};
                        options = _.merge(defaults, options);
                        return [4 /*yield*/, db.get(docId, options)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Bind to changes to this database
     *
     * @param {function} cb Callback function that fires when new data is received
     */
    BaseDb.prototype.changes = function (cb, options) {
        if (options === void 0) { options = {}; }
        return __awaiter(this, void 0, void 0, function () {
            var dbInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.getDb()];
                    case 2:
                        dbInstance = _a.sent();
                        return [2 /*return*/, dbInstance
                                .changes(_.merge({
                                since: "now",
                                live: true,
                            }, options))
                                .on("change", function (info) {
                                return __awaiter(this, void 0, void 0, function () {
                                    return __generator(this, function (_a) {
                                        cb(info);
                                        return [2 /*return*/];
                                    });
                                });
                            })];
                }
            });
        });
    };
    // This will be extended by sub-classes to initialize the database connection
    BaseDb.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.db) {
                            return [2 /*return*/];
                        }
                        _a = this;
                        return [4 /*yield*/, this.endpoint.connectDb(this.did, this.databaseName, this.permissions, this.isOwner)];
                    case 1:
                        _a.db = _b.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    // This is called when an endpoint is found to have died
    BaseDb.prototype.replaceEndpoint = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, this.engine.getActiveEndpoint(true, true)];
                    case 1:
                        _a.endpoint = _c.sent();
                        _b = this;
                        return [4 /*yield*/, this.endpoint.connectDb(this.did, this.databaseName, this.permissions, this.isOwner)];
                    case 2:
                        _b.db = _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Update the users that can access the database
     */
    BaseDb.prototype.updateUsers = function (readList, writeList) {
        if (readList === void 0) { readList = []; }
        if (writeList === void 0) { writeList = []; }
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Not implemented");
            });
        });
    };
    BaseDb.prototype.registryEntry = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Not implemented");
            });
        });
    };
    BaseDb.prototype._beforeInsert = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!data._id) {
                            // Do it in this way to ensure _id is the first JSON property
                            // When a result is returned from CouchDB it always returns _id as
                            // the first property, so this ensures consistency of order which
                            // is necessary when validating data signatures
                            data = _.merge({
                                _id: (0, uuid_1.v1)(),
                            }, data);
                        }
                        data.insertedAt = new Date().toISOString();
                        data.modifiedAt = new Date().toISOString();
                        if (!this.signData) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._signData(data)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, data];
                }
            });
        });
    };
    BaseDb.prototype._beforeUpdate = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        data.modifiedAt = new Date().toISOString();
                        if (!this.signData) return [3 /*break*/, 2];
                        return [4 /*yield*/, this._signData(data)];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2: return [2 /*return*/, data];
                }
            });
        });
    };
    BaseDb.prototype._afterInsert = function (data, response) { };
    BaseDb.prototype._afterUpdate = function (data, response) { };
    /**
     * Get the underlying PouchDB instance associated with this database.
     *
     * @see {@link https://pouchdb.com/api.html#overview|PouchDB documentation}
     * @returns {PouchDB}
     */
    BaseDb.prototype.getDb = function () {
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
     * See PouchDB bug: https://github.com/pouchdb/pouchdb/issues/6399
     *
     * This method automatically detects any fields being sorted on and
     * adds them to an $and clause to ensure query indexes are used.
     *
     * Note: This still requires the appropriate index to exist for
     * sorting to work.
     */
    BaseDb.prototype.applySortFix = function (filter, sortItems) {
        if (filter === void 0) { filter = {}; }
        if (sortItems === void 0) { sortItems = {}; }
        if (sortItems.length) {
            var and = [filter];
            for (var s in sortItems) {
                var sort = sortItems[s];
                for (var fieldName in sort) {
                    var d = {};
                    d[fieldName] = { $gt: true };
                    and.push(d);
                }
            }
            filter = {
                $and: and,
            };
        }
        return filter;
    };
    /**
     * Sign data as the current user
     *
     * @param {*} data
     * @todo Think about signing data and versions / insertedAt etc.
     */
    BaseDb.prototype._signData = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, utils_2.RecordSignature.generateSignature(data, {
                        signContext: this.signContext
                    })];
            });
        });
    };
    BaseDb.prototype.getAccessToken = function () {
        return this.token;
    };
    BaseDb.prototype.setAccessToken = function (token) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                this.token = token;
                return [2 /*return*/];
            });
        });
    };
    BaseDb.prototype.info = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Not implemented");
            });
        });
    };
    BaseDb.prototype.close = function (options) {
        if (options === void 0) { options = {
            clearLocal: false
        }; }
        return __awaiter(this, void 0, void 0, function () {
            var err_2;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        _a.trys.push([0, 3, , 4]);
                        return [4 /*yield*/, this.db.close()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.engine.closeDatabase(this.did, this.databaseName)];
                    case 2:
                        _a.sent();
                        this.emit('closed', this.databaseName);
                        return [3 /*break*/, 4];
                    case 3:
                        err_2 = _a.sent();
                        return [3 /*break*/, 4];
                    case 4: return [2 /*return*/];
                }
            });
        });
    };
    BaseDb.prototype.destroy = function (options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                throw new Error("Not implemented");
            });
        });
    };
    BaseDb.prototype.usage = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.endpoint.getUsage(this.isOwner)];
                    case 1: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    return BaseDb;
}(EventEmitter));
exports.default = BaseDb;
//# sourceMappingURL=base-db.js.map
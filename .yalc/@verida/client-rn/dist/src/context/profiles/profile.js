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
Object.defineProperty(exports, "__esModule", { value: true });
exports.Profile = void 0;
var EventEmitter = require("events");
var types_1 = require("@verida/types");
var helpers_1 = require("@verida/helpers");
var _ = require("lodash");
/**
 * A key/value profile datastore for a user
 */
/**
 * @category
 * Modules
 */
var Profile = /** @class */ (function (_super) {
    __extends(Profile, _super);
    /**
     * Create a new user profile.
     *
     * **Do not instantiate directly.**
     *
     * Access the current user's profile
     *
     * @constructor
     */
    function Profile(context, did, profileName, writeAccess, isPrivate) {
        if (isPrivate === void 0) { isPrivate = false; }
        var _this = _super.call(this) || this;
        _this.context = context;
        _this.profileName = profileName;
        _this.did = did;
        _this.writeAccess = writeAccess;
        _this.isPrivate = isPrivate;
        _this.errors = [];
        return _this;
    }
    /**
     * Get a profile value by key
     *
     * @param {string} key Profile key to get (ie: `email`)
     * @param options
     * @param extended
     * @example
     * let emailDoc = app.wallet.profile.get('email');
     *
     * // key = email
     * // value = john@doe.com
     * console.log(emailDoc.key, emailDoc.value);
     * @return {object} Database record for this profile key. Object has keys [`key`, `value`, `_id`, `_rev`].
     */
    Profile.prototype.get = function (key, options, extended) {
        if (extended === void 0) { extended = false; }
        return __awaiter(this, void 0, void 0, function () {
            var record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRecord()];
                    case 1:
                        record = _a.sent();
                        if (record && typeof record[key] !== "undefined") {
                            return [2 /*return*/, record[key]];
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     *
     * @param {string} key Profile key to delete (ie: `email`)
     * @returns {boolean} Boolean indicating if the delete was successful
     */
    Profile.prototype.delete = function (key) {
        return __awaiter(this, void 0, void 0, function () {
            var record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRecord()];
                    case 1:
                        record = _a.sent();
                        if (!record || record[key] == "undefined") {
                            return [2 /*return*/, false];
                        }
                        delete record[key];
                        return [4 /*yield*/, this.saveRecord(record)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Get many profile values.
     *
     * @param filter
     * @param {object} [options] Database options that will be passed through to [PouchDB.find()](https://pouchdb.com/api.html#query_index)
     */
    Profile.prototype.getMany = function (filter, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, this.getRecord()];
            });
        });
    };
    /**
     * Set a profile value by key
     *
     * @param {string} key Profile key to set (ie: `email`)
     * @param {*} value Value to save
     * @example
     * // Set a profile value by key
     * app.wallet.profile.set('name', 'John');
     *
     * // Update a profile value from an existing document
     * let emailDoc = app.wallet.profile.get('email');
     * app.wallet.profile.set(emailDoc, 'john@doe.com');
     *
     * // Update a profile profile by key
     * app.wallet.profile.set('email', 'john@doe.com');
     * @returns {boolean} Boolean indicating if the save was successful
     */
    Profile.prototype.set = function (key, value) {
        return __awaiter(this, void 0, void 0, function () {
            var record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRecord()];
                    case 1:
                        record = _a.sent();
                        record[key] = value;
                        return [4 /*yield*/, this.saveRecord(record)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Set many profile key / values at once
     *
     * @param data
     */
    Profile.prototype.setMany = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var record;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getRecord()];
                    case 1:
                        record = _a.sent();
                        if (!record) {
                            record = data;
                        }
                        else {
                            record = _.merge({}, record, data);
                        }
                        return [4 /*yield*/, this.saveRecord(record)];
                    case 2: return [2 /*return*/, _a.sent()];
                }
            });
        });
    };
    /**
     * Listen for changes to the public profile
     */
    Profile.prototype.listen = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var profile, cb;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        profile = this;
                        cb = function (info) {
                            return __awaiter(this, void 0, void 0, function () {
                                var row;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, profile.get(info.id, {
                                                rev: info.changes[0].rev,
                                            })];
                                        case 1:
                                            row = _a.sent();
                                            callback(row);
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        };
                        return [4 /*yield*/, this.store.changes(cb)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    Profile.prototype.verifyWebsite = function () {
        return __awaiter(this, void 0, void 0, function () {
            var domain;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.get('website')];
                    case 1:
                        domain = _a.sent();
                        if (!domain) {
                            return [2 /*return*/, false];
                        }
                        return [2 /*return*/, (0, helpers_1.verifyDidControlsDomain)(this.did, domain)];
                }
            });
        });
    };
    Profile.prototype.getRecord = function () {
        return __awaiter(this, void 0, void 0, function () {
            var record, err_1;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        _a.trys.push([2, 4, , 5]);
                        return [4 /*yield*/, this.store.get(this.profileName)];
                    case 3:
                        record = _a.sent();
                        return [2 /*return*/, record];
                    case 4:
                        err_1 = _a.sent();
                        if (err_1.message.match('Database not found')) {
                            // No profile exists
                            return [2 /*return*/, {
                                    _id: this.profileName
                                }];
                        }
                        else if (err_1.reason == "missing") {
                            // No profile exists or has been deleted
                            return [2 /*return*/, {
                                    _id: this.profileName,
                                }];
                        }
                        throw err_1;
                    case 5: return [2 /*return*/];
                }
            });
        });
    };
    Profile.prototype.saveRecord = function (record) {
        return __awaiter(this, void 0, void 0, function () {
            var success;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.store.save(record)];
                    case 2:
                        success = _a.sent();
                        if (!success) {
                            this.errors = this.store.errors;
                        }
                        return [2 /*return*/, success ? true : false];
                }
            });
        });
    };
    Profile.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var permissions, schemaUri, _a, _b, err_2;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (!!this.store) return [3 /*break*/, 7];
                        permissions = {
                            read: this.isPrivate
                                ? types_1.DatabasePermissionOptionsEnum.OWNER
                                : types_1.DatabasePermissionOptionsEnum.PUBLIC,
                            write: types_1.DatabasePermissionOptionsEnum.OWNER,
                        };
                        schemaUri = "https://common.schemas.verida.io/profile/" +
                            this.profileName +
                            "/v0.1.0/schema.json";
                        if (!this.writeAccess) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, this.context.openDatastore(schemaUri, {
                                permissions: permissions,
                            })];
                    case 1:
                        _a.store = _c.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        _b = this;
                        return [4 /*yield*/, this.context.openExternalDatastore(schemaUri, this.did, {
                                permissions: permissions,
                                readOnly: true,
                            })];
                    case 3:
                        _b.store = _c.sent();
                        _c.label = 4;
                    case 4:
                        _c.trys.push([4, 6, , 7]);
                        return [4 /*yield*/, this.get("")];
                    case 5:
                        _c.sent();
                        return [3 /*break*/, 7];
                    case 6:
                        err_2 = _c.sent();
                        if (err_2.response && err_2.response.status == 403) {
                            throw new Error("Schema URI not found: " + schemaUri);
                        }
                        // The profile may not exist yet
                        if (err_2.reason != "missing") {
                            throw err_2;
                        }
                        return [3 /*break*/, 7];
                    case 7: return [2 /*return*/];
                }
            });
        });
    };
    return Profile;
}(EventEmitter));
exports.Profile = Profile;
//# sourceMappingURL=profile.js.map
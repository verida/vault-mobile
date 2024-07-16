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
var tweetnacl_1 = require("tweetnacl");
var didJWT = require("did-jwt");
var events_1 = require("events");
var encryption_utils_1 = __importDefault(require("@verida/encryption-utils"));
var types_1 = require("@verida/types");
/**
 * @category
 * Modules
 */
var VeridaInbox = /** @class */ (function (_super) {
    __extends(VeridaInbox, _super);
    function VeridaInbox(context, keyring, maxItems) {
        if (maxItems === void 0) { maxItems = 50; }
        var _this = _super.call(this) || this;
        _this.context = context;
        _this.keyring = keyring;
        _this.initComplete = false;
        // Maximum length of inbox items to retain
        _this.maxItems = maxItems;
        return _this;
    }
    VeridaInbox.prototype.processAll = function () {
        return __awaiter(this, void 0, void 0, function () {
            var items, inbox, count;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.publicInbox.getMany()];
                    case 2:
                        items = _a.sent();
                        if (!items || items.length == 0) {
                            return [2 /*return*/, 0];
                        }
                        inbox = this;
                        count = 0;
                        items.forEach(function (item) {
                            inbox.processItem(item);
                            count++;
                        });
                        return [2 /*return*/, count];
                }
            });
        });
    };
    VeridaInbox.prototype.processItem = function (inboxItem) {
        return __awaiter(this, void 0, void 0, function () {
            var keys, publicKeyBytes, sharedKeyEnd, jwt, err_1, decoded, item, inboxEntry, err_2, err_3;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [4 /*yield*/, this.keyring.getKeys()];
                    case 2:
                        keys = _a.sent();
                        publicKeyBytes = encryption_utils_1.default.hexToBytes(inboxItem.key);
                        sharedKeyEnd = tweetnacl_1.box.before(publicKeyBytes, keys.asymPrivateKey);
                        _a.label = 3;
                    case 3:
                        _a.trys.push([3, 5, , 7]);
                        return [4 /*yield*/, this.keyring.asymDecrypt(inboxItem.content, sharedKeyEnd)];
                    case 4:
                        jwt = _a.sent();
                        return [3 /*break*/, 7];
                    case 5:
                        err_1 = _a.sent();
                        //console.error("Unable to decrypt inbox item")
                        return [4 /*yield*/, this.publicInbox.delete(inboxItem)];
                    case 6:
                        //console.error("Unable to decrypt inbox item")
                        _a.sent();
                        return [2 /*return*/];
                    case 7:
                        decoded = didJWT.decodeJWT(jwt);
                        item = decoded.payload;
                        inboxEntry = {
                            _id: inboxItem._id,
                            message: item.data.message,
                            type: item.data.type,
                            sentAt: item.insertedAt,
                            data: item.data.data,
                            sentBy: {
                                did: item.aud,
                                context: item.context,
                            },
                            insertedAt: new Date().toISOString(),
                            read: false,
                        };
                        if (inboxItem.openUrl) {
                            inboxEntry.openUrl = inboxItem.openUrl;
                        }
                        _a.label = 8;
                    case 8:
                        _a.trys.push([8, 10, , 11]);
                        return [4 /*yield*/, this.privateInbox.save(inboxEntry)];
                    case 9:
                        _a.sent();
                        return [3 /*break*/, 11];
                    case 10:
                        err_2 = _a.sent();
                        if (err_2.status == 409) {
                            // We have a conflict. This can happen if `processItem()` is called twice
                            // for the same inbox item. This can occur if called via the PouchDB changes
                            // listener and also by the `processAll()` method call inside `init()`.
                            this.emit("newMessage", inboxEntry);
                            return [2 /*return*/];
                        }
                        console.error("Unable to save to private inbox");
                        console.error(err_2);
                        return [3 /*break*/, 11];
                    case 11:
                        _a.trys.push([11, 13, , 14]);
                        // delete the inbox/item
                        return [4 /*yield*/, this.publicInbox.delete(inboxItem)];
                    case 12:
                        // delete the inbox/item
                        _a.sent();
                        return [3 /*break*/, 14];
                    case 13:
                        err_3 = _a.sent();
                        console.error("Unable to delete from public inbox");
                        console.error(err_3);
                        throw err_3;
                    case 14:
                        this.emit("newMessage", inboxEntry);
                        this._gc();
                        return [2 /*return*/];
                }
            });
        });
    };
    VeridaInbox.prototype.getItem = function (itemId, options) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.publicInbox.get(itemId, options)];
                }
            });
        });
    };
    VeridaInbox.prototype.watch = function () {
        return __awaiter(this, void 0, void 0, function () {
            var inbox, publicDb, dbInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        inbox = this;
                        return [4 /*yield*/, this.publicInbox.getDb()];
                    case 2:
                        publicDb = _a.sent();
                        return [4 /*yield*/, publicDb.getDb()];
                    case 3:
                        dbInstance = _a.sent();
                        dbInstance
                            .changes({
                            since: "now",
                            live: true,
                        })
                            .on("change", function (info) {
                            return __awaiter(this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            if (info.deleted) {
                                                // ignore deleted changes
                                                return [2 /*return*/];
                                            }
                                            return [4 /*yield*/, inbox.processAll()];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        })
                            .on("denied", function (err) {
                            console.error("Inbox sync denied");
                            console.error(err);
                        })
                            .on("error", function (err) {
                            //console.log("Error watching for private inbox changes")
                            //console.log(err)
                            // This often happens when changing networks, so don't log
                            setTimeout(function () {
                                console.log("Retrying to establish public inbox connection");
                                inbox.emit("connectionError", err);
                                inbox.watch();
                            }, 1000);
                        }); // Setup watching for any changes to the local private inbox (ie: marking an item as read)
                        this.processAll();
                        return [2 /*return*/];
                }
            });
        });
    };
    VeridaInbox.prototype.watchPrivateChanges = function () {
        return __awaiter(this, void 0, void 0, function () {
            var inbox, privateDb, dbInstance;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        inbox = this;
                        return [4 /*yield*/, this.privateInbox.getDb()];
                    case 1:
                        privateDb = _a.sent();
                        return [4 /*yield*/, privateDb.getDb()];
                    case 2:
                        dbInstance = _a.sent();
                        dbInstance
                            .changes({
                            since: "now",
                            live: true,
                        })
                            .on("change", function (info) {
                            return __awaiter(this, void 0, void 0, function () {
                                var inboxItem;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, privateDb.get(info.id, {
                                                rev: info.changes[0].rev,
                                            })];
                                        case 1:
                                            inboxItem = _a.sent();
                                            inbox.emit("inboxChange", inboxItem);
                                            return [2 /*return*/];
                                    }
                                });
                            });
                        })
                            .on("error", function (err) {
                            console.log("Error watching for private inbox changes");
                            console.log(err);
                            setTimeout(function () {
                                console.log("Retrying to establish private inbox connection");
                                inbox.watchPrivateChanges();
                            }, 1000);
                        });
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Initialise the inbox manager
     *
     * @todo: (bug) This opens the datastore based on the database endpoint, needs to open the datastore
     * based on the messaging endpoint (when we support additional types)
     */
    VeridaInbox.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.initComplete) {
                            return [2 /*return*/];
                        }
                        this.initComplete = true;
                        _a = this;
                        return [4 /*yield*/, this.context.openDatastore("https://core.schemas.verida.io/inbox/item/v0.1.0/schema.json", {
                                permissions: {
                                    read: types_1.DatabasePermissionOptionsEnum.PUBLIC,
                                    write: types_1.DatabasePermissionOptionsEnum.PUBLIC,
                                },
                            })];
                    case 1:
                        _a.publicInbox = _c.sent();
                        _b = this;
                        return [4 /*yield*/, this.context.openDatastore("https://core.schemas.verida.io/inbox/entry/v0.1.0/schema.json", {
                                permissions: {
                                    read: types_1.DatabasePermissionOptionsEnum.OWNER,
                                    write: types_1.DatabasePermissionOptionsEnum.OWNER,
                                },
                            })];
                    case 2:
                        _b.privateInbox = _c.sent();
                        return [4 /*yield*/, this.watchPrivateChanges()];
                    case 3:
                        _c.sent();
                        return [4 /*yield*/, this.watch()];
                    case 4:
                        _c.sent();
                        return [4 /*yield*/, this.processAll()];
                    case 5:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    VeridaInbox.prototype.getInboxDatastore = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        return [2 /*return*/, this.privateInbox];
                }
            });
        });
    };
    /**
     * Garbage collection. Remove inbox items past the max limit.
     */
    VeridaInbox.prototype._gc = function () {
        return __awaiter(this, void 0, void 0, function () {
            var privateInbox, items;
            var _this = this;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.init()];
                    case 1:
                        _a.sent();
                        privateInbox = this.privateInbox;
                        return [4 /*yield*/, privateInbox.getMany({
                                read: true, // Only delete read inbox items
                            }, {
                                skip: this.maxItems,
                                sort: [{ sentAt: "desc" }], // Delete oldest first
                            })];
                    case 2:
                        items = _a.sent();
                        if (items && items.length) {
                            items.forEach(function (item) { return __awaiter(_this, void 0, void 0, function () {
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0: return [4 /*yield*/, privateInbox.delete(item)];
                                        case 1:
                                            _a.sent();
                                            return [2 /*return*/];
                                    }
                                });
                            }); });
                        }
                        return [2 /*return*/];
                }
            });
        });
    };
    return VeridaInbox;
}(events_1.EventEmitter));
exports.default = VeridaInbox;
//# sourceMappingURL=inbox.js.map
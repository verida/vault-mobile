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
var inbox_1 = __importDefault(require("./inbox"));
var outbox_1 = __importDefault(require("./outbox"));
/**
 * @category
 * Modules
 */
var MessagingEngineVerida = /** @class */ (function () {
    function MessagingEngineVerida(context, config) {
        if (config === void 0) { config = {}; }
        this.context = context;
        this.contextName = this.context.getContextName();
        this.maxItems = config.maxItems ? config.maxItems : 50;
        this.didContextManager = context.getDidContextManager();
    }
    MessagingEngineVerida.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            var inbox;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!this.keyring) {
                            throw new Error("Unable to initialize messaging as no account is connected");
                        }
                        return [4 /*yield*/, this.getInbox()];
                    case 1:
                        inbox = _a.sent();
                        return [4 /*yield*/, inbox.init()];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    MessagingEngineVerida.prototype.connectAccount = function (account) {
        return __awaiter(this, void 0, void 0, function () {
            var _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        _a = this;
                        return [4 /*yield*/, account.did()];
                    case 1:
                        _a.did = _c.sent();
                        _b = this;
                        return [4 /*yield*/, account.keyring(this.contextName)];
                    case 2:
                        _b.keyring = _c.sent();
                        return [4 /*yield*/, this.init()];
                    case 3:
                        _c.sent();
                        return [2 /*return*/];
                }
            });
        });
    };
    /**
     * Send a message to another DID on the network
     *
     * @param did
     * @param type
     * @param data
     * @param message
     * @param config
     */
    MessagingEngineVerida.prototype.send = function (did, type, data, message, config) {
        return __awaiter(this, void 0, void 0, function () {
            var outbox, response, recipientContextName, notificationService;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getOutbox()];
                    case 1:
                        outbox = _a.sent();
                        return [4 /*yield*/, outbox.send(did, type, data, message, config)];
                    case 2:
                        response = _a.sent();
                        recipientContextName = config.recipientContextName ?
                            config.recipientContextName : this.context.getClient().getConfig().vaultAppName;
                        return [4 /*yield*/, this.context.getNotification(did, recipientContextName)
                            // Ping the notification service if it exists
                            // @todo: Make it configurable if the notification service is pinged
                        ];
                    case 3:
                        notificationService = _a.sent();
                        if (!(response && notificationService)) return [3 /*break*/, 5];
                        return [4 /*yield*/, notificationService.ping(recipientContextName, did)];
                    case 4:
                        _a.sent();
                        _a.label = 5;
                    case 5: return [2 /*return*/, response];
                }
            });
        });
    };
    /**
     * Register a callback to fire when a new message is received
     *
     * @returns {EventEmitter}
     */
    MessagingEngineVerida.prototype.onMessage = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var inbox;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getInbox()];
                    case 1:
                        inbox = _a.sent();
                        return [2 /*return*/, inbox.on("newMessage", callback)];
                }
            });
        });
    };
    MessagingEngineVerida.prototype.offMessage = function (callback) {
        return __awaiter(this, void 0, void 0, function () {
            var inbox;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getInbox()];
                    case 1:
                        inbox = _a.sent();
                        inbox.removeListener("newMessage", callback);
                        return [2 /*return*/];
                }
            });
        });
    };
    MessagingEngineVerida.prototype.getMessages = function (filter, options) {
        return __awaiter(this, void 0, void 0, function () {
            var inbox, inboxDs;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getInbox()];
                    case 1:
                        inbox = _a.sent();
                        return [4 /*yield*/, inbox.getInboxDatastore()];
                    case 2:
                        inboxDs = _a.sent();
                        return [2 /*return*/, inboxDs.getMany(filter, options)];
                }
            });
        });
    };
    MessagingEngineVerida.prototype.getInbox = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (this.inbox) {
                    return [2 /*return*/, this.inbox];
                }
                this.inbox = new inbox_1.default(this.context, this.keyring, this.maxItems);
                return [2 /*return*/, this.inbox];
            });
        });
    };
    MessagingEngineVerida.prototype.getOutbox = function () {
        return __awaiter(this, void 0, void 0, function () {
            var outboxDatastore;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (this.outbox) {
                            return [2 /*return*/, this.outbox];
                        }
                        return [4 /*yield*/, this.context.openDatastore("https://core.schemas.verida.io/outbox/entry/v0.1.0/schema.json")];
                    case 1:
                        outboxDatastore = _a.sent();
                        this.outbox = new outbox_1.default(this.contextName, this.did, this.keyring, outboxDatastore, this.context, this.didContextManager);
                        return [2 /*return*/, this.outbox];
                }
            });
        });
    };
    return MessagingEngineVerida;
}());
exports.default = MessagingEngineVerida;
//# sourceMappingURL=engine.js.map
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
var didJWT = require("did-jwt");
var tweetnacl_1 = require("tweetnacl");
var encryption_utils_1 = __importDefault(require("@verida/encryption-utils"));
var types_1 = require("@verida/types");
var VAULT_CONTEXT_NAME = "Verida: Vault";
/**
 * @category
 * Modules
 */
var VeridaOutbox = /** @class */ (function () {
    function VeridaOutbox(contextName, accountDid, keyring, outboxDatastore, context, didContextManager) {
        this.contextName = contextName;
        this.accountDid = accountDid;
        this.keyring = keyring;
        this.outboxDatastore = outboxDatastore;
        this.context = context;
        this.didContextManager = didContextManager;
        this.inboxes = {};
    }
    /**
     * Send a message to another user's application inbox. The message is converted to
     * a DID-JWT, signed by this application user (sender).
     *
     * The message is then encrypted using the recipients public key and saved
     * to their public inbox with date/time metadata removed.
     *
     * @param {string} did User's public DID
     * @param {string} type Type of inbox entry (ie: /schemas/base/inbox/type/dataSend)
     * @param {object} data Data to include in the message. Must match a particular
     *  schema or be an array of schema objects
     * @param {string} message Message to show the user describing the inbox message
     * @param {config} config Optional config (TBA). ie: specify `appName` if sending to a specific application
     */
    VeridaOutbox.prototype.send = function (did, type, data, message, config) {
        return __awaiter(this, void 0, void 0, function () {
            var defaults, sendingContextName, receivingContextName, recipientContextConfig, err_1, outboxEntry, outbox, response, keys, signer, jwt, publicAsymKey, publicAsymKeyBytes, sharedKey, encrypted, inbox, db, inboxBody, inboxResponse, outboxResponse;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        message = message ? message : "";
                        did = did.toLowerCase();
                        defaults = {
                            did: did,
                            // By default send data to the user's official Verida Vault application
                            recipientContextName: VAULT_CONTEXT_NAME,
                            // @todo: set a default expiry that is configurable but defaults to 24 hours?
                            // Fix in :- https://github.com/verida/verida-js/issues/131.
                        };
                        // Should refactor this logic
                        config = _.merge(defaults, config);
                        sendingContextName = this.contextName;
                        receivingContextName = config.recipientContextName;
                        this.validateData(type, data);
                        _a.label = 1;
                    case 1:
                        _a.trys.push([1, 3, , 4]);
                        return [4 /*yield*/, this.didContextManager.getDIDContextConfig(did, receivingContextName, false)];
                    case 2:
                        recipientContextConfig = _a.sent();
                        return [3 /*break*/, 4];
                    case 3:
                        err_1 = _a.sent();
                        throw new Error("Unable to send message. Recipient does not have an inbox for that context (" + receivingContextName + ")");
                    case 4:
                        outboxEntry = {
                            type: type,
                            data: data,
                            message: message,
                            sentTo: did,
                            sent: false,
                        };
                        if (config.openUrl) {
                            outboxEntry.openUrl = config.openUrl;
                        }
                        outbox = this.outboxDatastore;
                        return [4 /*yield*/, outbox.save(outboxEntry)];
                    case 5:
                        response = _a.sent();
                        if (!response) {
                            console.error(outbox.errors);
                            throw new Error("Unable to save to outbox. See error log above.");
                        }
                        if (response.ok !== true) {
                            console.error(outbox.errors);
                            throw new Error("Unable to save to outbox. See error log above.");
                        }
                        // Include the outbox _id and _rev so the recipient user
                        // can respond to this inbox message
                        outboxEntry._id = response.id;
                        outboxEntry._rev = response.rev;
                        return [4 /*yield*/, this.keyring.getKeys()];
                    case 6:
                        keys = _a.sent();
                        return [4 /*yield*/, didJWT.ES256KSigner(keys.signPrivateKey)];
                    case 7:
                        signer = _a.sent();
                        return [4 /*yield*/, didJWT.createJWT({
                                aud: this.accountDid,
                                exp: config.expiry,
                                data: outboxEntry,
                                context: sendingContextName,
                                insertedAt: new Date().toISOString(),
                            }, {
                                alg: "ES256K",
                                issuer: this.accountDid,
                                signer: signer,
                            })];
                    case 8:
                        jwt = _a.sent();
                        publicAsymKey = recipientContextConfig.publicKeys.asymKey.publicKeyHex;
                        publicAsymKeyBytes = encryption_utils_1.default.hexToBytes(publicAsymKey);
                        sharedKey = tweetnacl_1.box.before(publicAsymKeyBytes, keys.asymPrivateKey);
                        return [4 /*yield*/, this.keyring.asymEncrypt(jwt, sharedKey)];
                    case 9:
                        encrypted = _a.sent();
                        return [4 /*yield*/, this.getInboxDatastore(did, {
                                recipientContextName: receivingContextName,
                                did: did
                            })];
                    case 10:
                        inbox = _a.sent();
                        return [4 /*yield*/, inbox.getDb()];
                    case 11:
                        db = _a.sent();
                        db.on("beforeInsert", function (data) {
                            delete data["insertedAt"];
                            delete data["modifiedAt"];
                        });
                        inboxBody = {
                            content: encrypted,
                            key: encryption_utils_1.default.bytesToHex(keys.asymPublicKey),
                        };
                        return [4 /*yield*/, inbox.save(inboxBody)];
                    case 12:
                        inboxResponse = _a.sent();
                        if (!inboxResponse) {
                            throw new Error("Unable to write to user's inbox");
                        }
                        // Update outbox entry as saved
                        outboxEntry.sent = true;
                        return [4 /*yield*/, outbox.save(outboxEntry)];
                    case 13:
                        outboxResponse = _a.sent();
                        // Close the database connection to the other user's inbox
                        return [4 /*yield*/, inbox.close()];
                    case 14:
                        // Close the database connection to the other user's inbox
                        _a.sent();
                        if (!inboxResponse) {
                            return [2 /*return*/, null];
                        }
                        return [2 /*return*/, inboxResponse];
                }
            });
        });
    };
    /**
     * Get the inbox Datastore for a user by DID (and
     * optionally application name)
     *
     * @param {string} did User's public DID
     * @param {object} config Config to be passed to the dataserver
     */
    VeridaOutbox.prototype.getInboxDatastore = function (did, config) {
        return __awaiter(this, void 0, void 0, function () {
            var inbox;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.context.openExternalDatastore("https://core.schemas.verida.io/inbox/item/v0.1.0/schema.json", did, {
                            permissions: {
                                read: types_1.DatabasePermissionOptionsEnum.PUBLIC,
                                write: types_1.DatabasePermissionOptionsEnum.PUBLIC,
                            },
                            contextName: config.recipientContextName,
                        })];
                    case 1:
                        inbox = _a.sent();
                        return [2 /*return*/, inbox];
                }
            });
        });
    };
    VeridaOutbox.prototype.validateData = function (type, data) {
        // TODO: Validate the data is a valid schema (or an array of valid schemas)
        return true;
    };
    return VeridaOutbox;
}());
exports.default = VeridaOutbox;
//# sourceMappingURL=outbox.js.map
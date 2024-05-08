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
var axios_1 = __importDefault(require("axios"));
var NotificationEngineVerida = /** @class */ (function () {
    function NotificationEngineVerida(senderContextName, senderKeyring, recipientContextName, did, serverUrls) {
        this.errors = [];
        this.senderContextName = senderContextName;
        this.senderKeyring = senderKeyring;
        this.recipientContextName = recipientContextName;
        this.did = did;
        this.serverUrls = serverUrls;
    }
    NotificationEngineVerida.prototype.init = function () {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                // Do nothing. No initialisation is required for this implementation.
                return [2 /*return*/];
            });
        });
    };
    /**
    * Ping a notification server to fetch new messages
    */
    NotificationEngineVerida.prototype.ping = function () {
        return __awaiter(this, void 0, void 0, function () {
            var server, success, _a, _b, _i, s, serverUrl, err_1;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0: return [4 /*yield*/, this.getAxios()];
                    case 1:
                        server = _c.sent();
                        success = true;
                        _a = [];
                        for (_b in this.serverUrls)
                            _a.push(_b);
                        _i = 0;
                        _c.label = 2;
                    case 2:
                        if (!(_i < _a.length)) return [3 /*break*/, 7];
                        s = _a[_i];
                        serverUrl = this.serverUrls[s];
                        _c.label = 3;
                    case 3:
                        _c.trys.push([3, 5, , 6]);
                        // Returns the client context and the corresponding `DID`
                        return [4 /*yield*/, server.post(serverUrl + 'ping', {
                                data: {
                                    did: this.did,
                                    context: this.recipientContextName
                                }
                            })];
                    case 4:
                        // Returns the client context and the corresponding `DID`
                        _c.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        err_1 = _c.sent();
                        this.errors.push(err_1.message);
                        success = false;
                        return [3 /*break*/, 6];
                    case 6:
                        _i++;
                        return [3 /*break*/, 2];
                    case 7: return [2 /*return*/, success];
                }
            });
        });
    };
    NotificationEngineVerida.prototype.getErrors = function () {
        return this.errors;
    };
    NotificationEngineVerida.prototype.getAxios = function () {
        return __awaiter(this, void 0, void 0, function () {
            var config, did, message, signature;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        config = {
                            headers: {
                                "context-name": this.senderContextName,
                            },
                        };
                        did = this.did.toLowerCase();
                        message = "Access the notification service using context: \"" + this.senderContextName + "\"?\n\n" + did;
                        return [4 /*yield*/, this.senderKeyring.sign(message)];
                    case 1:
                        signature = _a.sent();
                        config["auth"] = {
                            username: did.replace(/:/g, "_"),
                            password: signature,
                        };
                        return [2 /*return*/, axios_1.default.create(config)];
                }
            });
        });
    };
    return NotificationEngineVerida;
}());
exports.default = NotificationEngineVerida;
//# sourceMappingURL=engine.js.map
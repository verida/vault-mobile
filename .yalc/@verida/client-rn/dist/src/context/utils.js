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
exports.getRandomInt = exports.RecordSignature = void 0;
var lodash_1 = __importDefault(require("lodash"));
var did_document_1 = require("@verida/did-document");
var schema_1 = __importDefault(require("./schema"));
/**
 * Generates a signature for the given record
 */
var RecordSignature = /** @class */ (function () {
    function RecordSignature() {
    }
    /**
     * Computes and returns the signature
     *
     * @param data Source of data required to generate the Signature
     * @param options required parameter
     */
    RecordSignature.generateSignature = function (data, options) {
        return __awaiter(this, void 0, void 0, function () {
            var signContext, signContextName, account, signDid, keyring, signContextHash, signKey, _data, sig;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        signContext = options.signContext;
                        signContextName = signContext.getContextName();
                        account = signContext.getAccount();
                        return [4 /*yield*/, account.did()];
                    case 1:
                        signDid = _a.sent();
                        return [4 /*yield*/, account.keyring(signContextName)];
                    case 2:
                        keyring = _a.sent();
                        if (!data.signatures) {
                            data.signatures = {};
                        }
                        signContextHash = did_document_1.DIDDocument.generateContextHash(signDid, signContextName);
                        signKey = signDid + "?context=" + signContextHash;
                        _data = lodash_1.default.merge({}, data);
                        // Don't include signatures or revision in the signature
                        // Revision won't be generated until after the record is saved, so can't include in sig
                        delete _data["signatures"];
                        delete _data["_rev"];
                        if (_data['schema']) {
                            _data['schema'] = schema_1.default.getVersionlessSchemaName(_data['schema']);
                        }
                        return [4 /*yield*/, keyring.sign(_data)
                            // Create empty signature object if this DID hasn't signed, or if this DID has an old signature format (string, not object)
                        ];
                    case 3:
                        sig = _a.sent();
                        // Create empty signature object if this DID hasn't signed, or if this DID has an old signature format (string, not object)
                        if (!data.signatures[signKey.toLowerCase()] || typeof (data.signatures[signKey.toLowerCase()]) === 'string') {
                            data.signatures[signKey.toLowerCase()] = {};
                        }
                        data.signatures[signKey.toLowerCase()]['secp256k1'] = sig;
                        return [2 /*return*/, data];
                }
            });
        });
    };
    return RecordSignature;
}());
exports.RecordSignature = RecordSignature;
function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min); // The maximum is exclusive and the minimum is inclusive
}
exports.getRandomInt = getRandomInt;
//# sourceMappingURL=utils.js.map
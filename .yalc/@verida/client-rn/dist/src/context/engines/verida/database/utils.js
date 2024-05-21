"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var encryption_utils_1 = __importDefault(require("@verida/encryption-utils"));
/**
 * @category
 * Modules
 */
var Utils = /** @class */ (function () {
    function Utils() {
    }
    Utils.sleep = function (ms) {
        return new Promise(function (resolve) { return setTimeout(resolve, ms); });
    };
    // DID + context name + DB Name + readPerm + writePerm
    Utils.buildDatabaseHash = function (databaseName, contextName, did) {
        var text = [
            did.toLowerCase(),
            contextName,
            databaseName,
        ].join("/");
        var hash = encryption_utils_1.default.hash(text).substring(2);
        // Database name in CouchDB must start with a letter, so prepend a `v`
        return "v" + hash;
    };
    return Utils;
}());
exports.default = Utils;
//# sourceMappingURL=utils.js.map
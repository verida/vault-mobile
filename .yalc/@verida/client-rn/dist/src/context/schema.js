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
var RefParser = require("json-schema-ref-parser");
var _2020_1 = __importDefault(require("ajv/dist/2020"));
var ajv_formats_1 = __importDefault(require("ajv-formats"));
var draft7MetaSchema = require("ajv/dist/refs/json-schema-draft-07.json");
var resolveAllOf = require("json-schema-resolve-allof");
var _ = require("lodash");
var axios_1 = __importDefault(require("axios"));
// Custom resolver for RefParser
//const { ono } = require("ono");
var resolver = {
    order: 1,
    canRead: true,
    read: function (file) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                return [2 /*return*/, Schema.loadJson(file.url)];
            });
        });
    },
};
var jsonCache = {};
/**
 * @category
 * Modules
 */
var Schema = /** @class */ (function () {
    /**
     * An object representation of a JSON Schema.
     *
     * **Do not instantiate directly.**
     *
     * Access via {@link App#getSchema}
     * @param {string} path Path to a schema in the form (http://..../schema.json, /schemas/name/schema.json, name/of/schema)
     * @constructor
     */
    function Schema(path, options) {
        if (options === void 0) { options = {}; }
        this.path = path;
        this.errors = [];
        options = _.merge({
            metaschemas: {},
            ajv: {
                loadSchema: Schema.loadJson,
                logger: false,
                strict: false,
            },
        }, options);
        this.ajv = new _2020_1.default(options.ajv);
        this.ajv.addMetaSchema(draft7MetaSchema);
        (0, ajv_formats_1.default)(this.ajv);
        for (var s in options.metaSchemas) {
            this.ajv.addMetaSchema(options.metaSchemas[s]);
        }
    }
    Schema.getSchema = function (schemaName) {
        return __awaiter(this, void 0, void 0, function () {
            return __generator(this, function (_a) {
                if (!Schema.schemas[schemaName]) {
                    Schema.schemas[schemaName] = new Schema(schemaName);
                }
                return [2 /*return*/, Schema.schemas[schemaName]];
            });
        });
    };
    Schema.setSchemaPaths = function (schemaPaths) {
        Schema.schemaPaths = schemaPaths;
    };
    Schema.getSchemaPaths = function () {
        return Schema.schemaPaths;
    };
    /**
     * @todo: Deprecate in favour of `getProperties()`
     * Get an object that represents the JSON Schema. Fully resolved.
     * Warning: This can cause issues with very large schemas.
     *
     * @example
     * let schemaDoc = await app.getSchema("social/contact");
     * let spec = schemaDoc.getSpecification();
     * console.log(spec);
     * @returns {object} JSON object representing the defereferenced schema
     */
    Schema.prototype.getSpecification = function () {
        return __awaiter(this, void 0, void 0, function () {
            var path, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.specification) {
                            return [2 /*return*/, this.specification];
                        }
                        return [4 /*yield*/, this.getPath()];
                    case 1:
                        path = _b.sent();
                        _a = this;
                        return [4 /*yield*/, RefParser.dereference(path, {
                                resolve: { http: resolver },
                            })];
                    case 2:
                        _a.specification = _b.sent();
                        return [4 /*yield*/, resolveAllOf(this.specification)];
                    case 3:
                        _b.sent();
                        return [2 /*return*/, this.specification];
                }
            });
        });
    };
    /**
     * Validate a data object with this schema, using AJV
     *
     * @param {object} data
     * @returns {boolean} True if the data validates against the schema.
     */
    Schema.prototype.validate = function (data) {
        return __awaiter(this, void 0, void 0, function () {
            var schemaJson, _a, valid;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (!!this.validateFunction) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getSchemaJson()];
                    case 1:
                        schemaJson = _b.sent();
                        // @todo: Fix schemas to have valid definitions and then enable strict compile
                        _a = this;
                        return [4 /*yield*/, this.ajv.compileAsync(schemaJson)];
                    case 2:
                        // @todo: Fix schemas to have valid definitions and then enable strict compile
                        _a.validateFunction = _b.sent();
                        _b.label = 3;
                    case 3: return [4 /*yield*/, this.validateFunction(data)];
                    case 4:
                        valid = _b.sent();
                        if (!valid) {
                            this.errors = this.validateFunction.errors;
                        }
                        return [2 /*return*/, valid];
                }
            });
        });
    };
    /**
     * Fetch unresolved JSON schema
     */
    Schema.prototype.getSchemaJson = function () {
        return __awaiter(this, void 0, void 0, function () {
            var path, fileData, _a;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0:
                        if (this.schemaJson) {
                            return [2 /*return*/, this.schemaJson];
                        }
                        return [4 /*yield*/, this.getPath()];
                    case 1:
                        path = _b.sent();
                        return [4 /*yield*/, axios_1.default.get(path, {
                                responseType: "json",
                            })];
                    case 2:
                        fileData = _b.sent();
                        _a = this;
                        return [4 /*yield*/, fileData.data];
                    case 3:
                        _a.schemaJson = _b.sent();
                        return [2 /*return*/, this.schemaJson];
                }
            });
        });
    };
    Schema.prototype.getAppearance = function () {
        return __awaiter(this, void 0, void 0, function () {
            var schemaJson, appearance, icon, path, path, rootPathParts;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, this.getSpecification()];
                    case 1:
                        schemaJson = _a.sent();
                        appearance = schemaJson.appearance;
                        if (!(appearance.style && appearance.style.icon)) return [3 /*break*/, 6];
                        icon = schemaJson.appearance.style.icon;
                        if (!(icon.substring(0, 2) == "./")) return [3 /*break*/, 3];
                        return [4 /*yield*/, this.getPath()];
                    case 2:
                        path = _a.sent();
                        icon = path.replace("schema.json", icon.substring(2));
                        _a.label = 3;
                    case 3:
                        if (!(icon.substring(0, 1) == "/")) return [3 /*break*/, 5];
                        return [4 /*yield*/, this.getPath()];
                    case 4:
                        path = _a.sent();
                        rootPathParts = path.match(/^(https?:\/\/[^\/]*)/);
                        if (rootPathParts) {
                            icon = rootPathParts[0] + "/" + icon.substring(1);
                        }
                        _a.label = 5;
                    case 5:
                        schemaJson.appearance.style.icon = icon;
                        _a.label = 6;
                    case 6: return [2 /*return*/, appearance];
                }
            });
        });
    };
    /**
     * Get a rully resolveable path for a URL
     *
     * Handle shortened paths:
     *  - `health/activity` -> `https://common.schemas.verida.io/health/activity/latest/schema.json`
     *  - `https://common/schemas.verida.io/health/activity/latest` -> `https://common.schemas.verida.io/health/activity/latest/schema.json`
     *  - `/health/activity/test.json` -> `https://common/schemas.verida.io/health/activity/test.json`
     */
    Schema.prototype.getPath = function () {
        return __awaiter(this, void 0, void 0, function () {
            var path, _a, _b;
            return __generator(this, function (_c) {
                switch (_c.label) {
                    case 0:
                        if (this.finalPath) {
                            return [2 /*return*/, this.finalPath];
                        }
                        path = this.path;
                        if (!path.match("http")) return [3 /*break*/, 2];
                        _a = this;
                        return [4 /*yield*/, Schema.resolvePath(path)];
                    case 1:
                        _a.finalPath = _c.sent();
                        return [2 /*return*/, this.finalPath];
                    case 2:
                        // Prepend `/` if required (ie: "profile/public")
                        if (path.substring(1) != "/") {
                            path = "/" + path;
                        }
                        // Append /schema.json if required
                        if (path.substring(path.length - 5) != ".json") {
                            path += "/schema.json";
                        }
                        _b = this;
                        return [4 /*yield*/, Schema.resolvePath(path)];
                    case 3:
                        _b.finalPath = _c.sent();
                        this.path = this.finalPath;
                        return [2 /*return*/, this.finalPath];
                }
            });
        });
    };
    /**
     * Force schema paths to be applied to URLs
     *
     */
    Schema.resolvePath = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            var resolvePaths, searchPath, resolvePath;
            return __generator(this, function (_a) {
                resolvePaths = Schema.schemaPaths;
                for (searchPath in resolvePaths) {
                    resolvePath = resolvePaths[searchPath];
                    if (uri.substring(0, searchPath.length) == searchPath) {
                        uri = uri.replace(searchPath, resolvePath);
                    }
                }
                return [2 /*return*/, uri];
            });
        });
    };
    /**
     * Load JSON from a url that is fully resolved.
     *
     * Used by AJV.
     *
     * @param {*} uri
     */
    Schema.loadJson = function (uri) {
        return __awaiter(this, void 0, void 0, function () {
            var _this = this;
            return __generator(this, function (_a) {
                if (jsonCache[uri]) {
                    return [2 /*return*/, jsonCache[uri]];
                }
                jsonCache[uri] = new Promise(function (resolve, reject) { return __awaiter(_this, void 0, void 0, function () {
                    var response, json, err_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, Schema.resolvePath(uri)];
                            case 1:
                                uri = _a.sent();
                                _a.label = 2;
                            case 2:
                                _a.trys.push([2, 5, , 6]);
                                return [4 /*yield*/, axios_1.default.get(uri, {
                                        responseType: "json",
                                    })];
                            case 3:
                                response = _a.sent();
                                return [4 /*yield*/, response.data];
                            case 4:
                                json = _a.sent();
                                resolve(json);
                                return [3 /*break*/, 6];
                            case 5:
                                err_1 = _a.sent();
                                reject(err_1);
                                return [3 /*break*/, 6];
                            case 6: return [2 /*return*/];
                        }
                    });
                }); });
                return [2 /*return*/, jsonCache[uri]];
            });
        });
    };
    /**
     * Checks a version specified in schemaName
     *
     * SchemaName example  :-  https://core.schemas.verida.io/base/v0.1.0/schema.json
     * SchemaName format :- https://{protocol-name}/{name}/{v}{version}/name.json
     * @param schemaName
     * @returns schemaName without the version
     */
    Schema.getVersionlessSchemaName = function (schemaName) {
        var schemaParts = schemaName.match(/(.*)\/((v[0-9\.]*)|latest)\/schema.json$/);
        if (!schemaParts) {
            return schemaName;
        }
        var schemaLess = schemaParts[1] + "/schema.json";
        return schemaLess;
    };
    Schema.schemas = {};
    return Schema;
}());
exports.default = Schema;
//# sourceMappingURL=schema.js.map
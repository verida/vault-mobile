"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spec_1 = require("./spec");
const utils_1 = require("./utils");
class AssetName {
    constructor(params) {
        if (typeof params === "string") {
            params = AssetName.parse(params);
        }
        this.namespace = params.namespace;
        this.reference = params.reference;
    }
    static parse(id) {
        if (!utils_1.isValidId(id, this.spec)) {
            throw new Error(`Invalid ${this.spec.name} provided: ${id}`);
        }
        return new AssetName(utils_1.getParams(id, this.spec)).toJson();
    }
    static format(params) {
        return utils_1.joinParams(params, this.spec);
    }
    toString() {
        return AssetName.format(this.toJson());
    }
    toJson() {
        return {
            namespace: this.namespace,
            reference: this.reference,
        };
    }
}
exports.AssetName = AssetName;
AssetName.spec = spec_1.CAIP["19"].assetName;
//# sourceMappingURL=assetName.js.map
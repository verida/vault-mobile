"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const spec_1 = require("./spec");
const utils_1 = require("./utils");
class ChainId {
    constructor(params) {
        if (typeof params === "string") {
            params = ChainId.parse(params);
        }
        this.namespace = params.namespace;
        this.reference = params.reference;
    }
    static parse(id) {
        if (!utils_1.isValidId(id, this.spec)) {
            throw new Error(`Invalid ${this.spec.name} provided: ${id}`);
        }
        return new ChainId(utils_1.getParams(id, this.spec)).toJson();
    }
    static format(params) {
        return utils_1.joinParams(params, this.spec);
    }
    toString() {
        return ChainId.format(this.toJson());
    }
    toJson() {
        return {
            namespace: this.namespace,
            reference: this.reference,
        };
    }
}
exports.ChainId = ChainId;
ChainId.spec = spec_1.CAIP["2"];
//# sourceMappingURL=chain.js.map
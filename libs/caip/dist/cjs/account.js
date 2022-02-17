"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chain_1 = require("./chain");
const spec_1 = require("./spec");
const utils_1 = require("./utils");
class AccountId {
    constructor(params) {
        if (typeof params === "string") {
            params = AccountId.parse(params);
        }
        this.chainId = new chain_1.ChainId(params.chainId);
        this.address = params.address;
    }
    static parse(id) {
        if (!utils_1.isValidId(id, this.spec)) {
            throw new Error(`Invalid ${this.spec.name} provided: ${id}`);
        }
        const { namespace, reference, address } = utils_1.getParams(id, this.spec);
        const chainId = new chain_1.ChainId({ namespace, reference });
        return new AccountId({ chainId, address }).toJson();
    }
    static format(params) {
        const chainId = new chain_1.ChainId(params.chainId);
        const splitParams = Object.assign(Object.assign({}, chainId.toJson()), { address: params.address });
        return utils_1.joinParams(splitParams, this.spec);
    }
    toString() {
        return AccountId.format(this.toJson());
    }
    toJson() {
        return {
            chainId: this.chainId.toJson(),
            address: this.address,
        };
    }
}
exports.AccountId = AccountId;
AccountId.spec = spec_1.CAIP["10"];
//# sourceMappingURL=account.js.map
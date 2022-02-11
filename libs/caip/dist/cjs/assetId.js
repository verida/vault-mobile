"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const assetName_1 = require("./assetName");
const chain_1 = require("./chain");
const spec_1 = require("./spec");
const utils_1 = require("./utils");
class AssetId {
    constructor(params) {
        if (typeof params === "string") {
            params = AssetId.parse(params);
        }
        this.chainId = new chain_1.ChainId(params.chainId);
        this.assetName = new assetName_1.AssetName(params.assetName);
        this.tokenId = params.tokenId;
    }
    static parse(id) {
        if (!utils_1.isValidId(id, this.spec)) {
            throw new Error(`Invalid ${this.spec.name} provided: ${id}`);
        }
        return new AssetId(utils_1.getParams(id, this.spec)).toJson();
    }
    static format(params) {
        return utils_1.joinParams(params, this.spec);
    }
    toString() {
        return AssetId.format(this.toJson());
    }
    toJson() {
        return {
            chainId: this.chainId.toJson(),
            assetName: this.assetName.toJson(),
            tokenId: this.tokenId,
        };
    }
}
exports.AssetId = AssetId;
AssetId.spec = spec_1.CAIP["19"].assetId;
//# sourceMappingURL=assetId.js.map
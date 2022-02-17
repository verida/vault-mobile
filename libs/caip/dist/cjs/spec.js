"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CAIP2 = {
    name: "chainId",
    regex: "[-:a-zA-Z0-9]{5,41}",
    parameters: {
        delimiter: ":",
        values: {
            0: {
                name: "namespace",
                regex: "[-a-z0-9]{3,8}",
            },
            1: {
                name: "reference",
                regex: "[-a-zA-Z0-9]{1,32}",
            },
        },
    },
};
const CAIP10 = {
    name: "accountId",
    regex: "[-:a-zA-Z0-9]{7,106}",
    parameters: {
        delimiter: ":",
        values: {
            0: {
                name: "namespace",
                regex: "[-a-z0-9]{3,8}",
            },
            1: {
                name: "reference",
                regex: "[-a-zA-Z0-9]{1,32}",
            },
            2: {
                name: "address",
                regex: "[a-zA-Z0-9]{1,64}",
            },
        },
    },
};
const AssetName = {
    name: "assetName",
    regex: "[-:a-zA-Z0-9]{5,73}",
    parameters: {
        delimiter: ":",
        values: {
            0: {
                name: "namespace",
                regex: "[-a-z0-9]{3,8}",
            },
            1: {
                name: "reference",
                regex: "[-a-zA-Z0-9]{1,64}",
            },
        },
    },
};
const CAIP19AssetType = {
    name: "assetType",
    regex: "[-:a-zA-Z0-9]{11,115}",
    parameters: {
        delimiter: "/",
        values: {
            0: CAIP2,
            1: AssetName,
        },
    },
};
const CAIP19AssetId = {
    name: "assetId",
    regex: "[-:a-zA-Z0-9]{13,148}",
    parameters: {
        delimiter: "/",
        values: {
            0: CAIP2,
            1: AssetName,
            2: {
                name: "tokenId",
                regex: "[-a-zA-Z0-9]{1,32}",
            },
        },
    },
};
exports.CAIP = {
    "2": CAIP2,
    "10": CAIP10,
    "19": {
        assetName: AssetName,
        assetType: CAIP19AssetType,
        assetId: CAIP19AssetId,
    },
};
//# sourceMappingURL=spec.js.map
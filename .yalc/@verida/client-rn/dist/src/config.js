"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var types_1 = require("@verida/types");
var config = {
    network: types_1.Network.BANKSIA,
    environments: {
        "local": {
            schemaPaths: {
                '/': 'https://schemas.verida.io/',
                'https://schemas.verida.io/': 'https://schemas.testnet.verida.io/'
                //'https://schemas.verida.io/': 'http://localhost:5010/'
            }
        },
        "banksia": {
            schemaPaths: {
                '/': 'https://schemas.verida.io/',
                'https://schemas.verida.io/': 'https://schemas.testnet.verida.io/'
            },
            readOnlyDataApiUri: 'https://data.verida.network'
        },
        "myrtle": {
            schemaPaths: {
                '/': 'https://schemas.verida.io/'
            },
            readOnlyDataApiUri: 'https://data.verida.network'
        },
    },
    vaultAppName: "Verida: Vault"
};
exports.default = config;
//# sourceMappingURL=config.js.map
import Verida from "@verida/datastore";

const VUE_APP_VERIDA_APP_NAME = "Verida";
const VUE_APP_VERIDA_ENVIRONMENT = "testnet";

export const connect = async () => {
    Verida.setConfig({
        appName: VUE_APP_VERIDA_APP_NAME,
        environment: VUE_APP_VERIDA_ENVIRONMENT,
        servers: {
            testnet: {
                schemaPaths: {
                    'https://schemas.testnet.verida.io/': 'http://localhost:5001/'
                }
            }
        }
    });
};

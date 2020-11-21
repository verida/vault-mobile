/*import Verida from '@verida/datastore';
import walletUtils from '@verida/wallet-utils';

const VERIDA_APP_NAME = 'Verida (Mobile)';
const VERIDA_ENVIRONMENT = 'testnet';

export const testVeridaConnect = () => {
    const { address, chain, privateKey } = walletUtils.createWallet('ethr');

    Verida.setConfig({
        appName: VERIDA_APP_NAME,
        environment: VERIDA_ENVIRONMENT,
        servers: {
            testnet: {
                schemaPaths: {
                    'https://schemas.testnet.verida.io/': 'http://localhost:5001/'
                }
            }
        }
    });

    const veridaApp = new Verida({
        address,
        chain,
        privateKey,
    });

    console.log(veridaApp);
};
*/
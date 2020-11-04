import Verida from '@verida/datastore';
import Vault from '@verida/vault-common';
import walletUtils from '@verida/wallet-utils';
import * as SecureStore from 'expo-secure-store';

const WALLET_KEY = 'VaultMobileWallet';
export const MNEMONIC_LENGTH = 12;
const VERIDA_APP_NAME = 'Verida (Mobile)';
const CHAIN ='ethr';

export const generateMnemonic = async () => {
    const wallet = await SecureStore.getItemAsync(WALLET_KEY);
    if (wallet) {
        const result = JSON.parse(wallet);
        return result.mnemonic;
    }
    const newWallet = walletUtils.createWallet('ethr');
    await SecureStore.setItemAsync(WALLET_KEY, JSON.stringify(newWallet));
    return newWallet.mnemonic;
};
export const walletByMnemonic = async (mnemonic) => {
    const wallet = walletUtils.getWallet('ethr', mnemonic);
    await SecureStore.setItemAsync(WALLET_KEY, JSON.stringify(wallet));
};
export const clearWallet = async () => {
    await SecureStore.deleteItemAsync(WALLET_KEY);
};
export const getWallet = async () => {
    const wallet = await SecureStore.getItemAsync(WALLET_KEY);
    if (wallet) {
        const result = JSON.parse(wallet);
        result.address = 'did:ethr:' + result.address.toLowerCase();
        return result;
    }
    return {};
};
export const isAuthorized = async () => {
    const wallet = await SecureStore.getItemAsync(WALLET_KEY);
    return Boolean(wallet);
};

export const getVeridaApp = async () => {
    const wallet = await SecureStore.getItemAsync(WALLET_KEY);
    const { address, privateKey } = JSON.parse(wallet);

    Verida.setConfig({
        appName: VERIDA_APP_NAME
    });

    const verida = new Verida({
        address,
        chain: CHAIN,
        privateKey
    });

    await verida.connect(true);

    return verida;
};

export const getVault = async () => {
    const verida = await getVeridaApp();
    return new Vault(verida);
};

import Verida from '@verida/datastore';
import Vault from '@verida/vault-common';
import walletUtils from '@verida/wallet-utils';
import * as SecureStore from 'expo-secure-store';

import dataMap from '../config/data-map'
const WALLET_KEY = 'VaultMobileWallet';
export const MNEMONIC_LENGTH = 12;
const VERIDA_APP_NAME = 'Verida: Vault';
const CHAIN ='ethr';

global.Verida = Verida;

export const generateMnemonic = async (userData) => {
    const wallet = await SecureStore.getItemAsync(WALLET_KEY);
    if (wallet) {
        const result = JSON.parse(wallet);
        return result.mnemonic;
    }
    const newWallet = walletUtils.createWallet('ethr');

    const vault = await getVault(newWallet);
    await Promise.all(Object.entries(userData).map(entry => vault.profiles.public.set(...entry)));

    await SecureStore.setItemAsync(WALLET_KEY, JSON.stringify(newWallet));
    return newWallet.mnemonic;
};
export const walletByMnemonic = async (mnemonic) => {
    const wallet = walletUtils.getWallet('ethr', mnemonic);
    await SecureStore.setItemAsync(WALLET_KEY, JSON.stringify(wallet));
};
export const clearWallet = async () => {
    global.verida = null;
    global.vault = null;
    await SecureStore.deleteItemAsync(WALLET_KEY);
};
export const getWallet = async () => {
    if (global.wallet) {
        return global.wallet;
    }
    
    const wallet = await SecureStore.getItemAsync(WALLET_KEY);
    if (wallet) {
        const result = JSON.parse(wallet);
        result.address = 'did:ethr:' + result.address.toLowerCase();
        global.wallet = result;
        return result;
    }
    return {};
};
export const isAuthorized = async () => {
    const wallet = await SecureStore.getItemAsync(WALLET_KEY);
    return Boolean(wallet);
};

export const getVeridaApp = async (wallet) => {
    if (global.verida) {
        return global.verida;
    }

    if (!wallet) {
        wallet = await SecureStore.getItemAsync(WALLET_KEY);
        wallet = JSON.parse(wallet);
    }
    const { address, privateKey } = wallet;

    Verida.setConfig({
        appName: VERIDA_APP_NAME
    });

    const verida = new Verida({
        address,
        chain: CHAIN,
        privateKey
    });

    await verida.connect(true);
    global.verida = verida;

    return verida;
};

export const getVault = async (wallet) => {
    if (global.vault) {
        return global.vault;
    }

    const verida = await getVeridaApp(wallet);
    const vault = new Vault(verida, dataMap);
    global.vault = vault;

    return vault;
};

export async function fetchInboxItems (filter = {}) {
    const inbox = await fetchInbox()

    return await inbox.getMany(filter, {
        sort: [{ sentAt: 'desc' }]
    });
}

export async function fetchInbox () {
    const veridaApp = await getVeridaApp();
    return veridaApp.inbox.getInbox();
}

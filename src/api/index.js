import Verida from '@verida/datastore';
import Vault from '@verida/vault-common';
import walletUtils from '@verida/wallet-utils';
import * as SecureStore from 'expo-secure-store';

const WALLET_KEY = 'VaultMobileWallet';
export const MNEMONIC_LENGTH = 12;
const VERIDA_APP_NAME = 'Verida: Vault';
const CHAIN ='ethr';

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
    const wallet = await SecureStore.getItemAsync(WALLET_KEY);
    global.wallet = wallet
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

export const getVeridaApp = async (wallet) => {
    console.log("getVeridaApp");
    if (global.verida) {
        console.log("return existing verid app");
        return global.verida;
    }
    console.log("build verida vapp");

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
    console.log("get vault")
    if (global.vault) {
        console.log("returning existing vault")
        return global.vault;
    }
    console.log("creating vault")

    const verida = await getVeridaApp(wallet);
    const vault = new Vault(verida);
    global.vault = vault;

    return vault;
};

global.getVault = getVault;

export async function fetchInbox (filter = {}) {
    console.log("fetch inbox");
    const veridaApp = await getVeridaApp();
    const inbox = await veridaApp.inbox.getInbox();

    return inbox.getMany(filter, {
        sort: [{ sentAt: 'desc' }]
    });
}

global.fetchInbox = fetchInbox;

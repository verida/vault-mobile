import Verida from '@verida/datastore';
import Vault from '@verida/vault-common';
import walletUtils from '@verida/wallet-utils';
import * as SecureStore from 'expo-secure-store';

import dataMap from '../config/data-map'
const WALLET_KEY = 'VaultMobileWallet';
export const MNEMONIC_LENGTH = 12;
const VERIDA_APP_NAME = 'Verida: Vault';
const CHAIN ='near';

global.Verida = Verida;

export const generateWallet = async (userData) => {
    const newWallet = walletUtils.createWallet('near');
    global.wallet = newWallet;

    const vault = await getVault(newWallet);
    await Promise.all(Object.entries(userData).map(entry => vault.profiles.public.set(...entry)));

    await SecureStore.setItemAsync(WALLET_KEY, JSON.stringify(newWallet));
    return newWallet;
};
export const walletByMnemonic = async (mnemonic) => {
    const wallet = walletUtils.getWallet(CHAIN, mnemonic);
    await SecureStore.setItemAsync(WALLET_KEY, JSON.stringify(wallet));
};
export const clearWallet = async () => {
    global.verida = null;
    global.vault = null;
    global.wallet = null;
    await SecureStore.deleteItemAsync(WALLET_KEY);
};
export const getWallet = async () => {
    if (global.wallet) {
        return global.wallet;
    }
    
    const wallet = await SecureStore.getItemAsync(WALLET_KEY);
    if (wallet) {
        const result = JSON.parse(wallet);
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

    // create a promise to return to avoid `getVeridaApp` being called multiple times
    global.verida = new Promise(async (resolve) => {
        if (!wallet) {
            wallet = await SecureStore.getItemAsync(WALLET_KEY);
            wallet = JSON.parse(wallet);
        }
        const { address, privateKey } = wallet;

        Verida.setConfig({
            appName: VERIDA_APP_NAME,
            /*servers: {
                testnet: {
                    schemaPaths: {
                    'https://schemas.verida.io/': 'http://localhost:5010/',
                    'https://schemas.testnet.verida.io/': 'http://localhost:5010/'
                    }
                }
            }*/
        });

        const verida = new Verida({
            address,
            chain: CHAIN,
            privateKey
        });

        await verida.connect(true);
        resolve(verida);
    });

    return global.verida;
};

export const getVault = async (wallet) => {
    if (global.vault) {
        return global.vault;
    }

    global.vault = new Promise(async (resolve) => {
        const verida = await getVeridaApp(wallet);
        const vault = new Vault(verida, dataMap);
        global.vault = vault;

        resolve(vault);
    });

    return global.vault;
};

/**
 * 
 * @returns <Image/> source property
 */
const DefaultAvatar = require('../assets/stubs/avatar.png');

export const loadAvatarSource = async () => {
    const vault = await getVault()
    let avatar = await vault.profiles.public.get('avatar')
    if (!avatar) {
        return DefaultAvatar
    }

    avatar = JSON.parse(avatar)

    if (avatar) {
        let image
        switch (avatar.encoding) {
            case 'base64':
                image = {
                    uri: `data:image/${avatar.format};base64,` + avatar.base64
                }

                break
            default:
                return DefaultAvatar
        }
        
        return image
    }

    return DefaultAvatar
}
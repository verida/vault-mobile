import walletUtils from '@verida/wallet-utils';
import * as SecureStore from 'expo-secure-store';

const WALLET_KEY = 'VaultMobileWallet';
export const MNEMONIC_LENGTH = 12;

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

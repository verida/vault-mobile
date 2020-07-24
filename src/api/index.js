import walletUtils from "@verida/wallet-utils";
import AsyncStorage from "@react-native-community/async-storage";

const WALLET_KEY = "@VaultMobile:wallet";

export const generateMnemonic = function() {
    const wallet = walletUtils.createWallet('ethr')
    return wallet.mnemonic
}
export const walletByMnemonic = async (mnemonic) => {
    const wallet = walletUtils.getWallet('ethr', mnemonic)
    await AsyncStorage.setItem(WALLET_KEY, JSON.stringify(wallet));
};
export const clearWallet = async () => {
    await AsyncStorage.removeItem(WALLET_KEY);
};
export const getWallet = async () => {
    const wallet = await AsyncStorage.getItem(WALLET_KEY);
    return (wallet && JSON.parse(wallet)) || {};
};
export const isAuthorized = async () => {
    const wallet = await AsyncStorage.getItem(WALLET_KEY);
    return Boolean(wallet);
};
export const getWalletInfo = async () => {
    const wallet = await getWallet();
    return wallet;
};

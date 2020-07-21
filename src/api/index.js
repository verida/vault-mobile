import * as ethers from "ethers";
import AsyncStorage from "@react-native-community/async-storage";

const WALLET_KEY = "@VaultMobile:wallet";

export const generateMnemonic = () => ethers.utils.HDNode.entropyToMnemonic(ethers.utils.randomBytes(16));
export const walletByMnemonic = async (mnemonic) => {
    const wallet = ethers.Wallet.fromMnemonic(mnemonic);
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

    const { address, mnemonic } = wallet.signingKey;
    const prefix = "did:ethr:";

    return {
        address: prefix + address,
        mnemonic
    };
};

import { generateMnemonic, walletByMnemonic } from '../api';
import { Actions } from 'react-native-router-flux';
import { CREATE_PIN } from '../constants/route';

export const onRemind = async (mnemonic) => {
    mnemonic = mnemonic || await generateMnemonic();
    await walletByMnemonic(mnemonic);
    Actions[CREATE_PIN]();
};

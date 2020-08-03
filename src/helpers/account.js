import {generateMnemonic, walletByMnemonic} from "../api";
import {Actions} from "react-native-router-flux";
import {SUCCESS} from "../constants/route";

export const onRemind = async (mnemonic = generateMnemonic()) => {
    await walletByMnemonic(mnemonic);
    Actions[SUCCESS]();
};

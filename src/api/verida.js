import { ethers } from "ethers";
import walletUtils from "@verida/wallet-utils/src/utils";

export const connect = () => {
   const wallet = ethers.Wallet.createRandom();
   console.log("wallet, connect");

   const walletUt = walletUtils.createAccount("ethr");
    console.log("wallet utils, connect");
};

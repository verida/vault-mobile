import walletUtils from "@verida/wallet-utils/src/utils";

export const connect = () => {
   const walletUt = walletUtils.createAccount("ethr");
   console.log("wallet utils, connect", walletUt);
};

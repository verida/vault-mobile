// https://github.com/WalletConnect/web-examples/blob/d7c56a3beaaf75adb0aa481b2010454339361871/wallets/react-wallet-v2/src/data/EIP155Data.ts#L95
export enum EthereumSigningMethod {
  PERSONAL_SIGN = 'personal_sign',
  ETH_SIGN = 'eth_sign',
  ETH_SIGN_TRANSACTION = 'eth_signTransaction',
  ETH_SIGN_TYPED_DATA = 'eth_signTypedData',
  ETH_SIGN_TYPED_DATA_V3 = 'eth_signTypedData_v3',
  ETH_SIGN_TYPED_DATA_V4 = 'eth_signTypedData_v4',
  ETH_SEND_RAW_TRANSACTION = 'eth_sendRawTransaction',
  ETH_SEND_TRANSACTION = 'eth_sendTransaction',
}

export enum EthereumSigningMethod {
  SEND_TRANSACTION = 'eth_sendTransaction',
  SIGN_TRANSACTION = 'eth_signTransaction',
  PERSONAL_SIGN = 'personal_sign',
  PERSONAL_SIGN_TYPED_DATA = 'personal_signTypedData',
  WALLET_SWITCH_ETHEREUM_CHAIN = 'wallet_switchEthereumChain',
}

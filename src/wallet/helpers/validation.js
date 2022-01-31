import algosdk from 'algosdk'

export const isValidWalletAddress = (address) => {
  return algosdk.isValidAddress(address)
}

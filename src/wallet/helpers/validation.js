import algosdk from 'algosdk'
import { web3 } from 'wallet/chains/ethereum'
import { getTokenChain } from 'wallet/helpers/tokens'

export const isValidWalletAddress = (address, tokenAddress) => {
  let chain = getTokenChain(tokenAddress)
  return chain === 'algorand'
    ? algosdk.isValidAddress(address)
    : web3.utils.isAddress(address)
}

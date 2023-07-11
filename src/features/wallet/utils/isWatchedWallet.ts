// Defines if a VeridaWalletAccount is just being watched by the user, i.e. they
// do not know the private key or mnemonic which accesses the account.
import { VeridaWalletAccount } from 'types'

export const isWatchedWallet = ({
  mnemonic,
  privateKey,
}: VeridaWalletAccount) => !mnemonic && !privateKey

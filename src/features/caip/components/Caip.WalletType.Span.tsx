import * as React from 'react'
import { CaipWalletType } from 'types'

export const CaipWalletTypeSpan = React.memo(function CaipWalletTypeSpan({
  caipWalletType = undefined,
}: {
  readonly caipWalletType: CaipWalletType | undefined
}): JSX.Element {
  // TODO: these will change depending whether we're on testnet or not
  const children =
    caipWalletType === 'eip155'
      ? 'Ethereum Goerli'
      : caipWalletType === 'algorand'
      ? 'Algorand Testnet'
      : caipWalletType === 'near'
      ? 'Near Testnet'
      : 'Unknown'

  // eslint-disable-next-line react/no-children-prop
  return <React.Fragment children={children} />
})

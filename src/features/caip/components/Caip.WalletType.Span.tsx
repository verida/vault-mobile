import { getCaipWalletTypeFriendlyName } from 'features/caip'
import * as React from 'react'
import { CaipWalletType } from 'types'

export const CaipWalletTypeSpan = React.memo(function CaipWalletTypeSpan({
  caipWalletType = undefined,
}: {
  readonly caipWalletType: CaipWalletType | undefined
}): JSX.Element {
  return (
    // eslint-disable-next-line react/no-children-prop
    <React.Fragment children={getCaipWalletTypeFriendlyName(caipWalletType)} />
  )
})

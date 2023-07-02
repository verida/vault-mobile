import { EnvironmentType } from '@verida/types'
import { getSupportedCaipProtocolFriendlyName } from 'features/caip'
import * as React from 'react'
import { SupportedCaipProtocol } from 'types'

import CONFIG from 'config/environment'

export const CaipWalletTypeSpan = React.memo(function CaipWalletTypeSpan({
  caipWalletType = undefined,
  environmentType = CONFIG.VERIDA_ENVIRONMENT,
}: {
  readonly caipWalletType: SupportedCaipProtocol | undefined
  readonly environmentType?: EnvironmentType
}): JSX.Element {
  return (
    <React.Fragment
      // eslint-disable-next-line react/no-children-prop
      children={getSupportedCaipProtocolFriendlyName(
        caipWalletType,
        environmentType
      )}
    />
  )
})

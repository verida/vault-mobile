import { EnvironmentType } from '@verida/types'
import { getCaipWalletTypeFriendlyName } from 'features/caip'
import * as React from 'react'
import { CaipWalletType } from 'types'

import CONFIG from 'config/environment'

export const CaipWalletTypeSpan = React.memo(function CaipWalletTypeSpan({
  caipWalletType = undefined,
  environmentType = CONFIG.VERIDA_ENVIRONMENT,
}: {
  readonly caipWalletType: CaipWalletType | undefined
  readonly environmentType?: EnvironmentType
}): JSX.Element {
  return (
    <React.Fragment
      // eslint-disable-next-line react/no-children-prop
      children={getCaipWalletTypeFriendlyName(caipWalletType, environmentType)}
    />
  )
})

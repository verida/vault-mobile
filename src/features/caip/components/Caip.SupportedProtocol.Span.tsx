import { EnvironmentType } from '@verida/types'
import * as React from 'react'
import { SupportedCaipProtocol } from 'types'

import CONFIG from 'config/environment'

import { getSupportedCaipProtocolFriendlyName } from '../utils'

export const CaipSupportedProtocolSpan = React.memo(
  function CaipWalletTypeSpan({
    supportedCaipProtocol = undefined,
    environmentType = CONFIG.VERIDA_ENVIRONMENT,
  }: {
    readonly supportedCaipProtocol: SupportedCaipProtocol | undefined
    readonly environmentType?: EnvironmentType
  }): JSX.Element {
    return (
      <React.Fragment
        // eslint-disable-next-line react/no-children-prop
        children={getSupportedCaipProtocolFriendlyName(
          supportedCaipProtocol,
          environmentType
        )}
      />
    )
  }
)

import { ParsedCaipType, stringifyCaip } from 'features/caip'
import * as React from 'react'

import { useActiveWalletConnectSessionChainAccountsCaipTypes } from '../hooks'
import { WalletConnectSessionNamespacesChainId } from './WalletConnect.Session.Namespaces.ChainId'

export const WalletConnectSessionChainCard = React.memo(
  function WalletConnectSessionChainCard({
    walletConnectSessionKey,
    // TODO: Consider branding: https://dev.to/hateablestream/typescript-tip-safer-functions-with-branded-types-14o4
    chain,
  }: {
    readonly walletConnectSessionKey: string
    readonly chain: string
  }): JSX.Element {
    const { parsedCaipTypes } =
      useActiveWalletConnectSessionChainAccountsCaipTypes({
        chain,
        walletConnectSessionKey,
      })

    return (
      <React.Fragment
        // eslint-disable-next-line react/no-children-prop
        children={parsedCaipTypes.map((parsedCaipType: ParsedCaipType) => (
          <WalletConnectSessionNamespacesChainId
            key={stringifyCaip({
              parsedCaipType,
              suppressAddressComponent: false,
            })}
            walletConnectSessionKey={walletConnectSessionKey}
            parsedCaipType={parsedCaipType}
          />
        ))}
      />
    )
  }
)

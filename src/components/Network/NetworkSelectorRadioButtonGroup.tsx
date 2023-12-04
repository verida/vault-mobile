import {
  getDefaultVeridaNetwork,
  getSupportedVeridaNetworks,
} from 'features/verida'
import React, { useState } from 'react'

import {
  CollapsibleRadioButtonGroup,
  RadioButtonGroupProps,
  RadioButtonItem,
} from 'components/Input'

export type NetworkSelectorRadioButtonGroupProps = Omit<
  RadioButtonGroupProps,
  'items' | 'selectedItem' | 'onValueChange'
>

export const NetworkSelectorRadioButtonGroup: React.FunctionComponent<NetworkSelectorRadioButtonGroupProps> =
  (props) => {
    const defaultNetwork = getDefaultVeridaNetwork()

    const [selectedNetwork, setSelectedNetwork] =
      useState<string>(defaultNetwork)

    const networks = getSupportedVeridaNetworks()
    const formattedNetworks: RadioButtonItem[] = networks.map((network) => ({
      label: network,
      value: network,
    }))

    return (
      <CollapsibleRadioButtonGroup
        title='Network'
        items={formattedNetworks}
        selectedItem={selectedNetwork}
        onValueChange={setSelectedNetwork}
        {...props}
      />
    )
  }

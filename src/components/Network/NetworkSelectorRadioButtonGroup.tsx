import { Network } from '@verida/types'
import React, { useCallback } from 'react'

import {
  CollapsibleRadioButtonGroup,
  CollapsibleRadioButtonGroupProps,
  RadioButtonItem,
} from '~/components/Input'
import { getSupportedVeridaNetworks } from '~/features/verida'

export type NetworkSelectorRadioButtonGroupProps = Omit<
  CollapsibleRadioButtonGroupProps,
  'title' | 'items' | 'selectedItem' | 'onValueChange'
> & {
  selectedNetwork?: Network
  onSelectionChange?: (newNetwork: Network) => void
}

export const NetworkSelectorRadioButtonGroup: React.FunctionComponent<
  NetworkSelectorRadioButtonGroupProps
> = (props) => {
  const { selectedNetwork, onSelectionChange, ...otherProps } = props

  const handleValueChange = useCallback(
    (newNetwork: string) => {
      onSelectionChange && onSelectionChange(newNetwork as Network)
    },
    [onSelectionChange]
  )

  const networks = getSupportedVeridaNetworks()
  const networkItems: RadioButtonItem[] = networks.map((network) => ({
    label: network,
    value: network,
  }))

  return (
    <CollapsibleRadioButtonGroup
      title='Network'
      items={networkItems}
      selectedItem={selectedNetwork}
      onValueChange={handleValueChange}
      {...otherProps}
    />
  )
}

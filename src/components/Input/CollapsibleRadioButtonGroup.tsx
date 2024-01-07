import React from 'react'
import { ViewProps } from 'react-native'

import { CollapsibleContent } from './CollapsibleContent'
import { RadioButtonGroup, RadioButtonItem } from './RadioButtonGroup'

export type CollapsibleRadioButtonGroupProps = {
  items: RadioButtonItem[]
  selectedItem?: string
  onValueChange?: (value: string) => void
  title: string
  expandedByDefault?: boolean
} & ViewProps

export const CollapsibleRadioButtonGroup: React.FunctionComponent<CollapsibleRadioButtonGroupProps> =
  (props) => {
    const {
      items,
      selectedItem,
      onValueChange,
      title,
      expandedByDefault,
      ...viewProps
    } = props

    return (
      <CollapsibleContent
        title={title}
        value={selectedItem}
        expandedByDefault={expandedByDefault}
        {...viewProps}>
        <RadioButtonGroup
          items={items}
          selectedItem={selectedItem}
          onValueChange={onValueChange}
        />
      </CollapsibleContent>
    )
  }

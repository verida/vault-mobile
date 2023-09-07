import { DataFieldItem } from 'features/data'
import { List } from 'native-base'
import React from 'react'

import { DataFieldListItem } from './DataFieldListItem'

export type DataFieldListProps = {
  fields: DataFieldItem[]
}

export const DataFieldList: React.FunctionComponent<DataFieldListProps> = (
  props
) => {
  const { fields } = props

  return (
    <List>
      {fields.map((fieldItem, index) => {
        return (
          <DataFieldListItem key={`data-field-${index}`} field={fieldItem} />
        )
      })}
    </List>
  )
}

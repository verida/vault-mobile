import { List } from 'native-base'
import React from 'react'

import { DataListItem } from './DataListItem'

export type DataListProps = {
  items: any[]
}

export const DataList: React.FunctionComponent<DataListProps> = (props) => {
  const { items } = props

  return (
    <List>
      {items.map((item, index) => {
        return <DataListItem key={`data-list-${index}`} item={item} />
      })}
    </List>
  )
}

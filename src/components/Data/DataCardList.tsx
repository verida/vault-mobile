import React from 'react'

import { DataCardListItem } from './DataCardListItem'

export type DataCardListProps = {
  // TODO: Add stronger typing
  items: any[]
}

export const DataCardList: React.FunctionComponent<DataCardListProps> = (
  props
) => {
  const { items } = props

  return (
    <>
      {items.map((item, index) => {
        return <DataCardListItem key={`data-card-${index}`} item={item} />
      })}
    </>
  )
}

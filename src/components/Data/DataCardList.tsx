import React from 'react'

import { DataCardListItem } from './DataCardListItem'

export type DataCardListProps = {
  // TODO: Add stronger typing
  list: any[]
}

export const DataCardList: React.FunctionComponent<DataCardListProps> = (
  props
) => {
  const { list } = props

  return (
    <>
      {list.map((item, index) => {
        return <DataCardListItem key={`data-card-${index}`} item={item} />
      })}
    </>
  )
}

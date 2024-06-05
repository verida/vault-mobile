import React from 'react'

import { ActivitiesListItem } from './ActivitiesListItem'

export type ActivitiesListProps = {
  list: Record<string, any>[]
}

export const ActivitiesList: React.FC<ActivitiesListProps> = (props) => {
  const { list } = props
  return (
    <>
      {list.map((item, index) => {
        return (
          <ActivitiesListItem key={`activities-list-${index}`} item={item} />
        )
      })}
    </>
  )
}

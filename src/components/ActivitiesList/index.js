import React from 'react'

import ActivitiesListItem from './ActivitiesListItem'

export default ({ list }) =>
  list.map((item, index) => {
    return <ActivitiesListItem key={`activities-list-${index}`} item={item} />
  })

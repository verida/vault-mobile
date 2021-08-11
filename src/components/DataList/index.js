import React from 'react'

import DataListItem from './DataListItem'

export default ({ list }) =>
  list.map((item, index) => {
    return <DataListItem key={`data-list-${index}`} item={item} />
  })

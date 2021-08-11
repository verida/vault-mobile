import React from 'react'

import DataGridItem from './DataGridItem'

export default ({ list, folder }) =>
  list.map((item, index) => {
    return (
      <DataGridItem key={`data-grid-${index}`} item={item} folder={folder} />
    )
  })

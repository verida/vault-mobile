import React from 'react'

import Folder from 'api/VaultCommon/managers/data/folder'

import { DataGridListItem } from './DataGridListItem'

export type DataGridListProps = {
  // TODO: Add stronger typing
  list: any[]
  folder: Folder
}

export const DataGridList: React.FunctionComponent<DataGridListProps> = (
  props
) => {
  const { list, folder } = props

  return (
    <>
      {/* TODO: Use an actual List component */}
      {list.map((item, index) => {
        return (
          <DataGridListItem
            key={`data-grid-${index}`}
            item={item}
            folder={folder}
          />
        )
      })}
    </>
  )
}

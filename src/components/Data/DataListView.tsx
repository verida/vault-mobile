import { Logger } from 'features/telemetry'
import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import Folder from 'api/VaultCommon/managers/data/folder'

import { DataGridList } from './DataGridList'

const logger = Logger.create('Components/Data/DataListView')

export type DataListViewProps = {
  folder: Folder
}

export const DataListView: React.FunctionComponent<DataListViewProps> = (
  props
) => {
  const { folder } = props

  const [items, setItems] = useState<Record<string, unknown>[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        // TODO: Add stronger typing
        const fetchedItems = await folder.getMany<Record<string, unknown>>(
          {},
          {
            sort: [{ insertedAt: 'desc' }],
          }
        )

        setItems(fetchedItems)
      } catch (error) {
        logger.error(
          new Error(`Failed to load the records of a Data folder`, {
            cause: error,
          })
        )
      } finally {
        setLoading(false)
      }
    }

    init()
  }, [folder])

  return (
    <View>
      {loading ? (
        <View style={style.placeholder}>
          <Text>Loading...</Text>
        </View>
      ) : items.length ? (
        <View style={style.itemsList}>
          <DataGridList items={items} folder={folder} />
        </View>
      ) : (
        <View style={style.placeholder}>
          <Text>No results</Text>
        </View>
      )}
    </View>
  )
}

const style = StyleSheet.create({
  itemsList: {
    flex: 1,
    flexWrap: 'wrap',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginLeft: 15,
    marginRight: 15,
  },
  placeholder: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'center',
  },
})

import { useNavigation } from '@react-navigation/native'
import { Logger } from 'features/telemetry'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import AccountManager from 'api/AccountManager'
import Folder from 'api/VaultCommon/managers/data/folder'

import { DataCardList } from './DataCardList'

const logger = new Logger('Data Screen')

export type DataCardViewProps = {
  folder: Folder
}

export const DataCardView: React.FunctionComponent<DataCardViewProps> = (
  props
) => {
  const { folder } = props

  const [items, setItems] = useState([])
  const navigation = useNavigation()

  useEffect(() => {
    const init = () => {
      try {
        const vault = AccountManager.getInstance().vault
        // TODO: Remove the ! once the whole thing is refactored
        const { folders } = vault!.data.map

        const _items =
          folder.config.folders?.map((folderName: string) => {
            const { title, titlePlural, icon, color } = folders[folderName]

            return {
              label: titlePlural || title,
              icon: icon,
              color: color,
              onPress: () =>
                navigation.navigate('DataFolder', { folderName: folderName }),
            }
          }) ?? []

        setItems(_items)
      } catch (error: unknown) {
        logger.error(
          new Error(
            'Failed getting the nested folders of the selected folder',
            { cause: error }
          )
        )
      }
    }

    init()
  }, [folder.config.folders, navigation])

  return (
    <View>
      <View style={style.itemsList}>
        <DataCardList items={items} />
      </View>
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
  },
})

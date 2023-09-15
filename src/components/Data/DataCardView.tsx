import { useNavigation } from '@react-navigation/native'
import { DataFolderDefinition, dataFolders } from 'features/data'
import { Logger } from 'features/telemetry'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

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

  const [items, setItems] = useState<any[]>([])
  const navigation = useNavigation()

  useEffect(() => {
    const init = () => {
      try {
        const currentFolderDefinition = folder.config as DataFolderDefinition

        const _items =
          dataFolders
            .filter(
              (folderDefinition) =>
                currentFolderDefinition.display === 'folders' &&
                currentFolderDefinition.folders?.includes(folderDefinition.name)
            )
            .map((folderDefinition) => {
              const { name, title, titlePlural, icon, color } = folderDefinition

              return {
                label: titlePlural || title,
                icon: icon,
                color: color,
                onPress: () =>
                  navigation.navigate('DataFolder', { folderName: name }),
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
  }, [folder.config, navigation])

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

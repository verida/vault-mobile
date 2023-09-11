import { useNavigation } from '@react-navigation/native'
import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import AccountManager from 'api/AccountManager'
import Folder from 'api/VaultCommon/managers/data/folder'

import { DataCardList } from './DataCardList'

export type DataCardViewProps = {
  folder: Folder
}

export const DataCardView: React.FunctionComponent<DataCardViewProps> = (
  props
) => {
  const { folder } = props

  const [list, setList] = useState([])
  const navigation = useNavigation()

  useEffect(() => {
    const init = async () => {
      const vault = AccountManager.getInstance().vault
      // TODO: Remove the ! once the whole thing is refactored
      const { folders } = vault!.data.map

      const generatedList =
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

      setList(generatedList)
    }

    init()
  }, [folder.config.folders, navigation])

  return (
    <View>
      <View style={style.itemsList}>
        <DataCardList list={list} />
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

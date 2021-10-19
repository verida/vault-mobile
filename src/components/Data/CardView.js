import React, { useEffect, useState } from 'react'
import { StyleSheet, View } from 'react-native'

import DataCardList from './DataCardList'
import { useNavigation } from '@react-navigation/native'
import AccountManager from 'api/AccountManager'

const CardView = ({ folder }) => {
  const [list, setList] = useState([])
  const navigation = useNavigation()

  useEffect(() => {
    const init = async () => {
      const vault = AccountManager.getInstance().vault
      const { folders } = vault.data.map

      const generatedList = folder.config.folders.map((folderName) => {
        const { title, titlePlural, icon, color } = folders[folderName]

        return {
          label: titlePlural || title,
          icon: icon,
          color: color,
          onPress: () =>
            navigation.navigate('DataFolder', { folderName: folderName }),
        }
      })

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

export default CardView

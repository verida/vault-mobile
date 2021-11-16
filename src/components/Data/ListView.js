import React, { useEffect, useState } from 'react'
import { StyleSheet, Text, View } from 'react-native'

import DataGridList from './DataGridList'

const ListView = ({ folder }) => {
  const [list, setList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const init = async () => {
      const items = await folder.getMany()

      setList(items)
      setLoading(false)
    }

    init()
  }, [folder])

  return (
    <View>
      {loading ? (
        <View style={style.placeholder}>
          <Text>Loading...</Text>
        </View>
      ) : list.length ? (
        <View style={style.itemsList}>
          <DataGridList list={list} folder={folder} />
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

export default ListView

import { IDatastore } from '@verida/types'
import update from 'immutability-helper'
import { debounce } from 'lodash'
import { Content } from 'native-base'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'

import AccountManager from '~/api/AccountManager'
import { BottomActionBar, ScreenWrapper } from '~/components'
import LoadingView from '~/components/LoadingView'
import NavigationHeader from '~/components/Navigation/NavigationHeader'
import { Text } from '~/components/Typography/Text'
import { GREY_COLOR, LIGHTGREY_COLOR } from '~/constants/color'
import { Logger } from '~/features/telemetry'
import { MainStackScreenProps } from '~/navigation/types'

import ShareableDataItem, { ShareableDataItemType } from './ShareableDataItem'

const logger = Logger.create('Pages/Inbox/ShareableData')

export type ShareableDataScreenParams = {
  schemaUrl: string
  onConfirm: (selectedItems: ShareableDataItemType[]) => void
  filter: any
}

type ShareableDataScreenProps = MainStackScreenProps<'ShareableData'>

export const ShareableDataScreen: React.FC<ShareableDataScreenProps> = (
  props
) => {
  const { navigation, route } = props

  useEffect(() => {
    navigation.setOptions({
      title: 'Select an item',
    })
  }, [navigation])

  const [data, setData] = useState<ShareableDataItemType[]>([])
  const [loading, setLoading] = useState(true)
  const [searchText, setSearchText] = useState('')
  const [selectedItems, setSelectedItems] = useState<ShareableDataItemType[]>(
    []
  )

  const fetchData = async (searchValue: string) => {
    try {
      setLoading(true)

      const { schemaUrl, filter } = route.params

      const requestFilter = filter && typeof filter === 'object' ? filter : {}

      const searchFilter =
        searchValue && searchValue.length > 0
          ? {
              $or: [
                {
                  name: {
                    $regex: searchValue,
                  },
                },
                {
                  summary: {
                    $regex: searchValue,
                  },
                },
              ],
            }
          : {}

      const query = {
        $and: [requestFilter, searchFilter],
      }

      const datastore: IDatastore | undefined =
        await AccountManager.getInstance().context?.openDatastore(
          schemaUrl,
          undefined
        )

      const result = (await datastore?.getMany(query, undefined)) as
        | ShareableDataItemType[]
        | undefined

      if (result) setData(result)

      setLoading(false)
    } catch (error) {
      logger.error(error)
      setLoading(false)
    }
  }
  const fetchDataRef = useRef(debounce(fetchData, 1000, { trailing: true }))

  useEffect(() => {
    fetchDataRef.current('')
  }, [])

  const onSearchTextChanged = useCallback((text: string) => {
    setSearchText(text)
    fetchDataRef.current(text)
  }, [])

  const onSelectItem = useCallback(
    (item: ShareableDataItemType) => {
      const index = selectedItems.findIndex((_item) => _item._id === item._id)
      if (index !== -1) {
        setSelectedItems((prevState) =>
          update(prevState, {
            $splice: [[index, 1]],
          })
        )
      } else {
        setSelectedItems((prevState) =>
          update(prevState, {
            $push: [item],
          })
        )
      }
    },
    [selectedItems]
  )

  function renderItem(info: ListRenderItemInfo<ShareableDataItemType>) {
    const { item } = info
    const selected = selectedItems.some((_item) => _item._id === item._id)

    return (
      <ShareableDataItem
        item={item}
        onSelect={onSelectItem}
        selected={selected}
      />
    )
  }

  function onConfirmPress() {
    navigation.goBack()
    route.params.onConfirm(selectedItems)
  }

  return (
    <ScreenWrapper>
      <NavigationHeader title='Select an item' />
      <View style={styles.searchInputContainer}>
        <AntDesign name='search1' size={15} color={GREY_COLOR} />
        <TextInput
          style={styles.searchInput}
          placeholder={'Search'}
          value={searchText}
          onChangeText={onSearchTextChanged}
        />
      </View>
      <Content>
        {loading ? (
          <LoadingView type={'small'} />
        ) : (
          <FlatList<ShareableDataItemType>
            data={data}
            renderItem={renderItem}
            ListEmptyComponent={
              <View style={styles.noResult}>
                <Text>No results</Text>
              </View>
            }
          />
        )}
      </Content>
      <BottomActionBar
        actions={[
          {
            label: 'Confirm selection',
            onPress: onConfirmPress,
          },
        ]}
      />
    </ScreenWrapper>
  )
}

const styles = StyleSheet.create({
  searchInputContainer: {
    borderRadius: 10,
    backgroundColor: LIGHTGREY_COLOR,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    padding: 8,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    lineHeight: 22,
  },
  noResult: {
    flex: 1,
    flexDirection: 'row',
    marginTop: 15,
    justifyContent: 'center',
  },
})

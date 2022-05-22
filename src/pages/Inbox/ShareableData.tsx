import { NativeStackScreenProps } from '@react-navigation/native-stack'
import * as Sentry from '@sentry/react-native'
import update from 'immutability-helper'
import { debounce } from 'lodash'
import { Container, Content } from 'native-base'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import store from 'reduxStore'
import {
  FlatList,
  ListRenderItemInfo,
  StyleSheet,
  TextInput,
  View,
} from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'

import AccountManager from 'api/AccountManager'
import Button from 'components/Button'
import CustomFooter from 'components/Layouts/CustomFooter'
import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { GREY_COLOR, LIGHTGREY_COLOR } from 'constants/color'
import { MainStackParams } from 'navigation/types'
import ShareableDataItem, {
  ShareableDataItemType,
} from 'pages/Inbox/ShareableDataItem'

function ShareableData(
  props: NativeStackScreenProps<MainStackParams, 'ShareableData'>
) {
  const { navigation, route } = props
  const [data, setData] = useState<ShareableDataItemType[]>([])
  const [loading, setLoading] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [selectedItems, setSelectedItems] = useState<ShareableDataItemType[]>(
    []
  )

  const fetchData = async (text: string) => {
    try {
      setLoading(true)
      const { schemaUrl, filter } = route.params
      const datastore =
        await store.getState().veridaContext?.openDatastore(schemaUrl)
      let query = {}
      if (text && text.length > 0) {
        if (Object.keys(filter).length > 0) {
          query = {
            $and: [
              {
                $or: [
                  {
                    name: {
                      $regex: text,
                    },
                  },
                  {
                    summary: {
                      $regex: text,
                    },
                  },
                ],
              },
              filter,
            ],
          }
        } else {
          query = {
            $or: [
              {
                name: {
                  $regex: text,
                },
              },
              {
                summary: {
                  $regex: text,
                },
              },
            ],
          }
        }
      }
      const result = await datastore?.getMany(query)
      if (result) {
        setData(result as ShareableDataItemType[])
      }
      setLoading(false)
    } catch (e) {
      Sentry.captureException(e)
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
    <Container>
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
          />
        )}
      </Content>
      <CustomFooter>
        <Button color='primary' onPress={onConfirmPress}>
          Confirm selection
        </Button>
      </CustomFooter>
    </Container>
  )
}

const styles = StyleSheet.create({
  searchInputContainer: {
    borderRadius: 10,
    backgroundColor: LIGHTGREY_COLOR,
    height: 36,
    flexDirection: 'row',
    alignItems: 'center',
    margin: 16,
    paddingHorizontal: 15,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
})

export default ShareableData

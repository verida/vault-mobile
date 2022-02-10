import React, {
  ForwardedRef,
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react'
import {
  ActivityIndicator,
  FlatList,
  FlatListProps,
  StyleSheet,
  View,
} from 'react-native'
import LoadingView from 'components/LoadingView'
import Text from './Text'

export interface CustomFlatListProps<ItemT> extends FlatListProps<ItemT> {
  loadData?: (skip: number) => Promise<ItemT[]>
}

export const ITEM_PER_PAGE = 5

const CustomFlatList = <ItemT,>(
  props: CustomFlatListProps<ItemT>,
  ref: ForwardedRef<unknown>
) => {
  const { loadData, ListFooterComponent, ...rest } = props
  useImperativeHandle(ref, () => ({
    refresh: onRefresh,
  }))

  const skip = useRef(0)
  const [loadingMore, setLoadingMore] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [loaded, setLoaded] = useState(false)
  const [noMoreData, setNoMoreData] = useState(false)
  const [data, setData] = useState<ItemT[]>([])

  const onEndReached = useCallback(async () => {
    if (loadingMore || !loadData || noMoreData) {
      return
    }

    try {
      setLoadingMore(true)
      skip.current = skip.current + ITEM_PER_PAGE
      const _data = await loadData(skip.current)
      setData((prevState) => [...prevState, ..._data])
      setLoadingMore(false)
      if (_data.length === 0) {
        setNoMoreData(true)
      }
    } catch (_) {
      setLoadingMore(false)
    }
  }, [loadingMore, loadData, noMoreData])

  const onRefresh = useCallback(async () => {
    if (!loadData) {
      return
    }
    setRefreshing(true)
    skip.current = 0
    setNoMoreData(false)
    const _data = await loadData(0)
    setData(_data)
    setRefreshing(false)
  }, [loadData])

  const renderFooter = () => {
    return (
      <>
        {ListFooterComponent}
        {loadingMore && (
          <ActivityIndicator
            size={'small'}
            color={'black'}
            style={styles.loadMoreIndicator}
          />
        )}
      </>
    )
  }

  useEffect(() => {
    async function init() {
      if (loadData) {
        skip.current = 0
        const _data = await loadData(0)
        setData(_data)
        setLoaded(true)
      }
    }

    init()
  }, [loadData])

  if (!loaded) {
    return (
      <View style={styles.loadingContainer}>
        <LoadingView />
      </View>
    )
  }

  if (loaded && data && data.length === 0) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.noMessages}>There are no messages</Text>
      </View>
    )
  }

  return (
    <FlatList<ItemT>
      {...rest}
      data={data}
      onEndReachedThreshold={0.7}
      onEndReached={onEndReached}
      refreshing={refreshing}
      onRefresh={onRefresh}
      ListFooterComponent={renderFooter}
    />
  )
}

const styles = StyleSheet.create({
  loadMoreIndicator: {
    marginVertical: 15,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noMessages: {
    fontSize: 18,
  },
})

export default forwardRef(CustomFlatList)

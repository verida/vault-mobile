import { ChainId } from 'caip'
import { useTheme } from 'contexts/ThemeContext'
import {
  ChainMetadata,
  getMaybeChainMetadatas,
  useChainMetadatas,
} from 'features/caip'
import { Container } from 'native-base'
import * as React from 'react'
import { ListRenderItem, StyleSheet, View } from 'react-native'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import { useImmediateLayoutAnimation } from 'use-layout-animation'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import { SearchBar } from 'components/SearchBar/SearchBar'
import { SEPARATOR_LIGHT } from 'constants/color'

import { ChainMetadataListItem } from './components'

const keyExtractor = (e: ChainMetadata) => new ChainId(e).toString()

const ItemSeparatorComponent = () => (
  <View
    style={{
      borderBottomWidth: 1,
      borderBottomColor: SEPARATOR_LIGHT,
    }}
  />
)

function Networks(): JSX.Element {
  const [searchText, setSearchText] = React.useState<string>('')
  const { theme } = useTheme()

  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  const renderItem: ListRenderItem<ChainMetadata> = React.useCallback(
    ({ item: chainMetadata }) => (
      <ChainMetadataListItem chainMetadata={chainMetadata} />
    ),
    []
  )

  const chainMetadatasToRender = React.useMemo(() => {
    if (typeof searchText !== 'string' || !searchText.length)
      return chainMetadatas

    return chainMetadatas.filter((e) =>
      `${e.name} ${e.nativeCurrencyName} ${e.namespace} ${e.reference}`
        .toLocaleLowerCase()
        .includes(searchText.toLocaleLowerCase())
    )
  }, [chainMetadatas, searchText])

  useImmediateLayoutAnimation([searchText])

  return (
    <Container>
      <NavigationHeader
        bottomBorder={false}
        title='Networks'
        renderNetInfo={false}
      />
      <View style={styles.content}>
        <SearchBar
          showSortButton={false}
          showFilterButton={false}
          style={{
            paddingHorizontal: theme.spacing.m,
            // HACK: Where does this value come from?
            marginTop: -10,
            paddingBottom: 22,
          }}
          inputProps={{
            autoFocus: false,
            onChangeText: setSearchText,
            value: searchText,
            placeholder: 'Search networks',
            spellCheck: false,
          }}
        />
        <ScrollView>
          <ItemSeparatorComponent />
          <FlatList
            data={chainMetadatasToRender}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ItemSeparatorComponent={ItemSeparatorComponent}
          />
          <ItemSeparatorComponent />
        </ScrollView>
      </View>
    </Container>
  )
}
const styles = StyleSheet.create({
  content: {
    backgroundColor: '#fff',
    flex: 1,
    paddingVertical: 24,
  },
  flex: { flex: 1 },
})

export default Networks

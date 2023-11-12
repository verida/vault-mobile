import { ChainId } from 'caip'
import { useTheme } from 'contexts/ThemeContext'
import {
  ChainMetadata,
  getMaybeChainMetadatas,
  useChainMetadataDetails,
  useChainMetadatas,
} from 'features/caip'
import { Container } from 'native-base'
import * as React from 'react'
import {
  ListRenderItem,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import { useImmediateLayoutAnimation } from 'use-layout-animation'

import NavigationHeader from 'components/Navigation/NavigationHeader'
import { SearchBar } from 'components/SearchBar/SearchBar'
import { useMainNavigation } from 'navigation/hooks'

import {
  ChainMetadataListItem,
  ChainMetadataListSeparatorComponent,
} from './components'

const keyExtractor = (e: ChainMetadata) => new ChainId(e).toString()

function Networks(): JSX.Element {
  const [searchText, setSearchText] = React.useState<string>('')
  const { theme } = useTheme()

  const navigation = useMainNavigation()
  const { getChainMetadataDetails } = useChainMetadataDetails()

  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  const renderItem: ListRenderItem<ChainMetadata> = React.useCallback(
    ({ item: chainMetadata }) => {
      const { isCustom } = getChainMetadataDetails(chainMetadata)
      return (
        <TouchableOpacity
          onPress={() =>
            // HACK: Only allow custom networks to be edited.
            navigation.navigate('NetworksEditor', {
              title: isCustom ? 'Edit custom network' : 'Network settings',
              disabled: !isCustom,
              initialValue: chainMetadata,
            })
          }>
          <ChainMetadataListItem chainMetadata={chainMetadata} />
        </TouchableOpacity>
      )
    },
    [navigation, getChainMetadataDetails]
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
          <ChainMetadataListSeparatorComponent />
          <FlatList
            data={chainMetadatasToRender}
            renderItem={renderItem}
            keyExtractor={keyExtractor}
            ItemSeparatorComponent={ChainMetadataListSeparatorComponent}
          />
          <ChainMetadataListSeparatorComponent />
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

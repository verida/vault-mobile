import { ChainId } from 'caip'
import { Typography } from 'components'
import { config } from 'config'
import {
  getMaybeChainMetadatas,
  useChainMetadataDetails,
  useChainMetadatas,
} from 'features/blockchain'
import { ChainMetadata } from 'features/caip'
import { useThemeAwareStyle } from 'hooks'
import { Container } from 'native-base'
import * as React from 'react'
import {
  ListRenderItem,
  StyleSheet,
  TouchableOpacity,
  useWindowDimensions,
  View,
} from 'react-native'
import { FlatList, ScrollView } from 'react-native-gesture-handler'
import { TabView } from 'react-native-tab-view'
import { useImmediateLayoutAnimation } from 'use-layout-animation'

import PlusIcon from 'assets/plus_icon.svg'
import { Line } from 'components/Line'
import NavigationHeader, {
  HeaderSideButton,
} from 'components/Navigation/NavigationHeader'
import { SearchBar } from 'components/SearchBar/SearchBar'
import { SegmentData, SegmentsControl } from 'components/SegmentControl'
import { useMainNavigation } from 'navigation/hooks'
import { Theme } from 'styles/types'

import { ChainMetadataListItem } from './components'

const tabs: SegmentData[] = [
  {
    key: 'mainnets',
    title: 'Mainnets',
  },
  {
    key: 'testnets',
    title: 'Testnets',
  },
]

const keyExtractor = (e: ChainMetadata) => new ChainId(e).toString()

function BlockchainNetworks(): JSX.Element {
  const navigation = useMainNavigation()
  const layout = useWindowDimensions()
  const [searchText, setSearchText] = React.useState<string>('')
  const [activeTabIndex, setActiveTabIndex] = React.useState(0)

  const styles = useThemeAwareStyle(createStyles)

  const handleActiveTabIndexChange = React.useCallback((index: number) => {
    setActiveTabIndex(index)
  }, [])

  const { getChainMetadataDetails } = useChainMetadataDetails()

  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  const renderItem: ListRenderItem<ChainMetadata> = React.useCallback(
    ({ item: chainMetadata }) => {
      const { isCustom } = getChainMetadataDetails(chainMetadata)
      return (
        <TouchableOpacity
          onPress={() =>
            // HACK: Only allow custom networks to be edited.
            navigation.navigate('BlockchainNetworksEditor', {
              title: isCustom ? 'Edit custom network' : 'Network settings',
              disabled: !isCustom,
              initialValue: chainMetadata,
            })
          }>
          <ChainMetadataListItem chainMetadata={chainMetadata} />
          <Line />
        </TouchableOpacity>
      )
    },
    [navigation, getChainMetadataDetails]
  )

  const { mainnets, testnets } = React.useMemo(() => {
    const filteredNetworks =
      typeof searchText !== 'string' || !searchText.length
        ? chainMetadatas
        : chainMetadatas.filter((e) =>
            `${e.name} ${e.nativeCurrencyName} ${e.namespace} ${e.reference}`
              .toLocaleLowerCase()
              .includes(searchText.toLocaleLowerCase())
          )
    return {
      mainnets: filteredNetworks.filter((e) => e.isMainnet),
      testnets: filteredNetworks.filter((e) => !e.isMainnet),
    }
  }, [chainMetadatas, searchText])

  const onPressAddNetwork = React.useCallback(
    () =>
      navigation.navigate('BlockchainNetworksEditor', {
        title: 'Create custom network',
        disabled: false,
        initialValue: null,
      }),
    [navigation]
  )

  const headerSideButton: HeaderSideButton | undefined = React.useMemo(() => {
    return config.features.blockchain.enableCustomNetwork
      ? {
          icon: <PlusIcon />,
          action: onPressAddNetwork,
        }
      : undefined
  }, [onPressAddNetwork])

  useImmediateLayoutAnimation([searchText])

  return (
    <Container>
      <NavigationHeader
        bottomBorder={false}
        title='Blockchain Networks'
        renderNetInfo={false}
        right={headerSideButton}
      />
      <View style={styles.searchAndTabsContainer}>
        <SearchBar
          showSortButton={false}
          showFilterButton={false}
          inputProps={{
            autoFocus: false,
            onChangeText: setSearchText,
            value: searchText,
            placeholder: 'Search networks',
            spellCheck: false,
          }}
        />
        <SegmentsControl
          segments={tabs}
          activeSegmentIndex={activeTabIndex}
          onSegmentPress={handleActiveTabIndexChange}
          style={styles.tabs}
        />
      </View>
      <TabView
        navigationState={{ index: activeTabIndex, routes: tabs }}
        renderScene={({ route }) => (
          <ScrollView>
            <FlatList
              data={route.key === 'mainnets' ? mainnets : testnets}
              renderItem={renderItem}
              keyExtractor={keyExtractor}
              ListEmptyComponent={() => (
                <View style={styles.emptyListContainer}>
                  <Typography style={styles.emptyListTitle}>
                    {`There is no ${route.title}`}
                  </Typography>
                </View>
              )}
            />
          </ScrollView>
        )}
        renderTabBar={() => null}
        onIndexChange={handleActiveTabIndexChange}
        initialLayout={{ width: layout.width }}
      />
    </Container>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    searchAndTabsContainer: {
      paddingTop: 0, // TODO: May have to adjust when the header has been properly reworked
      paddingBottom: theme.spacing.m,
      paddingHorizontal: theme.spacing.m,
      borderBottomWidth: 1,
      borderBottomColor: theme.color.separatorLight,
    },
    tabs: {
      marginTop: theme.spacing.m,
    },
    emptyListContainer: {
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: theme.spacing.xxxxl,
    },
    emptyListTitle: {
      marginTop: theme.spacing.m,
      textAlign: 'center',
    },
  })

export default BlockchainNetworks

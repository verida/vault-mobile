import { ChainId } from 'caip'
import { Icon, ScreenWrapper, Typography } from 'components'
import {
  getMaybeChainMetadatas,
  useChainMetadataDetails,
  useChainMetadatas,
} from 'features/blockchain'
import { ChainMetadata } from 'features/caip'
import { useThemeAwareStyle } from 'hooks'
import React, { useCallback, useEffect, useMemo, useState } from 'react'
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

import { config } from '~/config'
import { HIT_SLOP_10_10 } from '~/constants'
import { useTheme } from '~/contexts'

import { Line } from 'components/Line'
import { SearchBar } from 'components/SearchBar/SearchBar'
import { SegmentData, SegmentsControl } from 'components/SegmentControl'
import { MainStackScreenProps } from 'navigation/types'
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

export type BlockchainNetworksScreenParams = undefined

type BlockchainNetworksScreenProps = MainStackScreenProps<'BlockchainNetworks'>

export const BlockchainNetworksScreen: React.FC<
  BlockchainNetworksScreenProps
> = (props) => {
  const { navigation } = props

  const layout = useWindowDimensions()
  const [searchText, setSearchText] = useState<string>('')
  const [activeTabIndex, setActiveTabIndex] = useState(0)

  const styles = useThemeAwareStyle(createStyles)

  const handleActiveTabIndexChange = useCallback((index: number) => {
    setActiveTabIndex(index)
  }, [])

  const { getChainMetadataDetails } = useChainMetadataDetails()

  const chainMetadatas = getMaybeChainMetadatas(useChainMetadatas())

  const renderItem: ListRenderItem<ChainMetadata> = useCallback(
    ({ item: chainMetadata }) => {
      const { isCustom } = getChainMetadataDetails(chainMetadata)
      return (
        <TouchableOpacity
          onPress={() =>
            // HACK: Only allow custom networks to be edited.
            navigation.navigate('BlockchainNetworkEditor', {
              title: isCustom ? 'Edit custom network' : 'Network settings',
              isEditable: !!isCustom,
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

  const { mainnets, testnets } = useMemo(() => {
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

  const handlePressAddNetwork = useCallback(
    () =>
      navigation.navigate('BlockchainNetworkEditor', {
        title: 'Create custom network',
        isEditable: true,
        initialValue: null,
      }),
    [navigation]
  )

  const { theme } = useTheme()

  useEffect(() => {
    navigation.setOptions({
      title: 'Blockchain Networks',
      headerShadowVisible: false,
      headerRight: config.features.blockchain.enableCustomNetwork
        ? () => (
            <TouchableOpacity
              onPress={handlePressAddNetwork}
              hitSlop={HIT_SLOP_10_10}
              style={styles.headerAddNetworkButton}>
              <Icon name='add' size={24} color={theme.color.primary} />
            </TouchableOpacity>
          )
        : undefined,
    })
  }, [
    navigation,
    handlePressAddNetwork,
    styles.headerAddNetworkButton,
    theme.color.primary,
  ])

  useImmediateLayoutAnimation([searchText])

  return (
    <ScreenWrapper>
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
    </ScreenWrapper>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    headerAddNetworkButton: {
      marginRight: theme.spacing.m,
    },
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

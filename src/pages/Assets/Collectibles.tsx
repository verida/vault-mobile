/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNavigation } from '@react-navigation/native'
import * as sentry from '@sentry/react-native'
import { useTheme } from 'contexts/ThemeContext'
import { useGetNFTsQuery } from 'features/assets'
import {
  getSelectedWalletById,
  getUniqueWalletAddresses,
} from 'features/wallets'
import { getNFTImageUri } from 'helpers/nft'
import React, { useCallback } from 'react'
import {
  ListRenderItem,
  RefreshControl,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import FastImage from 'react-native-fast-image'
import { useDispatch, useSelector } from 'react-redux'

import { NFT, NFTCollection, NFTMetadata } from 'api/types'
import NFTPlaceholder from 'assets/stubs/nft_placeholder.svg'
import { NftItem } from 'components/Assets/NftItem'
import Container from 'components/Container'
import GridView from 'components/Grids/GridView'
import { Line } from 'components/Line'
import LoadingIndicator from 'components/LoadingIndicator'
import { Tag } from 'components/Tag'
import { Title } from 'components/Typography/Title'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

import { IMAGE_WIDTH, NUMBER_OF_COLUMNS } from './constants'

const Collectibles = () => {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()

  const selectedWallet = useSelector(getSelectedWalletById)
  const addresses = getUniqueWalletAddresses(selectedWallet)
  const { data, isLoading, isFetching, refetch } = useGetNFTsQuery(addresses) // TODO: replace with NFT colections API

  const isEmptyList = !data || data.length === 0

  // pull to refresh data
  const [refreshing, setRefreshing] = React.useState(false)
  const onRefresh = React.useCallback(() => {
    setRefreshing(true)
    refetch().finally(() => {
      setRefreshing(false)
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const renderCollection = useCallback<ListRenderItem<NFTCollection>>(
    ({ item }) => {
      try {
        const imageMeta = (item.nfts?.data?.[0]
          ?.metadata as unknown as NFTMetadata) ?? {
          image: null,
        }
        const uri = getNFTImageUri(imageMeta.image)
        return (
          <TouchableOpacity
            onPress={() => {
              navigation.navigate('NFTCollectionDetail', { collection: item })
            }}>
            <View style={styles.column}>
              <FastImage
                style={styles.image}
                defaultSource={require('assets/picture.png')}
                source={{
                  uri,
                  priority: FastImage.priority.high,
                }}
                resizeMode={FastImage.resizeMode.cover}
              />
              <Tag withBlur style={styles.itemTag}>
                <Tag.Label numberOfLines={1} style={styles.tagLabel}>
                  {item.name}
                </Tag.Label>
                <Tag.Label bold style={styles.tagLabelNumber}>
                  {item.nfts?.total ?? 0}
                </Tag.Label>
              </Tag>
            </View>
          </TouchableOpacity>
        )
      } catch (e) {
        sentry.captureException(e)
      }

      return null
    },
    [navigation, styles]
  )

  // Temp code
  const renderNft = useCallback<ListRenderItem<NFT>>(
    ({ item }) => {
      try {
        return (
          <TouchableOpacity
            onPress={() => navigation.navigate('NFTDetail', { nft: item })}>
            <View style={styles.column}>
              <NftItem containerStyle={styles.image} nft={item} />
            </View>
          </TouchableOpacity>
        )
      } catch (e) {
        sentry.captureException(e)
      }

      return null
    },
    [navigation, styles]
  )

  if (isLoading) return <LoadingIndicator />

  // TODO: enable, currently having an error when fetching assets for NEAR and Algorand addresses from the Wallet Provider API https://devnet-walletprovider.tn.verida.tech/nfts/list?
  // if (error)
  //   return (
  //     <ErrorFallbackCard
  //       error={new Error('Failed to load NFTs')}
  //       resetErrorBoundary={refetch}
  //     />
  //   )

  return (
    <Container withLoadingView showLoading={isFetching}>
      {
        // !isEmptyList && (
        //   <SearchBar
        //     style={{
        //       paddingHorizontal: theme.spacing.m,
        //       marginTop: theme.spacing.sm,
        //     }}
        //     inputProps={{
        //       placeholder: 'Search Collectibles',
        //     }}
        //   />
        // )
      }
      <Line style={{ marginTop: theme.spacing.s }} />
      {/* <GridView
        style={styles.grid}
        numColumns={NUMBER_OF_COLUMNS}
        contentContainerStyle={
          isEmptyList
            ? styles.listEmptyContainer
            : { paddingBottom: theme.spacing.xxl, paddingTop: theme.spacing.m }
        }
        data={data}
        keyExtractor={(item) => `${item.token_address}`}
        renderItem={renderCollection}
        ListEmptyComponent={() => (
          <View style={styles.emptyListContainer}>
            <NFTPlaceholder />
            <Title style={styles.emptyListTitle}>
              {"You don't have any collectibles yet"}
            </Title>
          </View>
        )}
      /> */}

      {/* Temp code  */}
      <GridView
        numColumns={NUMBER_OF_COLUMNS}
        data={data}
        style={styles.grid}
        contentContainerStyle={
          isEmptyList
            ? styles.listEmptyContainer
            : {
                paddingBottom: theme.spacing.xxl,
                paddingTop: theme.spacing.m,
              }
        }
        keyExtractor={(item, index) => `${index}-${item.token_id}`}
        renderItem={renderNft}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={() => (
          <View style={styles.emptyListContainer}>
            <NFTPlaceholder />
            <Title style={styles.emptyListTitle}>
              {"You don't have any collectibles yet"}
            </Title>
          </View>
        )}
      />
    </Container>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.color.background,
    },
    grid: {
      flex: 1,
      paddingHorizontal: theme.spacing.m,
    },
    listEmptyContainer: { height: '100%' },
    column: {
      flex: 0.48,
    },
    image: {
      width: IMAGE_WIDTH,
      minHeight: IMAGE_WIDTH,
      borderRadius: theme.roundness.xs,
    },
    itemTag: {
      position: 'absolute',
      left: theme.spacing.s,
      bottom: theme.spacing.s,
    },
    tagLabel: {
      maxWidth: 0.68 * IMAGE_WIDTH,
      color: theme.color.onPrimary,
    },
    tagLabelNumber: {
      marginLeft: theme.spacing.s,
      color: theme.color.onPrimary,
    },
    emptyListContainer: {
      ...StyleSheet.absoluteFillObject,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      marginHorizontal: theme.spacing.xxxxl,
    },
    emptyListTitle: {
      fontSize: theme.fontSize.xxl,
      marginTop: theme.spacing.m,
      textAlign: 'center',
    },
  })

export default Collectibles

/* eslint-disable @typescript-eslint/no-unused-vars */
import { useNavigation } from '@react-navigation/native'
import * as sentry from '@sentry/react-native'
import { useTheme } from 'contexts/ThemeContext'
import { getNFTImageUri } from 'helpers/nft'
import React, { useCallback, useEffect } from 'react'
import {
  ListRenderItem,
  Pressable,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import FastImage from 'react-native-fast-image'
import { useDispatch, useSelector } from 'react-redux'
import { VeridaWallet } from 'types/wallet'

import { NFT, NFTCollection, NFTMetadata } from 'api/types'
import NFTPlaceholder from 'assets/stubs/nft_placeholder.svg'
import GridView from 'components/Grids/GridView'
import { Line } from 'components/Line'
import LoadingIndicator from 'components/LoadingIndicator'
import { SearchBar } from 'components/SearchBar/SearchBar'
import { Tag } from 'components/Tag'
import { Title } from 'components/Typography/Title'
import { useReduxState } from 'hooks/useReduxState'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { useGetWalletNFTCollectionsQuery } from 'reduxStore/assets/api'
import * as thunkActions from 'reduxStore/thunkActions'
import {
  allWalletsSelector,
  getWalletsData,
  selectedWalletSelector,
} from 'reduxStore/wallet/selectors'
import { Theme } from 'styles/types'

import { IMAGE_WIDTH, NUMBER_OF_COLUMNS } from './constants'

const caipNormalizeAddress = (address: string) => {
  // FIXME: hardcode just ethereum for now
  return `eip155:5:${address}`
}

const Collectibles = () => {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()

  const selectedWalletId = useSelector(selectedWalletSelector)
  const wallets = useSelector(allWalletsSelector) as Record<
    string,
    VeridaWallet
  >

  const selectedWallet = wallets[selectedWalletId]
  // TODO: remove hardcode, as API only work well with ethereum for now
  const etherWallet = caipNormalizeAddress(
    selectedWallet?.accounts.eip155?.address ?? ''
  )

  const { data, isLoading, error } = useGetWalletNFTCollectionsQuery([
    etherWallet,
  ])

  // const walletNFTCollections = useReduxState(walletNFTCollectionsSelector)
  // const data = walletNFTCollections?.[etherWallet] ?? []
  const isEmptyList = !data || data.length === 0

  useEffect(() => {
    // dispatch(thunkActions.getWalletNFTCollections())
  }, [dispatch])

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
        const imageMeta = (item?.metadata as unknown as NFTMetadata) ?? {
          image: null,
        }
        const uri = getNFTImageUri(imageMeta.image)
        return (
          <TouchableOpacity
            onPress={() => navigation.navigate('NFTDetail', { nft: item })}>
            <View style={styles.column}>
              <FastImage
                style={styles.image}
                defaultSource={require('assets/picture.png')}
                source={{
                  uri,
                  priority: FastImage.priority.normal,
                }}
                resizeMode={FastImage.resizeMode.cover}
              />
              <Tag withBlur style={styles.itemTag}>
                <Tag.Label numberOfLines={1} style={styles.tagLabel}>
                  {item.name}
                </Tag.Label>
                <Tag.Label style={styles.tagLabelNumber}>
                  #{item.token_id}
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

  if (isLoading) return <LoadingIndicator />
  // if (error) return <Title>{'Something went wrong...'}</Title>

  return (
    <View style={styles.container}>
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
        data={data || []}
        style={styles.grid}
        contentContainerStyle={
          isEmptyList
            ? styles.listEmptyContainer
            : { paddingBottom: theme.spacing.xxl, paddingTop: theme.spacing.m }
        }
        keyExtractor={(item) => `${item.token_id}`}
        renderItem={renderNft}
        ListEmptyComponent={() => (
          <View style={styles.emptyListContainer}>
            <NFTPlaceholder />
            <Title style={styles.emptyListTitle}>
              {"You don't have any collectibles yet"}
            </Title>
          </View>
        )}
      />
    </View>
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

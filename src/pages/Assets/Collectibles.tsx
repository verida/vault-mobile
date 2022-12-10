import { useNavigation } from '@react-navigation/native'
import * as sentry from '@sentry/react-native'
import React, { useCallback, useEffect } from 'react'
import {
  Dimensions,
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  View,
} from 'react-native'
import FastImage from 'react-native-fast-image'
import { useDispatch } from 'react-redux'

import { NFTCollection, NFTMetadata } from 'api/types'
import NFTPlaceholder from 'assets/stubs/nft_placeholder.svg'
import LoadingIndicator from 'components/LoadingIndicator'
import { SearchBar } from 'components/SearchBar/SearchBar'
import { Spacer } from 'components/Spacer'
import { Tag } from 'components/Tag'
import { Title } from 'components/Typography/Title'
import { useReduxState } from 'hooks/useReduxState'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { createRequestSelector } from 'reduxStore/api/selectors'
import { walletNFTCollectionsSelector } from 'reduxStore/collectibles/selectors'
import * as thunkActions from 'reduxStore/thunkActions'
import { getWalletsData } from 'reduxStore/wallet/selectors'
import { Theme } from 'styles/types'

type CollectiblesProps = {}

const Collectibles = (props: CollectiblesProps) => {
  const dispatch = useDispatch()
  const navigation = useNavigation()
  const styles = useThemeAwareStyle(createStyles)
  const walletData = useReduxState((state) => getWalletsData(state.main))
  // FIXME: Test with eip155 wallet first
  const etherWallet = walletData.eip155?.address as string

  const { isLoading, error } = useReduxState(
    createRequestSelector(['GET_WALLET_NFT_COLLECTIBLES_REQUEST'])
  )
  const walletNFTCollections = useReduxState(walletNFTCollectionsSelector)
  const data = walletNFTCollections?.[etherWallet] ?? []

  useEffect(() => {
    dispatch(thunkActions.getWalletNFTCollections())
  }, [dispatch])

  const renderCollection = useCallback<ListRenderItem<NFTCollection>>(
    ({ item }) => {
      try {
        const imageMeta = (item.nfts?.data?.[0]
          ?.metadata as unknown as NFTMetadata) ?? {
          image: null,
        }

        const processIpfs = (ipfsLink: string) =>
          ipfsLink?.replace('ipfs://', 'https://ipfs.io/ipfs/')
        const isIpfsLink = (uri: string) => uri?.startsWith('ipfs://')

        const uri = isIpfsLink(imageMeta.image)
          ? processIpfs(imageMeta.image)
          : imageMeta.image
        return (
          <Pressable
            onPress={() => {
              navigation.navigate('NFTCollectionDetail', { collection: item })
            }}>
            <View style={styles.column}>
              <FastImage
                style={styles.image}
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
                <Tag.Label bold style={styles.tagLabelNumber}>
                  {item.nfts?.total ?? 0}
                </Tag.Label>
              </Tag>
            </View>
          </Pressable>
        )
      } catch (e) {
        sentry.captureException(e)
      }

      return null
    },
    [navigation, styles]
  )

  if (isLoading) return <LoadingIndicator />
  if (error) return <Title>{error?.message}</Title>
  // walletNFTCollections?.[etherWallet]
  // { height: '100%', backgroundColor: 'red' }
  return (
    <View style={styles.container}>
      <SearchBar
        inputProps={{
          placeholder: 'Search Collectibles',
        }}
      />
      <FlatList
        style={styles.grid}
        numColumns={NUMBER_OF_COLUMNS}
        contentContainerStyle={
          data.length === 0 ? styles.listEmptyContainer : {}
        }
        columnWrapperStyle={styles.columnWrapperStyle}
        ItemSeparatorComponent={() => <Spacer vertical='m' />}
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
      />
    </View>
  )
}

const NUMBER_OF_COLUMNS = 2
const SCREEN_WIDTH = Dimensions.get('screen').width
const PADDING = 16
const IMAGE_WIDTH = (SCREEN_WIDTH - 3 * PADDING) / NUMBER_OF_COLUMNS

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.sm,
      backgroundColor: theme.color.background,
    },
    grid: {
      flex: 1,
      marginTop: theme.spacing.m,
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
    columnWrapperStyle: {
      flex: 1,
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    itemTag: {
      position: 'absolute',
      left: theme.spacing.s,
      bottom: theme.spacing.s,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: theme.color.primary50,
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

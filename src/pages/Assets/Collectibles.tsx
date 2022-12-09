import * as sentry from '@sentry/react-native'
import React, { useCallback, useEffect } from 'react'
import { FlatList, ListRenderItem, StyleSheet, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useDispatch } from 'react-redux'

import { NFTCollection, NFTMetadata } from 'api/types'
import LoadingIndicator from 'components/LoadingIndicator'
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
  const styles = useThemeAwareStyle(createStyles)
  const walletData = useReduxState((state) => getWalletsData(state.main))
  // FIXME: Test with eip155 wallet first
  const etherWallet = walletData.eip155?.address as string

  const { isLoading, error } = useReduxState(
    createRequestSelector(['GET_WALLET_NFT_COLLECTIBLES_REQUEST'])
  )
  const walletNFTCollections = useReduxState(walletNFTCollectionsSelector)

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
                {item.nfts.data.length}
              </Tag.Label>
            </Tag>
          </View>
        )
      } catch (e) {
        sentry.captureException(e)
      }

      return null
    },
    [styles]
  )

  if (isLoading) return <LoadingIndicator />
  if (error) return <Title>{error?.message}</Title>

  return (
    <View style={styles.container}>
      <FlatList
        style={styles.grid}
        numColumns={2}
        columnWrapperStyle={styles.columnWrapperStyle}
        ItemSeparatorComponent={() => <Spacer vertical='m' />}
        data={walletNFTCollections?.[etherWallet]}
        keyExtractor={(item) => `${item.token_address}`}
        renderItem={renderCollection}
      />
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
    },
    grid: {
      flex: 1,
      backgroundColor: theme.color.background,
    },
    column: {
      flex: 0.48,
    },
    image: {
      width: '100%',
      minHeight: 164,
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
      maxWidth: 130,
      color: theme.color.onPrimary,
    },
    tagLabelNumber: {
      marginLeft: theme.spacing.m,
      color: theme.color.onPrimary,
    },
  })

export default Collectibles

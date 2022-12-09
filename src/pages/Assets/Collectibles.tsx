import * as sentry from '@sentry/react-native'
import React, { useCallback, useEffect } from 'react'
import { FlatList, Image, ListRenderItem, StyleSheet, View } from 'react-native'
import { useDispatch } from 'react-redux'

import { NFTCollection, NFTMetadata } from 'api/types'
import LoadingIndicator from 'components/LoadingIndicator'
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
          <View style={{ flex: 0.5, padding: 4 }}>
            <Image style={styles.image} source={{ uri }} />
            <Title numberOfLines={1}>{item.name}</Title>
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
    <FlatList
      style={styles.grid}
      numColumns={2}
      columnWrapperStyle={{
        flex: 1,
        justifyContent: 'space-between',
        alignItems: 'center',
      }}
      data={walletNFTCollections?.[etherWallet]}
      keyExtractor={(item) => `${item.token_address}`}
      renderItem={renderCollection}
    />
  )
}

export default Collectibles

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    grid: {
      flex: 1,
      // padding: 16,
      backgroundColor: theme.color.background,
    },
    image: {
      width: '100%',
      height: 200,
    },
  })

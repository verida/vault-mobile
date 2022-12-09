import { RouteProp, useRoute } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import * as sentry from '@sentry/react-native'
import React, { useCallback, useEffect } from 'react'
import {
  Dimensions,
  FlatList,
  ListRenderItem,
  StyleSheet,
  View,
} from 'react-native'
import FastImage from 'react-native-fast-image'
import { useDispatch } from 'react-redux'

import { NFT, NFTCollection, NFTMetadata } from 'api/types'
import LoadingIndicator from 'components/LoadingIndicator'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Screen from 'components/Screen'
import { SearchBar } from 'components/SearchBar/SearchBar'
import { Spacer } from 'components/Spacer'
import { Tag } from 'components/Tag'
import { Title } from 'components/Typography/Title'
import { useReduxState } from 'hooks/useReduxState'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { MainStackParams } from 'navigation/types'
import { createRequestSelector } from 'reduxStore/api/selectors'
import { walletNFTCollectionsSelector } from 'reduxStore/collectibles/selectors'
import * as thunkActions from 'reduxStore/thunkActions'
import { getWalletsData } from 'reduxStore/wallet/selectors'
import { Theme } from 'styles/types'

type NFTCollectionProps = {}

type NFTCollectionDetailRouteProp = RouteProp<
  MainStackParams,
  'NFTCollectionDetail'
>

const NFTCollectionDetail = (props: NFTCollectionProps) => {
  const styles = useThemeAwareStyle(createStyles)
  const route = useRoute<NFTCollectionDetailRouteProp>()
  const collection = route.params.collection

  const renderCollection = useCallback<ListRenderItem<NFT>>(
    ({ item }) => {
      try {
        const imageMeta = (item?.metadata as unknown as NFTMetadata) ?? {
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
              <Tag.Label style={styles.tagLabelNumber}>
                #{item.token_id}
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

  return (
    <Screen withSafeAreaView>
      <NavigationHeader title={collection.name} />
      <View style={styles.container}>
        <FlatList
          style={styles.grid}
          numColumns={NUMBER_OF_COLUMNS}
          columnWrapperStyle={styles.columnWrapperStyle}
          ItemSeparatorComponent={() => <Spacer vertical='m' />}
          data={collection.nfts.data}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => `${item.token_id}`}
          renderItem={renderCollection}
        />
      </View>
    </Screen>
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
    },
    grid: {
      flex: 1,
      backgroundColor: theme.color.background,
    },
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
      marginLeft: theme.spacing.xs,
      color: theme.color.onPrimary,
    },
  })

export default NFTCollectionDetail

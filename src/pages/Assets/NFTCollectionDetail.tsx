import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import * as sentry from '@sentry/react-native'
import React, { useCallback } from 'react'
import {
  Dimensions,
  FlatList,
  ListRenderItem,
  Pressable,
  StyleSheet,
  View,
} from 'react-native'
import FastImage from 'react-native-fast-image'

import { NFT, NFTMetadata } from 'api/types'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Screen from 'components/Screen'
import { Spacer } from 'components/Spacer'
import { Tag } from 'components/Tag'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { MainStackParams } from 'navigation/types'
import { Theme } from 'styles/types'

type NFTCollectionProps = {}

type NFTCollectionDetailRouteProp = RouteProp<
  MainStackParams,
  'NFTCollectionDetail'
>

const NFTCollectionDetail = (props: NFTCollectionProps) => {
  const styles = useThemeAwareStyle(createStyles)
  const route = useRoute<NFTCollectionDetailRouteProp>()
  const navigation = useNavigation()
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
          <Pressable
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
          </Pressable>
        )
      } catch (e) {
        sentry.captureException(e)
      }

      return null
    },
    [navigation, styles]
  )

  return (
    <Screen withSafeAreaView>
      <NavigationHeader title={collection.name} bottomBorder />
      <View style={styles.container}>
        <FlatList
          style={styles.grid}
          numColumns={NUMBER_OF_COLUMNS}
          columnWrapperStyle={styles.columnWrapperStyle}
          ItemSeparatorComponent={() => <Spacer vertical='m' />}
          data={collection.nfts?.data ?? []}
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
      padding: theme.spacing.m,
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

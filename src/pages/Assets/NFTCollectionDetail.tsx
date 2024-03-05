import { RouteProp, useNavigation, useRoute } from '@react-navigation/native'
import { NFT, NFTMetadata } from 'features/assets'
import { Logger } from 'features/telemetry'
import { getNFTImageUri } from 'helpers/nft'
import React, { useCallback } from 'react'
import { ListRenderItem, Pressable, StyleSheet, View } from 'react-native'
import FastImage from 'react-native-fast-image'

import GridView from 'components/Grids/GridView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Screen from 'components/Screen'
import { Tag } from 'components/Tag'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { MainStackParams } from 'navigation/types'
import { Theme } from 'styles/types'

import { IMAGE_WIDTH, NUMBER_OF_COLUMNS } from './constants'

const logger = Logger.create('Pages/NFTCollectionDetail')

type NFTCollectionDetailRouteProp = RouteProp<
  MainStackParams,
  'NFTCollectionDetail'
>

const NFTCollectionDetail = () => {
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
        const uri = getNFTImageUri(imageMeta.image)
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
      } catch (error) {
        logger.error(error)
      }

      return null
    },
    [navigation, styles]
  )

  return (
    <Screen>
      <NavigationHeader title={collection.name} bottomBorder />
      <View style={styles.container}>
        <GridView
          numColumns={NUMBER_OF_COLUMNS}
          data={collection.nfts?.data ?? []}
          keyExtractor={(item) => `${item.token_id}`}
          renderItem={renderCollection}
        />
      </View>
    </Screen>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
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
      marginLeft: theme.spacing.xs,
      marginRight: theme.spacing.xs,
      color: theme.color.onPrimary,
    },
  })

export default NFTCollectionDetail

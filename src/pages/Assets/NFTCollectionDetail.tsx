import React, { useCallback, useEffect } from 'react'
import { ListRenderItem, Pressable, StyleSheet, View } from 'react-native'
import FastImage from 'react-native-fast-image'

import { ScreenWrapper } from '~/components'
import GridView from '~/components/Grids/GridView'
import { Tag } from '~/components/Tag'
import { NFT, NFTCollection, NFTMetadata } from '~/features/assets'
import { Logger } from '~/features/telemetry'
import { getNFTImageUri } from '~/helpers/nft'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation/types'
import { Theme } from '~/styles/types'

import { IMAGE_WIDTH, NUMBER_OF_COLUMNS } from './constants'

const logger = Logger.create('Pages/NFTCollectionDetail')

export type NFTCollectionDetailScreenParams = { collection: NFTCollection }

type NFTCollectionDetailScreenProps =
  MainStackScreenProps<'NFTCollectionDetail'>

export const NFTCollectionDetailScreen: React.FC<
  NFTCollectionDetailScreenProps
> = (props) => {
  const {
    navigation,
    route: { params },
  } = props
  const { collection } = params

  useEffect(() => {
    navigation.setOptions({
      title: collection.name,
    })
  }, [navigation, collection])

  const styles = useThemeAwareStyle(createStyles)

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
                defaultSource={require('~/assets/picture.png')}
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
    <ScreenWrapper>
      <View style={styles.container}>
        <GridView
          numColumns={NUMBER_OF_COLUMNS}
          data={collection.nfts?.data ?? []}
          keyExtractor={(item) => `${item.token_id}`}
          renderItem={renderCollection}
        />
      </View>
    </ScreenWrapper>
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

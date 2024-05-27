import React from 'react'
import { ImageStyle, Platform, StyleSheet, View, ViewStyle } from 'react-native'
import FastImage from 'react-native-fast-image'
import { SvgCss, SvgCssUri } from 'react-native-svg'

import { ErrorBoundary } from '~/components/ErrorBoundary'
import { Tag } from '~/components/Tag'
import { NFT, NFTMetadata } from '~/features/assets'
import { getNFTImageUri } from '~/helpers/nft'
import { useThemeAwareStyle } from '~/hooks/useThemeAwareStyle'
import { IMAGE_WIDTH } from '~/pages/Assets/constants'
import { Theme } from '~/styles/types'

type Props = {
  nft: NFT
  containerStyle?: ViewStyle
  imageStyle?: ImageStyle
}

const decodeBase64Svg = (base64Svg: string) => {
  const data = base64Svg.split('data:image/svg+xml;base64,')?.[1] ?? ''
  return Buffer.from(data, 'base64').toString()
}

export const NftItem = ({ nft, containerStyle, imageStyle }: Props) => {
  const styles = useThemeAwareStyle(createStyles)
  const imageMeta = (nft?.metadata as unknown as NFTMetadata) ?? {
    image: null,
  }
  const uri = getNFTImageUri(imageMeta.image)
  const isSVG = uri?.includes('.svg')
  const isSVGBase64 = uri?.includes('data:image/svg+xml;base64,')
  return (
    <View style={[styles.itemContainer, containerStyle]}>
      {/* SVGs can easily fall into an unsupported format */}
      <ErrorBoundary>
        {isSVG || (isSVGBase64 && Platform.OS === 'ios') ? (
          <View style={[styles.image, imageStyle as any]}>
            <SvgCssUri width='100%' height='100%' uri={uri} />
          </View>
        ) : isSVGBase64 ? (
          <View style={[styles.image, imageStyle as any]}>
            <SvgCss
              width='100%'
              height='100%'
              xml={decodeBase64Svg(uri)}
              color='#ffff'
            />
          </View>
        ) : (
          <FastImage
            style={[styles.image, imageStyle as any]}
            defaultSource={require('~/assets/picture.png')}
            source={{
              uri,
              priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
        )}
      </ErrorBoundary>
      {nft.name ? (
        <Tag withBlur style={styles.itemTag}>
          <Tag.Label numberOfLines={1} style={styles.tagLabel}>
            {nft.name}
          </Tag.Label>
          <Tag.Label
            style={styles.tagLabelNumber}
            ellipsizeMode='middle'
            numberOfLines={1}>
            #{nft.token_id}
          </Tag.Label>
        </Tag>
      ) : null}
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    itemContainer: {
      flex: 0.48,
    },
    image: {
      width: IMAGE_WIDTH,
      height: IMAGE_WIDTH,
      borderRadius: theme.roundness.xs,
      overflow: 'hidden',
    },
    itemTag: {
      maxWidth: IMAGE_WIDTH - 2 * theme.spacing.s,
      position: 'absolute',
      left: theme.spacing.s,
      bottom: theme.spacing.s,
    },
    tagLabel: {
      maxWidth: 0.6 * IMAGE_WIDTH,
      color: theme.color.onPrimary,
    },
    tagLabelNumber: {
      maxWidth: 40,
      marginLeft: theme.spacing.s,
      color: theme.color.onPrimary,
    },
  })

import { getNFTImageUri } from 'helpers/nft'
import React from 'react'
import { ImageStyle, StyleSheet, View, ViewStyle } from 'react-native'
import FastImage from 'react-native-fast-image'

import { NFT, NFTMetadata } from 'api/types'
import { Tag } from 'components/Tag'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { IMAGE_WIDTH } from 'pages/Assets/constants'
import { Theme } from 'styles/types'

type Props = {
  nft: NFT
  containerStyle?: ViewStyle
  imageStyle?: ImageStyle
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
      {isSVG ? (
        // FIXME: this component caused a crash
        // <View style={styles.image}>
        //   <SvgCssUri height='100%' uri={uri} width='100%' />
        // </View>
        <FastImage
          style={[styles.image, imageStyle as any]}
          defaultSource={require('assets/picture.png')}
          source={{
            uri,
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
      ) : isSVGBase64 ? (
        // <View style={styles.image}>
        //   <SvgXml
        //     height='100%'
        //     xml={Buffer.from(
        //       uri.replace('data:image/svg+xml;base64,', ''),
        //       'base64'
        //     ).toString()}
        //     width='100%'
        //   />
        // </View>
        <FastImage
          style={[styles.image, imageStyle as any]}
          defaultSource={require('assets/picture.png')}
          source={{
            uri,
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
      ) : (
        <FastImage
          style={[styles.image, imageStyle as any]}
          defaultSource={require('assets/picture.png')}
          source={{
            uri,
            priority: FastImage.priority.normal,
          }}
          resizeMode={FastImage.resizeMode.cover}
        />
      )}
      {nft.name ? (
        <Tag withBlur style={styles.itemTag}>
          <Tag.Label numberOfLines={1} style={styles.tagLabel}>
            {nft.name}
          </Tag.Label>
          <Tag.Label style={styles.tagLabelNumber}>#{nft.token_id}</Tag.Label>
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
  })

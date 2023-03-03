import { useTheme } from 'contexts/ThemeContext'
import React from 'react'
import { Dimensions, StyleSheet, TouchableOpacity, View } from 'react-native'
import { OneProfileFeaturedAsset } from 'types/profile'

import EditIcon from 'assets/edit_icon.svg'
import PlusIcon from 'assets/plus_icon.svg'
import { NftItem } from 'components/Assets/NftItem'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

type Props = {
  featuredAsset?: OneProfileFeaturedAsset
  lastItemIndex: number
  index: number
  onEdit: () => void
}

export const FeaturedAssetItem = ({
  featuredAsset,
  index,
  lastItemIndex,
  onEdit,
}: Props) => {
  const { theme } = useTheme()
  const styles = useThemeAwareStyle(createStyles)

  return (
    <View key={`Asset-${index}`} style={[styles.itemContainer]}>
      {featuredAsset ? (
        <View style={styles.nftContainer}>
          <NftItem
            containerStyle={styles.nftContainer}
            imageStyle={styles.nftContainer}
            nft={{ metadata: { image: featuredAsset.uri } } as any}
          />
          <TouchableOpacity
            style={{
              position: 'absolute',
              alignItems: 'center',
              justifyContent: 'center',
              right: 6,
              top: 6,
            }}
            onPress={onEdit}>
            <View
              style={{
                width: 24,
                height: 24,
                padding: 4,
                backgroundColor: 'white',
                borderRadius: 6,
              }}>
              <EditIcon width='16' height='16' fill={theme.color.icon} />
            </View>
          </TouchableOpacity>
        </View>
      ) : index === lastItemIndex + 1 ? (
        <TouchableOpacity onPress={onEdit}>
          <View style={styles.assetPlaceholderPlus}>
            <PlusIcon />
          </View>
        </TouchableOpacity>
      ) : (
        <View style={styles.assetPlaceholderEmpty} />
      )}
    </View>
  )
}

const createStyles = (theme: Theme) => {
  const numberAssetsInARow = 4
  const imageW =
    (Dimensions.get('window').width -
      2 * theme.spacing.m -
      3 * theme.spacing.s) /
    numberAssetsInARow

  return StyleSheet.create({
    itemContainer: {},
    assetPlaceholderPlus: {
      width: imageW,
      height: imageW,
      backgroundColor: theme.color.primary100,
      borderColor: theme.color.primary,
      borderWidth: 1,
      borderStyle: 'dashed',
      borderRadius: theme.roundness.s,
      alignItems: 'center',
      justifyContent: 'center',
    },
    assetPlaceholderEmpty: {
      width: imageW,
      height: imageW,
      backgroundColor: theme.color.lightGrey,
      borderRadius: theme.roundness.s,
    },
    nftContainer: {
      width: imageW,
      height: imageW,
      borderRadius: theme.roundness.s,
      backgroundColor: theme.color.background,
    },
  })
}

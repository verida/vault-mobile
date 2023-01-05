import React from 'react'
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native'
import { BadgeData, ClaimableBadgeParams } from 'types/badges'

import Button from 'components/Button'
import { NUNITO_SANS, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'
import { getBadgeDetailsByID } from 'utils/badges'

const badgeImageBackground = require('assets/badge_gradient_bg.png')

type BadgeItemProps = {
  item: BadgeData
  onPressClaim: (arg: ClaimableBadgeParams) => void
}

const BadgeItem: React.FC<BadgeItemProps> = ({ item, onPressClaim }) => {
  const styles = useThemeAwareStyle(createStyles)

  const badgeDetails = getBadgeDetailsByID(item.id)

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ImageBackground
          source={badgeImageBackground}
          resizeMode='cover'
          imageStyle={styles.badgeImageBackground}
          style={styles.badgeImageBackgroundContainer}>
          <Image style={styles.badgeImage} source={badgeDetails.image} />
        </ImageBackground>
        <View style={styles.textWrapper}>
          <Text style={styles.title}>{badgeDetails.name}</Text>
          <Text style={styles.subText}>{item.username}</Text>
        </View>
      </View>
      <View>
        <Button
          style={styles.actionButton}
          color='primary'
          disabled={false}
          loading={false}
          onPress={() => {
            onPressClaim({
              ...item,
              ...badgeDetails,
            })
          }}>
          Claim
        </Button>
      </View>
    </View>
  )
}

export default BadgeItem

// TODO: Rework the sizing of the image. Maybe create a dedicated component
const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    badgeImageBackgroundContainer: {
      height: 48,
      width: 48,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeImageBackground: {
      borderRadius: theme.borderRadius.xs,
    },
    badgeImage: {
      height: 43,
      width: 37,
    },
    content: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
    },
    textWrapper: {
      marginHorizontal: theme.spacing.m,
    },
    title: {
      fontFamily: NUNITO_SANS_SEMIBOLD,
      fontWeight: '600',
      fontSize: theme.fontSize.l,
      color: theme.color.primary100,
    },
    subText: {
      fontFamily: NUNITO_SANS,
      fontWeight: '600',
      fontSize: theme.fontSize.s,
      color: theme.color.primary100,
    },
    actionButton: {
      height: 32,
      borderRadius: 70,
      paddingHorizontal: theme.spacing.sm,
    },
  })
}

import React from 'react'
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native'
import { AvailableBadge } from 'types/badges'

import Button from 'components/Button'
import { NUNITO_SANS, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

const badgeImageBackground = require('assets/badge_gradient_bg.png')

type BadgeItemProps = {
  badge: AvailableBadge
  onPressClaim: (badge: AvailableBadge) => void
}

const BadgeItem: React.FC<BadgeItemProps> = ({ badge, onPressClaim }) => {
  const styles = useThemeAwareStyle(createStyles)

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ImageBackground
          source={badgeImageBackground}
          resizeMode='cover'
          imageStyle={styles.badgeImageBackground}
          style={styles.badgeImageBackgroundContainer}>
          <Image style={styles.badgeImage} src={badge.imageUrl} />
        </ImageBackground>
        <View style={styles.textWrapper}>
          <Text style={styles.title}>{badge.label}</Text>
          <Text style={styles.subText} numberOfLines={1} ellipsizeMode='middle'>
            {badge?.claimMetadata || 'Not connected'}
          </Text>
        </View>
      </View>
      <Button
        style={styles.actionButton}
        color='primary'
        disabled={false}
        loading={false}
        onPress={() => {
          onPressClaim(badge)
        }}>
        <Text style={styles.buttonLabel}>Claim</Text>
      </Button>
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
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: 15,
    },
    textWrapper: {
      flex: 1,
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
      borderRadius: 70,
      paddingHorizontal: theme.spacing.sm,
      paddingVertical: theme.spacing.xs,
      height: 'auto', // Have to override the default style of the Button component!
      marginBottom: 0, // Have to override the default style of the Button component!
      borderWidth: 0, // Have to override the default style of the Button component!
    },
    buttonLabel: {
      // Have to enclose the button label in its own Text to override the default style of the Button that cannot be changed. Consider a different component or improving the Button component
      fontFamily: NUNITO_SANS,
      fontWeight: '500',
      fontSize: 12,
      lineHeight: 24,
    },
  })
}

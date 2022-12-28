import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React from 'react'
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native'
import { BadgeData, ClaimableBadgeParams } from 'types/Badges'

import Button from 'components/Button'
import { NUNITO_SANS, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { MainStackParams } from 'navigation/types'
import { Theme } from 'styles/types'
import { getBadgeDetailsByID } from 'utils/badges'

const badgeBgGradientColor = require('assets/badge_bg_gradient.png')

type BadgeItemProps = {
  item: BadgeData
  onPress: (arg: ClaimableBadgeParams) => void
}

const BadgeItem: React.FC<BadgeItemProps> = ({ item, onPress }) => {
  const styles = useThemeAwareStyle(createStyles)
  const navigation = useNavigation<NativeStackNavigationProp<MainStackParams>>()

  const badgeDetails = getBadgeDetailsByID(item.id)

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <ImageBackground
          source={badgeBgGradientColor}
          resizeMode='cover'
          style={styles.bgImage}>
          <Image style={styles.badgeIcon} source={badgeDetails.image} />
        </ImageBackground>
        <View style={styles.textWrapper}>
          <Text style={styles.title}>{badgeDetails?.name}</Text>
          <Text style={styles.subText}>{item.username || 'not connected'}</Text>
        </View>
      </View>
      <View>
        {item.username ? (
          <Button
            style={styles.actionButton}
            color='primary'
            disabled={false}
            loading={false}
            onPress={() => {
              onPress({
                ...item,
                ...badgeDetails,
              })
            }}>
            Claim
          </Button>
        ) : (
          <Button
            style={styles.actionButton}
            color='light-primary'
            disabled={false}
            loading={false}
            onPress={() => {
              navigation.navigate('SingleConnection', {
                provider: badgeDetails?.name as string,
              })
            }}>
            Connect
          </Button>
        )}
      </View>
    </View>
  )
}

export default BadgeItem

const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    badgeIcon: {
      height: 43,
      width: 37,
    },
    bgImage: {
      height: 48,
      width: 48,
      alignItems: 'center',
      justifyContent: 'center',
      borderRadius: theme.borderRadius.l,
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

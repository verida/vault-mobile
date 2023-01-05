import React from 'react'
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native'
import { BadgeType } from 'types/badges'

import ErrorStatusIcon from 'assets/icons/error_status_icon.svg'
import Button from 'components/Button'
import { Paragraph } from 'components/Typography/Paragraph'
import { NUNITO_SANS, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

const badgeImageBackground = require('assets/badge_gradient_bg.png')

const statusList = {
  success: {
    type: 'success',
    title: `Success!`,
    message: (badgeLabel: string) =>
      `Your ${badgeLabel} Badge has been successfully generated`,
  },
  error: {
    type: 'error',
    title: `Ooops...`,
    message: `Something went wrong
Please try again`,
  },
}

type ClaimBadgeStatusProps = {
  status: keyof typeof statusList
  badgeInfo: BadgeType
}

const ClaimBadgeStatus: React.FC<ClaimBadgeStatusProps> = ({
  status,
  badgeInfo,
}) => {
  const styles = useThemeAwareStyle(createStyles)

  // TODO: Set actions to the buttons
  const actions =
    status === 'success' ? (
      <View>
        <Button color='primary' disabled={false} loading={false}>
          Share
        </Button>
        <Button color='secondary' disabled={false} loading={false}>
          View in Verida One
        </Button>
      </View>
    ) : (
      <Button color='primary' disabled={false} loading={false}>
        Go Back
      </Button>
    )

  const message: string =
    status === 'success'
      ? statusList.success.message(badgeInfo.label)
      : statusList.error.message

  // TODO: Add animations as designed in Figma
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {status === 'error' && <ErrorStatusIcon />}
        {status === 'success' && (
          <ImageBackground
            source={badgeImageBackground}
            resizeMode='contain'
            imageStyle={styles.badgeImageBackground}
            style={styles.badgeImageBackgroundContainer}>
            <Image style={styles.badgeImage} source={badgeInfo.image} />
          </ImageBackground>
        )}
        <View style={styles.statusInfoContainer}>
          <Text style={styles.statusTitle}>{statusList[status].title}</Text>
          <Paragraph style={styles.statusMessage}>{message}</Paragraph>
        </View>
      </View>
      <View>{actions}</View>
    </View>
  )
}

export default ClaimBadgeStatus

// TODO: Rework the sizing of the image. Maybe create a dedicated component
const createStyles = (theme: Theme) => {
  return StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: 'column',
      justifyContent: 'space-between',
    },
    content: {
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 64,
      paddingHorizontal: theme.spacing.m,
    },
    badgeImageBackgroundContainer: {
      width: 221,
      height: 221,
      alignItems: 'center',
      justifyContent: 'center',
    },
    badgeImageBackground: {
      borderRadius: theme.borderRadius.l,
      borderWidth: 1,
      borderColor: theme.color.lightGrey,
    },
    badgeImage: {
      width: 170,
      height: 198,
      margin: 18,
    },
    statusInfoContainer: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    statusTitle: {
      fontFamily: NUNITO_SANS_SEMIBOLD,
      fontWeight: '700',
      fontSize: 28,
      lineHeight: 36.4,
      textAlign: 'center',
      color: theme.color.primary100,
      marginTop: theme.spacing.l,
      marginBottom: theme.spacing.m,
    },
    statusMessage: {
      fontFamily: NUNITO_SANS,
      fontSize: theme.fontSize.l,
      lineHeight: 24,
      textAlign: 'center',
      color: theme.color.primary100,
      opacity: 0.6,
    },
  })
}

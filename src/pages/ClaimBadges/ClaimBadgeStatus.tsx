import React, { useState } from 'react'
import { Image, ImageBackground, StyleSheet, Text, View } from 'react-native'
import { BadgeType } from 'types/badges'

import ErrorStatusIcon from 'assets/icons/error_status_icon.svg'
import Button from 'components/Button'
import { Paragraph } from 'components/Typography/Paragraph'
import { NUNITO_SANS, NUNITO_SANS_SEMIBOLD } from 'constants/text'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { Theme } from 'styles/types'

const badgeBgGradientColor = require('assets/badge_bg_gradient.png')

const STATUS = {
  success: {
    type: 'success',
    title: `Success!`,
    message: 'Your Badge has been successfully generated',
  },
  error: {
    type: 'error',
    title: `Ooops...`,
    message: `Something went wrong. Please try again.`,
  },
}

type StatusType = 'success' | 'error' | undefined

type ClaimBadgeStatusProps = {
  type: StatusType
  data: BadgeType
}

const ClaimBadgeStatus: React.FC<ClaimBadgeStatusProps> = ({
  type = 'error',
  data,
}) => {
  const styles = useThemeAwareStyle(createStyles)
  const [status] = useState(STATUS)

  const SuccessActionButton = (
    <View>
      <Button color='primary' disabled={false} loading={false}>
        Share
      </Button>
      <Button color='secondary' disabled={false} loading={false}>
        View in Verida One
      </Button>
    </View>
  )
  const ErrorActionButton = (
    <Button color='primary' disabled={false} loading={false}>
      Go Back
    </Button>
  )
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {type === 'error' && <ErrorStatusIcon />}
        {type === 'success' && (
          <ImageBackground
            source={badgeBgGradientColor}
            resizeMode='contain'
            style={styles.bgImage}>
            <Image style={styles.badgeImage} source={data.image} />
          </ImageBackground>
        )}
        <View style={styles.statusInfo}>
          <Text style={styles.title}>{status[type].title}</Text>
          <Paragraph style={styles.bodyText}>{status[type].message}</Paragraph>
        </View>
      </View>
      <View>
        {type === 'success' && SuccessActionButton}
        {type === 'error' && ErrorActionButton}
      </View>
    </View>
  )
}

export default ClaimBadgeStatus

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
      marginTop: 74,
      paddingHorizontal: theme.spacing.xxl,
    },
    badgeImage: {
      width: 170,
      height: 198,
      marginVertical: 18,
    },
    bgImage: {
      width: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    statusInfo: {
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontFamily: NUNITO_SANS_SEMIBOLD,
      fontWeight: '600',
      fontSize: 28,
      textAlign: 'center',
      color: theme.color.primary100,
      marginTop: theme.spacing.l,
      marginBottom: theme.spacing.s,
    },
    bodyText: {
      fontFamily: NUNITO_SANS,
      fontSize: theme.fontSize.l,
      textAlign: 'center',
      color: theme.color.primary100,
      marginBottom: theme.spacing.m,
    },
  })
}

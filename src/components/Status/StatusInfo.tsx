import { useThemeAwareStyle } from 'hooks'
import LottieView from 'lottie-react-native'
import React from 'react'
import { StyleSheet, View, ViewProps } from 'react-native'

import BlurCircle from 'assets/blur_circle.svg'
import FailureCross from 'assets/failure_cross.svg'
import SuccessTick from 'assets/success_tick.svg'
import { Typography } from 'components/Typography'
import { Theme } from 'styles/types'

type StatusInfoProps = {
  statusType: 'processsing' | 'error' | 'success'
  title?: string
  subtitle?: string
} & ViewProps

export const StatusInfo: React.FunctionComponent<StatusInfoProps> = (props) => {
  const { statusType, title, subtitle, ...rest } = props

  const styles = useThemeAwareStyle(createStyles)

  const statusTitle = title
    ? title
    : statusType === 'processsing'
      ? 'Processing'
      : statusType === 'success'
        ? 'Success'
        : 'Error'

  const statusSubtitle = subtitle
    ? subtitle
    : statusType === 'processsing'
      ? 'Please wait'
      : statusType === 'success'
        ? 'Congratulations!'
        : 'Something went wrong!'

  const icon =
    statusType === 'processsing' ? (
      <>
        <BlurCircle />
        {/* FIXME: The animation doesn't seem to work */}
        <LottieView
          source={require('assets/animations/dots-loader.json')}
          autoPlay
          loop
          style={styles.dotsLoader}
        />
      </>
    ) : statusType === 'success' ? (
      // TODO: Use an icon and apply it on top of the blue blur background instead of a combine icon + background
      <SuccessTick />
    ) : (
      // TODO: Use an icon and apply it on top of the blue blur background instead of a combine icon + background
      <FailureCross />
    )

  return (
    <View {...rest}>
      <View
        style={{
          alignItems: 'center',
        }}>
        <View
          style={{
            alignItems: 'center',
            justifyContent: 'center',
          }}>
          {icon}
        </View>
        <Typography variant='h2' style={styles.statusTitle}>
          {statusTitle}
        </Typography>
        <Typography variant='h5' style={styles.statusSubtitle}>
          {statusSubtitle}
        </Typography>
      </View>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    statusTitle: {
      marginTop: theme.spacing.l,
    },
    statusSubtitle: {
      opacity: 0.6,
      marginTop: theme.spacing.sm,
    },
    dotsLoader: {
      width: 48,
      height: 48,
      position: 'absolute',
    },
  })

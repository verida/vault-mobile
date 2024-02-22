import { CircuitStatus } from 'features/polygonid'
import { useThemeAwareStyle } from 'hooks'
import * as React from 'react'
import { StyleProp, StyleSheet, Text, View, ViewStyle } from 'react-native'

import { NUNITO_SANS, NUNITO_SANS_BOLD } from 'constants/text'
import { Theme } from 'styles/types'

export const CircuitDownloadStateDebug = React.memo(
  function CircuitDownloadStateDebug({
    label,
    status,
    style,
  }: {
    readonly label: string
    readonly status: CircuitStatus
    readonly style?: StyleProp<ViewStyle>
  }): JSX.Element {
    const styles = useThemeAwareStyle(createStyles)

    const formattedStatus =
      status === CircuitStatus.AVAILABLE
        ? 'Available'
        : status === CircuitStatus.DOWNLOADING
        ? 'Downloading...'
        : status === CircuitStatus.UNAVAILABLE
        ? 'Not Available'
        : 'Unknown'

    return (
      <View style={style}>
        <View style={styles.container}>
          <Text style={styles.label}>{label}</Text>
          <Text style={styles.status}>{formattedStatus}</Text>
        </View>
      </View>
    )
  }
)

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: theme.spacing.m,
    },
    label: {
      fontSize: theme.fontSize.l,
      lineHeight: 22,
      fontFamily: NUNITO_SANS_BOLD,
    },
    status: {
      fontSize: theme.fontSize.m,
      lineHeight: 22,
      fontFamily: NUNITO_SANS,
    },
  })

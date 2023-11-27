import type { CircuitId } from '@0xpolygonid/js-sdk'
import { useTheme } from 'contexts'
import { useThemeAwareStyle } from 'hooks'
import * as React from 'react'
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native'

import { NUNITO_SANS, NUNITO_SANS_BOLD } from 'constants/text'
import { Theme } from 'styles/types'

import { CircuitDownloadStatus } from '../@types'
import {
  useCircuitSpecificDownloadStates,
  useIsCircuitsDownloaded,
} from '../hooks'

export const CircuitDownloadStateDebug = React.memo(
  function CircuitDownloadStateDebug({
    circuitId,
    style,
  }: {
    readonly circuitId: `${CircuitId}`
    readonly style?: StyleProp<ViewStyle>
  }): JSX.Element {
    const styles = useThemeAwareStyle(createStyles)
    const { theme } = useTheme()
    const circuitSpecificDownloadStates = useCircuitSpecificDownloadStates({
      circuitId,
    })

    const isCircuitsDownloaded = useIsCircuitsDownloaded([circuitId])

    const circuitIsDownloaded =
      'result' in isCircuitsDownloaded && isCircuitsDownloaded.result

    return (
      <View style={style}>
        <View style={[styles.circuitlabelContainer]}>
          <Text style={styles.circuitlabel}>{circuitId}</Text>
          {!circuitIsDownloaded && (
            <ActivityIndicator color={theme.color.primary} />
          )}
        </View>
        {!('result' in circuitSpecificDownloadStates) ? (
          <View style={styles.row}>
            <ActivityIndicator color={theme.color.primary} />
          </View>
        ) : (
          <View>
            {Object.entries(circuitSpecificDownloadStates.result).map(
              ([circuitType, { status }]) => (
                <View key={circuitType} style={styles.row}>
                  <Text style={styles.circuitTypelabel}>{circuitType}</Text>
                  <View style={styles.flex} />
                  {status === CircuitDownloadStatus.DOWNLOADED && (
                    <Text style={[styles.status]}>Available</Text>
                  )}
                  {status === CircuitDownloadStatus.DOWNLOADING && (
                    <Text style={[styles.status]}>Downloading...</Text>
                  )}
                  {status === CircuitDownloadStatus.UNINITIALIZED && (
                    <Text style={[styles.status]}>Not Available</Text>
                  )}
                </View>
              )
            )}
          </View>
        )}
      </View>
    )
  }
)

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    circuitlabelContainer: {
      flexDirection: 'row',
      marginBottom: theme.spacing.s,
    },
    circuitlabel: {
      fontSize: theme.fontSize.l,
      lineHeight: 22,
      fontFamily: NUNITO_SANS_BOLD,
    },
    circuitTypelabel: {
      fontSize: theme.fontSize.m,
      lineHeight: 22,
      fontFamily: NUNITO_SANS,
    },
    status: {
      fontSize: theme.fontSize.m,
      lineHeight: 22,
      fontFamily: NUNITO_SANS,
    },
    center: { alignItems: 'center', justifyContent: 'center' },
    flex: { flex: 1 },
    row: { alignItems: 'center', flexDirection: 'row' },
  })

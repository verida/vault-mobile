import type { CircuitId } from '@0xpolygonid/js-sdk'
import { useTheme } from 'contexts'
import {
  CircuitComponentDownloadStatus,
  getCircuitDownloadState,
  isCircuitDownloaded,
  usePolygonIdCircuits,
} from 'features/polygonid_new'
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

    const { circuitDownloadStates } = usePolygonIdCircuits()
    const circuitDownloadState = getCircuitDownloadState(
      circuitId,
      circuitDownloadStates
    )
    const circuitDownloaded = isCircuitDownloaded(circuitDownloadState)

    return (
      <View style={style}>
        <View style={[styles.circuitlabelContainer]}>
          <Text style={styles.circuitlabel}>{circuitId}</Text>
          {!circuitDownloaded && (
            <ActivityIndicator color={theme.color.primary} />
          )}
        </View>
        <View>
          {Object.entries(circuitDownloadState).map(
            ([circuitType, { status }]) => (
              <View key={circuitType} style={styles.row}>
                <Text style={styles.circuitTypelabel}>{circuitType}</Text>
                <View style={styles.flex} />
                {status === CircuitComponentDownloadStatus.DOWNLOADED && (
                  <Text style={[styles.status]}>Available</Text>
                )}
                {status === CircuitComponentDownloadStatus.DOWNLOADING && (
                  <Text style={[styles.status]}>Downloading...</Text>
                )}
                {status === CircuitComponentDownloadStatus.UNINITIALIZED && (
                  <Text style={[styles.status]}>Not Available</Text>
                )}
              </View>
            )
          )}
        </View>
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

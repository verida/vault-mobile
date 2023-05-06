import type { CircuitId } from '@0xpolygonid/js-sdk'
import * as React from 'react'
import {
  ActivityIndicator,
  StyleProp,
  StyleSheet,
  Text,
  View,
  ViewStyle,
} from 'react-native'

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
    const circuitSpecificDownloadStates = useCircuitSpecificDownloadStates({
      circuitId,
    })

    const isCircuitsDownloaded = useIsCircuitsDownloaded([circuitId])

    const circuitIsDownloaded =
      'result' in isCircuitsDownloaded && isCircuitsDownloaded.result

    return (
      <View style={style}>
        {!('result' in circuitSpecificDownloadStates) ? (
          <View style={styles.row}>
            <ActivityIndicator />
          </View>
        ) : (
          <View>
            <View style={[styles.row, styles.center]}>
              {!circuitIsDownloaded && <ActivityIndicator />}
              <Text style={styles.bold}>{circuitId}</Text>
            </View>
            {Object.entries(circuitSpecificDownloadStates.result).map(
              ([circuitType, { status }]) => (
                <View key={circuitType} style={styles.row}>
                  <Text>{circuitType}</Text>
                  <View style={styles.flex} />
                  {status === CircuitDownloadStatus.DOWNLOADED && (
                    <Text children='✅' />
                  )}
                  {status === CircuitDownloadStatus.DOWNLOADING && (
                    <Text children='🔄' />
                  )}
                  {status === CircuitDownloadStatus.UNINITIALIZED && (
                    <Text children='❌' />
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

const styles = StyleSheet.create({
  bold: { fontWeight: 'bold' },
  center: { alignItems: 'center', justifyContent: 'center' },
  flex: { flex: 1 },
  row: { alignItems: 'center', flexDirection: 'row' },
})

import { CircuitDownloadStateDebug } from 'features/polygonid/circuit'
import { ALL_CIRCUIT_IDS } from 'features/polygonid/circuit/constants'
import { useThemeAwareStyle } from 'hooks'
import React, { useEffect } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { NUNITO_SANS } from 'constants/text'
import { MainStackScreenProps } from 'navigation/types'
import { Theme } from 'styles/types'

// Define screen params if/when needed
export type PolygonIdCircuitsSettingsScreenParams = undefined

type PolygonIdCircuitsSettingsScreenProps =
  MainStackScreenProps<'PolygonIdCircuitsSettings'>

export const PolygonIdCircuitsSettingsScreen: React.FunctionComponent<
  PolygonIdCircuitsSettingsScreenProps
> = (props) => {
  const { navigation } = props

  const styles = useThemeAwareStyle(createStyles)
  const insets = useSafeAreaInsets()

  useEffect(() => {
    navigation.setOptions({
      title: 'Polygon ID Circuits',
    })
  }, [navigation])

  return (
    <View
      style={[
        styles.wrapper,
        {
          paddingBottom: insets.bottom,
          paddingRight: insets.right,
          paddingLeft: insets.left,
        },
      ]}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.containerContent}>
        <View style={styles.messageWrapper}>
          <Text style={styles.message}>
            Polygon ID requires these circuits to be available
          </Text>
        </View>
        <View>
          {ALL_CIRCUIT_IDS.map((circuitId) => (
            <CircuitDownloadStateDebug
              key={circuitId}
              circuitId={circuitId}
              style={styles.circuitWrapper}
            />
          ))}
        </View>
      </ScrollView>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    wrapper: {
      flex: 1,
    },
    container: {
      flex: 1,
    },
    containerContent: {
      padding: theme.spacing.m,
    },
    messageWrapper: {
      marginBottom: theme.spacing.l,
    },
    message: {
      fontFamily: NUNITO_SANS,
      fontSize: theme.fontSize.m,
    },
    circuitWrapper: {
      marginBottom: theme.spacing.l,
    },
  })

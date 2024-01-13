import { ScreenWrapper } from 'components'
import { CircuitDownloadStateDebug } from 'features/polygonid/circuit'
import { ALL_CIRCUIT_IDS } from 'features/polygonid/circuit/constants'
import { useThemeAwareStyle } from 'hooks'
import React, { useEffect } from 'react'
import { ScrollView, StyleSheet, Text, View } from 'react-native'

import { NUNITO_SANS } from 'constants/text'
import { MainStackScreenProps } from 'navigation/types'
import { Theme } from 'styles/types'

export type PolygonIdCircuitsSettingsScreenParams = undefined

type PolygonIdCircuitsSettingsScreenProps =
  MainStackScreenProps<'PolygonIdCircuitsSettings'>

export const PolygonIdCircuitsSettingsScreen: React.FunctionComponent<PolygonIdCircuitsSettingsScreenProps> =
  (props) => {
    const { navigation } = props

    const styles = useThemeAwareStyle(createStyles)

    useEffect(() => {
      navigation.setOptions({
        title: 'Polygon ID Circuits',
      })
    }, [navigation])

    return (
      <ScreenWrapper>
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
      </ScreenWrapper>
    )
  }

const createStyles = (theme: Theme) =>
  StyleSheet.create({
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

import React, { useEffect, useMemo } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import {
  BottomActionBar,
  ScreenWrapper,
  StatusInfo,
  StatusList,
  StatusListItem,
  Typography,
} from '~/components'
import { usePolygonId, usePolygonIdCircuits } from '~/features/polygonid'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps } from '~/navigation/types'
import { Theme } from '~/styles/types'

export type PolygonIdStatusScreenParams = undefined

export type PolygonIdStatusScreenProps = MainStackScreenProps<'PolygonIdStatus'>

export const PolygonIdStatusScreen: React.FC<PolygonIdStatusScreenProps> = (
  props
) => {
  const { navigation } = props

  useEffect(() => {
    navigation.setOptions({
      title: 'Polygon ID Status',
    })
  }, [navigation])

  const {
    isPolygonIdReady,
    isWitnessReady,
    isManagerReady,
    isManagerInitialising,
    restartManager,
  } = usePolygonId()

  const { circuitStates, downloadAllCircuits } = usePolygonIdCircuits()

  const statusItems: StatusListItem[] = useMemo(
    () => [
      {
        label: isManagerInitialising ? 'Manager (initialising...)' : 'Manager',
        status: isManagerReady
          ? 'success'
          : isManagerInitialising
            ? 'processing'
            : 'error',
      },
      {
        label: 'Witness',
        status: isWitnessReady ? 'success' : 'error',
      },
    ],
    [isManagerInitialising, isManagerReady, isWitnessReady]
  )

  const circuitsStatusItems: StatusListItem[] = Object.entries(
    circuitStates
  ).map(([circuitId, circuitState]) => ({
    label: `${circuitId}${circuitState.status === 'DOWNLOADING' ? ' (downloading...)' : circuitState.status === 'UNAVAILABLE' ? ' (unavailable)' : ''}`,
    status:
      circuitState.status === 'AVAILABLE'
        ? 'success'
        : circuitState.status === 'DOWNLOADING'
          ? 'processing'
          : 'idle',
  }))

  const globalStatus = useMemo(
    () =>
      isPolygonIdReady
        ? 'success'
        : statusItems.some((status) => status.status === 'processing') ||
            circuitsStatusItems.some((status) => status.status === 'processing')
          ? 'processsing'
          : 'error',
    [isPolygonIdReady, statusItems, circuitsStatusItems]
  )

  const styles = useThemeAwareStyle(createStyles)

  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <StatusInfo
          statusType={globalStatus}
          title={
            globalStatus === 'success'
              ? 'Ready'
              : globalStatus === 'processsing'
                ? 'Initialising'
                : 'Something went wrong'
          }
          subtitle={
            globalStatus === 'success'
              ? 'You can use Polygon ID.'
              : globalStatus === 'processsing'
                ? 'Please wait, it can take moment.'
                : 'Try restarting the engine or re-downloading the circuits.'
          }
        />
        <ScrollView contentContainerStyle={styles.sectionContainer}>
          <View style={styles.section}>
            <Typography variant='h4'>Engine</Typography>
            <StatusList statusItems={statusItems} style={styles.statusList} />
          </View>
          <View style={styles.section}>
            <Typography variant='h4'>Circuits</Typography>
            <StatusList
              statusItems={circuitsStatusItems}
              style={styles.statusList}
            />
          </View>
        </ScrollView>
      </View>
      <BottomActionBar
        hideBorder
        actionsOrientation='column'
        actions={[
          {
            label: 'Restart engine',
            onPress: restartManager,
            color: 'grey',
          },
          {
            label: 'Re-download circuits',
            onPress: downloadAllCircuits,
            color: 'grey',
          },
        ]}
      />
    </ScreenWrapper>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: theme.spacing.l,
      paddingHorizontal: theme.spacing.m,
      gap: theme.spacing.l,
    },
    sectionContainer: {
      gap: theme.spacing.l,
    },
    section: {
      gap: theme.spacing.m,
    },
    statusList: {
      marginLeft: theme.spacing.m,
    },
  })

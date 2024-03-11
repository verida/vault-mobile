import React, { useEffect, useMemo } from 'react'
import { ScrollView, StyleSheet, View } from 'react-native'

import {
  BottomActionBar,
  CopyToClipboardButton,
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
      headerBackTitleVisible: false,
    })
  }, [navigation])

  const {
    isPolygonIdReady,
    isWitnessReady,
    isManagerReady,
    isManagerInitialising,
    isManagerInError,
    restartManager,
    manager,
  } = usePolygonId()

  const { circuitStates, areAnyCircuitsDownloading, downloadAllCircuits } =
    usePolygonIdCircuits()

  const statusItems: StatusListItem[] = useMemo(
    () => [
      {
        label: isManagerInitialising ? 'Manager (initialising...)' : 'Manager',
        status: isManagerReady
          ? 'success'
          : isManagerInitialising
            ? 'processing'
            : isManagerInError
              ? 'error'
              : 'idle',
      },
      {
        label: 'Witness',
        status: isWitnessReady ? 'success' : 'error',
      },
    ],
    [isManagerInitialising, isManagerInError, isManagerReady, isWitnessReady]
  )

  const circuitsStatusItems: StatusListItem[] = Object.entries(
    circuitStates
  ).map(([circuitId, circuitState]) => ({
    label: circuitId,
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

  const sharedContent = manager?.did?.string() ?? null

  const styles = useThemeAwareStyle(createStyles)

  return (
    <ScreenWrapper>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        alwaysBounceVertical={false}>
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
        <View style={styles.sharedContentContainer}>
          <View style={{ flex: 1 }}>
            <Typography numberOfLines={2} lineBreakMode='middle'>
              {sharedContent ?? 'No identifier yet'}
            </Typography>
          </View>
          <CopyToClipboardButton
            content={sharedContent ?? ''}
            disabled={!sharedContent}
          />
        </View>
        <View style={styles.sectionContainer}>
          <View style={styles.section}>
            <Typography variant='h4'>Engine</Typography>
            <StatusList statusItems={statusItems} style={styles.statusList} />
          </View>
          <View style={styles.section}>
            <Typography variant='h4'>{`Circuits${areAnyCircuitsDownloading ? ' (downloading...)' : ''}`}</Typography>
            <StatusList
              statusItems={circuitsStatusItems}
              style={styles.statusList}
            />
          </View>
        </View>
      </ScrollView>
      <BottomActionBar
        hideBorder
        actionsOrientation='row'
        actions={[
          {
            label: 'Restart engine',
            onPress: restartManager,
            color: 'grey',
          },
          {
            label: 'Download circuits',
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
    },
    contentContainer: {
      paddingTop: theme.spacing.l,
      paddingHorizontal: theme.spacing.m,
      gap: theme.spacing.m,
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
    sharedContentContainer: {
      paddingVertical: theme.spacing.sm,
      paddingHorizontal: theme.spacing.sm,
      borderRadius: theme.roundness.l,
      backgroundColor: theme.color.primary5,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.s,
    },
  })

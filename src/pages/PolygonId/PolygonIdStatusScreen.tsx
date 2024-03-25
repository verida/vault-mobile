import React, { useCallback, useEffect, useMemo } from 'react'
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
import {
  CircuitStatus,
  usePolygonId,
  usePolygonIdCircuits,
} from '~/features/polygonid'
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

  const {
    circuitStates,
    areAllCircuitsAvailable,
    areAnyCircuitsInError,
    areAnyCircuitsUnavailable,
    areAnyCircuitsDownloading,
    downloadCircuits,
  } = usePolygonIdCircuits()

  const handleRestartEngine = useCallback(async () => {
    await restartManager()
  }, [restartManager])

  const handleDownloadCircuits = useCallback(async () => {
    try {
      await downloadCircuits()
    } catch (error) {
      // TODO: Inform the user
      // It should not be a download error, but a could be an error if the download is already in progress
    }
  }, [downloadCircuits])

  const engineStatusItems: StatusListItem[] = useMemo(
    () => [
      {
        label: isManagerInitialising
          ? 'Manager (initialising...)'
          : !isManagerReady && !areAllCircuitsAvailable
            ? 'Manager (waiting circuits...)'
            : 'Manager',
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
    [
      isManagerInitialising,
      isManagerInError,
      isManagerReady,
      areAllCircuitsAvailable,
      isWitnessReady,
    ]
  )

  const circuitsStatusItems: StatusListItem[] = Object.entries(
    circuitStates
  ).map(([circuitId, circuitState]) => ({
    label: circuitId,
    status:
      circuitState.status === CircuitStatus.AVAILABLE
        ? 'success'
        : circuitState.status === CircuitStatus.DOWNLOADING
          ? 'processing'
          : circuitState.status === CircuitStatus.ERROR
            ? 'error'
            : 'idle',
  }))

  const globalStatus = useMemo(
    () =>
      isPolygonIdReady
        ? 'success'
        : engineStatusItems.some((status) => status.status === 'processing') ||
            circuitsStatusItems.some((status) => status.status === 'processing')
          ? 'processsing'
          : 'error',
    [isPolygonIdReady, engineStatusItems, circuitsStatusItems]
  )

  const globalStatusMessages = useMemo(
    (): { title: string; subtitle: string } =>
      globalStatus === 'success'
        ? { title: 'Ready', subtitle: 'You can use Polygon ID.' }
        : areAnyCircuitsInError
          ? {
              title: 'Circuits in error',
              subtitle: 'Try re-downloading the circuits.',
            }
          : isManagerInError
            ? {
                title: 'Manager in error',
                subtitle: 'Try restarting the engine.',
              }
            : globalStatus === 'processsing'
              ? {
                  title: 'Initialising',
                  subtitle: 'Please wait, it can take moment.',
                }
              : areAnyCircuitsUnavailable
                ? {
                    title: 'Circuits unavailable',
                    subtitle: 'Download the circuits.',
                  }
                : {
                    title: 'Something went wrong',
                    subtitle:
                      'Try restarting the engine or re-downloading the circuits.',
                  },
    [
      globalStatus,
      isManagerInError,
      areAnyCircuitsInError,
      areAnyCircuitsUnavailable,
    ]
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
          title={globalStatusMessages.title}
          subtitle={globalStatusMessages.subtitle}
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
            <StatusList
              statusItems={engineStatusItems}
              style={styles.statusList}
            />
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
            onPress: handleRestartEngine,
            color: 'grey',
          },
          {
            label: 'Download circuits',
            onPress: handleDownloadCircuits,
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

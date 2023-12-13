import {
  BottomActionBar,
  ScreenWrapper,
  StatusInfo,
  StatusList,
  StatusListItem,
} from 'components'
import { useTheme } from 'contexts'
import { useThemeAwareStyle } from 'hooks'
import React, { useEffect } from 'react'
import { StyleSheet, View } from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import { MainStackScreenProps } from 'navigation/types'
import { Theme } from 'styles/types'

export type MigrateIdentityExecutionScreenParams = undefined

type MigrateIdentityExecutionScreenProps =
  MainStackScreenProps<'MigrateIdentityExecution'>

export const MigrateIdentityExecutionScreen: React.FunctionComponent<MigrateIdentityExecutionScreenProps> =
  (props) => {
    const { navigation } = props

    const insets = useSafeAreaInsets()
    const { theme } = useTheme()
    const styles = useThemeAwareStyle(createStyles)

    useEffect(() => {
      navigation.setOptions({
        title: 'Migrate Identity',
        headerShown: false,
      })
    }, [navigation])

    const title = 'Migrating your Identity'
    const subtitle = 'Please wait, it can take a few minutes.'

    const statusItems: StatusListItem[] = [
      {
        label: 'Creating your Mainnet Identity',
        status: 'success',
      },
      {
        label: 'Connecting to your storage nodes',
        status: 'processing',
      },
      {
        label: 'Migrating your data',
        status: 'idle',
      },
    ]

    return (
      <ScreenWrapper>
        <View
          style={[
            styles.container,
            { paddingTop: insets.top + theme.spacing.l }, // TODO: allow fine-tuning insets in ScreenWrapper
          ]}>
          <StatusInfo
            statusType='processsing'
            title={title}
            subtitle={subtitle}
          />
          <StatusList statusItems={statusItems} style={styles.statusList} />
        </View>
        <BottomActionBar
          actions={[]}
          alertType='warning'
          alertContent={`Do not close the application`}
          // TODO: Allow fine-tunning BottomActionBar with optional actions, optional top border and action orientation configuration
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
    },
    statusList: {
      marginTop: theme.spacing.xxl,
    },
  })

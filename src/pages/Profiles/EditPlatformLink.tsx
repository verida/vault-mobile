import * as Sentry from '@sentry/react-native'
import { useTheme } from 'contexts'
import { emitter } from 'helpers/emitter'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import { Keyboard, StyleSheet, View } from 'react-native'
import PagerView from 'react-native-pager-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import DataConnectorsManager from 'api/DataConnectorsManager'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import {
  EnterPlatformLinkPage,
  EnterPlatformLinkPageRefProps,
} from 'components/PublicProfile'
import Screen from 'components/Screen'
import { PLATFORM_LINKS } from 'constants/profile'
import { NUNITO_SANS_BOLD } from 'constants/text'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { MainStackScreenProps } from 'navigation/types'
import { Theme } from 'styles/types'

enum PageType {
  AddSocialNetworkManually,
}

export interface EditPlatformLinkScreenParams {
  screenName: string
  mode: string | number
  originalValue?: any
  platform: string
}

type EditPlatformLinkScreenProps = MainStackScreenProps<'EditPlatformLink'>

const EditPlatformLink: React.FunctionComponent<EditPlatformLinkScreenProps> = (
  props
) => {
  const { navigation, route } = props
  const { screenName, mode, platform, originalValue } = route.params

  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()
  const { bottom } = useSafeAreaInsets()
  const [currentPage, setCurrentPage] = useState(
    PageType.AddSocialNetworkManually
  )
  const pagerRef = useRef<PagerView>(null)
  const [selectedNetwork, setSelectedNetwork] = useState<any>({}) // TODO: add type
  const [loading, setLoading] = useState(true)
  const enterPlatformLinkPageRef = useRef<EnterPlatformLinkPageRefProps>(null)

  const [connectors, setConnectors] = useState([])

  const availableSocicalNetworks = useMemo(
    () =>
      Object.values(PLATFORM_LINKS).filter(
        (network) =>
          !connectors.some(
            (cn) => cn.name === network.name && cn.syncStatus !== 'disabled'
          )
      ),
    [connectors]
  )

  useEffect(() => {
    platform && setSelectedNetwork(PLATFORM_LINKS[platform] as any)
  }, [platform])

  useEffect(() => {
    const load = async () => {
      function buildConnections(allConnectors: any) {
        const finalConnectors = []
        for (const connectorName in allConnectors) {
          finalConnectors.push(allConnectors[connectorName].render())
        }

        return finalConnectors
      }

      try {
        setLoading(true)
        DataConnectorsManager.triggerSync()

        const currentConnectors = await DataConnectorsManager.getConnectors()
        setConnectors(buildConnections(currentConnectors))

        DataConnectorsManager.on('connectionUpdated', async () => {
          // Connection has been updated, so update UI
          const conns = await DataConnectorsManager.getConnectors()
          setConnectors(buildConnections(conns))
        })

        DataConnectorsManager.on('logout', async () => {
          await DataConnectorsManager.resetConnector()
        })
      } catch (error) {
        Sentry.captureException(error)
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [])

  const getPageName = () => {
    switch (currentPage) {
      case PageType.AddSocialNetworkManually:
        return `Edit ${selectedNetwork.label}`
    }
  }

  const goBack = () => {
    navigation.goBack()
  }

  const isSupportedNetwork = (network: any) => {
    return connectors.some((cn) => cn.name === network.name)
  }

  const onSaveSocialNetworkHandle = (url: string) => {
    try {
      Keyboard.dismiss()

      // "category", "platform", "accountId", "url", "order"
      const val = {
        category: 'social',
        url: url,
        platform: selectedNetwork.name,
        accountId: url.split('/').pop(),
        order: 0,
        originalValue,
      }

      emitter.emit('SAVE_GENERIC_PROPERTY', {
        screenName,
        value: val,
        mode,
        originalValue,
      })

      navigation.goBack()
    } catch (error) {
      Sentry.captureException(error)
    }
  }

  return (
    <Screen
      navBar={
        <NavigationHeader title={getPageName()} left={{ icon: 'back' }} />
      }>
      <PagerView
        style={styles.pagerView}
        initialPage={currentPage}
        scrollEnabled={false}
        onPageSelected={(e) => {
          setCurrentPage(e.nativeEvent.position)
          if (e.nativeEvent.position === PageType.AddSocialNetworkManually) {
            enterPlatformLinkPageRef.current?.focusInput()
          }
        }}
        ref={pagerRef}>
        <View key={'AddSocialNetworkManually'}>
          <EnterPlatformLinkPage
            ref={enterPlatformLinkPageRef}
            socialNetwork={selectedNetwork}
            onSaveSocialNetworkHandle={onSaveSocialNetworkHandle}
            originalValue={originalValue}
          />
        </View>
      </PagerView>
    </Screen>
  )
}

export default EditPlatformLink

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    pagerView: {
      flex: 1,
    },
    container: {
      paddingHorizontal: theme.spacing.m,
      paddingVertical: theme.spacing.m,
    },
    connectionItem: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      minHeight: 64,
    },
    connectionItemIconLabel: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    iconSmall: { width: 48, height: 48, marginRight: 10 },
    iconBig: { width: 80, height: 80, marginBottom: theme.spacing.s },
    itemText: {
      fontSize: 18,
    },
    itemStatusText: {
      textTransform: 'uppercase',
      fontSize: 12,
      fontFamily: NUNITO_SANS_BOLD,
    },
  })

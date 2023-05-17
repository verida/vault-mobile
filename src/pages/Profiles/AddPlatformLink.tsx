import { StackActions } from '@react-navigation/native'
import * as Sentry from '@sentry/react-native'
import { useTheme } from 'contexts'
import { emitter } from 'helpers/emitter'
import React, { useEffect, useMemo, useRef, useState } from 'react'
import {
  Image,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import PagerView from 'react-native-pager-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'

import DataConnectorsManager from 'api/DataConnectorsManager'
import Button from 'components/Button'
import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { EnterPlatformLinkPage } from 'components/PublicProfile'
import Screen from 'components/Screen'
import { Text } from 'components/Typography/Text'
import { NUNITO_SANS_BOLD } from 'constants/text'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { MainStackScreenProps } from 'navigation/types'
import { Theme } from 'styles/types'

enum PageType {
  ListSocialNetworks,
  AddSocialNetwork,
  AddSocialNetworkManually,
}

const FacebookIcon = require('assets/social_icons/facebook.png')
const TwitterIcon = require('assets/social_icons/twitter.png')
const InstagramIcon = require('assets/social_icons/instagram.png')
const DiscordIcon = require('assets/social_icons/discord.png')
const LinkedinIcon = require('assets/social_icons/linkedin.png')
const TelegramIcon = require('assets/social_icons/telegram.png')
const GithubIcon = require('assets/social_icons/github.png')

const SOCIAL_NETWORKS = {
  facebook: {
    name: 'facebook',
    label: 'Facebook',
    icon: FacebookIcon,
    baseURL: 'https://facebook.com/',
  },
  twitter: {
    name: 'twitter',
    label: 'Twitter',
    icon: TwitterIcon,
    baseURL: 'https://twitter.com/',
  },
  instagram: {
    name: 'instagram',
    label: 'Instagram',
    icon: InstagramIcon,
    baseURL: 'https://instagram.com/',
  },
  discord: {
    name: 'discord',
    label: 'Discord',
    icon: DiscordIcon,
    baseURL: 'https://discord.com/',
  },
  linkedin: {
    name: 'linkedin',
    label: 'Linkedin',
    icon: LinkedinIcon,
    baseURL: 'https://linkedin.com/in/',
  },
  telegram: {
    name: 'telegram',
    label: 'Telegram',
    icon: TelegramIcon,
    baseURL: 'https://telegram.com/',
  },
  github: {
    name: 'github',
    label: 'Github',
    icon: GithubIcon,
    baseURL: 'https://github.com/',
  },
}

export interface AddPlatformLinkScreenParams {
  screenName: string
  title?: string
  label?: string
  url?: string
  mode: string | number
  originalValue?: any
  submitButtonLabel?: string
  verification?: {
    expectedValue: string
    errorMessage: string
  }
}

type AddPlatformLinkScreenProps = MainStackScreenProps<'AddPlatformLink'>

const AddPlatformLink: React.FunctionComponent<AddPlatformLinkScreenProps> = (
  props
) => {
  const { navigation, route } = props
  const {
    screenName,
    title,
    label,
    url,
    mode,
    originalValue,
    submitButtonLabel = 'Save',
  } = route.params

  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()
  const { bottom } = useSafeAreaInsets()
  const [currentPage, setCurrentPage] = useState(PageType.ListSocialNetworks)
  const pagerRef = useRef<PagerView>(null)
  const [labelInput, setLabelInput] = useState(originalValue?.label ?? '')
  const [urlInput, setUrlInput] = useState(originalValue?.url ?? '')
  const [selectedNetwork, setSelectedNetwork] = useState({ label: 'Twitter' })
  const [loading, setLoading] = useState(true)

  const [connectors, setConnectors] = useState([])

  const availableSocicalNetworks = useMemo(
    () =>
      Object.values(SOCIAL_NETWORKS).filter(
        (network) =>
          !connectors.some(
            (cn) => cn.name === network.name && cn.syncStatus !== 'disabled'
          )
      ),
    [connectors]
  )

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
      case PageType.ListSocialNetworks:
        return 'Add new social'
      case PageType.AddSocialNetwork:
        return selectedNetwork.label
      case PageType.AddSocialNetworkManually:
        return `Add ${selectedNetwork.label}`
    }
  }

  const goBack = () => {
    if (currentPage > 0) {
      if (isSupportedNetwork(selectedNetwork)) {
        pagerRef.current?.setPage(currentPage - 1)
      } else {
        pagerRef.current?.setPage(PageType.ListSocialNetworks)
      }
    } else {
      navigation.goBack()
    }
  }

  const isSupportedNetwork = (network: any) => {
    return connectors.some((cn) => cn.name === network.name)
  }

  const onAddSocialNetworkHandle = (url: string) => {
    try {
      Keyboard.dismiss()

      // "category", "platform", "accountId", "url", "order"
      const val = {
        category: 'social',
        url: url,
        platform: selectedNetwork.name,
        accountId: url.split('/').pop(),
        order: 0,
      }

      emitter.emit('SAVE_GENERIC_PROPERTY', {
        screenName,
        title,
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
        <NavigationHeader
          title={getPageName()}
          left={{
            icon:
              currentPage === PageType.ListSocialNetworks ? 'close' : 'back',
            action: () => {
              goBack()
            },
          }}
        />
      }>
      <PagerView
        style={styles.pagerView}
        initialPage={currentPage}
        scrollEnabled={false}
        onPageSelected={(e) => {
          setCurrentPage(e.nativeEvent.position)
        }}
        ref={pagerRef}>
        <View key={'ListSocialNetworks'}>
          {loading ? (
            <LoadingView />
          ) : (
            <View style={styles.container}>
              {availableSocicalNetworks.map((item) => {
                return (
                  <TouchableOpacity
                    key={item.name}
                    onPress={() => {
                      setSelectedNetwork(item)
                      pagerRef.current?.setPage(
                        isSupportedNetwork(item)
                          ? PageType.AddSocialNetwork
                          : PageType.AddSocialNetworkManually
                      )
                    }}
                    style={styles.connectionItem}>
                    <View style={styles.connectionItemIconLabel}>
                      <Image style={styles.iconSmall} source={item.icon} />
                      <Text style={styles.itemText}>{item.label}</Text>
                    </View>
                  </TouchableOpacity>
                )
              })}
            </View>
          )}
        </View>
        <View key={'AddSocialNetwork'}>
          {isSupportedNetwork(selectedNetwork) ? (
            <View style={styles.container}>
              <View
                style={{
                  alignSelf: 'center',
                  alignItems: 'center',
                  marginBottom: theme.spacing.xl,
                }}>
                <Image style={styles.iconBig} source={selectedNetwork.icon} />
                <Text style={styles.itemText}>{selectedNetwork.label}</Text>
              </View>
              <Button
                onPress={() => {
                  // navigation.goBack()
                  navigation.dispatch(
                    StackActions.replace('SingleConnection', {
                      provider: selectedNetwork.name,
                    })
                  )
                }}>
                Connect
              </Button>
              <Button
                onPress={() => {
                  pagerRef.current?.setPage(PageType.AddSocialNetworkManually)
                }}
                color={'transparent-border'}>
                Enter URL manually
              </Button>
            </View>
          ) : null}
        </View>
        <View key={'AddSocialNetworkManually'}>
          <EnterPlatformLinkPage
            socialNetwork={selectedNetwork}
            onAddSocialNetworkHandle={onAddSocialNetworkHandle}
          />
        </View>
      </PagerView>
    </Screen>
  )
}

export default AddPlatformLink

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
      marginBottom: theme.spacing.m,
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

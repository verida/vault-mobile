import { StackActions } from '@react-navigation/native'
import Color from 'color'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert,
  Image,
  Keyboard,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import PagerView from 'react-native-pager-view'

import { Icon, ScreenWrapper } from '~/components'
import Button from '~/components/Button'
import {
  EnterPlatformLinkView,
  EnterPlatformLinkViewRefProps,
} from '~/components/PublicProfile'
import { Text } from '~/components/Typography/Text'
import { HIT_SLOP_10_10 } from '~/constants'
import { NUNITO_SANS_BOLD } from '~/constants/text'
import { useTheme } from '~/contexts'
import { Logger } from '~/features/telemetry'
import {
  VeridaOnePlatformLink,
  VeridaOnePlatformLinkCategory,
  VeridaOnePlatformMetadata,
} from '~/features/veridaOne'
import { emitter } from '~/helpers/emitter'
import { useThemeAwareStyle } from '~/hooks/useThemeAwareStyle'
import { MainStackScreenProps } from '~/navigation/types'
import { Theme } from '~/styles/types'

const logger = Logger.create('Pages/Profiles/AddPlatformLink')

enum PageType {
  ListSocialNetworks,
  AddSocialNetwork,
  AddSocialNetworkManually,
}

export type AddVeridaOnePlatformLinkScreenParams = {
  screenName: string
  mode: string | number
  originalValue?: any
  supportedConnectPlatforms: any[] // Type
  availablePlatformLinks: VeridaOnePlatformMetadata[]
}

type AddVeridaOnePlatformLinkScreenProps =
  MainStackScreenProps<'AddVeridaOnePlatformLink'>

export const AddVeridaOnePlatformLinkScreen: React.FunctionComponent<
  AddVeridaOnePlatformLinkScreenProps
> = (props) => {
  const { navigation, route } = props
  const {
    screenName,
    mode,
    originalValue,
    supportedConnectPlatforms,
    availablePlatformLinks,
  } = route.params

  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()
  const [currentPage, setCurrentPage] = useState(PageType.ListSocialNetworks)
  const pagerRef = useRef<PagerView>(null)
  const [selectedNetwork, setSelectedNetwork] = useState<any>({}) // TODO: add type
  const enterPlatformLinkPageRef = useRef<EnterPlatformLinkViewRefProps>(null)

  const getPageName = useCallback(() => {
    switch (currentPage) {
      case PageType.ListSocialNetworks:
        return 'Add new social'
      case PageType.AddSocialNetwork:
        return selectedNetwork.label
      case PageType.AddSocialNetworkManually:
        return `Add ${selectedNetwork.label}`
    }
  }, [currentPage, selectedNetwork])

  const isSupportedNetwork = useCallback(
    (network: any) => {
      return supportedConnectPlatforms.some((cn) => cn.name === network.name)
    },
    [supportedConnectPlatforms]
  )

  const goBack = useCallback(() => {
    if (currentPage > 0) {
      if (isSupportedNetwork(selectedNetwork)) {
        pagerRef.current?.setPage(currentPage - 1)
      } else {
        pagerRef.current?.setPage(PageType.ListSocialNetworks)
      }
    } else {
      navigation.goBack()
    }
  }, [navigation, currentPage, selectedNetwork, isSupportedNetwork])

  const onSaveSocialNetworkHandle = useCallback(
    (url: string) => {
      try {
        Keyboard.dismiss()
        if (!url?.length) {
          Alert.alert('Error', 'The URL must not be empty')
        }

        const cleanUrl = url.replace(/(\s)|(\/+$)/, '')
        const cleanUsername = cleanUrl.split('/').pop()

        const val: VeridaOnePlatformLink = {
          category: VeridaOnePlatformLinkCategory.SOCIAL,
          url: cleanUrl,
          platform: selectedNetwork.name,
          accountId: cleanUsername!,
          order: 0,
        }

        emitter.emit('SAVE_GENERIC_PROPERTY', {
          screenName,
          value: val,
          mode,
          originalValue,
        })

        navigation.goBack()
      } catch (error) {
        logger.error(error)
      }
    },
    [mode, navigation, originalValue, screenName, selectedNetwork.name]
  )

  useEffect(() => {
    navigation.setOptions({
      title: getPageName(),
      headerLeft: () => (
        <TouchableOpacity
          onPress={goBack}
          hitSlop={HIT_SLOP_10_10}
          style={styles.headerLeftButton}>
          {currentPage === PageType.ListSocialNetworks ? (
            <Icon name='close' size={24} color={theme.color.onBackground} />
          ) : (
            <Icon name='back' size={24} color={theme.color.onBackground} />
          )}
        </TouchableOpacity>
      ),
    })
  }, [
    navigation,
    getPageName,
    goBack,
    currentPage,
    styles.headerLeftButton,
    theme,
  ])

  return (
    <ScreenWrapper isModal keyboardAvoiding>
      <PagerView
        // FIXME: bottom bar blink when the keyboard appears. Remove the footer button from within each Page and move it in a BottomActionBar at the same level as the PagerView.
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
        <View key={'ListSocialNetworks'}>
          <View style={styles.container}>
            {availablePlatformLinks.map((item) => {
              // TODO: Use a flat list instead
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
                  <Icon
                    size={22}
                    name='chevron-forward'
                    color={Color(theme.color.onBackground)
                      .alpha(0.45)
                      .toString()}
                  />
                </TouchableOpacity>
              )
            })}
          </View>
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
                  navigation.dispatch(
                    StackActions.replace('SingleConnection', {
                      provider: selectedNetwork.name,
                      connectNow: true,
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
          <EnterPlatformLinkView
            ref={enterPlatformLinkPageRef}
            platformLink={selectedNetwork}
            onSaveSocialNetworkHandle={onSaveSocialNetworkHandle}
          />
        </View>
      </PagerView>
    </ScreenWrapper>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    headerLeftButton: {
      marginLeft: theme.spacing.m,
    },
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
    iconSmall: { width: 48, height: 48, borderRadius: 24, marginRight: 10 },
    iconBig: {
      width: 80,
      height: 80,
      borderRadius: 40,
      marginBottom: theme.spacing.s,
    },
    itemText: {
      fontSize: 18,
    },
    itemStatusText: {
      textTransform: 'uppercase',
      fontSize: 12,
      fontFamily: NUNITO_SANS_BOLD,
    },
  })

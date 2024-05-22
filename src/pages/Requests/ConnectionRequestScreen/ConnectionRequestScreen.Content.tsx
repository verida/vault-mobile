import { useNavigation } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import { Button as ButtonNativeBase, Icon as IconNativeBase } from 'native-base'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import {
  ScrollView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native'
import PagerView from 'react-native-pager-view'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import Feather from 'react-native-vector-icons/Feather'

import {
  Avatar,
  BottomActionBar,
  RequestDetailProperty,
  RequestDetails,
  RequestMessage,
  StatusInfo,
  Typography,
  WalletSelectorButton,
  WalletSelectorButtonProps,
} from '~/components'
import { CryptoWalletList } from '~/components/CryptoWallet'
import {
  LegacyCryptoWallet,
  selectCryptoWallet,
  useSelectedCryptoWalletId,
} from '~/features/cryptoWallet'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackParams } from '~/navigation/types'
import { useAppDispatch } from '~/reduxStore/types'
import { Theme } from '~/styles/types'

import { ConnectionRequestScreenParams } from './ConnectionRequestScreen'

enum PageType {
  ConnectionRequest,
  SelectWallet,
  ConnectionRequestResult,
}

export const ConnectionRequestScreenContent = React.memo(
  function ConnectionRequestScreenContent({
    params,
    processing,
    error,
    errorMessage,
    success,
    processButtonDisabled,
    detailProperties,
    maybeWalletSelectorButtonProps,
    handleConnect,
    handleReject,
    handleAlertProcess,
  }: {
    params: ConnectionRequestScreenParams
    processing: boolean
    error: boolean
    errorMessage: string | undefined
    success: boolean
    processButtonDisabled: boolean
    detailProperties: RequestDetailProperty[]
    maybeWalletSelectorButtonProps?: WalletSelectorButtonProps | null
    handleConnect: () => Promise<void>
    handleReject: () => Promise<void> | void
    handleAlertProcess: () => void
  }): JSX.Element {
    const { name, logo, details } = params
    const styles = useThemeAwareStyle(createStyles)
    const selectedCryptoWalletId = useSelectedCryptoWalletId()
    const dispatch = useAppDispatch()
    const navigation =
      useNavigation<NativeStackNavigationProp<MainStackParams>>()
    const [currentPage, setCurrentPage] = useState<PageType>(
      PageType.ConnectionRequest
    )
    const [erroMessage] = useState<string | undefined>()
    const [detailsOpen, setDetailsOpen] = useState(false)
    const [previousWalletId, setPreviousWalletId] = useState<string | null>(
      selectedCryptoWalletId
    )
    const pagerRef = useRef<PagerView>(null)
    const insets = useSafeAreaInsets()

    const handleToggleDetails = () => {
      setDetailsOpen((prevValue) => !prevValue)
    }

    const handleWalletSelection = async (item: LegacyCryptoWallet) => {
      dispatch(await selectCryptoWallet(item.id))
    }

    const handleWalletSelectorButton = () => {
      setPreviousWalletId(selectedCryptoWalletId)
      pagerRef.current?.setPage(PageType.SelectWallet)
    }

    const handleConfirmWalletSelect = () => {
      pagerRef.current?.setPage(PageType.ConnectionRequest)
    }

    const handleRejectWalletSelect = useCallback(async () => {
      if (previousWalletId) {
        dispatch(await selectCryptoWallet(previousWalletId))
      }
      pagerRef.current?.setPage(PageType.ConnectionRequest)
    }, [dispatch, previousWalletId])

    // const maybeWalletSelectorButtonProps = useMaybeWalletSelectorButtonProps({
    //   aggregateWalletBannerBalance,
    //   resource: chainId,
    // })

    useEffect(() => {
      if (currentPage === PageType.SelectWallet) {
        navigation.setOptions({
          title: 'Select a Wallet',
          headerRight: () => (
            <ButtonNativeBase transparent onPress={handleRejectWalletSelect}>
              <IconNativeBase name='close' style={{ color: '#000' }} />
            </ButtonNativeBase>
          ),
        })
      } else if (currentPage === PageType.ConnectionRequest) {
        navigation.setOptions({
          title: 'Connection Request',
          headerRight: () => (
            <ButtonNativeBase transparent onPress={handleReject}>
              <IconNativeBase name='close' style={{ color: '#000' }} />
            </ButtonNativeBase>
          ),
        })
      }
    }, [navigation, handleRejectWalletSelect, handleReject, currentPage])

    useEffect(() => {
      if ((success || processing || error) && pagerRef.current) {
        pagerRef.current.setPage(PageType.ConnectionRequestResult)
      }
    }, [success, processing, error, pagerRef])

    return (
      <>
        <StatusBar barStyle='light-content' />
        <PagerView
          initialPage={currentPage}
          style={styles.pagerView}
          ref={pagerRef}
          onPageSelected={(e) => {
            setCurrentPage(e.nativeEvent.position)
          }}>
          <View
            key={`ConnectionRequest`}
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
              <Avatar source={logo} fallbackType='person' style={styles.logo} />
              {details.url ? (
                <Typography variant='bodySemiBold' style={styles.url}>
                  {details.url}
                </Typography>
              ) : null}
              <Typography
                variant='h2'
                style={
                  styles.connectMessage
                }>{`Connect to ${name}`}</Typography>
              {details.message ? (
                <RequestMessage style={styles.messageContainer}>
                  {details.message}
                </RequestMessage>
              ) : null}

              <TouchableOpacity
                onPress={handleToggleDetails}
                style={styles.detailsButton}>
                <Typography
                  variant='bodySemiBold'
                  style={styles.detailsButtonLabel}>
                  Request details
                </Typography>
                <Feather
                  name={detailsOpen ? 'chevron-up' : 'chevron-down'}
                  size={16}
                  style={styles.detailsButtonLabelIcon}
                />
              </TouchableOpacity>

              {detailsOpen ? (
                <RequestDetails
                  properties={detailProperties}
                  style={styles.detailsContainer}
                />
              ) : null}
              {maybeWalletSelectorButtonProps && (
                <TouchableOpacity
                  onPress={handleWalletSelectorButton}
                  style={styles.walletSelectorButton}>
                  <WalletSelectorButton {...maybeWalletSelectorButtonProps} />
                </TouchableOpacity>
              )}
            </ScrollView>
            <BottomActionBar
              alertType='error'
              alertContent={errorMessage}
              alertOnPress={handleAlertProcess}
              actions={[
                {
                  label: 'Decline',
                  onPress: handleReject,
                  color: 'grey',
                },
                {
                  label: 'Connect',
                  onPress: handleConnect,
                  disabled: processButtonDisabled,
                },
              ]}
            />
          </View>
          <View key={`SelectWallet`}>
            <CryptoWalletList
              style={styles.walletListContainer}
              onPressItem={handleWalletSelection}
            />
            <BottomActionBar
              actions={[
                {
                  label: 'Confirm Selection',
                  onPress: handleConfirmWalletSelect,
                  disabled: false,
                },
              ]}
            />
          </View>
          <View key={`ConnectionRequestResult`}>
            <View style={styles.container}>
              <StatusInfo
                style={styles.statusContainer}
                statusType={
                  processing ? 'processsing' : success ? 'success' : 'error'
                }
                title={
                  processing ? 'Connecting...' : success ? 'Success!' : 'Error!'
                }
                subtitle={
                  processing
                    ? 'Please wait a moment, we are securely setting up the connection.'
                    : success
                      ? `You are successfully connected to ${name}.`
                      : erroMessage || 'Something went wrong. Try again later.'
                }
              />
            </View>
            <BottomActionBar
              alertType='error'
              alertContent={errorMessage}
              alertOnPress={handleAlertProcess}
              actions={[
                {
                  label: 'Done',
                  onPress: handleReject,
                  disabled: processing,
                },
              ]}
            />
          </View>
        </PagerView>
      </>
    )
  }
)

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    pagerView: {
      flex: 1,
    },
    wrapper: {
      flex: 1,
      backgroundColor: theme.color.background,
    },
    container: {
      flex: 1,
    },
    containerContent: {
      paddingTop: theme.spacing.xxxxl,
      paddingBottom: theme.spacing.m,
      paddingHorizontal: theme.spacing.m,
      alignItems: 'center',
    },
    logo: {
      height: 72,
      aspectRatio: 1 / 1,
      borderRadius: theme.roundness.full,
    },
    url: {
      marginTop: theme.spacing.s,
      color: theme.color.textLightGrey,
    },
    connectMessage: {
      marginTop: theme.spacing.sm,
    },
    messageContainer: {
      marginTop: theme.spacing.m,
      width: '100%',
    },
    detailsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      marginTop: theme.spacing.m,
      paddingVertical: theme.spacing.xs,
      paddingHorizontal: theme.spacing.sm,
      borderWidth: 1,
      borderRadius: theme.roundness.full,
      borderColor: theme.color.lightGrey,
    },
    detailsButtonLabel: {
      color: theme.color.textLightGrey,
    },
    detailsButtonLabelIcon: {
      marginLeft: theme.spacing.xs,
      color: theme.color.textLightGrey,
    },
    detailsContainer: {
      marginTop: theme.spacing.sm,
      width: '100%',
    },
    statusContainer: {
      marginTop: theme.spacing.xxl,
    },
    walletListContainer: {
      width: '100%',
    },
    walletSelectorButton: {
      marginTop: theme.spacing.sm,
      width: '100%',
    },
  })

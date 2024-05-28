import PINCode, { hasUserSetPinCode } from '@haskkor/react-native-pincode'
import React, { useCallback, useEffect, useRef, useState } from 'react'
import { StyleSheet, View } from 'react-native'
import PagerView from 'react-native-pager-view'

import AccountManager from '~/api/AccountManager'
import PrivateKeyIllustration from '~/assets/private_key_illustration.svg'
import SeedPhraseIllustration from '~/assets/seed_phrase_illustration.svg'
import {
  Alert,
  BottomActionBar,
  CopyToClipboardButton,
  ScreenWrapper,
  Typography,
} from '~/components'
import { Checkbox } from '~/components/Input'
import { useTheme } from '~/contexts'
import { useCryptoWallets } from '~/features/cryptoWallet'
import { Logger } from '~/features/telemetry'
import { useThemeAwareStyle } from '~/hooks'
import { MainStackScreenProps, useScreenCaptureProtection } from '~/navigation'
import { Theme } from '~/styles/types'

const logger = Logger.create('DisplayPrivateInfoScreen')

enum PageType {
  Warning,
  AuthCheck,
  PrivateInfoDisplay,
}

export type DisplayPrivateInfoScreenParams = {
  // Intentionally not passing the private info via screen params to prevent
  // any leaks (Sentry, logs, Flipper, etc.)
  sourceId?: string
  noAuthCheck?: boolean
} & (
  | {
      source: 'currentVeridaDid'
      type: 'recoveryPhrase'
    }
  | {
      source: 'cryptoWallet'
      type: 'recoveryPhrase' | 'privateKey'
    }
)

type DisplayPrivateInfoScreenProps = MainStackScreenProps<'DisplayPrivateInfo'>

export const DisplayPrivateInfoScreen: React.FC<
  DisplayPrivateInfoScreenProps
> = (props) => {
  const {
    navigation,
    route: { params },
  } = props
  const { type, source, sourceId, noAuthCheck = false } = params

  useScreenCaptureProtection()

  const pagerRef = useRef<PagerView>(null)
  const [currentPage, setCurrentPage] = useState(PageType.Warning)
  const [isWarningCheckboxChecked, setIsWarningCheckboxChecked] =
    useState(false)
  const [privateInfo, setPrivateInfo] = useState('')

  useEffect(() => {
    pagerRef.current?.setPage(currentPage)
  }, [currentPage])

  useEffect(() => {
    navigation.setOptions({
      title:
        type === 'recoveryPhrase'
          ? 'Seed Phrase'
          : type === 'privateKey'
            ? 'Private Key'
            : 'Private Information',
    })
  }, [navigation, type])

  const cryptoWallets = useCryptoWallets()
  const cryptoWallet =
    source === 'cryptoWallet' && type === 'recoveryPhrase' && sourceId
      ? cryptoWallets.find((wallet) => wallet.id === sourceId)
      : source === 'cryptoWallet' && type === 'privateKey' && sourceId
        ? cryptoWallets.find((wallet) => {
            return !!wallet.accounts.find(
              (account) => account.address === sourceId
            )
          })
        : undefined

  useEffect(() => {
    async function getPrivateInfo() {
      if (source === 'currentVeridaDid') {
        const account = AccountManager.getInstance().getSelectedAccount()
        setPrivateInfo(account?.mnemonic || '')
        return
      }
      if (source === 'cryptoWallet' && cryptoWallet) {
        if (type === 'recoveryPhrase') {
          setPrivateInfo(cryptoWallet.mnemonic || '')
          return
        }
        if (type === 'privateKey') {
          const account = cryptoWallet.accounts.find(
            (acc) => acc.address === sourceId
          )
          setPrivateInfo(account?.privateKey || '')
          return
        }
      }
    }

    getPrivateInfo().catch((error) => {
      logger.error(new Error('Failed to get private info', { cause: error }))
    })
  }, [source, type, sourceId, cryptoWallet])

  const handleToggleWarningCheckboxPress = useCallback(() => {
    setIsWarningCheckboxChecked((prev) => !prev)
  }, [])

  const handleClose = useCallback(() => {
    navigation.goBack()
  }, [navigation])

  const handleGoToAuthCheck = useCallback(async () => {
    // TODO: Handle biometric as well
    const isPinCodeSet = await hasUserSetPinCode()
    if (!isPinCodeSet || noAuthCheck) {
      setCurrentPage(PageType.PrivateInfoDisplay)
    } else {
      setCurrentPage(PageType.AuthCheck)
    }
  }, [noAuthCheck])

  const handlePinCheckSuccessful = useCallback(() => {
    setCurrentPage(PageType.PrivateInfoDisplay)
  }, [])

  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()

  return (
    <ScreenWrapper isModal>
      <PagerView
        ref={pagerRef}
        initialPage={currentPage}
        scrollEnabled={false}
        style={styles.pagerView}>
        <View key='Warning' style={styles.container}>
          <View style={styles.warningPageContainer}>
            <View style={styles.warningContent}>
              {type === 'recoveryPhrase' ? (
                <SeedPhraseIllustration style={styles.warningIllustration} />
              ) : (
                <PrivateKeyIllustration style={styles.warningIllustration} />
              )}
              {type === 'recoveryPhrase' ? (
                <>
                  <Typography>
                    Your seed phrase is the only way to recover access to your
                    account.
                  </Typography>
                  <Typography>
                    Make a backup of your seed phrase and store it securely.
                  </Typography>
                </>
              ) : (
                <>
                  <Typography>
                    Your private key is a very sensitive information as it
                    allows to control your account.
                  </Typography>
                  <Typography>
                    It can be used to import your crypto account into other
                    crypto wallets.
                  </Typography>
                </>
              )}
              <Typography>Verida will never ask you to share it.</Typography>
              <Alert type='warning'>
                <Typography variant='h5SemiBold'>
                  {`Never share your ${type === 'recoveryPhrase' ? 'seed phrase' : 'private key'} with anyone`}
                </Typography>
              </Alert>
            </View>
            <View>
              <Checkbox
                checked={isWarningCheckboxChecked}
                onToggle={handleToggleWarningCheckboxPress}>
                <Typography variant='h5SemiBold'>
                  I understand the risks
                </Typography>
              </Checkbox>
            </View>
          </View>
        </View>
        <View key='AuthCheck' style={styles.container}>
          <PINCode
            // TODO: Create a dedicated PIN component setting our custom style
            status={'enter'}
            titleEnter={'Enter your PIN'}
            finishProcess={handlePinCheckSuccessful}
            colorCircleButtons='#dfe1e8'
            stylePinCodeColorTitle={theme.color.black}
            stylePinCodeColorSubtitle={theme.color.black}
            stylePinCodeButtonNumber={theme.color.black}
            stylePinCodeDeleteButtonSize={45}
            stylePinCodeCircle={{ height: 10, width: 10, borderRadius: 5 }}
          />
        </View>
        <View key='PrivateInfoDisplay' style={styles.container}>
          <View style={styles.displayPageContainer}>
            <Typography variant='h5SemiBold'>
              {source === 'currentVeridaDid'
                ? 'The seed phrase for your Verida Identity is:'
                : source === 'cryptoWallet' && type === 'recoveryPhrase'
                  ? 'The seed phrase for your crypto wallet is:'
                  : 'The private key for your crypto wallet is:'}
            </Typography>
            <View style={styles.privateInfoContainer}>
              <View style={styles.privateInfoWrapper}>
                <Typography variant='h4' style={styles.privateInfoText}>
                  {privateInfo}
                </Typography>
              </View>
              <CopyToClipboardButton content={privateInfo} />
            </View>
            <Alert type='warning'>
              Caution when copying to the clipboard, as your clipboard history
              can be accessed by other applications. Prefer to write it down
              manually.
            </Alert>
          </View>
        </View>
      </PagerView>
      <BottomActionBar
        hideBorder
        actions={
          currentPage === PageType.Warning
            ? [
                {
                  label: `Show${
                    type === 'recoveryPhrase'
                      ? ' Seed Phrase'
                      : type === 'privateKey'
                        ? ' Private Key'
                        : ''
                  }`,
                  onPress: handleGoToAuthCheck,
                  disabled: !isWarningCheckboxChecked,
                },
              ]
            : currentPage === PageType.AuthCheck
              ? [
                  {
                    label: 'Cancel',
                    onPress: handleClose,
                    variant: 'secondary',
                  },
                ]
              : currentPage === PageType.PrivateInfoDisplay
                ? [
                    {
                      label: 'Close',
                      onPress: handleClose,
                      variant: 'secondary',
                    },
                  ]
                : []
        }
      />
    </ScreenWrapper>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    pagerView: {
      flex: 1,
    },
    container: {
      flex: 1,
    },
    warningPageContainer: {
      flex: 1,
      paddingHorizontal: theme.spacing.m,
    },
    warningContent: {
      flex: 1,
      gap: theme.spacing.l,
    },
    warningIllustration: {
      alignSelf: 'center',
      marginVertical: theme.spacing.l,
    },
    warningCheckboxButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: theme.spacing.s,
    },
    displayPageContainer: {
      flex: 1,
      padding: theme.spacing.m,
      paddingTop: theme.spacing.xl,
      gap: theme.spacing.xl,
    },
    privateInfoContainer: {
      paddingVertical: theme.spacing.l,
      paddingHorizontal: theme.spacing.m,
      borderRadius: theme.roundness.l,
      backgroundColor: theme.color.primary5,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: theme.spacing.s,
    },
    privateInfoWrapper: {
      flex: 1,
    },
    privateInfoText: {
      fontFamily: theme.fontFamily.regular,
    },
  })

import { useNavigation } from '@react-navigation/native'
import StorageEngineVerida from '@verida/client-rn/dist/src/context/engines/verida/database/engine'
import EncryptionUtils from '@verida/encryption-utils'
import { AuthContext, AuthTypeConfig, EnvironmentType } from '@verida/types'
import didJWT from 'did-jwt'
import { capitalize } from 'lodash'
import moment from 'moment'
import { Container, Content, Icon } from 'native-base'
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Linking, StyleSheet, View } from 'react-native'

import AccountManager from '~/api/AccountManager'
import MobileSvg from '~/assets/mobile.svg'
import { Alert as AlertBanner } from '~/components'
import AppLogo from '~/components/AppLogo'
import Button from '~/components/Button'
import CountDownText from '~/components/CountDownText'
import CustomFooter from '~/components/Layouts/CustomFooter'
import LoadingView from '~/components/LoadingView'
import Text from '~/components/Text'
import {
  BLACK_COLOR_OPACITY,
  ORANGE_COLOR,
  PRIMARY_COLOR,
  SUCCESS_COLOR,
  WARNING_COLOR,
} from '~/constants/color'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '~/constants/text'
import { getNetworkFromDID, selectSelectedAccount } from '~/features/identities'
import { Logger } from '~/features/telemetry'
import { isNetworkCompatibleForConnect } from '~/features/veridaConnect'
import { useWalletConnectProtocolHandler } from '~/features/walletConnect'
import { MainStackScreenProps } from '~/navigation'
import { useAppSelector } from '~/reduxStore/types'

const logger = Logger.create('Pages/Login/LoginRequest')

export type LoginRequestScreenParams = {
  _k: string
  _r: string
}

type LoginRequestScreenProps = MainStackScreenProps<'LoginRequest'>

export const LoginRequestScreen: React.FC<LoginRequestScreenProps> = (
  props
) => {
  const {
    route: { params },
  } = props
  const navigation = useNavigation()

  useEffect(() => {
    navigation.setOptions({
      title: 'Login Request',
    })
  }, [navigation])

  const [status, setStatus] = useState<string>('loading')
  const [info, setInfo] = useState<Record<string, any>>({})
  const [expiry, setExpiry] = useState<number>(0)
  const [expired, setExpired] = useState(false)
  const [errorMessage, setErrorMessage] = useState<Record<string, any> | null>(
    null
  )
  const [ws, setWebsocket] = useState<WebSocket | null>(null)

  const currentIdentity = useAppSelector(selectSelectedAccount)
  const currentIdentityNetwork = currentIdentity?.did
    ? getNetworkFromDID(currentIdentity.did)
    : null

  const hasNetworkInRequest = !!info.network

  const compatibleNetwork =
    !currentIdentityNetwork || !hasNetworkInRequest
      ? 'unknown'
      : isNetworkCompatibleForConnect(currentIdentityNetwork, info.network)
        ? 'compatible'
        : 'incompatible'

  const { handleDeepLink } = useWalletConnectProtocolHandler()

  useEffect(() => {
    const init = async () => {
      const { _k, _r }: { _k: string | undefined; _r: string | undefined } =
        params
      const key = _k
      const didJwt = _r
      const decoded = didJWT.decodeJWT(didJwt)
      const payload = decoded.payload
      const _expiry = payload.exp
      setExpiry((_expiry || 0) * 1000)

      const socketUri = payload.data.authUri
      const sessionId = payload.data.session
      const websocket = new WebSocket(socketUri)
      setWebsocket(websocket)

      websocket.onopen = () => {
        websocket.send(
          JSON.stringify({
            type: 'getSession',
            data: {
              sessionId: sessionId,
            },
          })
        )
      }

      websocket.onmessage = (event) => {
        const message = JSON.parse(event.data)

        if (message.type === 'error') {
          setErrorMessage({
            message: message.message,
            heading: 'Security Error',
            type: 'error',
            color: '#FF3B30',
            iconName: 'exclamationcircleo',
          })
          setInfo({
            payload,
          })
          setStatus('error')

          return
        }

        switch (message.type) {
          case 'auth-session':
            try {
              const request = message.message
              const keyBytes = Buffer.from(key.slice(2), 'hex')
              const decrypted = EncryptionUtils.symDecrypt(
                request.request,
                keyBytes
              )
              const parsed = JSON.parse(decrypted)

              setInfo({
                request,
                payload,
                params: parsed,
                _expiry,
                key,
                network:
                  parsed.environment === EnvironmentType.MAINNET
                    ? EnvironmentType.MAINNET
                    : parsed.environment === EnvironmentType.TESTNET
                      ? EnvironmentType.TESTNET
                      : parsed.environment === EnvironmentType.DEVNET
                        ? EnvironmentType.DEVNET
                        : parsed.environment === EnvironmentType.LOCAL
                          ? EnvironmentType.LOCAL
                          : null,
                logoUrl: parsed.logoUrl,
                openUrl: parsed.openUrl ? parsed.openUrl : null,
                walletConnect: parsed.walletConnect,
              })
              setStatus('loaded')
            } catch (error) {
              logger.error(error)
            }
            break

          case 'auth-vault-response':
            navigation.navigate('Home')
            break
        }
      }

      websocket.onerror = () => {
        setErrorMessage({
          message: 'Cannot connect to authentication server',
          heading: 'Network Error',
          type: 'error',
          color: '#FF3B30',
          iconName: 'exclamationcircleo',
        })
        setInfo({
          payload,
        })
        setStatus('error')
      }
    }

    init()
  }, [params, navigation])

  // @todo use key to encrypt response to server

  const reloadExpired = useCallback(() => {
    const _expired = expiry <= Date.now()
    setExpired(_expired)
  }, [expiry])

  useEffect(() => {
    reloadExpired()
  }, [reloadExpired])

  const saveLoginRequest = async (approved: boolean, deviceId?: string) => {
    const vault = AccountManager.getInstance().context
    // save into login database
    const loginRequest = {
      context: info.request.context,
      loginDomain: info.request.loginDomain,
      insertedAt: info.payload.insertedAt,
      sessionId: info.payload.data.session,
      authUri: info.payload.data.authUri,
      expiry: info.payload.exp,
      deviceId,
      approved,
    }

    const loginRequestDatastore = await vault?.openDatastore(
      'https://vault.schemas.verida.io/auth/loginRequest/v0.1.0/schema.json'
    )
    const saveSuccess = await loginRequestDatastore?.save(loginRequest, {})
    if (!saveSuccess) {
      Alert.alert('Warning', 'Failed to save request to history')
    }
    navigation.navigate('Home')
  }

  const deny = async () => {
    try {
      if (status !== 'error' && !expired) {
        setStatus('denying')
        await saveLoginRequest(false)
      }
      navigation.navigate('Home')
    } catch (error) {
      logger.error(error)
      setStatus('loaded')
    }
  }

  /**
   * @todo: Move this into vault-common
   */
  const approve = async () => {
    try {
      if (!currentIdentityNetwork) {
        return
      }

      setStatus('approving')

      const vault = await AccountManager.getInstance().getVeridaContext(
        currentIdentityNetwork
      )
      const client = vault?.getClient()
      const account = await vault?.getAccount()
      const keyring = await account?.keyring(info.request.context)
      const signature = keyring?.getSeed()
      const did = await account?.did()
      const contextName = info.request.context
      const deviceId = info.params.userAgent
        ? info.params.userAgent
        : `${contextName} (${info.request.loginDomain})`

      const context = await client?.openContext(contextName, true)
      const contextConfig = await context?.getContextConfig()

      // Get a context auth object and force create so we get a new refresh token
      const dbEngine = await context?.getDatabaseEngine(did!, true)
      const endpoints = (dbEngine as StorageEngineVerida).getEndpoints()

      const contextAuths: Record<string, AuthContext | undefined> = {}
      for (const endpointUri in endpoints) {
        const contextAuth = await context?.getAuthContext({
          force: true,
          endpointUri: endpointUri,
          deviceId,
        } as AuthTypeConfig)

        contextAuths[endpointUri] = contextAuth
      }

      // NOTE: To disconnect a device (effectively log out an external application)
      // await context.disconnectDevice(deviceId)
      const response = {
        signature,
        did,
        contextConfig,
        contextAuths,
        context: contextName,
      }

      // Build encrypted response
      const keyBytes = Buffer.from(info.key.slice(2), 'hex')
      const encryptedResponse = EncryptionUtils.symEncrypt(response, keyBytes)

      // Send encrypted response to WSS, which will forward
      // onto the web browser
      ws?.send(
        JSON.stringify({
          type: 'responseJwt',
          sessionId: info.payload.data.session,
          data: encryptedResponse,
        })
      )

      setStatus('sentResponse')

      if (info.openUrl && response) {
        const jsonEncoded = JSON.stringify(response)
        const encoded = Buffer.from(jsonEncoded).toString('base64')
        await Linking.openURL(info.openUrl + '?_verida_auth=' + encoded)
      }

      if (info.walletConnect?.uri) await handleDeepLink(info.walletConnect.uri)

      await saveLoginRequest(true, deviceId)
    } catch (error) {
      logger.error(error)
      setStatus('loaded')
    }
  }

  const fromText =
    info?.request?.loginDomain || info?.payload?.context || 'Unidentified'
  const logoUrl = info.logoUrl
  const appName = info.request?.context
  const timeToExpire = moment(expiry).format('DD MMM, YYYY [at] h:mm a')
  const secondsUntilExpire = Math.max(
    0,
    Math.floor(((expiry || 0) - Date.now()) / 1000)
  )

  async function onPressLoginDomain() {
    const canOpen = await Linking.canOpenURL(fromText)
    if (canOpen) {
      await Linking.openURL(`${info.request.loginDomain}`)
    }
  }

  function tryAgainOnPress() {
    props.navigation.navigate('ScanQrCode', {
      firstTime: false,
    })
  }

  function onCountdownFinished() {
    setExpired(true)
  }

  return (
    <Container>
      <Content contentContainerStyle={style.contentContainer}>
        {status === 'loading' && <LoadingView />}
        {status !== 'loading' ? (
          <View style={style.content}>
            {!errorMessage && (
              <>
                {logoUrl ? (
                  <AppLogo url={logoUrl} style={style.img} />
                ) : (
                  <MobileSvg style={style.img} />
                )}
                <Text style={style.appName}>{appName}</Text>
              </>
            )}
            {/* <View style={style.verified}>
              {!errorMessage ? (
                <>
                  <AntDesign name='check' size={15} color={SUCCESS_COLOR} />
                  <Text style={style.verifiedText}> Verified</Text>
                </>
              ) : (
                <>
                  <AntDesign
                    name='exclamationcircleo'
                    size={15}
                    color={WARNING_COLOR}
                  />
                  <Text style={[style.verifiedText, style.warningText]}>
                    {' '}
                    Not Verified
                  </Text>
                </>
              )}
            </View> */}
            <Text style={style.title}>New Login Request</Text>
            <View>
              <Text style={style.text}>
                There is a new login approval request from
              </Text>
              <Text
                style={[style.text, style.link]}
                onPress={onPressLoginDomain}>
                {fromText}
              </Text>
            </View>
            <View style={style.timeContainer}>
              <Text style={style.generatedTime}>
                Generated:{' '}
                {moment(info.payload.insertedAt).format(
                  'DD MMM, YYYY [at] h:mm a'
                )}
              </Text>
              {compatibleNetwork !== 'incompatible' && !expired && (
                <Text style={style.expiresTime}>
                  Expires:{' '}
                  <CountDownText
                    seconds={secondsUntilExpire}
                    style={style.countDownText}
                    onFinish={onCountdownFinished}
                  />{' '}
                  seconds ({(expiry || 0) / 1000})
                </Text>
              )}
            </View>
            {compatibleNetwork === 'incompatible' ? (
              <View style={style.alertBannerContainer}>
                <AlertBanner type='error'>{`The application requests a ${capitalize(
                  info.network
                )} Identity, switch to a compatible one.`}</AlertBanner>
              </View>
            ) : null}
            {compatibleNetwork === 'unknown' && !hasNetworkInRequest ? (
              <View style={style.alertBannerContainer}>
                <AlertBanner type='warning'>
                  {`The application doesn't specify a network, compatibility issue may occur with your ${capitalize(
                    currentIdentityNetwork as string
                  )} Identity`}
                </AlertBanner>
              </View>
            ) : null}
            {compatibleNetwork !== 'incompatible' &&
              (expired || errorMessage) && (
                <View style={style.modal}>
                  {errorMessage && (
                    <>
                      <View style={{ flexDirection: 'row' }}>
                        <Text
                          style={[
                            style.text,
                            { color: errorMessage.color, marginBottom: 2 },
                          ]}>
                          <Icon
                            type='AntDesign'
                            name={errorMessage.iconName}
                            style={[style.text, { color: errorMessage.color }]}
                          />
                          &nbsp; {errorMessage.heading}
                        </Text>
                      </View>
                      <Text
                        style={[
                          style.text,
                          { fontSize: 12, color: errorMessage.color },
                          expired && { marginBottom: 5 },
                        ]}>
                        {errorMessage.message}
                      </Text>
                    </>
                  )}
                  {expired && (
                    <Text
                      style={[
                        style.text,
                        { fontSize: 12, color: '#FF3B30', marginBottom: 2 },
                      ]}>
                      Expired: {timeToExpire}
                    </Text>
                  )}
                  <Text
                    style={[
                      style.text,
                      { fontSize: 12, color: '#FF3B30', marginTop: 5 },
                    ]}>
                    Please refresh the login screen
                  </Text>
                </View>
              )}
          </View>
        ) : null}
      </Content>
      {compatibleNetwork !== 'incompatible' ? (
        <CustomFooter>
          <View style={style.actions}>
            {expired || errorMessage ? (
              <Button style={style.btn} onPress={tryAgainOnPress}>
                Try Again
              </Button>
            ) : (
              <Button
                style={[style.btn, style.mr]}
                color='grey'
                onPress={deny}
                disabled={status !== 'loaded' && status !== 'error'}>
                Ignore
              </Button>
            )}
            {!errorMessage && !expired ? (
              <Button
                style={style.btn}
                onPress={approve}
                disabled={status !== 'loaded'}>
                Login
              </Button>
            ) : null}
          </View>
          {status === 'approving' || status === 'denying' ? (
            <View>
              <Text style={style.text}>Sending response...</Text>
            </View>
          ) : null}
        </CustomFooter>
      ) : null}
    </Container>
  )
}

const style = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
    padding: 16,
    alignItems: 'center',
  },
  img: {
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 22,
    textAlign: 'center',
    marginTop: 12,
    marginBottom: 12,
  },
  text: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 14,
    textAlign: 'center',
  },
  alertBannerContainer: {
    alignSelf: 'stretch',
  },
  timeout: {
    fontSize: 12,
    color: BLACK_COLOR_OPACITY(0.6),
  },
  expiredText: {
    color: ORANGE_COLOR,
  },
  link: {
    color: PRIMARY_COLOR,
    marginBottom: 8,
    marginTop: 2,
  },
  actions: {
    marginTop: 20,
    flexDirection: 'row',
  },
  btn: {
    flex: 1,
    height: 40,
  },
  mr: {
    marginRight: 20,
  },
  modal: {
    backgroundColor: 'rgba(255, 110, 110, 0.1)',
    marginTop: 35,
    borderRadius: 5,
    marginHorizontal: 28,
    alignSelf: 'stretch',
    alignItems: 'center',
    paddingVertical: 12,
  },
  appLogo: {
    marginTop: 35,
    marginBottom: 12,
  },
  appName: {
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 17,
  },
  generatedTime: {
    fontSize: 12,
    color: '#041133',
    marginBottom: 5,
  },
  countDownText: {
    fontSize: 12,
    color: '#041133',
  },
  verified: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
  },
  verifiedText: {
    color: SUCCESS_COLOR,
    fontSize: 12,
  },
  warningText: {
    color: WARNING_COLOR,
  },
  loadingContainer: {},
  timeContainer: {
    marginBottom: 16,
    alignItems: 'center',
    marginTop: 20,
  },
  expiresTime: {
    fontSize: 12,
    color: '#041133',
  },
})

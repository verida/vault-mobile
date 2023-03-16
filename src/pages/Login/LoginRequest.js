import * as Sentry from '@sentry/react-native'
import EncryptionUtils from '@verida/encryption-utils'
import didJWT from 'did-jwt'
import moment from 'moment'
import { Container, Content, Icon } from 'native-base'
import React, { useCallback, useEffect, useState } from 'react'
import { Alert, Linking, StyleSheet, View } from 'react-native'

import AccountManager from 'api/AccountManager'
import AppLogo from 'components/AppLogo'
import CountDownText from 'components/CountDownText'
import CustomFooter from 'components/Layouts/CustomFooter'
import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Text from 'components/Text'
import { useWalletConnect, useWalletConnectv2 } from 'hooks/useWalletConnect'

import MobileSvg from '../../assets/mobile.svg'
import Button from '../../components/Button'
import {
  BLACK_COLOR_OPACITY,
  ORANGE_COLOR,
  PRIMARY_COLOR,
  SUCCESS_COLOR,
  WARNING_COLOR,
} from '../../constants/color'
import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '../../constants/text'

global.EncryptionUtils = EncryptionUtils

export default (props) => {
  const [status, setStatus] = useState('loading')
  const [info, setInfo] = useState({})
  const [expiry, setExpiry] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [ws, setWebsocket] = useState(null)
  const [expired, setExpired] = useState(false)
  const { requestConnect } = useWalletConnect()
  const { requestConnect: requestConnectv2 } = useWalletConnectv2()

  useEffect(() => {
    const init = async () => {
      const { _k, _r } = props.route.params
      const key = _k
      const didJwt = _r
      const decoded = didJWT.decodeJWT(didJwt)
      const payload = decoded.payload
      const _expiry = payload.exp
      setExpiry(_expiry * 1000)

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
                logoUrl: parsed.logoUrl,
                openUrl: parsed.openUrl ? parsed.openUrl : null,
                walletConnect: parsed.walletConnect,
              })
              setStatus('loaded')
            } catch (e) {
              Sentry.captureException(e)
            }
            break

          case 'auth-vault-response':
            props.navigation.navigate('Home')
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
  }, [props.route.params, props.navigation])

  // @todo use key to encrypt response to server

  const reloadExpired = useCallback(() => {
    const _expired = expiry <= Date.now()
    setExpired(_expired)
  }, [expiry])

  useEffect(() => {
    reloadExpired()
  }, [reloadExpired])

  const saveLoginRequest = async (approved, deviceId) => {
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

    const loginRequestDatastore = await vault.openDatastore(
      'https://vault.schemas.verida.io/auth/loginRequest/v0.1.0/schema.json'
    )
    const saveSuccess = await loginRequestDatastore.save(loginRequest)
    if (!saveSuccess) {
      Alert.alert('Warning', 'Failed to save request to history')
    }
    props.navigation.navigate('Home')
  }

  const deny = async () => {
    try {
      if (status !== 'error' && !expired) {
        setStatus('denying')
        await saveLoginRequest(false)
      }
      props.navigation.navigate('Home')
    } catch (error) {
      Sentry.captureException(error)
      setStatus('loaded')
    }
  }

  /**
   * @todo: Move this into vault-common
   */
  const approve = async () => {
    try {
      setStatus('approving')

      const vault = AccountManager.getInstance().context
      const client = AccountManager.getInstance().client
      const account = await vault.getAccount()
      const keyring = await account.keyring(info.request.context)
      const signature = keyring.getSeed()
      const did = await account.did()
      const contextName = info.request.context
      const deviceId = info.params.userAgent
        ? info.params.userAgent
        : `${contextName} (${info.request.loginDomain})`

      const context = await client.openContext(contextName, true)
      const contextConfig = await context.getContextConfig()

      // Get a context auth object and force create so we get a new refresh token
      const dbEngine = await context.getDatabaseEngine(did, true)
      const endpoints = await dbEngine.getEndpoints()

      const contextAuths = {}
      for (let endpointUri in endpoints) {
        const contextAuth = await context.getAuthContext({
          force: true,
          endpointUri: endpointUri,
          deviceId,
        })

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
      ws.send(
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

      if (info.walletConnect?.uri) {
        if (info.walletConnect.version === 1) {
          requestConnect(info.walletConnect.uri)
        } else if (info.walletConnect.version === 2) {
          requestConnectv2(info.walletConnect.uri)
        }
      }

      await saveLoginRequest(true, deviceId)
    } catch (error) {
      Sentry.captureException(error)
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
    Math.floor((expiry - Date.now()) / 1000)
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
      <NavigationHeader
        title='Login Request'
        left={{
          icon: <Icon name='close' style={{ color: '#000' }} />,
          action: () => props.navigation.goBack(),
        }}
      />
      <Content contentContainerStyle={style.contentContainer}>
        {status === 'loading' && <LoadingView />}
        {status !== 'loading' ? (
          <View style={style.content}>
            {!errorMessage && (
              <>
                <AppLogo url={logoUrl} style={style.img} />
                <Text style={style.appName}>{appName}</Text>
              </>
            )}
            <View style={style.verified}>
              {/* TODO: render verified status */}
              {/*{!errorMessage ? (*/}
              {/*  <>*/}
              {/*    <AntDesign name='check' size={15} color={SUCCESS_COLOR} />*/}
              {/*    <Text style={style.verifiedText}> Verified</Text>*/}
              {/*  </>*/}
              {/*) : (*/}
              {/*  <>*/}
              {/*    <AntDesign*/}
              {/*      name='exclamationcircleo'*/}
              {/*      size={15}*/}
              {/*      color={WARNING_COLOR}*/}
              {/*    />*/}
              {/*    <Text style={[style.verifiedText, style.warningText]}>*/}
              {/*      {' '}*/}
              {/*      Not Verified*/}
              {/*    </Text>*/}
              {/*  </>*/}
              {/*)}*/}
            </View>
            <MobileSvg style={style.img} />
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
              {!expired && (
                <Text style={style.expiresTime}>
                  Expires:{' '}
                  <CountDownText
                    seconds={secondsUntilExpire}
                    style={style.countDownText}
                    onFinish={onCountdownFinished}
                  />{' '}
                  seconds ({expiry / 1000})
                </Text>
              )}
            </View>
            {(expired || errorMessage) && (
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
    </Container>
  )
}

const style = StyleSheet.create({
  contentContainer: {
    flex: 1,
  },
  content: {
    flex: 1,
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
    marginBottom: 12,
  },
  text: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 14,
    textAlign: 'center',
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

import React, { useEffect, useState } from 'react'
import { Linking, StyleSheet, View } from 'react-native'
import { Container, Content, Icon } from 'native-base'
import didJWT from 'did-jwt'
import EncryptionUtils from '@verida/encryption-utils'
import MobileSvg from '../../assets/mobile.svg'

import Text from 'components/Text'
import Button from '../../components/Button'
import NavigationHeader from 'components/Navigation/NavigationHeader'

import { NUNITO_SANS_BOLD, NUNITO_SANS_SEMIBOLD } from '../../constants/text'
import {
  BLACK_COLOR_OPACITY,
  ORANGE_COLOR,
  PRIMARY_COLOR,
  SUCCESS_COLOR,
  WARNING_COLOR,
} from '../../constants/color'
import CustomFooter from 'components/Layouts/CustomFooter'
import LoadingView from 'components/LoadingView'
import AccountManager from 'api/AccountManager'
import Moment from 'moment'
import moment from 'moment'
import AppLogo from 'components/AppLogo'
import * as Sentry from '@sentry/react-native'

global.EncryptionUtils = EncryptionUtils

export default (props) => {
  const [status, setStatus] = useState('loading')
  const [info, setInfo] = useState({})
  const [expiry, setExpiry] = useState(null)
  const [errorMessage, setErrorMessage] = useState(null)
  const [ws, setWebsocket] = useState(null)

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
                _expiry,
                key,
                logoUrl: parsed.logoUrl,
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

      websocket.onerror = (err) => {
        console.log(err)

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

  const saveLoginRequest = async (approved) => {
    const vault = AccountManager.getInstance().context
    // save into login database
    const loginRequest = {
      context: info.request.context,
      loginDomain: info.request.loginDomain,
      insertedAt: info.payload.insertedAt,
      sessionId: info.payload.data.session,
      authUri: info.payload.data.authUri,
      expiry: info.payload.exp,
      approved,
    }

    const loginRequestDatastore = await vault.openDatastore(
      'https://vault.schemas.verida.io/auth/loginRequest/v0.1.0/schema.json'
    )
    const saveSuccess = await loginRequestDatastore.save(loginRequest)
    if (!saveSuccess) {
      console.log('saveError:', loginRequestDatastore.errors)
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
      console.log(error)
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

      const context = await client.openContext(contextName, true)
      const contextConfig = await context.getContextConfig()

      const response = {
        signature,
        did,
        contextConfig,
        context: contextName,
      }

      const keyBytes = Buffer.from(info.key.slice(2), 'hex')

      const encryptedResponse = EncryptionUtils.symEncrypt(response, keyBytes)

      // Build encrypted response

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
      await saveLoginRequest(true)
    } catch (error) {
      console.log(error)
      setStatus('loaded')
    }
  }

  const fromText =
    info?.request?.loginDomain || info?.payload?.context || 'Unidentified'
  const logoUrl = info.logoUrl
  const appName = info.request?.context
  const expired = expiry <= Date.now()
  const timeToExpire = moment(expiry).format('YYYY MMM DD [at] HH:mm')
  const expiryText = expired
    ? `Expired: ${timeToExpire}`
    : `Expire: ${timeToExpire}`

  async function onPressLoginDomain() {
    const canOpen = await Linking.canOpenURL(fromText)
    if (canOpen) {
      await Linking.openURL(`${info.request.loginDomain}`)
    }
  }

  return (
    <Container>
      <NavigationHeader title='Login Request' left={{ icon: 'skip' }} />
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
            <Text style={style.generatedTime}>
              {Moment(info.payload.insertedAt).format(
                'DD MMM, YYYY [at] h:mm a'
              )}
            </Text>
            {expired && errorMessage && (
              <Text
                style={[
                  style.text,
                  style.timeout,
                  expired && style.expiredText,
                ]}>
                {expiryText}
              </Text>
            )}
            {expired && !errorMessage && (
              <View style={style.modal}>
                <View style={{ flexDirection: 'row' }}>
                  <Text
                    style={[style.text, { color: '#FF3B30', marginBottom: 2 }]}>
                    {expiryText}
                  </Text>
                </View>
                <Text style={[style.text, { fontSize: 12, color: '#FF3B30' }]}>
                  Please try again
                </Text>
              </View>
            )}
            {errorMessage && (
              <View style={style.modal}>
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
                  ]}>
                  {errorMessage.message}
                </Text>
              </View>
            )}
          </View>
        ) : null}
      </Content>
      <CustomFooter>
        <View style={style.actions}>
          <Button
            style={[style.btn, style.mr]}
            color='grey'
            onPress={deny}
            disabled={status !== 'loaded' && status !== 'error'}>
            Ignore
          </Button>
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
    marginBottom: 16,
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 14,
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
})

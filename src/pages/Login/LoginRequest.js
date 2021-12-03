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
  PRIMARY_COLOR,
  SUCCESS_COLOR,
  WARNING_COLOR,
} from '../../constants/color'
import CustomFooter from 'components/Layouts/CustomFooter'
import LoadingView from 'components/LoadingView'
import AccountManager from 'api/AccountManager'
import Moment from "moment";

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
      const now = Math.floor(Date.now() / 1000)
      setExpiry(_expiry - now)
      console.log('payload:', payload)

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
        console.log('message:', message)

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
            console.log('auth-session')
            const request = message.message
            setInfo({
              request,
              payload,
              _expiry,
              key,
            })
            setStatus('loaded')
            break

          case 'auth-vault-response':
            props.navigation.navigate('Home')
            break
        }
      }

      websocket.onerror = (err) => {
        console.log('ws error!')
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
  console.log('info:', info)

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
    console.log('loginRequest:', loginRequest)

    const loginRequestDatastore = await vault.openDatastore(
      'https://vault.schemas.verida.io/auth/loginRequest/v0.1.0/schema.json'
    )
    const saveSuccess = await loginRequestDatastore.save(loginRequest)
    console.log('saveSuccess:', !!saveSuccess)
    if (!saveSuccess) {
      console.log('saveError:', loginRequestDatastore.errors)
    }
    props.navigation.navigate('Home')
  }

  const deny = async () => {
    try {
      if (status !== 'error') {
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
      console.log('approve press')
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
      console.log('saving')
      await saveLoginRequest(true)
    } catch (error) {
      console.log(error)
      setStatus('loaded')
    }
  }

  const fromText =
    info?.request?.loginDomain || info?.payload?.context || 'Unidentified'

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
            {/*<AppLogo url={info.request.logoUrl} style={style.img} />*/}
            {/*<Text style={style.appName}>{info.request.context}</Text>*/}
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
            <Text style={[style.text, style.timeout]}>
              Expires in {expiry} seconds
            </Text>
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
          {!errorMessage ? (
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

import React, { useEffect, useState } from 'react'
import { Linking, StyleSheet, View } from 'react-native'
import { Container, Content, Icon } from 'native-base'
import didJWT from 'did-jwt'
import Moment from 'moment'
import { getVeridaApp } from '../../api'
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
import AppLogo from 'components/AppLogo'
import CustomFooter from 'components/Layouts/CustomFooter'
import LoadingView from 'components/LoadingView'

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
            color: '#EF7936',
            iconName: 'exclamationcircleo',
          })

          return
        }

        switch (message.type) {
          case 'auth-session':
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
      }
    }

    init()
  }, [props.route.params, props.navigation])

  // @todo use key to encrypt response to server

  const deny = () => {
    props.navigation.navigate('Home')
  }

  /**
   * @todo: Move this into vault-common
   */
  const approve = async () => {
    try {
      setStatus('approving')

      const vault = await getVeridaApp()
      const account = await vault.getAccount()
      const keyring = await account.keyring(info.request.context)
      const signature = keyring.getSeed()
      const did = await account.did()
      const contextName = info.request.context

      const context = await global.client.openContext(contextName, true)
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

      // @todo: validate domain name and public key to ensure they match
      // If they don't, show warning "Website could not be verified and is untrusted."

      // @todo: show message (pending)

      // save into login database
      const loginRequest = {
        context: info.request.appName,
        loginDomain: info.request.loginDomain,
        insertedAt: info.payload.insertedAt,
        sessionId: info.request.session,
        authUri: info.request.authUri,
        expiry: info.payload.exp,
        approved: true,
      }

      const loginRequestDatastore = await context.openDatastore(
        'https://schemas.verida.io/auth/loginRequest/schema.json'
      )
      await loginRequestDatastore.save(loginRequest)
    } catch (error) {
      console.log(error)
      setStatus('loaded')
    }
  }

  return (
    <Container>
      <NavigationHeader title='Login Request' left={{ icon: 'skip' }} />
      <Content contentContainerStyle={style.contentContainer}>
        {status === 'loading' && <LoadingView />}
        {status !== 'loading' ? (
          <View style={style.content}>
            <AppLogo url={info.request.logoUrl} style={style.img} />
            <Text style={style.appName}>{info.request.context}</Text>
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
                onPress={() => Linking.openURL(`${info.request.loginDomain}`)}>
                {info.request.loginDomain}
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
          </View>
        ) : null}

        {errorMessage && (
          <View style={style.modal}>
            <View style={{ flexDirection: 'row' }}>
              <Text style={[style.text, { color: errorMessage.color }]}>
                <Icon
                  type='AntDesign'
                  name={errorMessage.iconName}
                  style={[style.text, { color: errorMessage.color }]}
                />
                &nbsp; {errorMessage.heading}
              </Text>
            </View>
            <Text style={[style.text, { textAlign: 'left', fontSize: 12 }]}>
              {errorMessage.message}
            </Text>
          </View>
        )}
      </Content>
      <CustomFooter>
        <View style={style.actions}>
          <Button
            style={[style.btn, style.mr]}
            color='grey'
            onPress={deny}
            disabled={status === 'approving'}>
            Ignore
          </Button>
          {!errorMessage ? (
            <Button
              style={style.btn}
              onPress={approve}
              disabled={status === 'approving'}>
              Login
            </Button>
          ) : null}
        </View>
        {status === 'approving' ? (
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
    backgroundColor: '#FDF4EA',
    paddingLeft: 15,
    marginTop: 10,
    width: '100%',
    borderRadius: 5,
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

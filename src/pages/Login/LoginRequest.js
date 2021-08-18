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
import { BLACK_COLOR_OPACITY } from '../../constants/color'

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
  }, [props.route.params])

  // @todo use key to encrypt response to server

  const deny = () => {
    props.navigation.navigate('Home')
  }

  /**
   * @todo: Move this into vault-common
   */
  const approve = async () => {
    setStatus('approving')

    const veridaApp = await getVeridaApp()
    const signature = await veridaApp.user.requestSignature(
      info.request.appName
    )
    const did = veridaApp.user.did
    const appName = info.request.appName

    const response = {
      signature,
      did,
      appName,
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

    const loginRequestDatastore = await veridaApp.openDatastore(
      'https://schemas.verida.io/auth/loginRequest/schema.json'
    )
    await loginRequestDatastore.save(loginRequest)
  }

  return (
    <Container>
      <NavigationHeader title='Login Request' left={{ icon: 'skip' }} />
      <Content>
        <View style={style.container}>
          {status !== 'loading' ? (
            <View style={{ alignItems: 'center' }}>
              <MobileSvg style={style.img} />
              <Text style={style.title}>{info.request.appName}</Text>
              <View>
                <Text style={style.text}>
                  You have a new login approval request from:
                </Text>
                <Text
                  style={[style.text, style.link]}
                  onPress={() =>
                    Linking.openURL(`${info.request.loginDomain}`)
                  }>
                  {info.request.loginDomain}
                </Text>
              </View>
              <Text style={style.text} />
              <Text style={[style.text, style.timeout]}>
                Generated:{' '}
                {Moment(info.payload.insertedAt).format(
                  'DD MMM, YYYY [at] h:mm a'
                )}
                {'\n'}
                Expires: {expiry} seconds ({info.payload.exp})
              </Text>
            </View>
          ) : null}

          {errorMessage ? (
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
          ) : null}

          <View style={style.actions}>
            <Button style={[style.btn, style.mr]} color='grey' onPress={deny}>
              Cancel
            </Button>
            {!errorMessage ? (
              <Button style={style.btn} onPress={() => approve()}>
                Login
              </Button>
            ) : null}
          </View>
          {status === 'approving' ? (
            <View>
              <Text style={style.text}>Sending response...</Text>
            </View>
          ) : null}
        </View>
      </Content>
    </Container>
  )
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'space-between',
    marginVertical: 20,
    marginHorizontal: 20,
  },
  img: {
    marginTop: 20,
    marginBottom: 20,
  },
  title: {
    fontFamily: NUNITO_SANS_BOLD,
    fontSize: 22,
    marginVertical: 4,
    textAlign: 'center',
  },
  text: {
    fontFamily: NUNITO_SANS_SEMIBOLD,
    fontSize: 14,
    textAlign: 'center',
    marginVertical: 8,
  },
  timeout: {
    fontSize: 12,
    color: BLACK_COLOR_OPACITY(0.6),
  },
  link: {
    color: 'blue',
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
})

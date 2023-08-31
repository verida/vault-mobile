import * as Sentry from '@sentry/react-native'
import { W3CVerifiableCredential } from '@veramo/core'
import { Context } from '@verida/client-rn'
import { SharingCredential } from '@verida/verifiable-credentials'
import { getDidMetadata } from 'features/did'
import { isValidVeridaDid } from 'features/verida'
import { useCredential } from 'features/verifiableCredential'
import { isEmpty } from 'lodash'
import { List } from 'native-base'
import React, { useEffect, useState } from 'react'
import {
  Dimensions,
  Image,
  Modal,
  SafeAreaView,
  StyleSheet,
  TouchableOpacity,
  View,
  ViewProps,
} from 'react-native'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { QRCode } from 'react-native-custom-qr-codes-expo'
import AntDesign from 'react-native-vector-icons/AntDesign'

import AccountManager from 'api/AccountManager'
import { DefaultAvatar, getPublicProfile } from 'api/utils'
import DataFieldList from 'components/Data/DataFieldList'
import LoadingView from 'components/LoadingView'
import Text from 'components/Text'
import { GREY_COLOR, ORANGE_COLOR, SUCCESS_COLOR } from 'constants/color'
import { NUNITO_SANS, NUNITO_SANS_BOLD } from 'constants/text'

type ValidState = 'valid' | 'invalid' | 'unknown'

export type CredentialDataItemProps = Omit<ViewProps, 'children'> & {
  data: any
  item: any
  setCopyUrl: any
}

const { width: SCREEN_WIDTH } = Dimensions.get('screen')
const MODAL_HORIZONTAL_MARGIN = 20

function CredentialDataItem(props: CredentialDataItemProps) {
  const { data, item, setCopyUrl, ...rest } = props

  const [loading, setLoading] = useState(true)
  const [issuer, setIssuer] = useState({
    did: '',
    name: '',
    avatar: '',
  })
  const [credentialPresentationUri, setCredentialPresentationUri] = useState('')
  const [valid, setValid] = useState<ValidState>('unknown')
  const [showFullscreenQr, setShowFullscreenQr] = useState(false)
  const { verifyCredential } = useCredential()

  useEffect(() => {
    async function checkCredential(credential: W3CVerifiableCredential) {
      try {
        const verificationResult = await verifyCredential(credential)
        setValid(verificationResult.valid)
        return verificationResult
      } catch (error: unknown) {
        setValid('unknown')
        Sentry.captureException(error)
      }
    }

    async function getIssuerProfile(issuerDid: string, contextName?: string) {
      try {
        let issuerProfile
        // TODO: Move the logic to get the profile of a DID (verida or not) into features/did or features/profile
        if (isValidVeridaDid(issuerDid)) {
          const publicProfile = await getPublicProfile(issuerDid, contextName)
          issuerProfile = {
            did: issuerDid,
            name: publicProfile?.name || 'Unknown',
            avatar: publicProfile?.avatar || DefaultAvatar,
          }
        } else {
          const didMetadata = await getDidMetadata(issuerDid)
          issuerProfile = {
            did: issuerDid,
            name: didMetadata?.name || 'Unknown',
            avatar: didMetadata?.icon || DefaultAvatar,
          }
        }
        setIssuer(issuerProfile)
      } catch (error: unknown) {
        Sentry.captureException(error)
      }
    }

    async function buildCredentialSharing(didJwtVc: string) {
      try {
        const context = AccountManager.getInstance().context as Context
        const currentDid =
          AccountManager.getInstance().getSelectedAccount()?.did
        if (!context || !currentDid) {
          return
        }
        const shareCredential = new SharingCredential(context)
        const credentialPresentation =
          await shareCredential.issueEncryptedPresentation(didJwtVc)
        // Surprisingly, this method is able to generate a presentation and a publicUri even when didJwtVc is undefined
        setCredentialPresentationUri(credentialPresentation.publicUri)
        setCopyUrl(credentialPresentation.publicUri)
      } catch (error: unknown) {
        Sentry.captureException(error)
      }
    }

    async function init() {
      if (isEmpty(item)) {
        return
      }

      setLoading(true)

      // TODO: Consider only using credentialData
      const result = await checkCredential(item.didJwtVc || item.credentialData)

      const issuerDid = result?.verified
        ? result.issuer
        : item.credentialData.issuer
      const contextName = result?.verified
        ? result.verifiedCredential.vc?.veridaContextName
        : undefined
      await getIssuerProfile(issuerDid, contextName)

      const jwt = result?.verified ? result.result.jwt : item.didJwtVc
      if (jwt) {
        await buildCredentialSharing(jwt)
      }

      setLoading(false)
    }

    init()
  }, [item, verifyCredential, setCopyUrl])

  if (isEmpty(data.data)) {
    return null
  }

  function renderQRCode(fullScreen = false) {
    if (isEmpty(credentialPresentationUri)) {
      return null
    }
    return (
      <QRCode
        logo={require('assets/vault-logo.png')}
        logoSize={60}
        size={fullScreen ? SCREEN_WIDTH - MODAL_HORIZONTAL_MARGIN * 2 : 207}
        codeStyle='dot'
        innerEyeStyle='circle'
        padding={0.5}
        content={credentialPresentationUri}
      />
    )
  }

  function toggleFullscreenQr() {
    setShowFullscreenQr((prevState) => !prevState)
  }

  const avatarSource = issuer.avatar
    ? typeof issuer.avatar === 'string' && issuer.avatar.startsWith('http')
      ? { uri: issuer.avatar }
      : issuer.avatar
    : DefaultAvatar

  return (
    <View style={styles.container} {...rest}>
      <Text style={styles.title}>{data?.row?.name || item?.name}</Text>
      {loading ? (
        <View style={styles.loadingStatusContainer}>
          <LoadingView type={'small'} style={styles.loadingView} />
          <Text style={styles.verifiedText}>Verification in progress...</Text>
        </View>
      ) : (
        <>
          {!isEmpty(credentialPresentationUri) ? (
            <View style={styles.qrContainer}>
              <TouchableOpacity onPress={toggleFullscreenQr}>
                {renderQRCode()}
              </TouchableOpacity>
            </View>
          ) : null}
          <View style={styles.verifiedContainer}>
            {valid === 'unknown' ? (
              <>
                <AntDesign
                  name='questioncircleo'
                  size={20}
                  color={GREY_COLOR}
                />
                <Text style={styles.verifiedText}>
                  Validity can not be determined
                </Text>
              </>
            ) : null}
            {valid === 'valid' ? (
              <>
                <AntDesign
                  name='checkcircleo'
                  size={20}
                  color={SUCCESS_COLOR}
                />
                <Text style={styles.verifiedText}>Credential is valid</Text>
              </>
            ) : null}
            {valid === 'invalid' ? (
              <>
                <AntDesign
                  name='exclamationcircle'
                  size={20}
                  color={ORANGE_COLOR}
                />
                <Text style={styles.verifiedText}>Credential is invalid</Text>
              </>
            ) : null}
          </View>
        </>
      )}
      <View style={styles.issuerSection}>
        <Text>Signed by</Text>
        <View style={styles.issuerInfo}>
          <Image source={avatarSource} style={styles.issuerLogo} />
          <View style={styles.issuerNameAndDidContainer}>
            <Text
              style={styles.issuerName}
              numberOfLines={1}
              ellipsizeMode='middle'>
              {issuer.name}
            </Text>
            <Text
              style={styles.issuerDid}
              numberOfLines={1}
              ellipsizeMode='tail'>
              {issuer.did}
            </Text>
          </View>
        </View>
      </View>
      <List style={{ alignSelf: 'stretch' }}>
        <DataFieldList data={data} setCopyUrl={setCopyUrl} />
      </List>
      <Modal visible={showFullscreenQr}>
        <View style={styles.qrCodeModalOuterContainer}>
          <SafeAreaView style={styles.safeArea}>
            <View style={styles.qrCodeModalContainer}>
              <View style={styles.qrCodeModalContent}>
                {renderQRCode(true)}
              </View>
              <TouchableOpacity
                style={styles.modalCloseButton}
                hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
                onPress={toggleFullscreenQr}>
                <AntDesign name='close' size={24} color='white' />
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
  },
  issuerSection: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'column',
    paddingHorizontal: 20,
  },
  issuerInfo: {
    width: '100%',
    marginTop: 10,
    flexDirection: 'row',
  },
  issuerLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'contain',
    marginRight: 5,
  },
  issuerNameAndDidContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  issuerName: {
    fontFamily: NUNITO_SANS_BOLD,
  },
  issuerDid: {
    fontFamily: NUNITO_SANS,
  },
  verifiedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 15,
    alignSelf: 'center',
  },
  verifiedText: {
    marginLeft: 5,
  },
  title: {
    fontSize: 18,
    fontFamily: NUNITO_SANS_BOLD,
    alignSelf: 'center',
    marginTop: 20,
    marginLeft: 15,
  },
  qrContainer: {
    alignSelf: 'center',
  },
  loadingStatusContainer: {
    alignSelf: 'center',
  },
  loadingView: {
    maxHeight: 50,
  },
  qrCodeModalOuterContainer: {
    flex: 1,
    backgroundColor: 'black',
  },
  safeArea: {
    flex: 1,
  },
  qrCodeModalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  qrCodeModalContent: {
    backgroundColor: 'white',
    marginHorizontal: MODAL_HORIZONTAL_MARGIN,
  },
  modalCloseButton: {
    position: 'absolute',
    top: 20,
    right: 20,
  },
})

export default CredentialDataItem

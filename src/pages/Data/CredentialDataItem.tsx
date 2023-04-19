import * as Sentry from '@sentry/react-native'
import { Context } from '@verida/client-ts'
import { SharingCredential } from '@verida/verifiable-credentials'
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
import { DefaultAvatar } from 'api/utils'
import DataFieldList from 'components/Data/DataFieldList'
import LoadingView from 'components/LoadingView'
import Text from 'components/Text'
import { ORANGE_COLOR, SUCCESS_COLOR } from 'constants/color'
import { NUNITO_SANS_BOLD } from 'constants/text'

export type CredentialDataItemProps = Omit<ViewProps, 'children'> & {
  data: any
  item: any
  setCopyUrl: any
}

const { width: SCREEN_WIDTH } = Dimensions.get('screen')
const MODAL_HORIZONTAL_MARGIN = 20

function CredentialDataItem(props: CredentialDataItemProps) {
  const { data, item, setCopyUrl, ...rest } = props
  const [credUri, setCredUri] = useState('')
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)
  const [showFullscreenQr, setShowFullscreenQr] = useState(false)

  const {
    issuer: { name: issuerName, avatar: issuerAvatar } = {
      name: '',
      avatar: null,
    },
  } = data

  useEffect(() => {
    async function init() {
      try {
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        const context = AccountManager.getInstance().context as Context
        const currentDid =
          AccountManager.getInstance().getSelectedAccount()?.did
        if (isEmpty(item) || !context || !currentDid) {
          return
        }
        setLoading(true)
        const shareCredential = new SharingCredential(context)
        const issuedCredential =
          await shareCredential.issueEncryptedPresentation(item.didJwtVc)
        setCredUri(issuedCredential.publicUri)
        setCopyUrl(issuedCredential.publicUri)
        setVerified(true)
        setLoading(false)
      } catch (error) {
        setLoading(false)
        setVerified(false)
        Sentry.captureException(error)
      }
    }

    init()
  }, [item, setCopyUrl])

  if (isEmpty(data.data)) {
    return null
  }

  function renderQRCode(fullScreen = false) {
    if (isEmpty(credUri)) {
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
        content={credUri}
      />
    )
  }

  function toggleFullscreenQr() {
    setShowFullscreenQr((prevState) => !prevState)
  }

  const avatarSource = issuerAvatar || DefaultAvatar
  return (
    <View style={styles.container} {...rest}>
      <View style={styles.sender}>
        <Text>Signed by</Text>
        <Image source={avatarSource} style={styles.logo} />
        <Text style={styles.issuerName}>{issuerName}</Text>
      </View>
      {/* TODO: To revert to this after Polygon ID demo */}
      {/* <View style={styles.qrContainer}>
        {!isEmpty(credUri) ? (
          <TouchableOpacity onPress={toggleFullscreenQr}>
            {renderQRCode()}
          </TouchableOpacity>
        ) : (
          <LoadingView type={'small'} style={styles.loadingView} />
        )}
      </View> */}
      {!loading && verified && (
        <View style={styles.verifiedContainer}>
          <AntDesign name='checkcircleo' size={20} color={SUCCESS_COLOR} />
          <Text style={styles.verifiedText}>Credential is valid</Text>
        </View>
      )}
      {!loading && !verified && (
        <View style={styles.verifiedContainer}>
          <AntDesign name='exclamationcircle' size={20} color={ORANGE_COLOR} />
          <Text style={styles.verifiedText}>Credential is invalid</Text>
        </View>
      )}
      <Text style={styles.title}>{data?.row?.name}</Text>
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
  sender: {
    marginTop: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
    alignSelf: 'center',
  },
  logo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'contain',
    marginLeft: 10,
    marginRight: 5,
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
    alignSelf: 'flex-start',
    marginTop: 20,
    marginLeft: 15,
  },
  qrContainer: {
    alignSelf: 'center',
  },
  issuerName: {
    fontFamily: NUNITO_SANS_BOLD,
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

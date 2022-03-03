import * as Sentry from '@sentry/react-native'
import { Context } from '@verida/client-ts'
import { SharingCredential } from '@verida/verifiable-credentials'
import { isEmpty } from 'lodash'
import { List } from 'native-base'
import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, View, ViewProps } from 'react-native'
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
}

function CredentialDataItem(props: CredentialDataItemProps) {
  const { data, item, ...rest } = props
  const [credUri, setCredUri] = useState('')
  const [loading, setLoading] = useState(false)
  const [verified, setVerified] = useState(false)

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
          await shareCredential.issueEncryptedPresentation(item)
        setCredUri(issuedCredential.publicUri)
        setVerified(true)
        setLoading(false)
      } catch (error) {
        setLoading(false)
        setVerified(false)
        Sentry.captureException(error)
      }
    }

    init()
  }, [data, item])

  if (isEmpty(data.data)) {
    return null
  }

  const avatarSource = issuerAvatar || DefaultAvatar
  return (
    <View style={styles.container} {...rest}>
      <View style={styles.sender}>
        <Text>Signed by</Text>
        <Image source={avatarSource} style={styles.logo} />
        <Text style={styles.issuerName}>{issuerName}</Text>
      </View>
      <View style={styles.qrContainer}>
        {!isEmpty(credUri) ? (
          <QRCode
            logo={require('assets/vault-logo.png')}
            logoSize={60}
            size={207}
            codeStyle='dot'
            innerEyeStyle='circle'
            padding={0.5}
            content={credUri}
          />
        ) : (
          <LoadingView type={'small'} style={styles.loadingView} />
        )}
      </View>
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
        <DataFieldList data={data} />
      </List>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
  },
  sender: {
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
})

export default CredentialDataItem

import React, { useEffect, useState } from 'react'
import { Image, StyleSheet, View, ViewProps } from 'react-native'
import Text from 'components/Text'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { SUCCESS_COLOR } from 'constants/color'
import { List } from 'native-base'
import DataFieldList from 'components/Data/DataFieldList'
import { NUNITO_SANS_BOLD } from 'constants/text'
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { QRCode } from 'react-native-custom-qr-codes-expo'
import { DefaultAvatar } from 'api/utils'
import { isEmpty } from 'lodash'
import { Credentials } from '@verida/verifiable-credentials'
import AccountManager from 'api/AccountManager'

export type CredentialDataItemProps = Omit<ViewProps, 'children'> & {
  data: any
}

function CredentialDataItem(props: CredentialDataItemProps) {
  const { data, ...rest } = props
  const [credUri, setCredUri] = useState('')

  console.log('data:', data)

  const {
    issuer: { name: issuerName, avatar: issuerAvatar, did: issuerDID } = {
      name: '',
      avatar: null,
      did: '',
    },
  } = data

  useEffect(() => {
    async function init() {
      if (isEmpty(data.payload)) {
        return
      }
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      const credential = new Credentials(AccountManager.getInstance().context)

      const item = await credential.createCredentialJWT(data)
      console.log('item:', item)
    }

    init()
  }, [])

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
        <QRCode
          logo={require('assets/vault-logo.png')}
          logoSize={60}
          size={207}
          codeStyle='dot'
          innerEyeStyle='circle'
          padding={0.5}
          content={issuerDID || ''}
        />
      </View>
      <View style={styles.verifiedContainer}>
        <AntDesign name='checkcircleo' size={20} color={SUCCESS_COLOR} />
        <Text style={styles.verifiedText}>Credential is valid</Text>
      </View>
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
})

export default CredentialDataItem

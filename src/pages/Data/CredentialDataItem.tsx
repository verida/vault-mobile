import React from 'react'
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

export type CredentialDataItemProps = Omit<ViewProps, 'children'> & {
  data: any
  senderInfo: {
    did: string
    avatar: string
  }
}

function CredentialDataItem(props: CredentialDataItemProps) {
  const { data, ...rest } = props

  return (
    <View style={styles.container}>
      <View style={styles.sender}>
        <Text>Signed by</Text>
        <Image
          source={{
            uri: 'https://i1.wp.com/www.mapaycorp.com/wp-content/uploads/elementor/thumbs/MAPay-Logo-smaller-pg5ee3dukmnrkppmdc9wnueeowra310sf9vuaf3k74.png?w=800&ssl=1',
          }}
          style={styles.logo}
        />
      </View>
      <View style={styles.qrContainer}>
        <QRCode
          logo={{
            uri: 'https://i1.wp.com/www.mapaycorp.com/wp-content/uploads/2021/10/MAPay-Icon-1.png?resize=768%2C815&ssl=1',
          }}
          logoSize={60}
          size={207}
          codeStyle='dot'
          innerEyeStyle='circle'
          padding={0.5}
          content={'did:vda:0xafFdd56da6903b5c750f9f4bdE5f6242EbD3f8fA'}
        />
      </View>
      <View style={styles.verifiedContainer}>
        <AntDesign name='checkcircleo' size={20} color={SUCCESS_COLOR} />
        <Text style={styles.verifiedText}>Credential is valid</Text>
      </View>
      <Text style={styles.title}>
        {data?.row?.firstName} {data?.row?.lastName}
      </Text>
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
    width: 100,
    height: 50,
    resizeMode: 'contain',
    marginLeft: 10,
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
})

export default CredentialDataItem

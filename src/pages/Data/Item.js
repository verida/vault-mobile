import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Container, Content, List } from 'native-base'

import DataFieldList from '../../components/Data/DataFieldList'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { Image, StyleSheet, View } from 'react-native'
import Text from 'components/Text'
import { QRCode } from 'react-native-custom-qr-codes-expo'
import AntDesign from 'react-native-vector-icons/AntDesign'
import { SUCCESS_COLOR } from 'constants/color'
import { NUNITO_SANS_BOLD } from 'constants/text'

const DataItem = (props) => {
  const { item, folder } = props.route.params
  const [data, setData] = useState({
    data: [],
    title: '',
  })
  console.log(item)

  useEffect(() => {
    const init = async () => {
      const _data = await folder.getDetail(item)
      console.log('_data:', _data)
      setData(_data)
    }

    init()
  }, [folder, item])
  const isCredential =
    item.schema ===
    'https://verida.github.io/demo-credential-issuer/mapay/v0.1.0/schema.json'

  return (
    <Container>
      <NavigationHeader title={folder.config.title} />
      <Content contentContainerStyle={[isCredential && styles.content]}>
        {isCredential ? (
          <>
            <View style={styles.sender}>
              <Text>Signed by</Text>
              <Image
                source={{
                  uri: 'https://i1.wp.com/www.mapaycorp.com/wp-content/uploads/elementor/thumbs/MAPay-Logo-smaller-pg5ee3dukmnrkppmdc9wnueeowra310sf9vuaf3k74.png?w=800&ssl=1',
                }}
                style={styles.logo}
              />
            </View>
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
          </>
        ) : (
          <List>
            <DataFieldList data={data} />
          </List>
        )}
      </Content>
    </Container>
  )
}

const styles = StyleSheet.create({
  content: {
    paddingVertical: 20,
    paddingHorizontal: 15,
    alignItems: 'center',
  },
  sender: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
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
})

const mapDispatchToProps = () => {
  return {}
}

const mapStateToProps = () => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(DataItem)

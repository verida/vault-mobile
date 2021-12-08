import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Container, Content, List } from 'native-base'

import DataFieldList from '../../components/Data/DataFieldList'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { StyleSheet } from 'react-native'
import CredentialDataItem from 'pages/Data/CredentialDataItem'
import didJWT from 'did-jwt'
import AccountManager from 'api/AccountManager'

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
      const decoded = didJWT.decodeJWT(item.didJwtVc)
      console.log('decoded:', decoded)
      const ds = await AccountManager.getInstance().context.openDatastore(
        item.schema
      )
      const found = await ds.getMany({
        _id: item._id,
      })
      console.log('found:', found)
    }

    init()
  }, [folder, item])
  const isCredential =
    item.schema ===
    'https://verida.github.io/demo-credential-issuer/mapay/v0.1.0/schema.json'

  return (
    <Container>
      <NavigationHeader title={folder.config.title} />
      <Content>
        {isCredential ? (
          <CredentialDataItem data={data} style={styles.credentialContainer} />
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
  credentialContainer: {},
})

const mapDispatchToProps = () => {
  return {}
}

const mapStateToProps = () => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(DataItem)

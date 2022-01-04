import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Container, Content, List } from 'native-base'

import DataFieldList from '../../components/Data/DataFieldList'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { Alert, StyleSheet } from 'react-native'
import CredentialDataItem from 'pages/Data/CredentialDataItem'
import didJWT from 'did-jwt'
import * as Sentry from '@sentry/react-native'
import { getProfile } from 'api/utils'

const DataItem = (props) => {
  const { item, folder } = props.route.params
  const [data, setData] = useState({
    data: [],
    title: '',
  })

  const isCredential = folder.config.database === 'credential'

  useEffect(() => {
    const init = async () => {
      try {
        const _data = await folder.getDetail(item)
        if (isCredential) {
          const decoded = didJWT.decodeJWT(item.didJwtVc)
          const iss = decoded.payload.iss
          const { name, avatar } = await getProfile(iss)
          _data.issuer = {
            name,
            avatar,
            did: iss,
          }
        }
        setData(_data)
      } catch (e) {
        console.error(e)
        Alert.alert('Failed to fetch data')
        Sentry.captureException(e)
      }
    }

    init()
  }, [folder, item, isCredential])

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

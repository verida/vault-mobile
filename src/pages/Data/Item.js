import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { Container, Content, List } from 'native-base'

import DataFieldList from '../../components/Data/DataFieldList'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import { Alert, StyleSheet } from 'react-native'
import CredentialDataItem from 'pages/Data/CredentialDataItem'
import didJWT from 'did-jwt'
import AccountManager from 'api/AccountManager'
import * as Sentry from '@sentry/react-native'

const DataItem = (props) => {
  const { item, folder } = props.route.params
  const [data, setData] = useState({
    data: [],
    title: '',
  })

  const isCredential =
    item.schema ===
    'https://verida.github.io/demo-credential-issuer/mapay/v0.1.0/schema.json'

  useEffect(() => {
    const init = async () => {
      try {
        const _data = await folder.getDetail(item)
        console.log('_data:', _data)
        if (isCredential) {
          const decoded = didJWT.decodeJWT(item.didJwtVc)
          console.log('decoded:', decoded)
          const iss = decoded.payload.iss
          const issProfile =
            await AccountManager.getInstance().context.openProfile(
              'basicProfile',
              iss
            )
          const issAvatar = await issProfile.get('avatar')
          const issName = await issProfile.get('name')
          _data.issuer = {
            name: issName,
            avatar: issAvatar,
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

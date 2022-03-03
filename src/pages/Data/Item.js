import * as Sentry from '@sentry/react-native'
import didJWT from 'did-jwt'
import { Container, Content, List } from 'native-base'
import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet } from 'react-native'
import { connect } from 'react-redux'

import { getProfile } from 'api/utils'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import CredentialDataItem from 'pages/Data/CredentialDataItem'
<<<<<<< HEAD
import didJWT from 'did-jwt'
import * as Sentry from '@sentry/react-native'
import { getProfile } from 'api/utils'
import { get } from 'lodash'
import LoadingView from 'components/LoadingView'
=======

import DataFieldList from '../../components/Data/DataFieldList'
>>>>>>> develop

const DataItem = (props) => {
  const { item, folder } = props.route.params
  const [data, setData] = useState({
    data: [],
    title: '',
  })
  const [loading, setLoading] = useState(false)

  const isCredential = folder.config.database === 'credential'

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        const _data = await folder.getDetail(item)
        if (isCredential) {
          const decoded = didJWT.decodeJWT(item.didJwtVc)
          _data.payload = get(decoded, 'payload.data', {})
          const iss = decoded.payload.iss
          const { name, avatar } = await getProfile(iss)
          _data.issuer = {
            name,
            avatar,
            did: iss,
          }
        }
        setData(_data)
        setLoading(false)
      } catch (e) {
<<<<<<< HEAD
        setLoading(false)
        console.error(e)
=======
>>>>>>> develop
        Alert.alert('Failed to fetch data')
        Sentry.captureException(e)
      }
    }

    init()
  }, [folder, item, isCredential])

  return (
    <Container>
      <NavigationHeader title={folder.config.title} />
      <Content contentContainerStyle={styles.content}>
        {loading ? (
          <LoadingView />
        ) : (
          <>
            {isCredential ? (
              <CredentialDataItem
                data={data}
                item={item}
                style={styles.credentialContainer}
              />
            ) : (
              <List>
                <DataFieldList data={data} />
              </List>
            )}
          </>
        )}
      </Content>
    </Container>
  )
}

const styles = StyleSheet.create({
  content: {
    flexGrow: 1,
  },
  credentialContainer: {},
})

const mapDispatchToProps = () => {
  return {}
}

const mapStateToProps = () => {
  return {}
}

export default connect(mapStateToProps, mapDispatchToProps)(DataItem)

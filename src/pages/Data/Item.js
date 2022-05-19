import * as Sentry from '@sentry/react-native'
import didJWT from 'did-jwt'
import { get } from 'lodash'
import { Container, Content, List } from 'native-base'
import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet } from 'react-native'
import { connect } from 'react-redux'

import { getPublicProfile } from 'api/utils'
import LoadingView from 'components/LoadingView'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import CredentialDataItem from 'pages/Data/CredentialDataItem'

import DataFieldList from '../../components/Data/DataFieldList'

const DataItem = (props) => {
  const { item, folder } = props.route.params
  const [data, setData] = useState({
    data: [],
    title: '',
  })
  const [loading, setLoading] = useState(true)

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

          const { name, avatar } = await getPublicProfile(iss)
          _data.issuer = {
            name,
            avatar,
            did: iss,
          }
        }
        setData(_data)
        setLoading(false)
      } catch (e) {
        setLoading(false)
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

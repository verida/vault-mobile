import Clipboard from '@react-native-community/clipboard'
import * as Sentry from '@sentry/react-native'
import { Credentials } from '@verida/verifiable-credentials'
import { Container, Content, Icon, List } from 'native-base'
import React, { useEffect, useState } from 'react'
import { Alert, StyleSheet } from 'react-native'
import Toast from 'react-native-root-toast'
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
  const [copyUrl, setCopyUrl] = useState(null)

  const isCredential = folder.config.database === 'credential'
  const isContact = folder.config.database === 'social_contact'

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true)
        let _data
        if (isCredential) {
          const credentialLib = new Credentials()
          const vcData = await credentialLib.verifyCredential(item.didJwtVc)
          const credentialData = vcData.payload.vc.credentialSubject
          const schemaUri = vcData.payload.vc.credentialSchema.id
          const credentialDetail = await folder.getDetail(
            credentialData,
            schemaUri
          )
          const iss = vcData.payload.iss

          _data = credentialDetail

          const { name, avatar } = await getPublicProfile(
            iss,
            vcData.payload.vc.veridaContextName
          )
          _data.issuer = {
            name,
            avatar,
            did: iss,
          }
        } else {
          _data = await folder.getDetail(item)
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

  const right = {
    action: () => {
      Clipboard.setString(copyUrl)
      Toast.show('Address copied', {
        duration: Toast.durations.LONG,
        position: -130,
        shadow: false,
        animation: true,
        hideOnPress: true,
        delay: 0,
        backgroundColor: 'rgba(4, 17, 51, 1)',
      })
    },
    icon: (
      <Icon
        name='copy-outline'
        style={{ color: 'rgba(66, 59, 206, 1)', fontSize: 22 }}
      />
    ),
  }

  return (
    <Container>
      <NavigationHeader
        title={folder.config.title}
        right={(isCredential || isContact) && copyUrl ? right : null}
      />
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
                setCopyUrl={setCopyUrl}
              />
            ) : (
              <List>
                <DataFieldList data={data} setCopyUrl={setCopyUrl} />
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

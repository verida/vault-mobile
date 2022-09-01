import { useNavigation } from '@react-navigation/native'
import { SessionTypes } from '@walletconnect/typesv2'
import { getSdkError } from '@walletconnect/utilsv2'
import { Icon } from 'native-base'
import React, { Fragment, useEffect, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useDispatch } from 'react-redux'
import { nearAddresses } from 'wallet-connect/helpers/NearWalletUtil'
import { getWC2SignClient } from 'wallet-connect/helpers/SignClient'
import { DAppv2 } from 'wallet-connect/types'

import Button from 'components/Button'
import LoadingView from 'components/LoadingView'
import ProjectInfoCard from 'components/WalletConnect/ProjectInfoCard'
import SessionChainCard from 'components/WalletConnect/SessionChainCard'

import NavigationHeader from '../../components/Navigation/NavigationHeader'
import { Spacer } from '../../components/Spacer'
import useParams from '../../hooks/useParams'
import { removeWalletConnectSessionv2 } from '../../reduxStore/actions'
import LayoutStyle from '../../styles/layouts'
import text from '../../styles/text'

const DappSessionDetail = () => {
  const params = useParams<{ dapp: DAppv2 }>()
  const topic = params.dapp.topic
  const navigation = useNavigation()
  const dispatch = useDispatch()
  const [session, setSession] = useState<SessionTypes.Struct | undefined>(
    undefined
  )
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!topic) {
      setLoading(false)
    }

    ;(async () => {
      setLoading(true)
      const ss = (await getWC2SignClient()).session.values.find(
        (s) => s.topic === topic
      )
      setSession(ss)
      setLoading(false)
    })()
  }, [topic])

  if (!session) {
    if (loading) {
      return <LoadingView />
    } else {
      dispatch(removeWalletConnectSessionv2(params.dapp))
      Alert.alert('Info', 'Corrupted session removed')
      navigation.goBack()
      return null
    }
  }

  const expiryDate = new Date(session!.expiry * 1000)
  const { namespaces } = session

  // Handle deletion of a session
  async function onDeleteSession() {
    setLoading(true)
    dispatch(removeWalletConnectSessionv2(params.dapp))
    await (
      await getWC2SignClient()
    ).disconnect({ topic, reason: getSdkError('USER_DISCONNECTED') })
    setLoading(false)
    navigation.goBack()
  }

  return (
    <View>
      <NavigationHeader
        title='Session Details'
        left={{
          icon: <Icon name='arrow-back' style={{ color: '#000' }} />,
          action: () => navigation.goBack(),
        }}
      />
      <View style={LayoutStyle.layout}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollViewContainer}>
          <ProjectInfoCard metadata={session.peer.metadata} />
          <Spacer height={16} />

          {Object.keys(namespaces).map((chain) => {
            return (
              <Fragment key={chain}>
                <View style={styles.row}>
                  <Text
                    style={text.primary}>{`Review ${chain} permissions`}</Text>
                </View>
                <SessionChainCard namespace={namespaces[chain]} />
              </Fragment>
            )
          })}

          {nearAddresses?.[0] && (
            <View style={styles.row}>
              <Text style={styles.label}>Account ID</Text>
              <Text style={styles.value}>{nearAddresses[0]}</Text>
            </View>
          )}
          <View style={styles.row}>
            <Text style={styles.label}>Expiry</Text>
            <Text style={styles.value}>{expiryDate.toDateString()}</Text>
          </View>

          <Spacer height={32} />
          <Button
            style={styles.actionButton}
            color='transparent-warning'
            disabled={loading}
            loading={loading}
            onPress={onDeleteSession}>
            Disconnect
          </Button>
        </ScrollView>
      </View>
    </View>
  )
}

export default DappSessionDetail

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'stretch',
    paddingBottom: 30,
  },
  scrollViewContainer: {
    paddingBottom: 32,
  },
  disconnectButton: {
    paddingHorizontal: 24,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginVertical: 8,
  },
  label: {
    minWidth: '40%',
    ...text.grey,
    fontSize: 16,
    textAlign: 'left',
  },
  value: {
    flex: 1,
    ...text.primary,
    textAlign: 'right',
    fontSize: 16,
  },
  appContainer: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 8,
  },
  appTextContainer: { flex: 1, alignItems: 'flex-start', marginLeft: 16 },
  actionButton: {
    alignSelf: 'stretch',
    backgroundColor: 'red',
  },
})

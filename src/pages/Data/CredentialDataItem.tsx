import * as Sentry from '@sentry/react-native'
import { VerifiableCredential } from '@veramo/core'
import { extractIssuer } from '@veramo/utils'
import { getDidMetadata } from 'features/did'
import { isValidVeridaDid } from 'features/verida'
import {
  CredentialValidityStatus,
  getCredentialValidityStatus,
  useCredential,
} from 'features/verifiableCredential'
import { isEmpty } from 'lodash'
import { List } from 'native-base'
import React, { useEffect, useState } from 'react'
import {
  ActivityIndicator,
  Image,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native'
import AntDesign from 'react-native-vector-icons/AntDesign'

import { DefaultAvatar, getPublicProfile } from 'api/utils'
import DataFieldList from 'components/Data/DataFieldList'
import Text from 'components/Text'
import { GREY_COLOR, ORANGE_COLOR, SUCCESS_COLOR } from 'constants/color'
import { NUNITO_SANS, NUNITO_SANS_BOLD } from 'constants/text'

export type CredentialDataItemProps = Omit<ViewProps, 'children'> & {
  data: any
  item: any
  setCopyUrl: any
}

export const CredentialDataItem: React.FunctionComponent<CredentialDataItemProps> =
  (props) => {
    const { data, item, setCopyUrl, ...rest } = props

    const [loading, setLoading] = useState(true)
    const [issuer, setIssuer] = useState({
      did: '',
      name: '',
      avatar: '',
    })
    const [status, setStatus] = useState<CredentialValidityStatus>('unknown')
    const { verifyCredential } = useCredential()

    useEffect(() => {
      async function checkCredential(credential: VerifiableCredential) {
        const result = await verifyCredential(credential)
        const validityStatus = getCredentialValidityStatus(result)
        setStatus(validityStatus)
      }

      async function getIssuerProfile(issuerDid: string, contextName?: string) {
        try {
          let issuerProfile
          // TODO: Move the logic to get the profile of a DID (verida or not) into features/did or features/profile
          if (isValidVeridaDid(issuerDid)) {
            const publicProfile = await getPublicProfile(issuerDid, contextName)
            issuerProfile = {
              did: issuerDid,
              name: publicProfile?.name || 'Unknown',
              avatar: publicProfile?.avatar || DefaultAvatar,
            }
          } else {
            const didMetadata = await getDidMetadata(issuerDid)
            issuerProfile = {
              did: issuerDid,
              name: didMetadata?.name || 'Unknown',
              avatar: didMetadata?.icon || DefaultAvatar,
            }
          }
          setIssuer(issuerProfile)
        } catch (error: unknown) {
          Sentry.captureException(error)
        }
      }

      async function init() {
        if (isEmpty(item)) {
          return
        }

        const { credentialData } = item

        setLoading(true)
        await checkCredential(credentialData)
        const extractedIssuer = extractIssuer(credentialData)
        await getIssuerProfile(extractedIssuer)
        setLoading(false)
      }

      init()
    }, [item, verifyCredential])

    if (isEmpty(data.data)) {
      return null
    }

    const avatarSource = issuer.avatar
      ? typeof issuer.avatar === 'string' && issuer.avatar.startsWith('http')
        ? { uri: issuer.avatar }
        : issuer.avatar
      : DefaultAvatar

    return (
      <View style={styles.container} {...rest}>
        <Text style={styles.title}>{data?.row?.name || item?.name}</Text>
        <View style={styles.verificationStatusContainer}>
          {loading ? (
            <>
              <ActivityIndicator size={20} color={GREY_COLOR} />
              <Text style={styles.verifiedText}>
                Verification in progress...
              </Text>
            </>
          ) : (
            <>
              {status === 'unknown' ? (
                <>
                  <AntDesign
                    name='questioncircleo'
                    size={20}
                    color={GREY_COLOR}
                  />
                  <Text style={styles.verifiedText}>
                    Validity can not be determined
                  </Text>
                </>
              ) : null}
              {status === 'revoked' ? (
                <>
                  <AntDesign
                    name='exclamationcircle'
                    size={20}
                    color={ORANGE_COLOR}
                  />
                  <Text style={styles.verifiedText}>Revoked</Text>
                </>
              ) : null}
              {status === 'suspended' ? (
                <>
                  <AntDesign
                    name='exclamationcircle'
                    size={20}
                    color={ORANGE_COLOR}
                  />
                  <Text style={styles.verifiedText}>Temporarily Suspended</Text>
                </>
              ) : null}
              {status === 'valid' ? (
                <>
                  <AntDesign
                    name='checkcircleo'
                    size={20}
                    color={SUCCESS_COLOR}
                  />
                  <Text style={styles.verifiedText}>Valid</Text>
                </>
              ) : null}
              {status === 'expired' ? (
                <>
                  <AntDesign
                    name='exclamationcircle'
                    size={20}
                    color={ORANGE_COLOR}
                  />
                  <Text style={styles.verifiedText}>Expired</Text>
                </>
              ) : null}
              {status === 'invalid' ? (
                <>
                  <AntDesign
                    name='exclamationcircle'
                    size={20}
                    color={ORANGE_COLOR}
                  />
                  <Text style={styles.verifiedText}>Invalid</Text>
                </>
              ) : null}
            </>
          )}
        </View>
        <View style={styles.issuerSection}>
          <Text>Signed by</Text>
          <View style={styles.issuerInfo}>
            <Image source={avatarSource} style={styles.issuerLogo} />
            <View style={styles.issuerNameAndDidContainer}>
              <Text
                style={styles.issuerName}
                numberOfLines={1}
                ellipsizeMode='middle'>
                {issuer.name}
              </Text>
              <Text
                style={styles.issuerDid}
                numberOfLines={1}
                ellipsizeMode='tail'>
                {issuer.did}
              </Text>
            </View>
          </View>
        </View>
        <List style={{ alignSelf: 'stretch' }}>
          <DataFieldList data={data} setCopyUrl={setCopyUrl} />
        </List>
      </View>
    )
  }

const styles = StyleSheet.create({
  container: {
    alignItems: 'stretch',
  },
  issuerSection: {
    marginTop: 20,
    marginBottom: 10,
    flexDirection: 'column',
    paddingHorizontal: 20,
  },
  issuerInfo: {
    width: '100%',
    marginTop: 10,
    flexDirection: 'row',
  },
  issuerLogo: {
    width: 40,
    height: 40,
    borderRadius: 20,
    resizeMode: 'contain',
    marginRight: 5,
  },
  issuerNameAndDidContainer: {
    flexDirection: 'column',
    flex: 1,
  },
  issuerName: {
    fontFamily: NUNITO_SANS_BOLD,
  },
  issuerDid: {
    fontFamily: NUNITO_SANS,
  },
  verificationStatusContainer: {
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
    alignSelf: 'center',
    marginTop: 20,
    marginLeft: 15,
  },
  loadingStatusContainer: {
    alignSelf: 'center',
  },
  loadingView: {
    maxHeight: 50,
  },
})

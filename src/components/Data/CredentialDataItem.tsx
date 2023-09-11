import * as Sentry from '@sentry/react-native'
import { VerifiableCredential } from '@veramo/core'
import { DataFieldItem, DataItem } from 'features/data'
import { getDidMetadata } from 'features/did'
import { extractIssuer } from 'features/veramo'
import { isValidVeridaDid } from 'features/verida'
import {
  CredentialValidityStatus,
  getCredentialValidityStatus,
  useCredential,
  VeridaVerifiableCredentialRecord,
} from 'features/verifiableCredential'
import { isEmpty } from 'lodash'
import moment from 'moment'
// TODO: Get rid of native-base
import { Body, Card, CardItem, Text as NativeBaseText } from 'native-base'
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
import { DataFieldList } from 'components/Data/DataFieldList'
import Text from 'components/Text'
import { GREY_COLOR, ORANGE_COLOR, SUCCESS_COLOR } from 'constants/color'
import { NUNITO_SANS, NUNITO_SANS_BOLD } from 'constants/text'

export type CredentialDataItemProps = Omit<ViewProps, 'children'> & {
  data: DataItem
  item: VeridaVerifiableCredentialRecord
}

export const CredentialDataItem: React.FunctionComponent<CredentialDataItemProps> =
  (props) => {
    const { data, item } = props

    // TODO: Validate the item is a Verifiable Credential Record
    const { credentialData } = item

    const extractedIssuer = extractIssuer(credentialData)

    const credentialDataFields: DataFieldItem[] = data.data

    const credentialMetadataFields: DataFieldItem[] = [
      {
        field: 'Issuance Date',
        value: item.credentialData.issuanceDate
          ? moment(item.credentialData.issuanceDate).format(
              'DD MMM YYYY, h:mm a'
            )
          : '-',
      },
      {
        field: 'Expiration Date',
        value: item.credentialData.expirationDate
          ? moment(item.credentialData.expirationDate).format(
              'DD MMM YYYY, h:mm a'
            )
          : 'No expiration',
      },
    ]

    const [loading, setLoading] = useState(true)
    const [issuer, setIssuer] = useState({
      did: extractedIssuer,
      name: 'Unknown',
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

      // TODO: Factorise this (or part of it) as it's also used in DataGridListItem
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

        setLoading(true)
        getIssuerProfile(extractedIssuer)
        await checkCredential(credentialData)
        setLoading(false)
      }

      init()
    }, [item, credentialData, extractedIssuer, verifyCredential])

    const avatarSource = issuer.avatar
      ? typeof issuer.avatar === 'string' && issuer.avatar.startsWith('http')
        ? { uri: issuer.avatar }
        : issuer.avatar
      : DefaultAvatar

    return (
      <View style={styles.container}>
        <Text style={styles.title}>{item?.name}</Text>
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
        <Card transparent style={styles.card}>
          <CardItem>
            <Body>
              <NativeBaseText note>Issuer</NativeBaseText>
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
            </Body>
          </CardItem>
        </Card>
        <View>
          <Text style={styles.sectionTitle}>Credential Data</Text>
          <DataFieldList fields={credentialDataFields} />
        </View>
        <View>
          <Text style={styles.sectionTitle}>Other Information</Text>
          <DataFieldList fields={credentialMetadataFields} />
        </View>
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
  sectionTitle: {
    fontSize: 18,
    fontFamily: NUNITO_SANS_BOLD,
    alignSelf: 'flex-start',
    marginTop: 40,
    marginLeft: 15,
  },
  loadingStatusContainer: {
    alignSelf: 'center',
  },
  loadingView: {
    maxHeight: 50,
  },
  card: {
    marginTop: 40,
    marginBottom: 0,
  },
  value: {
    fontSize: 14,
    marginTop: 5,
  },
})

import { useNavigation } from '@react-navigation/native'
import { extractIssuer } from '@veramo/utils'
import { getDidMetadata } from 'features/did'
import { Logger } from 'features/telemetry'
import { isValidVeridaDid } from 'features/verida'
import {
  isCredentialsDatabase,
  VeridaVerifiableCredentialRecord,
} from 'features/verifiableCredential'
import { isEmpty } from 'lodash'
import moment from 'moment'
import { Body, Card, CardItem, Left, Right, Text } from 'native-base'
import React, { useCallback, useEffect, useState } from 'react'
import { Image, ImageSourcePropType, StyleSheet } from 'react-native'

import { DefaultAvatar, getPublicProfile } from 'api/utils'
import Folder from 'api/VaultCommon/managers/data/folder'
// TODO: Factorise this (or part of it) as it's also used in CredentialDataItem
import VeridaSvg from 'assets/icons/verida.svg'

const logger = new Logger('Components/Data/DataGridListItem')

export type DataGridListItemProps = {
  // TODO: Add stronger typing
  item: any
  folder: Folder
}

export const DataGridListItem: React.FunctionComponent<
  DataGridListItemProps
> = (props) => {
  const { folder, item } = props

  const isCredential = isCredentialsDatabase(folder)

  const navigation = useNavigation()

  // TODO: Not pretty, to refactor

  const cardDetail = folder.getCardDetail(item)
  const logoSource = item.icon
    ? typeof item.icon === 'string' && item.icon.startsWith('http')
      ? { uri: item.icon }
      : item.icon
    : isCredential
      ? DefaultAvatar
      : undefined

  const [cardInfo, setCardInfo] = useState({
    logo: logoSource,
    title: cardDetail.name,
    subtitle: cardDetail.summary,
    date: moment(item.insertedAt).format('DD MMM YYYY'),
  })

  const handlePress = useCallback(
    () => navigation.navigate('DataItem', { folder, item }),
    [folder, item, navigation]
  )

  useEffect(() => {
    if (!isCredential || isEmpty(item)) {
      return
    }

    const credentialRecord = item as VeridaVerifiableCredentialRecord
    const extractedIssuer = extractIssuer(credentialRecord.credentialData)

    // TODO: Factorise this (or part of it) as it's also used in CredentialDataItem
    async function getIssuerProfile(issuerDid: string, contextName?: string) {
      try {
        let issuerProfile: {
          name?: string
          avatar?: ImageSourcePropType | string
        }
        // TODO: Move the logic to get the profile of a DID (verida or not) into features/did or features/profile
        if (isValidVeridaDid(issuerDid)) {
          const publicProfile = await getPublicProfile(issuerDid, contextName)
          issuerProfile = {
            name: publicProfile?.name,
            avatar: publicProfile?.avatar,
          }
        } else {
          const didMetadata = await getDidMetadata(issuerDid)
          issuerProfile = {
            name: didMetadata?.name,
            avatar: didMetadata?.icon,
          }
        }
        setCardInfo((prevInfo) => ({
          ...prevInfo,
          subtitle: issuerProfile.name || issuerDid,
          logo: issuerProfile.avatar
            ? typeof issuerProfile.avatar === 'string' &&
              issuerProfile.avatar.startsWith('http')
              ? { uri: issuerProfile.avatar }
              : issuerProfile.avatar
            : DefaultAvatar,
        }))
      } catch (error) {
        logger.error(
          new Error('Failed to get the issuer profile', { cause: error })
        )
      }
    }

    getIssuerProfile(extractedIssuer)
  }, [isCredential, folder, item])

  return (
    <Card style={styles.card}>
      <CardItem button style={styles.cardItem} onPress={handlePress}>
        <Left style={styles.left}>
          {cardInfo.logo ? (
            <Image source={cardInfo.logo} style={styles.avatar} />
          ) : (
            <VeridaSvg />
          )}
          <Body style={styles.body}>
            <Text numberOfLines={1} lineBreakMode='middle'>
              {cardInfo.title}
            </Text>
            <Text
              note
              style={styles.subText}
              numberOfLines={1}
              lineBreakMode='tail'>
              {cardInfo.subtitle}
            </Text>
          </Body>
        </Left>
        <Right style={styles.right}>
          <Text note style={styles.date}>
            {cardInfo.date}
          </Text>
        </Right>
      </CardItem>
    </Card>
  )
}

const styles = StyleSheet.create({
  card: {
    width: '100%',
    borderRadius: 4,
  },
  cardItem: {
    borderRadius: 4,
  },
  left: {
    flex: 1,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 999999,
  },
  body: {
    paddingHorizontal: 5,
  },
  subText: {
    fontSize: 14,
    marginTop: 5,
    width: '100%',
  },
  date: {
    fontSize: 12,
  },
  right: {
    height: '100%',
    flex: -1,
  },
})

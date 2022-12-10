import Clipboard from '@react-native-community/clipboard'
import { RouteProp, useRoute } from '@react-navigation/native'
import { useTheme } from 'contexts/ThemeContext'
import React, { FC, ReactNode } from 'react'
import {
  Alert,
  Dimensions,
  Pressable,
  PressableProps,
  ScrollView,
  StyleSheet,
  View,
  ViewProps,
} from 'react-native'
import FastImage from 'react-native-fast-image'

import { NFTMetadata } from 'api/types'
import MoreIcon from 'assets/more_icon.svg'
import Icon from 'components/Icon/Icon'
import LoadingIndicator from 'components/LoadingIndicator'
import NavigationHeader from 'components/Navigation/NavigationHeader'
import Screen from 'components/Screen'
import { Spacer } from 'components/Spacer'
import { Headline } from 'components/Typography/Headline'
import { Label } from 'components/Typography/Label'
import { SubHeadline } from 'components/Typography/SubHeadline'
import { Text } from 'components/Typography/Text'
import { useReduxState } from 'hooks/useReduxState'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { MainStackParams } from 'navigation/types'
import { getWallets } from 'reduxStore/wallet/selectors'
import { Theme } from 'styles/types'

type NFTDetailProps = {}

type NFTDetailRouteProp = RouteProp<MainStackParams, 'NFTDetail'>

const Row: FC<
  {
    left?: ReactNode
    right?: ReactNode
  } & ViewProps
> = ({ left, right, style, ...rest }) => {
  return (
    <View
      style={[
        {
          flexDirection: 'row',
          flex: 1,
          justifyContent: 'space-between',
        },
        style,
      ]}
      {...rest}>
      <View style={{ flex: 1 }}>{left}</View>
      <Spacer horizontal='m' />
      {right}
    </View>
  )
}

const IconWithText = ({
  icon,
  text,
  onPress,
}: {
  icon?: ReactNode
  text?: ReactNode
} & PressableProps) => {
  return (
    <Pressable onPress={onPress}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}>
        {icon}
        <Spacer horizontal='xs' />
        <Text
          style={{ maxWidth: 140 }}
          ellipsizeMode='middle'
          numberOfLines={1}>
          {text}
        </Text>
      </View>
    </Pressable>
  )
}

const Property = ({
  trail = '',
  value = '',
  style,
}: {
  trail: string
  value: string
} & ViewProps) => {
  const { theme } = useTheme()
  return (
    <View
      style={[
        {
          justifyContent: 'space-between',
          borderColor: theme.color.lightGrey,
          borderWidth: 1,
          padding: theme.spacing.s,
          minWidth: 90,
          borderRadius: theme.roundness.m,
        },
        style,
      ]}>
      <Label
        style={{
          color: theme.color.textLightGrey,
          fontSize: theme.fontSize.xs,
        }}>
        {trail.toUpperCase()}
      </Label>
      <Text>{value}</Text>
    </View>
  )
}

const NFTDetail = (props: NFTDetailProps) => {
  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()
  const route = useRoute<NFTDetailRouteProp>()
  const wallet = useReduxState((state) => getWallets(state.main))

  const nft = route.params.nft
  const metadata = (nft?.metadata as unknown as NFTMetadata) ?? {
    image: null,
  }
  const processIpfs = (ipfsLink: string) =>
    ipfsLink?.replace('ipfs://', 'https://ipfs.io/ipfs/')
  const isIpfsLink = (uri: string) => uri?.startsWith('ipfs://')
  const uri = isIpfsLink(metadata.image)
    ? processIpfs(metadata.image)
    : metadata.image
  const name = nft.name + ` #${nft.token_id}`
  const hasMinterWallet = nft.minter_address?.startsWith('0x')

  if (!nft) return <LoadingIndicator />

  return (
    <Screen withSafeAreaView>
      <NavigationHeader
        title={name}
        right={{
          icon: <MoreIcon />,
          action: () => Alert.alert('Share'),
        }}
        bottomBorder
      />
      <ScrollView>
        <View style={styles.container}>
          <FastImage
            style={styles.image}
            defaultSource={require('assets/picture.png')}
            source={{
              uri,
              priority: FastImage.priority.normal,
            }}
            resizeMode={FastImage.resizeMode.cover}
          />
          <Headline style={styles.title}>{name}</Headline>
          <SubHeadline style={styles.subTitle}>Desciption</SubHeadline>
          <Text style={styles.description}>
            {metadata.description ?? 'N/A'}
          </Text>

          <Row
            style={styles.rowContainer}
            left={<Text style={styles.rowLabel}>Owner</Text>}
            right={
              <IconWithText
                icon={<Icon size={theme.iconSize.s} name='Wallet' />}
                text={wallet.label}
              />
            }
          />
          <Row
            style={styles.rowContainer}
            left={<Text style={styles.rowLabel}>Chain</Text>}
            right={
              <IconWithText
                icon={<Icon size={theme.iconSize.s} name='ethereum' />}
                text={wallet.label}
              />
            }
          />
          <Row
            style={styles.rowContainer}
            left={<Text style={styles.rowLabel}>Asset ID</Text>}
            right={<IconWithText text={nft.block_number} />}
          />
          <Row
            style={styles.rowContainer}
            left={<Text style={styles.rowLabel}>Creator Wallet address</Text>}
            right={
              <IconWithText
                onPress={() => {
                  if (hasMinterWallet) {
                    Clipboard.setString(nft.minter_address as string)
                    Alert.alert('Copied') // TODO:
                  }
                }}
                icon={
                  hasMinterWallet ? (
                    <Icon
                      size={theme.iconSize.s}
                      name='copy'
                      color={theme.color.primary}
                    />
                  ) : null
                }
                text={hasMinterWallet ? nft.minter_address : 'N/A'}
              />
            }
          />

          <SubHeadline style={styles.subTitle}>Properties</SubHeadline>
          <View style={styles.propertiesContainer}>
            {metadata.attributes.map((attribute: any) => (
              <Property
                style={{
                  marginRight: theme.spacing.s,
                  marginBottom: theme.spacing.s,
                }}
                key={attribute.trait_type}
                trail={attribute.trait_type as string}
                value={attribute.value as string}
              />
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  )
}
const SCREEN_WIDTH = Dimensions.get('screen').width
const PADDING = 16
const IMAGE_WIDTH = SCREEN_WIDTH - 2 * PADDING
const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: theme.spacing.m,
    },
    image: {
      width: IMAGE_WIDTH,
      minHeight: IMAGE_WIDTH,
      borderRadius: theme.roundness.xxl,
      marginBottom: theme.spacing.l,
    },
    title: {
      fontSize: theme.fontSize.xxl,
      marginBottom: theme.spacing.m,
    },
    subTitle: {
      marginBottom: theme.spacing.s,
    },
    description: {
      color: theme.color.textLightGrey,
      marginBottom: theme.spacing.m,
    },
    rowContainer: {
      marginBottom: theme.spacing.m,
    },
    rowLabel: {
      color: theme.color.textLightGrey,
    },
    propertiesContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
  })

export default NFTDetail

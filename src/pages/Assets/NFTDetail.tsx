import Clipboard from '@react-native-community/clipboard'
import { RouteProp, useRoute } from '@react-navigation/native'
import { useTheme } from 'contexts/ThemeContext'
import { getWallets } from 'features/wallets'
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

import { NFTMetadata } from 'api/types'
import { NftItem } from 'components/Assets/NftItem'
import { Icon } from 'components/Icon'
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
import { Theme } from 'styles/types'

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

const NFTDetail = () => {
  //const { showActionSheetWithOptions } = useActionSheet()
  const styles = useThemeAwareStyle(createStyles)
  const { theme } = useTheme()
  const route = useRoute<NFTDetailRouteProp>()
  const wallet = useReduxState((state) => getWallets(state.main))

  const nft = route.params.nft
  const metadata = (nft?.metadata as unknown as NFTMetadata) ?? {
    image: null,
  }
  const name = nft.name + ` #${nft.token_id}`
  const hasMinterWallet = nft.minter_address?.startsWith('0x')

  //const handleMoreActions = () => {
  //  const options = ['Send', 'View in Explorer', 'Share', 'Cancel']
  //  const cancelButtonIndex = 3

  //  showActionSheetWithOptions(
  //    {
  //      options,
  //      cancelButtonIndex,
  //    },
  //    (selectedIndex?: number) => {
  //      switch (selectedIndex!) {
  //        case 1:
  //          // Send
  //          break

  //        case 2:
  //          // View in Explorer
  //          break
  //        case 3:
  //          // Share
  //          break

  //        case cancelButtonIndex:
  //          // Canceled
  //          break
  //      }
  //    }
  //  )
  //}

  if (!nft) return <LoadingIndicator />

  return (
    <Screen>
      <NavigationHeader
        title={name}
        // right={{
        //   icon: <MoreIcon fill={theme.color.icon} />,
        //   action: handleMoreActions,
        // }}
        bottomBorder
      />
      <ScrollView
        contentContainerStyle={{
          paddingBottom: theme.spacing.xl,
          paddingHorizontal: theme.spacing.m,
          paddingTop: theme.spacing.m,
        }}
        showsVerticalScrollIndicator={false}>
        <View style={styles.container}>
          <NftItem
            containerStyle={styles.image}
            imageStyle={{ width: IMAGE_WIDTH, minHeight: IMAGE_WIDTH }}
            nft={nft}
          />
          <Headline style={styles.title}>{name}</Headline>
          <SubHeadline style={styles.subTitle}>Description</SubHeadline>
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
          {/** TODO: logic to detect chain */}
          <Row
            style={styles.rowContainer}
            left={<Text style={styles.rowLabel}>Chain</Text>}
            right={
              <IconWithText
                icon={<Icon size={theme.iconSize.s} name='ethereum' />}
                text={'Ethereum'}
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
            left={<Text style={styles.rowLabel}>Creator wallet address</Text>}
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
            {metadata.attributes && metadata.attributes?.length > 0 ? (
              metadata.attributes.map((attribute: any) => (
                <Property
                  style={{
                    marginRight: theme.spacing.s,
                    marginBottom: theme.spacing.s,
                  }}
                  key={attribute.trait_type}
                  trail={attribute.trait_type as string}
                  value={attribute.value as string}
                />
              ))
            ) : (
              <Text style={{ color: theme.color.textLightGrey }}>N/A</Text>
            )}
          </View>
        </View>
      </ScrollView>
      {/* <Footer>
        <Button color='primary' onPress={null}>
          Add to Verida One
        </Button>
      </Footer> */}
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
      backgroundColor: theme.color.background,
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
    footer: {
      backgroundColor: theme.color.surface,
      paddingHorizontal: theme.spacing.sm,
      paddingTop: theme.spacing.sm,
    },
  })

export default NFTDetail

import { useTheme } from 'contexts/ThemeContext'
import React from 'react'
import { StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { PublicWalletAddress } from 'types/profile'

import DragIcon from 'assets/drag_icon.svg'
import EditIcon from 'assets/edit_icon.svg'
import Button from 'components/Button'
import { SubHeadline } from 'components/Typography/SubHeadline'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { smallButtonHitSlop } from 'styles/button'
import { Theme } from 'styles/types'

type Props = {
  walletAddress: PublicWalletAddress
  drag: () => void
  isActive: boolean
  onEditName?: () => void
  setPublicAddress: (
    publicAdress: PublicWalletAddress,
    visible: boolean
  ) => void
}

export const WalletAddressItem = ({
  walletAddress,
  drag,
  isActive,
  onEditName,
  setPublicAddress,
}: Props) => {
  const { theme } = useTheme()
  const styles = useThemeAwareStyle(createStyles)

  return (
    <View
      style={[
        styles.walletItemContainer,
        {
          backgroundColor: walletAddress.isPublic
            ? theme.color.background
            : theme.color.snow,
        },
      ]}>
      <TouchableOpacity
        hitSlop={smallButtonHitSlop}
        onPressIn={drag}
        disabled={isActive}>
        <View style={{ marginHorizontal: theme.spacing.xs }}>
          <DragIcon fill={theme.color.iconDefault} />
        </View>
      </TouchableOpacity>
      <View style={{ flex: 1 }}>
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <View
            style={{
              flex: 1,
              flexDirection: 'row',
            }}>
            <FastImage
              source={{ uri: walletAddress.icon }}
              style={{ width: 48, height: 48 }}
              resizeMode='contain'
            />
            <View style={{ marginLeft: theme.spacing.m }}>
              <SubHeadline
                ellipsizeMode='tail'
                numberOfLines={2}
                style={{
                  maxWidth: 200,
                  color: walletAddress.label
                    ? theme.color.onBackground
                    : theme.color.textLightGrey,
                }}>
                {walletAddress.label || 'Public label'}
              </SubHeadline>
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Text
                  ellipsizeMode='middle'
                  numberOfLines={1}
                  style={{
                    maxWidth: 100,
                    marginRight: theme.spacing.xs,
                  }}>
                  {walletAddress.address}
                </Text>
                <Text style={styles.veridaWalletName}>
                  {walletAddress.veridaWalletName}
                </Text>
              </View>
            </View>
          </View>
          <Button
            color={'transparent'}
            disabled={!walletAddress.isPublic}
            style={{
              width: 40,
              height: 40,
              marginBottom: 0,
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: 'lightGrey',
            }}
            onPress={onEditName}>
            {/* Add a wrapped view so on click behavior fixed */}
            <View>
              <EditIcon fill={theme.color.iconDefault} />
            </View>
          </Button>
        </View>
        <View
          style={{
            marginVertical: theme.spacing.s,
            borderWidth: StyleSheet.hairlineWidth,
            borderColor: theme.color.separatorExtraLight,
          }}
        />
        <View
          style={{
            flex: 1,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <Text>Display on Verida One profile</Text>
          <Switch
            trackColor={{
              false: theme.color.switchFalseState,
              true: theme.color.success,
            }}
            onValueChange={(value: boolean) =>
              setPublicAddress(walletAddress, value)
            }
            value={walletAddress.isPublic}
          />
        </View>
      </View>
    </View>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    walletItemContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: theme.color.background,
      borderColor: theme.color.lightGrey,
      borderWidth: 1,
      borderRadius: theme.roundness.xs,
      paddingVertical: theme.spacing.s,
      paddingRight: theme.spacing.m,
      marginBottom: theme.spacing.s,
    },
    veridaWalletName: {
      color: theme.color.textLightGrey,
    },
  })

import { useTheme } from 'contexts/ThemeContext'
import { debounce } from 'lodash'
import React, { useCallback, useMemo, useState } from 'react'
import { ScrollView, StyleSheet, Switch, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import { useSelector } from 'react-redux'

import AccountManager from 'api/AccountManager'
import Button from 'components/Button'
import type { CaipWalletType, VeridaWallet } from 'components/types/wallet'
import { useThemeAwareStyle } from 'hooks/useThemeAwareStyle'
import { selectChains } from 'reduxStore/tokens/selectors'
import { allWalletsSelector } from 'reduxStore/wallet/selectors'
import { Theme } from 'styles/types'

import ProfileImageLoader from '../../components/ProfileImageLoader'
import PropertyList from '../../components/PropertyList'
import { BLACK_COLOR_OPACITY } from '../../constants/color'
import { NUNITO_SANS_SEMIBOLD } from '../../constants/text'
import Text from '../Text'

interface profileLayoutProps {
  list: any
  publicProfile: any
  description: string
}

interface PublicAddress {
  address: string
  chain: string
  name: string
  visible: boolean
  veridaWalletNameName: string
  description: string
  icon: string
}

export default function ProfileLayout({
  list,
  description,
  publicProfile,
}: profileLayoutProps) {
  const { theme } = useTheme()
  const wallets = useSelector(allWalletsSelector) as Record<
    string,
    VeridaWallet
  >
  const chains = useSelector(selectChains)
  const styles = useThemeAwareStyle(createStyles)
  const [publicWalletAddresses, setPublicWalletAddresses] = useState<
    PublicAddress[]
  >(publicProfile.walletAddresses || [])

  function isVisible(address: string) {
    return (
      publicWalletAddresses.findIndex(
        (walletAddress) => walletAddress.address === address
      ) >= 0
    )
  }

  function getPublicName(address: string) {
    // TODO: find name in public profile data
    return null
  }

  function findChainFromChainId(chainId: string) {
    return Object.values(chains).find(
      (chain: any) => chain.addressMapping === chainId
    )
  }

  const walletAddresses = useMemo<PublicAddress[]>(() => {
    return Object.keys(wallets).reduce((acc, key) => {
      const wallet = wallets[key]
      const accounts = Object.keys(wallet.accounts).map((accountKey) => {
        const account = wallet.accounts[accountKey as CaipWalletType]
        const chain = findChainFromChainId(accountKey) as any
        return {
          address: account.address,
          chain: accountKey,
          name: getPublicName(account.address),
          visible: isVisible(account.address),
          veridaWalletName: wallet.label,
          icon: chain?.icon,
        }
      })

      // console.log('Wallet', JSON.stringify(accounts, null, 2))
      acc.push(...accounts)

      return acc
    }, [] as PublicAddress[])
  }, [wallets, publicWalletAddresses])

  async function setPublicAddress(
    publicAdress: PublicAddress,
    visible: boolean
  ) {
    let newPublicWalletAddresses = [...publicWalletAddresses]

    // console.log(
    //   'Current Wallet Addresses',
    //   JSON.stringify(newPublicWalletAddresses, null, 2)
    // )

    if (visible) {
      newPublicWalletAddresses.push(publicAdress)
    } else {
      newPublicWalletAddresses = newPublicWalletAddresses.filter(
        (walletAddress) => walletAddress.address !== publicAdress.address
      )
    }

    setPublicWalletAddresses(newPublicWalletAddresses)
    debounceSaveProfile(newPublicWalletAddresses)
  }

  const debounceSaveProfile = useCallback(
    debounce(async (walletAddresses) => {
      console.log('save profile', JSON.stringify(walletAddresses, null, 2))
      const vault = AccountManager.getInstance().vault as any
      await vault.profiles.public.set('walletAddresses', walletAddresses)
    }, 2000),
    []
  )

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
      }}>
      <ProfileImageLoader />
      <View>
        <Text>PUBLIC INFORMATION</Text>
        <PropertyList list={list} />
      </View>
      <Text style={styles.description}>{description}</Text>
      <View>
        <View
          style={{
            flexDirection: 'row',
            flex: 1,
            justifyContent: 'space-between',
          }}>
          <Text>WALLET ADDRESS</Text>
          <Button
            style={{ padding: 0, margin: 0, height: 24 }}
            color='transparent'>
            ADD NEW
          </Button>
        </View>
        {walletAddresses.map((walletAddress) => {
          return (
            <View
              key={walletAddress.address}
              style={styles.walletItemContainer}>
              <View style={{ flex: 1 }}>
                <View style={{ flex: 1, flexDirection: 'row' }}>
                  <FastImage
                    source={{ uri: walletAddress.icon }}
                    style={{ width: 48, height: 48 }}
                    resizeMode='contain'
                  />
                  <View style={{ marginLeft: 16 }}>
                    <Text>{walletAddress.name || 'Public title'}</Text>
                    <View style={{ flexDirection: 'row' }}>
                      <Text
                        ellipsizeMode='middle'
                        numberOfLines={1}
                        style={{ maxWidth: 120, marginRight: 16 }}>
                        {walletAddress.address}
                      </Text>
                      <Text>{walletAddress.veridaWalletNameName}</Text>
                    </View>
                  </View>
                </View>
                <View
                  style={{
                    flex: 1,
                    flexDirection: 'row',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    borderTopColor: theme.color.separatorExtraLight,
                    borderTopWidth: 1,
                    paddingTop: 16,
                    marginTop: 16,
                  }}>
                  <Text>Display on Verida One profile</Text>
                  <Switch
                    trackColor={{ false: '#767577', true: theme.color.success }}
                    ios_backgroundColor='#3e3e3e'
                    onValueChange={(value) => {
                      setPublicAddress(walletAddress, value)
                    }}
                    value={walletAddress.visible}
                  />
                </View>
              </View>
            </View>
          )
        })}
      </View>
    </ScrollView>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    description: {
      textAlign: 'center',
      marginVertical: 17,
      color: BLACK_COLOR_OPACITY(0.4),
      fontSize: 12,
      fontFamily: NUNITO_SANS_SEMIBOLD,
    },
    walletItemContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-between',
      backgroundColor: theme.color.background,
      borderColor: theme.color.lightGrey,
      borderWidth: 1,
      borderRadius: theme.roundness.xs,
      padding: theme.spacing.m,
      marginBottom: theme.spacing.s,
    },
  })

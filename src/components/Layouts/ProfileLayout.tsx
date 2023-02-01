import { useTheme } from 'contexts/ThemeContext'
import { debounce } from 'lodash'
import React, { useCallback, useMemo, useState } from 'react'
import { Image, ScrollView, StyleSheet, Switch, View } from 'react-native'
import FastImage from 'react-native-fast-image'
import Snackbar from 'react-native-snackbar'
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wallets, publicWalletAddresses])

  async function setPublicAddress(
    publicAdress: PublicAddress,
    visible: boolean
  ) {
    let newPublicWalletAddresses = [...publicWalletAddresses]

    if (visible) {
      newPublicWalletAddresses.push(publicAdress)
      Snackbar.show({
        text: 'Added to Verida One profile',
        duration: Snackbar.LENGTH_SHORT,
      })
    } else {
      newPublicWalletAddresses = newPublicWalletAddresses.filter(
        (walletAddress) => walletAddress.address !== publicAdress.address
      )
      Snackbar.show({
        text: 'Hidden from Verida One profile',
        duration: Snackbar.LENGTH_SHORT,
      })
    }

    setPublicWalletAddresses(newPublicWalletAddresses)
    debounceSaveProfile(newPublicWalletAddresses)
  }

  const debounceSaveProfile = useCallback(
    debounce(async (walletAddresses) => {
      console.log('save profile', JSON.stringify(walletAddresses, null, 2))
      const vault = AccountManager.getInstance().vault as any
      await vault.profiles.public.set('walletAddresses', walletAddresses)
    }, 1000),
    []
  )

  return (
    <ScrollView
      contentContainerStyle={{
        padding: 16,
      }}>
      <ProfileImageLoader />

      <View style={styles.oneProfileLinkContainer}>
        <Image
          style={{
            position: 'absolute',
            width: '100%',
          }}
          resizeMode='stretch'
          source={require('assets/profile_banner_bg.png')}
        />
        <Text style={{}}>PUBLIC INFORMATION</Text>
      </View>
      <View>
        <Text style={styles.sectionHeader}>PUBLIC INFORMATION</Text>
        <PropertyList list={list} />
      </View>
      <Text style={styles.description}>
        This information is always visible on your Verida One page
      </Text>
      <View
        style={{
          flexDirection: 'row',
          flex: 1,
          justifyContent: 'space-between',
          marginTop: theme.spacing.xl,
        }}>
        <Text>WALLET ADDRESS</Text>
        <Button
          style={{ padding: 0, margin: 0, height: 20 }}
          color='transparent'>
          ADD NEW
        </Button>
      </View>
      {walletAddresses.map((walletAddress) => {
        return (
          <View key={walletAddress.address} style={styles.walletItemContainer}>
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
    </ScrollView>
  )
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    description: {
      marginVertical: theme.spacing.s,
      color: theme.color.onBackground,
      opacity: 0.4,
      fontSize: theme.fontSize.s,
    },
    sectionHeader: {
      color: theme.color.onBackground,
      opacity: 0.6,
      marginBottom: theme.spacing.s,
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
    oneProfileLinkContainer: {
      position: 'relative',
      width: '100%',
      height: 140,
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: theme.spacing.m,
    },
  })

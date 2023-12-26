import { canMigrateToMainnet } from 'features/identities'
import React from 'react'

import MigrateIdentityIcon from 'assets/icons/migrate_identity_icon.svg'
import UpdateProfileIcon from 'assets/icons/update_profile_icon.svg'
// import ConnectIcon from 'assets/icons/connect_icon.svg'
import MainWalletIcon from 'assets/icons/wallet_icon_2.svg'

import { HomeScreenGettingStartedItem } from '../types'

const migrateIdentityItem: HomeScreenGettingStartedItem[] = [
  {
    key: 'migrate_identity',
    label: 'Migrate your Identity to Mainnet',
    icon: <MigrateIdentityIcon />,
    screen: 'MigrateIdentityConfirmation',
  },
]

const homeGettingStartedItems: HomeScreenGettingStartedItem[] = [
  {
    key: 'update_profile',
    label: 'Update your profile',
    icon: <UpdateProfileIcon />,
    screen: 'Profile',
  },
  // {
  //   key: 'connect_accounts',
  //   label: 'Connect social accounts',
  //   icon: <ConnectIcon />,
  //   screen: 'Connections',
  // },
  {
    key: 'manage_crypto_wallet',
    label: 'Manage your crypto wallets',
    icon: <MainWalletIcon />,
    screen: 'ManageWallets',
  },
]

export function getHomeGettingStartedItems(currentDid?: string) {
  const canMigrate = currentDid ? canMigrateToMainnet(currentDid) : false
  const displayedMigrateItem = canMigrate ? migrateIdentityItem : []
  return [...displayedMigrateItem, ...homeGettingStartedItems]
}

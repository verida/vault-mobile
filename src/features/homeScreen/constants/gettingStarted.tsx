import React from 'react'

// import ConnectIcon from 'assets/icons/connect_icon.svg'
import UpdateProfileIcon from 'assets/icons/update_profile_icon.svg'
import MainWalletIcon from 'assets/icons/wallet_icon_2.svg'

import { HomeScreenGettingStartedItem } from '../types'

export const homeGettingStartedItems: HomeScreenGettingStartedItem[] = [
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

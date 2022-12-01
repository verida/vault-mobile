import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'

import { useEventHandlers } from 'hooks/useEventHandlers'
import DashboardNavigator from 'navigation/DashboardNavigator'
import { MainStackParams } from 'navigation/types'
import Create from 'pages/Account/Create'
import DeleteAccount from 'pages/Account/DeleteAccount'
import ChangePin from 'pages/Authentication/ChangePin'
import BadgeClaiming from 'pages/ClaimBadges/BadgeClaiming'
import ClaimBadges from 'pages/ClaimBadges/ClaimBadges'
import SingleConnection from 'pages/Connections/SingleConnection'
import ImportAccount from 'pages/Dashboard/ImportAccount'
import Folder from 'pages/Data/Folder'
import Item from 'pages/Data/Item'
import Inbox from 'pages/Inbox'
import ShareableData from 'pages/Inbox/ShareableData'
import InboxItem from 'pages/InboxItem'
import LoginHistory from 'pages/Login/LoginHistory'
import LoginRequest from 'pages/Login/LoginRequest'
import Networks from 'pages/Networks/Networks'
import EditProfile from 'pages/Profiles/EditProfile'
import PrivateProfile from 'pages/Profiles/PrivateProfile'
import PublicProfile from 'pages/Profiles/PublicProfile'
import ScanQrCode from 'pages/ScanQrCode/ScanQrCode'
import SeedPhrase from 'pages/SeedPhrase/SeedPhrase'
import SeedPhraseEntered from 'pages/SeedPhrase/SeedPhraseEntered'
import SeedPhraseGenerated from 'pages/SeedPhrase/SeedPhraseGenerated'
import SeedPhraseView from 'pages/SeedPhrase/SeedPhraseView'
import VerifyPhrase from 'pages/SeedPhrase/VerifyPhrase'
import Settings from 'pages/Settings'
import StorageNodes from 'pages/StorageNodes/StorageNodes'
import BuyToken from 'pages/Tokens/BuyToken'
import ConfirmTransaction from 'pages/Tokens/ConfirmTransaction'
import ReceiveToken from 'pages/Tokens/ReceiveToken'
import SendToken from 'pages/Tokens/SendToken'
import SingleCurrency from 'pages/Tokens/SingleCurrency'
import TokenRecipient from 'pages/Tokens/TokenRecipient'
import TransactionDetails from 'pages/Tokens/TransactionDetails'
import TransactionFailure from 'pages/Tokens/TransactionFailure'
import TransactionSuccess from 'pages/Tokens/TransactionSuccess'
import ManageWallets from 'pages/Wallets/ManageWallets'
import OtherAddresses from 'pages/Wallets/OtherAddresses'
import SingleWallet from 'pages/Wallets/SingleWallet'
import SuccessFailure from 'pages/Wallets/SuccessFailure'

import DappSessionDetail from '../pages/WalletConnect/DappSessionDetail'
import DappSessionDetailv2 from '../pages/WalletConnect/DappSessionDetailv2'
import WalletConnect from '../pages/WalletConnect/WalletConnect'

const Stack = createNativeStackNavigator<MainStackParams>()

function MainNavigator() {
  useEventHandlers()

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={'BadgeClaiming'} component={BadgeClaiming} />
      <Stack.Screen name={'ClaimBadges'} component={ClaimBadges} />
      <Stack.Screen name={'Dashboard'} component={DashboardNavigator} />
      <Stack.Screen name={'Inbox'} component={Inbox} />
      <Stack.Screen name={'InboxItem'} component={InboxItem} />
      <Stack.Screen name={'LoginHistory'} component={LoginHistory} />
      <Stack.Screen name={'LoginRequest'} component={LoginRequest} />
      <Stack.Screen name={'PublicProfile'} component={PublicProfile} />
      <Stack.Screen name={'PrivateProfile'} component={PrivateProfile} />
      <Stack.Screen name={'EditProfile'} component={EditProfile} />
      <Stack.Screen name={'SeedPhraseView'} component={SeedPhraseView} />
      <Stack.Screen name={'SeedPhraseEntered'} component={SeedPhraseEntered} />
      <Stack.Screen name={'ManageWallets'} component={ManageWallets} />
      <Stack.Screen name={'SingleWallet'} component={SingleWallet} />
      <Stack.Screen name={'OtherAddresses'} component={OtherAddresses} />
      <Stack.Screen name={'SuccessFailure'} component={SuccessFailure} />
      <Stack.Screen name={'SingleCurrency'} component={SingleCurrency} />
      <Stack.Screen name={'SendToken'} component={SendToken} />
      <Stack.Screen
        name={'ConfirmTransaction'}
        component={ConfirmTransaction}
      />
      <Stack.Screen
        name={'TransactionSuccess'}
        component={TransactionSuccess}
      />
      <Stack.Screen
        name={'TransactionFailure'}
        component={TransactionFailure}
      />
      <Stack.Screen
        name={'TransactionDetails'}
        component={TransactionDetails}
      />
      <Stack.Screen name={'TokenRecipient'} component={TokenRecipient} />
      <Stack.Screen name={'BuyToken'} component={BuyToken} />
      <Stack.Screen name={'ReceiveToken'} component={ReceiveToken} />
      <Stack.Screen name={'DataFolder'} component={Folder} />
      <Stack.Screen name={'DataItem'} component={Item} />
      <Stack.Screen name={'Settings'} component={Settings} />
      <Stack.Screen name={'ChangePin'} component={ChangePin} />
      <Stack.Screen name={'ScanQrCode'} component={ScanQrCode} />
      <Stack.Screen name={'AddAccount'} component={Create} />
      <Stack.Screen name={'ImportAccount'} component={ImportAccount} />
      <Stack.Screen name={'DeleteAccount'} component={DeleteAccount} />

      <Stack.Screen name={'SeedPhrase'} component={SeedPhrase} />
      <Stack.Screen
        name={'SeedPhraseGenerated'}
        component={SeedPhraseGenerated}
      />
      <Stack.Screen name={'VerifyPhrase'} component={VerifyPhrase} />
      <Stack.Screen name={'ShareableData'} component={ShareableData} />
      <Stack.Screen name={'Networks'} component={Networks} />
      <Stack.Screen name={'StorageNodes'} component={StorageNodes} />

      <Stack.Screen name={'WalletConnect'} component={WalletConnect} />
      <Stack.Screen name={'WalletConnectDapp'} component={DappSessionDetail} />
      <Stack.Screen
        name={'WalletConnectDappv2'}
        component={DappSessionDetailv2}
      />

      <Stack.Screen name={'SingleConnection'} component={SingleConnection} />
    </Stack.Navigator>
  )
}

export default MainNavigator

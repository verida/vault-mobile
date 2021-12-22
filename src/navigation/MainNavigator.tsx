import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { MainStackParams } from 'navigation/types'
import DashboardNavigator from 'navigation/DashboardNavigator'
import Inbox from 'pages/Inbox'
import InboxItem from 'pages/InboxItem'
import LoginHistory from 'pages/Login/LoginHistory'
import LoginRequest from 'pages/Login/LoginRequest'
import PublicProfile from 'pages/Profiles/PublicProfile'
import PrivateProfile from 'pages/Profiles/PrivateProfile'
import EditProfile from 'pages/Profiles/EditProfile'
import SeedPhraseView from 'pages/SeedPhrase/SeedPhraseView'
import ManageWallets from 'pages/Wallets/ManageWallets'
import SingleWallet from 'pages/Wallets/SingleWallet'
import OtherAddresses from 'pages/Wallets/OtherAddresses'
import SuccessFailure from 'pages/Wallets/SuccessFailure'
import SingleCurrency from 'pages/Tokens/SingleCurrency'
import SendToken from 'pages/Tokens/SendToken'
import TokenRecipient from 'pages/Tokens/TokenRecipient'
import ConfirmTransaction from 'pages/Tokens/ConfirmTransaction'
import BuyToken from 'pages/Tokens/BuyToken'
import ReceiveToken from 'pages/Tokens/ReceiveToken'
import Folder from 'pages/Data/Folder'
import Item from 'pages/Data/Item'
import Settings from 'pages/Settings'
import ChangePin from 'pages/Authentication/ChangePin'
import ScanQrCode from 'pages/ScanQrCode/ScanQrCode'
import { useEventHandlers } from 'hooks/useEventHandlers'
import AddAccount from 'pages/Dashboard/AddAccount'
import ImportAccount from 'pages/Dashboard/ImportAccount'
import SeedPhrase from 'pages/SeedPhrase/SeedPhrase'
import VerifyPhrase from 'pages/SeedPhrase/VerifyPhrase'
import SeedPhraseGenerated from 'pages/SeedPhrase/SeedPhraseGenerated'
import ShareableData from 'pages/Inbox/ShareableData'

const Stack = createNativeStackNavigator<MainStackParams>()

function MainNavigator() {
  useEventHandlers()

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name={'Dashboard'} component={DashboardNavigator} />
      <Stack.Screen name={'Inbox'} component={Inbox} />
      <Stack.Screen name={'InboxItem'} component={InboxItem} />
      <Stack.Screen name={'LoginHistory'} component={LoginHistory} />
      <Stack.Screen name={'LoginRequest'} component={LoginRequest} />
      <Stack.Screen name={'PublicProfile'} component={PublicProfile} />
      <Stack.Screen name={'PrivateProfile'} component={PrivateProfile} />
      <Stack.Screen name={'EditProfile'} component={EditProfile} />
      <Stack.Screen name={'SeedPhraseView'} component={SeedPhraseView} />
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
      <Stack.Screen name={'TokenRecipient'} component={TokenRecipient} />
      <Stack.Screen name={'BuyToken'} component={BuyToken} />
      <Stack.Screen name={'ReceiveToken'} component={ReceiveToken} />
      <Stack.Screen name={'DataFolder'} component={Folder} />
      <Stack.Screen name={'DataItem'} component={Item} />
      <Stack.Screen name={'Settings'} component={Settings} />
      <Stack.Screen name={'ChangePin'} component={ChangePin} />
      <Stack.Screen name={'ScanQrCode'} component={ScanQrCode} />
      <Stack.Screen name={'AddAccount'} component={AddAccount} />
      <Stack.Screen name={'ImportAccount'} component={ImportAccount} />
      <Stack.Screen name={'SeedPhrase'} component={SeedPhrase} />
      <Stack.Screen
        name={'SeedPhraseGenerated'}
        component={SeedPhraseGenerated}
      />
      <Stack.Screen name={'VerifyPhrase'} component={VerifyPhrase} />
      <Stack.Screen name={'ShareableData'} component={ShareableData} />
    </Stack.Navigator>
  )
}

export default MainNavigator

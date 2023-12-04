import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { BehindAuthContextProviders } from 'contexts'
import React from 'react'

import { BehindAuthHandlers } from 'components/BehindAuthHandlers'
import { TabsNavigator } from 'navigation/TabsNavigator'
import { MainStackParams } from 'navigation/types'
import NFTCollectionDetail from 'pages/Assets/NFTCollectionDetail'
import NFTDetail from 'pages/Assets/NFTDetail'
import SelectAsset from 'pages/Assets/SelectAsset'
import { ChangePin } from 'pages/Authentication/ChangePin'
import SingleConnection from 'pages/Connections/SingleConnection'
import { DataFolderScreen, DataItemScreen } from 'pages/Data'
import {
  AddIdentityScreen,
  CreateIdentityScreen,
  DeleteIdentityScreen,
  ImportIdentityScreen,
} from 'pages/Identity'
import Inbox from 'pages/Inbox'
import ShareableData from 'pages/Inbox/ShareableData'
import InboxItem from 'pages/InboxItem'
import LoginHistory from 'pages/Login/LoginHistory'
import LoginRequest from 'pages/Login/LoginRequest'
import Networks from 'pages/Networks/Networks'
import AddCustomLink from 'pages/Profiles/AddCustomLink'
import AddPlatformLink from 'pages/Profiles/AddPlatformLink'
import ClaimUsername from 'pages/Profiles/ClaimUsername'
import EditGenericProperty from 'pages/Profiles/EditGenericProperty'
import EditPlatformLink from 'pages/Profiles/EditPlatformLink'
import EditProfile from 'pages/Profiles/EditProfile'
import PrivateProfile from 'pages/Profiles/PrivateProfile'
import { PublicProfile } from 'pages/Profiles/PublicProfile'
import UnlockVeridaOne from 'pages/Profiles/UnlockVeridaOne'
import { QrCodeScannerScreen } from 'pages/QrCodeScanner'
import {
  ConnectionRequestScreen,
  IncomingDataRequestScreen,
  PaymentRequestScreen,
  ProofRequestScreen,
} from 'pages/Requests'
import SeedPhrase from 'pages/SeedPhrase/SeedPhrase'
import SeedPhraseGenerated from 'pages/SeedPhrase/SeedPhraseGenerated'
import SeedPhraseView from 'pages/SeedPhrase/SeedPhraseView'
import VerifyPhrase from 'pages/SeedPhrase/VerifyPhrase'
import Settings from 'pages/Settings'
import { PolygonIdCircuitsSettingsScreen } from 'pages/Settings/PolygonID'
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
import { WalletConnectActiveSessionDetails } from 'pages/WalletConnectActiveSessionDetails'
import { WalletConnectActiveSessions } from 'pages/WalletConnectActiveSessions'
import ManageWallets from 'pages/Wallets/ManageWallets'
import OtherAddresses from 'pages/Wallets/OtherAddresses'
import SingleWallet from 'pages/Wallets/SingleWallet'
import SuccessFailure from 'pages/Wallets/SuccessFailure'

const Stack = createNativeStackNavigator<MainStackParams>()

export const MainNavigator: React.FunctionComponent = () => {
  return (
    <>
      {/* As the MainNavigator is only mounted after the user is authenticated, so are these context providers. */}
      <BehindAuthContextProviders>
        {/* An empty component, just to register all of the main app events after the user has authenticated. */}
        <BehindAuthHandlers />
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name={'Dashboard'} component={TabsNavigator} />
          <Stack.Screen name={'Inbox'} component={Inbox} />
          <Stack.Screen name={'InboxItem'} component={InboxItem} />
          <Stack.Screen name={'LoginHistory'} component={LoginHistory} />
          <Stack.Screen name={'LoginRequest'} component={LoginRequest} />
          <Stack.Screen name={'PublicProfile'} component={PublicProfile} />
          <Stack.Screen name={'PrivateProfile'} component={PrivateProfile} />

          {/* Public profile modal screens */}
          <Stack.Group
            screenOptions={{
              presentation: 'modal',
            }}>
            <Stack.Screen name={'EditProfile'} component={EditProfile} />
            <Stack.Screen
              name={'EditGenericProperty'}
              component={EditGenericProperty}
            />
            <Stack.Screen name={'AddCustomLink'} component={AddCustomLink} />
            <Stack.Screen name={'SelectAsset'} component={SelectAsset} />
            <Stack.Screen name={'ClaimUsername'} component={ClaimUsername} />
            <Stack.Screen
              name={'UnlockVeridaOne'}
              component={UnlockVeridaOne}
            />
            <Stack.Screen
              name={'AddPlatformLink'}
              component={AddPlatformLink}
            />
            <Stack.Screen
              name={'EditPlatformLink'}
              component={EditPlatformLink}
            />
          </Stack.Group>

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
          <Stack.Screen name={'DataFolder'} component={DataFolderScreen} />
          <Stack.Screen name={'DataItem'} component={DataItemScreen} />
          <Stack.Screen name={'Settings'} component={Settings} />
          <Stack.Screen name={'ChangePin'} component={ChangePin} />
          <Stack.Screen name={'ScanQrCode'} component={QrCodeScannerScreen} />

          <Stack.Screen name={'AddIdentity'} component={AddIdentityScreen} />
          <Stack.Screen
            name='CreateIdentity'
            component={CreateIdentityScreen}
          />
          <Stack.Screen
            name={'ImportIdentity'}
            component={ImportIdentityScreen}
          />
          <Stack.Screen
            name={'DeleteIdentity'}
            component={DeleteIdentityScreen}
          />

          <Stack.Screen name={'SeedPhrase'} component={SeedPhrase} />
          <Stack.Screen
            name={'SeedPhraseGenerated'}
            component={SeedPhraseGenerated}
          />
          <Stack.Screen name={'VerifyPhrase'} component={VerifyPhrase} />
          <Stack.Screen name={'ShareableData'} component={ShareableData} />
          <Stack.Screen name={'Networks'} component={Networks} />
          <Stack.Screen name={'StorageNodes'} component={StorageNodes} />

          <Stack.Screen
            name='WalletConnectActiveSessions'
            component={WalletConnectActiveSessions}
          />
          <Stack.Screen
            name='WalletConnectActiveSessionDetails'
            component={WalletConnectActiveSessionDetails}
          />

          <Stack.Screen
            name={'SingleConnection'}
            component={SingleConnection}
          />

          <Stack.Screen
            name={'NFTCollectionDetail'}
            component={NFTCollectionDetail}
          />
          <Stack.Screen name={'NFTDetail'} component={NFTDetail} />

          <Stack.Screen
            name={'PolygonIdCircuitsSettings'}
            component={PolygonIdCircuitsSettingsScreen}
            options={{
              // TODO: Refactor the whole Navigation to leverage the header customisation
              headerShown: true,
            }}
          />

          {/* Modal screens */}
          <Stack.Group
            screenOptions={{
              presentation: 'modal',
              headerShown: true, // Set as shown to use the default header from react-navigation as our custom one was not appropriate.
              // TODO: Refactor the whole Navigation to leverage the header customisation from here instead of in each screen.
            }}>
            <Stack.Screen
              name={'ConnectionRequest'}
              component={ConnectionRequestScreen}
            />
            <Stack.Screen
              name={'IncomingDataRequest'}
              component={IncomingDataRequestScreen}
            />
            <Stack.Screen
              name={'PaymentRequest'}
              component={PaymentRequestScreen}
            />
            <Stack.Screen
              name={'ProofRequest'}
              component={ProofRequestScreen}
            />
          </Stack.Group>
        </Stack.Navigator>
      </BehindAuthContextProviders>
    </>
  )
}

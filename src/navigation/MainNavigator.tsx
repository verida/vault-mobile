import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { BaseScreenHeader, ModalScreenHeader } from 'components'
import { BehindAuthContextProviders } from 'contexts'
import React from 'react'

import { BehindAuthHandlers } from 'components/BehindAuthHandlers'
import { TabsNavigator } from 'navigation/TabsNavigator'
import { MainStackParams } from 'navigation/types'
import NFTCollectionDetail from 'pages/Assets/NFTCollectionDetail'
import NFTDetail from 'pages/Assets/NFTDetail'
import SelectAsset from 'pages/Assets/SelectAsset'
import { ChangePin } from 'pages/Authentication/ChangePin'
import BlockchainNetworks from 'pages/BlockchainNetworks/BlockchainNetworks'
import { BlockchainNetworksEditor } from 'pages/BlockchainNetworksEditor'
import SingleConnection from 'pages/Connections/SingleConnection'
import { DataFolderScreen, DataItemScreen } from 'pages/Data'
import {
  AddIdentityScreen,
  CreateIdentityScreen,
  DeleteIdentityScreen,
  ImportIdentityScreen,
  MigrateIdentityConfirmationScreen,
  MigrateIdentityExecutionScreen,
  RemoveIdentityScreen,
  ShareIdentityScreen,
} from 'pages/Identity'
import { InboxItemScreen, InboxScreen, ShareableDataScreen } from 'pages/Inbox'
import { LoginHistoryScreen } from 'pages/Login'
import LoginRequest from 'pages/Login/LoginRequest'
import {
  AddVeridaOneCustomLinkScreen,
  AddVeridaOnePlatformLinkScreen,
  ClaimUsernameScreen,
  EditGenericPropertyScreen,
  EditProfileScreen,
  EditVeridaOnePlatformLinkScreen,
  PublicProfileScreen,
  UnlockVeridaOneScreen,
} from 'pages/Profiles'
import { QrCodeScannerScreen } from 'pages/QrCodeScanner'
import {
  SeedPhraseGeneratedScreen,
  SeedPhraseScreen,
  SeedPhraseViewScreen,
  VerifyPhraseScreen,
} from 'pages/RecoveryPhrase'
import {
  ConnectionRequestScreen,
  IncomingDataRequestScreen,
  PaymentRequestScreen,
  ProofRequestScreen,
} from 'pages/Requests'
import { PolygonIdCircuitsSettingsScreen, SettingsScreen } from 'pages/Settings'
import {
  BuyTokenScreen,
  ConfirmTransactionScreen,
  ReceiveTokenScreen,
  SendTokenScreen,
  SingleCurrencyScreen,
  TokenRecipientScreen,
  TransactionDetailsScreen,
  TransactionFailureScreen,
  TransactionSuccessScreen,
} from 'pages/Tokens'
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
        <Stack.Navigator
          initialRouteName='Tabs'
          screenOptions={{
            headerShown: false,
          }}>
          <Stack.Screen
            name='Tabs'
            component={TabsNavigator}
            options={{ headerShown: false }}
          />

          <Stack.Screen name='Inbox' component={InboxScreen} />
          <Stack.Screen name='InboxItem' component={InboxItemScreen} />

          <Stack.Screen name={'LoginHistory'} component={LoginHistoryScreen} />
          <Stack.Screen name={'LoginRequest'} component={LoginRequest} />

          <Stack.Screen name='PublicProfile' component={PublicProfileScreen} />

          {/* Public profile modal screens */}
          <Stack.Group
            screenOptions={{
              presentation: 'modal',
            }}>
            <Stack.Screen name='EditProfile' component={EditProfileScreen} />
            <Stack.Screen
              name='EditGenericProperty'
              component={EditGenericPropertyScreen}
            />
            <Stack.Screen
              name='AddVeridaOneCustomLink'
              component={AddVeridaOneCustomLinkScreen}
            />
            <Stack.Screen name={'SelectAsset'} component={SelectAsset} />
            <Stack.Screen
              name='ClaimUsername'
              component={ClaimUsernameScreen}
            />
            <Stack.Screen
              name='UnlockVeridaOne'
              component={UnlockVeridaOneScreen}
            />
            <Stack.Screen
              name='AddVeridaOnePlatformLink'
              component={AddVeridaOnePlatformLinkScreen}
            />
            <Stack.Screen
              name='EditVeridaOnePlatformLink'
              component={EditVeridaOnePlatformLinkScreen}
            />
          </Stack.Group>

          <Stack.Screen
            name='SeedPhraseView'
            component={SeedPhraseViewScreen}
          />
          <Stack.Screen name={'ManageWallets'} component={ManageWallets} />
          <Stack.Screen name={'SingleWallet'} component={SingleWallet} />
          <Stack.Screen name={'OtherAddresses'} component={OtherAddresses} />
          <Stack.Screen name={'SuccessFailure'} component={SuccessFailure} />
          <Stack.Screen
            name='SingleCurrency'
            component={SingleCurrencyScreen}
          />
          <Stack.Screen name='SendToken' component={SendTokenScreen} />
          <Stack.Screen
            name='ConfirmTransaction'
            component={ConfirmTransactionScreen}
          />
          <Stack.Screen
            name='TransactionSuccess'
            component={TransactionSuccessScreen}
          />
          <Stack.Screen
            name='TransactionFailure'
            component={TransactionFailureScreen}
          />
          <Stack.Screen
            name='TransactionDetails'
            component={TransactionDetailsScreen}
          />
          <Stack.Screen
            name='TokenRecipient'
            component={TokenRecipientScreen}
          />
          <Stack.Screen name='BuyToken' component={BuyTokenScreen} />
          <Stack.Screen name='ReceiveToken' component={ReceiveTokenScreen} />

          <Stack.Screen name={'DataFolder'} component={DataFolderScreen} />
          <Stack.Screen name={'DataItem'} component={DataItemScreen} />
          <Stack.Screen name={'ChangePin'} component={ChangePin} />
          <Stack.Screen name={'ScanQrCode'} component={QrCodeScannerScreen} />

          <Stack.Screen name='AddIdentity' component={AddIdentityScreen} />
          <Stack.Screen
            name='CreateIdentity'
            component={CreateIdentityScreen}
          />
          <Stack.Screen
            name='ImportIdentity'
            component={ImportIdentityScreen}
          />
          <Stack.Screen
            name='RemoveIdentity'
            component={RemoveIdentityScreen}
          />
          <Stack.Screen
            name='DeleteIdentity'
            component={DeleteIdentityScreen}
          />
          <Stack.Screen
            name='MigrateIdentityConfirmation'
            component={MigrateIdentityConfirmationScreen}
            options={{
              headerShown: true,
            }}
          />
          <Stack.Screen
            name='MigrateIdentityExecution'
            component={MigrateIdentityExecutionScreen}
          />

          <Stack.Screen name='SeedPhrase' component={SeedPhraseScreen} />
          <Stack.Screen
            name='SeedPhraseGenerated'
            component={SeedPhraseGeneratedScreen}
          />
          <Stack.Screen name='VerifyPhrase' component={VerifyPhraseScreen} />
          <Stack.Screen name='ShareableData' component={ShareableDataScreen} />
          <Stack.Screen
            name={'BlockchainNetworks'}
            component={BlockchainNetworks}
          />
          <Stack.Screen
            name={'BlockchainNetworksEditor'}
            component={BlockchainNetworksEditor}
          />
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

          {/* Internal Screens */}
          {__DEV__ && (
            <Stack.Screen
              name='__Storybook__'
              component={require('../../.storybook').default}
            />
          )}

          {/* Modal screens */}
          <Stack.Group
            screenOptions={{
              presentation: 'modal',
              headerShown: true, // Set as shown to use the default header from react-navigation as our custom one was not appropriate.
              // TODO: Refactor the whole Navigation to leverage the header customisation from here instead of in each screen.
            }}>
            <Stack.Screen
              name='ConnectionRequest'
              component={ConnectionRequestScreen}
            />
            <Stack.Screen
              name='IncomingDataRequest'
              component={IncomingDataRequestScreen}
            />
            <Stack.Screen
              name='PaymentRequest'
              component={PaymentRequestScreen}
            />
            <Stack.Screen name='ProofRequest' component={ProofRequestScreen} />
          </Stack.Group>

          {/* Groups with the new BaseScreenHeader
          TODO: Progressively move other screens here to migrate from old header
          Eventually apply it at the very top and remove the group
           */}
          <Stack.Group
            screenOptions={{
              headerShown: true,
              headerShadowVisible: true,
              header: (props) => <BaseScreenHeader {...props} />,
            }}>
            <Stack.Screen name='Settings' component={SettingsScreen} />
            <Stack.Screen
              name='PolygonIdCircuitsSettings'
              component={PolygonIdCircuitsSettingsScreen}
            />
          </Stack.Group>
          <Stack.Group
            screenOptions={{
              presentation: 'modal',
              headerShown: true,
              header: (props) => <ModalScreenHeader {...props} />,
              headerShadowVisible: true,
            }}>
            <Stack.Screen
              name='ShareIdentity'
              component={ShareIdentityScreen}
            />
          </Stack.Group>
        </Stack.Navigator>
      </BehindAuthContextProviders>
    </>
  )
}

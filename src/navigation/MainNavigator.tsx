import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'

import LoadingView from 'components/LoadingView'
import { useAuth } from 'hooks/useAuth'
import { TabsNavigator } from 'navigation/TabsNavigator'
import { MainStackParams } from 'navigation/types'
import NFTCollectionDetail from 'pages/Assets/NFTCollectionDetail'
import NFTDetail from 'pages/Assets/NFTDetail'
import SelectAsset from 'pages/Assets/SelectAsset'
import { ChangePin } from 'pages/Authentication/ChangePin'
import { CreatePin } from 'pages/Authentication/CreatePin'
import {
  BlockchainNetworkEditorScreen,
  BlockchainNetworksScreen,
} from 'pages/Blockchains'
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
import Inbox from 'pages/Inbox'
import ShareableData from 'pages/Inbox/ShareableData'
import InboxItem from 'pages/InboxItem'
import LoginHistory from 'pages/Login/LoginHistory'
import LoginRequest from 'pages/Login/LoginRequest'
import { OnboardingScreen } from 'pages/Onboarding'
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
  ConnectionRequestScreen,
  IncomingDataRequestScreen,
  PaymentRequestScreen,
  ProofRequestScreen,
} from 'pages/Requests'
import SeedPhrase from 'pages/SeedPhrase/SeedPhrase'
import SeedPhraseGenerated from 'pages/SeedPhrase/SeedPhraseGenerated'
import SeedPhraseView from 'pages/SeedPhrase/SeedPhraseView'
import VerifyPhrase from 'pages/SeedPhrase/VerifyPhrase'
import { PolygonIdCircuitsSettingsScreen, SettingsScreen } from 'pages/Settings'
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
  const { authenticated, loaded } = useAuth()

  if (!loaded) {
    return <LoadingView />
  }

  return (
    <Stack.Navigator
      initialRouteName={authenticated ? 'Tabs' : 'Onboarding'}
      screenOptions={{ headerShown: false }}>
      {/* Common group of screens, available when authenticated or not */}
      <Stack.Group>
        <Stack.Screen name='AddIdentity' component={AddIdentityScreen} />
        <Stack.Screen name='CreateIdentity' component={CreateIdentityScreen} />
        <Stack.Screen name='ImportIdentity' component={ImportIdentityScreen} />
        <Stack.Screen name={'SeedPhrase'} component={SeedPhrase} />
        <Stack.Screen
          name={'SeedPhraseGenerated'}
          component={SeedPhraseGenerated}
        />
        <Stack.Screen name={'VerifyPhrase'} component={VerifyPhrase} />
      </Stack.Group>

      {!authenticated ? (
        <>
          <Stack.Screen name={'Onboarding'} component={OnboardingScreen} />
          <Stack.Screen name={'CreatePin'} component={CreatePin} />
        </>
      ) : (
        <>
          <Stack.Screen name={'Tabs'} component={TabsNavigator} />
          <Stack.Screen name={'Inbox'} component={Inbox} />
          <Stack.Screen name={'InboxItem'} component={InboxItem} />
          <Stack.Screen name={'LoginHistory'} component={LoginHistory} />
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
          <Stack.Screen name={'Settings'} component={SettingsScreen} />
          <Stack.Screen name={'ChangePin'} component={ChangePin} />
          <Stack.Screen name={'ScanQrCode'} component={QrCodeScannerScreen} />

          <Stack.Screen
            name={'RemoveIdentity'}
            component={RemoveIdentityScreen}
          />
          <Stack.Screen
            name={'DeleteIdentity'}
            component={DeleteIdentityScreen}
          />
          <Stack.Screen
            name={'MigrateIdentityConfirmation'}
            component={MigrateIdentityConfirmationScreen}
            options={{
              headerShown: true,
            }}
          />
          <Stack.Screen
            name={'MigrateIdentityExecution'}
            component={MigrateIdentityExecutionScreen}
          />

          <Stack.Screen name={'VerifyPhrase'} component={VerifyPhrase} />
          <Stack.Screen name={'ShareableData'} component={ShareableData} />
          <Stack.Screen
            name={'BlockchainNetworks'}
            component={BlockchainNetworksScreen}
          />
          <Stack.Screen
            name={'BlockchainNetworkEditor'}
            component={BlockchainNetworkEditorScreen}
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

          <Stack.Screen
            name='PolygonIdCircuitsSettings'
            component={PolygonIdCircuitsSettingsScreen}
            options={{
              // TODO: Refactor the whole Navigation to leverage the header customisation
              headerShown: true,
            }}
          />

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
          <Stack.Group
            screenOptions={{
              presentation: 'modal',
              headerShown: true, // Set as shown to use the default header from react-navigation as our custom one was not appropriate.
              // TODO: Refactor the whole Navigation to leverage the header customisation from here instead of in each screen.
            }}>
            <Stack.Screen
              name='ShareIdentity'
              component={ShareIdentityScreen}
            />
          </Stack.Group>
        </>
      )}
    </Stack.Navigator>
  )
}

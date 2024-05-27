import { createNativeStackNavigator } from '@react-navigation/native-stack'
import React from 'react'

import { BaseScreenHeader, ModalScreenHeader } from '~/components'
import { BehindAuthHandlers } from '~/components/BehindAuthHandlers'
import { BehindAuthContextProviders } from '~/contexts'
import { NFTCollectionDetailScreen } from '~/pages/Assets/NFTCollectionDetail'
import { NFTDetailScreen } from '~/pages/Assets/NFTDetail'
import { SelectAssetScreen } from '~/pages/Assets/SelectAsset'
import { ChangePinScreen } from '~/pages/Authentication/ChangePin'
import {
  BlockchainNetworkEditorScreen,
  BlockchainNetworksScreen,
} from '~/pages/Blockchains'
import { SingleConnectionScreen } from '~/pages/Connections'
import { DataFolderScreen, DataItemScreen } from '~/pages/Data'
import {
  AddIdentityScreen,
  CreateIdentityScreen,
  DeleteIdentityScreen,
  ImportIdentityScreen,
  MigrateIdentityConfirmationScreen,
  MigrateIdentityExecutionScreen,
  RemoveIdentityScreen,
  ShareIdentityScreen,
} from '~/pages/Identity'
import {
  InboxItemScreen,
  InboxScreen,
  ShareableDataScreen,
} from '~/pages/Inbox'
import { LoginHistoryScreen } from '~/pages/Login'
import { LoginRequestScreen } from '~/pages/Login/LoginRequest'
import { PolygonIdStatusScreen } from '~/pages/PolygonId'
import {
  AddVeridaOneCustomLinkScreen,
  AddVeridaOnePlatformLinkScreen,
  ClaimUsernameScreen,
  EditGenericPropertyScreen,
  EditProfileScreen,
  EditVeridaOnePlatformLinkScreen,
  PublicProfileScreen,
  UnlockVeridaOneScreen,
} from '~/pages/Profiles'
import { QrCodeScannerScreen } from '~/pages/QrCodeScanner'
import {
  SeedPhraseGeneratedScreen,
  SeedPhraseScreen,
  SeedPhraseViewScreen,
  VerifyPhraseScreen,
} from '~/pages/RecoveryPhrase'
import {
  IncomingDataRequestScreen,
  PaymentRequestScreen,
  PolygonIdConnectionRequestScreen,
  ProofRequestScreen,
  WalletConnectConnectionRequestScreen,
} from '~/pages/Requests'
import { SettingsScreen } from '~/pages/Settings'
import {
  ConfirmTransactionScreen,
  ReceiveTokenScreen,
  SendTokenScreen,
  SingleCurrencyScreen,
  TokenRecipientScreen,
  TransactionDetailsScreen,
  TransactionFailureScreen,
  TransactionSuccessScreen,
} from '~/pages/Tokens'
import {
  WalletConnectActiveSessionDetailsScreen,
  WalletConnectActiveSessionsScreen,
} from '~/pages/WalletConnect'
import { ManageWalletsScreen, SingleWalletScreen } from '~/pages/Wallets'

import { TabsNavigator } from './TabsNavigator'
import { MainStackParams } from './types'

const Stack = createNativeStackNavigator<MainStackParams>()

export const MainNavigator: React.FC = () => {
  return (
    <>
      {/* As the MainNavigator is only mounted after the user is authenticated, so are these context providers. */}
      <BehindAuthContextProviders>
        {/* An empty component, just to register all of the main app events after the user has authenticated. */}
        <BehindAuthHandlers />
        <Stack.Navigator
          initialRouteName='Tabs'
          screenOptions={{
            headerShown: true,
            headerShadowVisible: true,
            header: (props) => <BaseScreenHeader {...props} />,
          }}>
          <Stack.Screen
            name='Tabs'
            component={TabsNavigator}
            options={{ headerShown: false }}
          />
          <Stack.Screen name='ScanQrCode' component={QrCodeScannerScreen} />
          <Stack.Screen name='LoginRequest' component={LoginRequestScreen} />
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
            name='MigrateIdentityConfirmation'
            component={MigrateIdentityConfirmationScreen}
          />
          <Stack.Screen
            name='MigrateIdentityExecution'
            component={MigrateIdentityExecutionScreen}
          />
          <Stack.Screen name='PublicProfile' component={PublicProfileScreen} />
          <Stack.Screen name='Inbox' component={InboxScreen} />
          <Stack.Screen name='InboxItem' component={InboxItemScreen} />
          <Stack.Screen name='ShareableData' component={ShareableDataScreen} />
          <Stack.Screen name='DataFolder' component={DataFolderScreen} />
          <Stack.Screen name='DataItem' component={DataItemScreen} />
          <Stack.Screen
            name='SingleConnection'
            component={SingleConnectionScreen}
          />
          <Stack.Screen name='ManageWallets' component={ManageWalletsScreen} />
          <Stack.Screen name='SingleWallet' component={SingleWalletScreen} />
          <Stack.Screen
            name='SingleCurrency'
            component={SingleCurrencyScreen}
          />
          <Stack.Screen
            name='TransactionDetails'
            component={TransactionDetailsScreen}
          />
          <Stack.Screen name='SendToken' component={SendTokenScreen} />
          <Stack.Screen
            name='TokenRecipient'
            component={TokenRecipientScreen}
          />
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
            name='NFTCollectionDetail'
            component={NFTCollectionDetailScreen}
          />
          <Stack.Screen name={'NFTDetail'} component={NFTDetailScreen} />
          <Stack.Screen name='Settings' component={SettingsScreen} />
          <Stack.Screen name='ChangePin' component={ChangePinScreen} />
          <Stack.Screen
            name='SeedPhraseView'
            component={SeedPhraseViewScreen}
          />
          <Stack.Screen name='LoginHistory' component={LoginHistoryScreen} />
          <Stack.Screen
            name='RemoveIdentity'
            component={RemoveIdentityScreen}
          />
          <Stack.Screen
            name='DeleteIdentity'
            component={DeleteIdentityScreen}
          />
          <Stack.Screen
            name='BlockchainNetworks'
            component={BlockchainNetworksScreen}
          />
          <Stack.Screen
            name='BlockchainNetworkEditor'
            component={BlockchainNetworkEditorScreen}
          />
          <Stack.Screen
            name='WalletConnectActiveSessions'
            component={WalletConnectActiveSessionsScreen}
          />
          <Stack.Screen
            name='WalletConnectActiveSessionDetails'
            component={WalletConnectActiveSessionDetailsScreen}
          />
          <Stack.Screen
            name='PolygonIdStatus'
            component={PolygonIdStatusScreen}
          />
          <Stack.Screen name='SeedPhrase' component={SeedPhraseScreen} />
          <Stack.Screen
            name='SeedPhraseGenerated'
            component={SeedPhraseGeneratedScreen}
          />
          <Stack.Screen name='VerifyPhrase' component={VerifyPhraseScreen} />

          {/* Modals */}
          <Stack.Group
            screenOptions={{
              presentation: 'modal',
              headerShown: true,
              header: (props) => <ModalScreenHeader {...props} />,
              headerShadowVisible: true,
            }}>
            <Stack.Screen name='EditProfile' component={EditProfileScreen} />
            <Stack.Screen
              name='UnlockVeridaOne'
              component={UnlockVeridaOneScreen}
            />
            <Stack.Screen
              name='ClaimUsername'
              component={ClaimUsernameScreen}
            />
            <Stack.Screen
              name='EditGenericProperty'
              component={EditGenericPropertyScreen}
            />
            <Stack.Screen
              name='AddVeridaOneCustomLink'
              component={AddVeridaOneCustomLinkScreen}
            />
            <Stack.Screen name='SelectAsset' component={SelectAssetScreen} />
            <Stack.Screen
              name='AddVeridaOnePlatformLink'
              component={AddVeridaOnePlatformLinkScreen}
            />
            <Stack.Screen
              name='EditVeridaOnePlatformLink'
              component={EditVeridaOnePlatformLinkScreen}
            />
            <Stack.Screen name='ReceiveToken' component={ReceiveTokenScreen} />
            <Stack.Screen
              name='ShareIdentity'
              component={ShareIdentityScreen}
            />
            <Stack.Screen
              name='WalletConnectConnectionRequest'
              component={WalletConnectConnectionRequestScreen}
            />
            <Stack.Screen
              name='PolygonIdConnectionRequest'
              component={PolygonIdConnectionRequestScreen}
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

          {/* FIXME: temporary comment as this causes an infinite loop on the current Tab navigator setup which did not happen in the previous version. */}
          {/* {__DEV__ && (
            <Stack.Screen
              name='__Storybook__'
              component={require('../../.storybook').default}
            />
          )} */}
        </Stack.Navigator>
      </BehindAuthContextProviders>
    </>
  )
}

import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'

import {
  AssetsScreenParams,
  NFTCollectionDetailScreenParams,
  NFTDetailScreenParams,
  SelectAssetScreenParams,
} from 'pages/Assets'
import {
  ChangePinScreenParams,
  CreatePinScreenParams,
} from 'pages/Authentication'
import {
  BlockchainNetworksEditorScreenParams,
  BlockchainNetworksScreenParams,
} from 'pages/Blockchains'
import {
  // ConnectionsScreenParams,
  SingleConnectionScreenParams,
} from 'pages/Connections'
import {
  DataFolderScreenParams,
  DataItemScreenParams,
  DataScreenParams,
} from 'pages/Data'
import { HomeScreenParams } from 'pages/Home'
import {
  AddIdentityScreenParams,
  CreateIdentityScreenParams,
  DeleteIdentityScreenParams,
  ImportIdentityScreenParams,
  MigrateIdentityConfirmationScreenParams,
  MigrateIdentityExecutionScreenParams,
  RemoveIdentityScreenParams,
  ShareIdentityScreenParams,
} from 'pages/Identity'
import {
  InboxItemScreenParams,
  InboxScreenParams,
  ShareableDataScreenParams,
} from 'pages/Inbox'
import { LoginHistoryScreenParams } from 'pages/Login'
import { OnboardingScreenParams } from 'pages/Onboarding'
import { PolygonIdCircuitsSettingsScreenParams } from 'pages/PolygonID'
import {
  AddVeridaOneCustomLinkScreenParams,
  AddVeridaOnePlatformLinkScreenParams,
  ClaimUsernameScreenParams,
  EditProfileScreenParams,
  EditVeridaOnePlatformLinkScreenParams,
  GenericEditPropertyScreenParams,
  PublicProfileScreenParams,
  UnlockVeridaOneScreenParams,
} from 'pages/Profiles'
import { QrCodeScannerScreenParams } from 'pages/QrCodeScanner'
import {
  SeedPhraseGeneratedScreenParams,
  SeedPhraseScreenParams,
  SeedPhraseViewScreenParams,
  VerifyPhraseScreenParams,
} from 'pages/RecoveryPhrase'
import {
  ConnectionRequestScreenParams,
  IncomingDataRequestScreenParams,
  PaymentRequestScreenParams,
  ProofRequestScreenParams,
} from 'pages/Requests'
import { SettingsScreenParams } from 'pages/Settings'
import {
  BuyTokenScreenParams,
  ConfirmTransactionScreenParams,
  ReceiveTokenScreenParams,
  SendTokenScreenParams,
  SingleCurrencyScreenParams,
  TokenRecipientScreenParams,
  TransactionDetailsScreenParams,
  TransactionFailureScreenParams,
  TransactionSuccessScreenParams,
} from 'pages/Tokens'
import {
  WalletConnectActiveSessionDetailsScreenParams,
  WalletConnectActiveSessionsScreenParams,
} from 'pages/WalletConnect'
import {
  ManageWalletsScreenParams,
  SingleWalletScreenParams,
  SuccessFailureScreenParams,
} from 'pages/Wallets'

export type RootStackParams = {
  Auth: undefined
  Main: undefined
}

export type AuthStackParams = {
  Onboarding: OnboardingScreenParams
  AddIdentity: AddIdentityScreenParams
  CreateIdentity: CreateIdentityScreenParams
  ImportIdentity: ImportIdentityScreenParams
  SeedPhrase: SeedPhraseScreenParams
  SeedPhraseGenerated: SeedPhraseGeneratedScreenParams
  VerifyPhrase: VerifyPhraseScreenParams
  CreatePin: CreatePinScreenParams
}

export type AuthStackScreenProps<S extends keyof AuthStackParams> =
  NativeStackScreenProps<AuthStackParams, S>

export type TabsScreenParams = {
  Home: HomeScreenParams
  Profile: PublicProfileScreenParams
  Data: DataScreenParams
  // Connections: ConnectionsScreenParams // TODO: uncomment when ready
  Assets: AssetsScreenParams
}

export type TabsScreenProps<S extends keyof TabsScreenParams> =
  CompositeScreenProps<
    BottomTabScreenProps<TabsScreenParams, S>,
    MainStackScreenProps<keyof MainStackParams>
  >

export type MainStackParams = {
  Tabs: NavigatorScreenParams<TabsScreenParams>
  Inbox: InboxScreenParams
  InboxItem: InboxItemScreenParams
  ShareableData: ShareableDataScreenParams
  LoginHistory: LoginHistoryScreenParams
  LoginRequest: undefined
  PublicProfile: PublicProfileScreenParams
  EditProfile: EditProfileScreenParams
  ClaimUsername: ClaimUsernameScreenParams
  EditGenericProperty: GenericEditPropertyScreenParams
  AddVeridaOneCustomLink: AddVeridaOneCustomLinkScreenParams
  AddVeridaOnePlatformLink: AddVeridaOnePlatformLinkScreenParams
  EditVeridaOnePlatformLink: EditVeridaOnePlatformLinkScreenParams
  UnlockVeridaOne: UnlockVeridaOneScreenParams
  ManageWallets: ManageWalletsScreenParams
  SingleCurrency: SingleCurrencyScreenParams
  SendToken: SendTokenScreenParams
  TokenRecipient: TokenRecipientScreenParams
  ConfirmTransaction: ConfirmTransactionScreenParams
  TransactionSuccess: TransactionSuccessScreenParams
  TransactionFailure: TransactionFailureScreenParams
  TransactionDetails: TransactionDetailsScreenParams
  BuyToken: BuyTokenScreenParams
  ReceiveToken: ReceiveTokenScreenParams
  SingleWallet: SingleWalletScreenParams
  SuccessFailure: SuccessFailureScreenParams
  NFTCollectionDetail: NFTCollectionDetailScreenParams
  NFTDetail: NFTDetailScreenParams
  SelectAsset: SelectAssetScreenParams
  ChangePin: ChangePinScreenParams
  ScanQrCode: QrCodeScannerScreenParams
  AddIdentity: AddIdentityScreenParams
  ShareIdentity: ShareIdentityScreenParams
  CreateIdentity: CreateIdentityScreenParams
  ImportIdentity: ImportIdentityScreenParams
  DeleteIdentity: DeleteIdentityScreenParams
  RemoveIdentity: RemoveIdentityScreenParams
  MigrateIdentityConfirmation: MigrateIdentityConfirmationScreenParams
  MigrateIdentityExecution: MigrateIdentityExecutionScreenParams
  SeedPhrase: SeedPhraseScreenParams
  SeedPhraseGenerated: SeedPhraseGeneratedScreenParams
  VerifyPhrase: VerifyPhraseScreenParams
  SeedPhraseView: SeedPhraseViewScreenParams
  DataFolder: DataFolderScreenParams
  DataItem: DataItemScreenParams
  BlockchainNetworks: BlockchainNetworksScreenParams
  BlockchainNetworkEditor: BlockchainNetworksEditorScreenParams
  WalletConnectActiveSessions: WalletConnectActiveSessionsScreenParams
  WalletConnectActiveSessionDetails: WalletConnectActiveSessionDetailsScreenParams
  SingleConnection: SingleConnectionScreenParams
  ConnectionRequest: ConnectionRequestScreenParams
  IncomingDataRequest: IncomingDataRequestScreenParams
  PaymentRequest: PaymentRequestScreenParams
  ProofRequest: ProofRequestScreenParams
  Settings: SettingsScreenParams
  PolygonIdCircuitsSettings: PolygonIdCircuitsSettingsScreenParams
  __Storybook__: undefined
}

export type MainStackScreenProps<S extends keyof MainStackParams> =
  NativeStackScreenProps<MainStackParams, S>

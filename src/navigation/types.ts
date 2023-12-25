import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'

import { BlockchainWalletWithAccounts, NFT, NFTCollection } from 'api/types'
import { SelectAssetScreenProps } from 'pages/Assets/SelectAsset'
import {
  DataFolderScreenParams,
  DataItemScreenParams,
  DataTabScreenParams,
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
import { ShareableDataItemType } from 'pages/Inbox/ShareableDataItem'
import { OnboardingScreenParams } from 'pages/Onboarding'
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
  ConnectionRequestScreenParams,
  IncomingDataRequestScreenParams,
  PaymentRequestScreenParams,
  ProofRequestScreenParams,
} from 'pages/Requests'
import {
  PolygonIdCircuitsSettingsScreenParams,
  SettingsScreenParams,
} from 'pages/Settings'
import type { WalletConnectActiveSessionDetailsParams } from 'pages/WalletConnectActiveSessionDetails'

export type TabsScreenParams = {
  Home: HomeScreenParams
  Profile: PublicProfileScreenParams
  Data: DataTabScreenParams
  // Connections: undefined // TODO: uncomment when ready
  Assets: undefined
}

export type TabsScreenProps<S extends keyof TabsScreenParams> =
  CompositeScreenProps<
    BottomTabScreenProps<TabsScreenParams, S>,
    MainStackScreenProps<keyof MainStackParams>
  >

export type MainStackParams = {
  Tabs: NavigatorScreenParams<TabsScreenParams>
  Onboarding: OnboardingScreenParams
  CreatePin: undefined

  Inbox: undefined
  InboxItem: { inboxItemId: string }
  LoginHistory: undefined
  LoginRequest: undefined

  PublicProfile: PublicProfileScreenParams
  EditProfile: EditProfileScreenParams
  ClaimUsername: ClaimUsernameScreenParams
  EditGenericProperty: GenericEditPropertyScreenParams
  AddVeridaOneCustomLink: AddVeridaOneCustomLinkScreenParams
  AddVeridaOnePlatformLink: AddVeridaOnePlatformLinkScreenParams
  EditVeridaOnePlatformLink: EditVeridaOnePlatformLinkScreenParams
  ShareIdentity: ShareIdentityScreenParams
  MigrateIdentityConfirmation: MigrateIdentityConfirmationScreenParams
  MigrateIdentityExecution: MigrateIdentityExecutionScreenParams

  SeedPhraseView: undefined
  ManageWallets: undefined
  SingleCurrency: undefined
  SendToken: undefined
  TokenRecipient: undefined
  ConfirmTransaction: undefined
  TransactionSuccess: undefined
  TransactionFailure: undefined
  TransactionDetails: undefined
  BuyToken: undefined
  ReceiveToken: undefined
  SingleWallet: { item: BlockchainWalletWithAccounts }
  OtherAddresses: undefined
  SuccessFailure: undefined
  DataFolder: DataFolderScreenParams
  DataItem: DataItemScreenParams
  ChangePin: undefined
  ScanQrCode: QrCodeScannerScreenParams

  // Identity
  AddIdentity: AddIdentityScreenParams
  CreateIdentity: CreateIdentityScreenParams
  ImportIdentity: ImportIdentityScreenParams
  DeleteIdentity: DeleteIdentityScreenParams
  RemoveIdentity: RemoveIdentityScreenParams

  SeedPhrase: undefined
  SeedPhraseGenerated: undefined
  VerifyPhrase: { shuffled: string[] }
  ShareableData: {
    schemaUrl: string
    onConfirm: (selectedItems: ShareableDataItemType[]) => void
    filter: any
  }
  WalletConnectActiveSessions: undefined
  WalletConnectActiveSessionDetails: WalletConnectActiveSessionDetailsParams
  SingleConnection: { provider: string; connectNow?: boolean }

  NFTCollectionDetail: { collection: NFTCollection }
  NFTDetail: { nft: NFT }
  SelectAsset: SelectAssetScreenProps

  VeridaOneInvitationSuccess: undefined
  UnlockVeridaOne: UnlockVeridaOneScreenParams

  ConnectionRequest: ConnectionRequestScreenParams
  IncomingDataRequest: IncomingDataRequestScreenParams
  PaymentRequest: PaymentRequestScreenParams
  ProofRequest: ProofRequestScreenParams

  Settings: SettingsScreenParams
  PolygonIdCircuitsSettings: PolygonIdCircuitsSettingsScreenParams
}

export type MainStackScreenProps<S extends keyof MainStackParams> =
  NativeStackScreenProps<MainStackParams, S>

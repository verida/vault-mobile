import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import {
  CompositeScreenProps,
  NavigatorScreenParams,
} from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { NFT, NFTCollection } from 'features/assets'

import { PolygonIdStatusScreenParams } from '~/pages/PolygonId'
import { SingleWalletScreenParams } from '~/pages/Wallets/SingleWallet'

import { AssetsScreenParams } from 'pages/Assets'
import { SelectAssetScreenProps } from 'pages/Assets/SelectAsset'
import {
  BlockchainNetworkEditorScreenParams,
  BlockchainNetworksScreenParams,
} from 'pages/Blockchains'
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
import { SettingsScreenParams } from 'pages/Settings'
import { ConfirmTransactionScreenProps } from 'pages/Tokens/ConfirmTransaction'
import { ReceiveTokenScreenProps } from 'pages/Tokens/ReceiveToken'
import { SendTokenScreenProps } from 'pages/Tokens/SendToken'
import { SingleCurrencyScreenProps } from 'pages/Tokens/SingleCurrency'
import { TokenRecipientScreenProps } from 'pages/Tokens/TokenRecipient'
import { TransactionDetailsScreenProps } from 'pages/Tokens/TransactionDetails'
import { TransactionFailureScreenProps } from 'pages/Tokens/TransactionFailure'
import { TransactionSuccessScreenProps } from 'pages/Tokens/TransactionSuccess'
import type { WalletConnectActiveSessionDetailsParams } from 'pages/WalletConnectActiveSessionDetails'

export type TabsScreenParams = {
  Home: HomeScreenParams
  Profile: PublicProfileScreenParams
  Data: DataTabScreenParams
  // Connections: undefined // TODO: uncomment when ready
  Assets: AssetsScreenParams
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
  SingleCurrency: SingleCurrencyScreenProps
  SendToken: SendTokenScreenProps
  TokenRecipient: TokenRecipientScreenProps
  ConfirmTransaction: ConfirmTransactionScreenProps
  TransactionSuccess: TransactionSuccessScreenProps
  TransactionFailure: TransactionFailureScreenProps
  TransactionDetails: TransactionDetailsScreenProps
  BuyToken: undefined
  ReceiveToken: ReceiveTokenScreenProps
  SingleWallet: SingleWalletScreenParams
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
  BlockchainNetworks: BlockchainNetworksScreenParams
  BlockchainNetworkEditor: BlockchainNetworkEditorScreenParams
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
  PolygonIdStatus: PolygonIdStatusScreenParams

  __Storybook__: undefined
}

export type MainStackScreenProps<S extends keyof MainStackParams> =
  NativeStackScreenProps<MainStackParams, S>

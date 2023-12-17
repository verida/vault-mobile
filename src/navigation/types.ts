import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { CompositeScreenProps } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'

import {
  BlockchainWalletWithAccounts,
  Network,
  NFT,
  NFTCollection,
} from 'api/types'
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
import { PolygonIdCircuitsSettingsScreenParams } from 'pages/Settings/PolygonID'
import type { WalletConnectActiveSessionDetailsParams } from 'pages/WalletConnectActiveSessionDetails'

export type RootStackParams = {
  Auth: undefined
  Main: undefined
}

export type AuthStackParams = {
  Onboarding: OnboardingScreenParams
  AddIdentity: AddIdentityScreenParams
  CreateIdentity: CreateIdentityScreenParams
  ImportIdentity: ImportIdentityScreenParams
  SeedPhrase: undefined
  SeedPhraseGenerated: undefined
  VerifyPhrase: { shuffled: string[] }
  CreatePin: undefined
}

export type AuthStackScreenProps<S extends keyof AuthStackParams> =
  NativeStackScreenProps<AuthStackParams, S>

export type TabsScreenParams = {
  Home: undefined
  NewHome: HomeScreenParams
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
  Tabs: undefined
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
  Settings: undefined
  ChangePin: undefined
  ScanQrCode: QrCodeScannerScreenParams

  // Identity
  AddIdentity: AddIdentityScreenParams
  CreateIdentity: CreateIdentityScreenParams
  ImportIdentity: ImportIdentityScreenParams
  DeleteIdentity: DeleteIdentityScreenParams

  SeedPhrase: undefined
  SeedPhraseGenerated: undefined
  VerifyPhrase: undefined
  ShareableData: {
    schemaUrl: string
    onConfirm: (selectedItems: ShareableDataItemType[]) => void
    filter: any
  }
  Networks: undefined
  StorageNodes: { data: Network[] }
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

  PolygonIdCircuitsSettings: PolygonIdCircuitsSettingsScreenParams
}

export type MainStackScreenProps<S extends keyof MainStackParams> =
  NativeStackScreenProps<MainStackParams, S>

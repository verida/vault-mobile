import { BottomTabScreenProps } from '@react-navigation/bottom-tabs'
import { CompositeScreenProps } from '@react-navigation/native'
import { NativeStackScreenProps } from '@react-navigation/native-stack'

import {
  BlockchainWalletWithAccounts,
  Network,
  NFT,
  NFTCollection,
} from 'api/types'
import { AddIdentityMode } from 'pages/Account/Identity/Identity'
import { SelectAssetScreenProps } from 'pages/Assets/SelectAsset'
import { NetworksEditorScreenParams } from 'pages/BlockchainNetworksEditor'
import {
  DataFolderScreenParams,
  DataItemScreenParams,
  DataTabScreenParams,
} from 'pages/Data'
import { ShareableDataItemType } from 'pages/Inbox/ShareableDataItem'
import { AddCustomLinkScreenProps } from 'pages/Profiles/AddCustomLink'
import { AddPlatformLinkScreenParams } from 'pages/Profiles/AddPlatformLink'
import { GenericEditPropertyScreenProps } from 'pages/Profiles/EditGenericProperty'
import { EditPlatformLinkScreenParams } from 'pages/Profiles/EditPlatformLink'
import { QrCodeScannerScreenParams } from 'pages/QrCodeScanner'
import {
  ConnectionRequestScreenParams,
  IncomingDataRequestScreenParams,
  PaymentRequestScreenParams,
  ProofRequestScreenParams,
} from 'pages/Requests'
import { PolygonIdCircuitsSettingsScreenParams } from 'pages/Settings/PolygonID'
import { ConfirmTransactionScreenProps } from 'pages/Tokens/ConfirmTransaction'
import { ReceiveTokenScreenProps } from 'pages/Tokens/ReceiveToken'
import { SendTokenScreenProps } from 'pages/Tokens/SendToken'
import { SingleCurrencyScreenProps } from 'pages/Tokens/SingleCurrency'
import { TokenRecipientScreenProps } from 'pages/Tokens/TokenRecipient'
import { TransactionDetailsScreenProps } from 'pages/Tokens/TransactionDetails'
import { TransactionFailureScreenProps } from 'pages/Tokens/TransactionFailure'
import { TransactionSuccessScreenProps } from 'pages/Tokens/TransactionSuccess'
import type { WalletConnectActiveSessionDetailsParams } from 'pages/WalletConnectActiveSessionDetails'

export type RootStackParams = {
  Auth: undefined
  Main: undefined
}

export type AuthStackParams = {
  Start: undefined
  Identity: undefined
  AddIdentity: { mode?: AddIdentityMode }
  SeedPhrase: undefined
  SeedPhraseGenerated: undefined
  SeedPhraseEntered: undefined
  VerifyPhrase: { shuffled: string[] }
  CreatePin: undefined
  Success: undefined
  SelectNetwork: undefined
}

export type AuthStackScreenProps<S extends keyof AuthStackParams> =
  NativeStackScreenProps<AuthStackParams, S>

export type TabsScreenParams = {
  Home: undefined
  Profile: undefined
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
  Inbox: undefined
  Dashboard: undefined
  InboxItem: { inboxItemId: string }
  LoginHistory: undefined
  LoginRequest: undefined
  PublicProfile: undefined
  PrivateProfile: undefined
  EditProfile: undefined
  EditGenericProperty: GenericEditPropertyScreenProps
  AddCustomLink: AddCustomLinkScreenProps
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
  SingleWallet: { item: BlockchainWalletWithAccounts }
  OtherAddresses: undefined
  SuccessFailure: undefined
  DataFolder: DataFolderScreenParams
  DataItem: DataItemScreenParams
  Settings: undefined
  ChangePin: undefined
  ScanQrCode: QrCodeScannerScreenParams
  DeleteAccount: undefined
  Identity: undefined
  AddIdentity: { mode?: AddIdentityMode }
  SeedPhraseEntered: {
    usePrivateKey: boolean
    previousScreen?: string
  }
  SeedPhrase: undefined
  SeedPhraseGenerated: undefined
  VerifyPhrase: undefined
  ShareableData: {
    schemaUrl: string
    onConfirm: (selectedItems: ShareableDataItemType[]) => void
    filter: any
  }
  BlockchainNetworks: undefined
  BlockchainNetworksEditor: NetworksEditorScreenParams
  StorageNodes: { data: Network[] }
  WalletConnectActiveSessions: undefined
  WalletConnectActiveSessionDetails: WalletConnectActiveSessionDetailsParams
  SingleConnection: { provider: string; connectNow?: boolean }
  Success: undefined

  NFTCollectionDetail: { collection: NFTCollection }
  NFTDetail: { nft: NFT }
  SelectAsset: SelectAssetScreenProps

  ClaimUsername: undefined
  VeridaOneInvitationSuccess: undefined
  UnlockVeridaOne: {
    initialPage?: number
  }

  ConnectionRequest: ConnectionRequestScreenParams
  IncomingDataRequest: IncomingDataRequestScreenParams
  PaymentRequest: PaymentRequestScreenParams
  ProofRequest: ProofRequestScreenParams

  AddPlatformLink: AddPlatformLinkScreenParams
  EditPlatformLink: EditPlatformLinkScreenParams
  PolygonIdCircuitsSettings: PolygonIdCircuitsSettingsScreenParams

  __Storybook__: undefined
}

export type MainStackScreenProps<S extends keyof MainStackParams> =
  NativeStackScreenProps<MainStackParams, S>

import { NativeStackScreenProps } from '@react-navigation/native-stack'
import { DApp, DAppv2 } from 'wallet-connect/types'

import { Network, NFT, NFTCollection } from 'api/types'
import { AddIdentityMode } from 'pages/Account/Identity/Identity'
import { SelectAssetScreenProps } from 'pages/Assets/SelectAsset'
import { ShareableDataItemType } from 'pages/Inbox/ShareableDataItem'
import { AddCustomLinkScreenProps } from 'pages/Profiles/AddCustomLink'
import { AddPlatformLinkScreenParams } from 'pages/Profiles/AddPlatformLink'
import { GenericEditPropertyScreenProps } from 'pages/Profiles/EditGenericProperty'
import { EditPlatformLinkScreenParams } from 'pages/Profiles/EditPlatformLink'
import {
  ConnectionRequestScreenParams,
  IncomingDataRequestScreenParams,
  ProofRequestScreenParams,
} from 'pages/Requests'
import { PolygonIdCircuitsSettingsScreenParams } from 'pages/Settings/PolygonID'

export type RootStackParams = {
  Auth: undefined
  Main: undefined
}

export type RootStackScreenProps<S extends keyof RootStackParams> =
  NativeStackScreenProps<RootStackParams, S>

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

export type DashboardTabParams = {
  Home: undefined
  Data: undefined
  Tokens: undefined
  Assets: undefined
  Profile: undefined
  Connections: undefined
}

export type DashboardTabScreenProps<S extends keyof DashboardTabParams> =
  NativeStackScreenProps<DashboardTabParams, S>

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
  SingleCurrency: undefined
  SendToken: undefined
  TokenRecipient: undefined
  ConfirmTransaction: undefined
  TransactionSuccess: undefined
  TransactionFailure: undefined
  TransactionDetails: undefined
  BuyToken: undefined
  ReceiveToken: undefined
  SingleWallet: { item: any }
  OtherAddresses: undefined
  SuccessFailure: undefined
  DataFolder: { folderName: string }
  DataItem: undefined
  Settings: undefined
  ChangePin: undefined
  // eslint-disable-next-line @typescript-eslint/ban-types
  ScanQrCode: { firstTime: boolean; onReadQRCode?: Function }
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
  Networks: undefined
  StorageNodes: { data: Network[] }
  WalletConnect: undefined
  WalletConnectDapp: { dapp: DApp }
  WalletConnectDappv2: { dapp: DAppv2 }
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
  ProofRequest: ProofRequestScreenParams
  IncomingDataRequest: IncomingDataRequestScreenParams

  AddPlatformLink: AddPlatformLinkScreenParams
  EditPlatformLink: EditPlatformLinkScreenParams
  PolygonIdCircuitsSettings: PolygonIdCircuitsSettingsScreenParams
}

export type MainStackScreenProps<S extends keyof MainStackParams> =
  NativeStackScreenProps<MainStackParams, S>

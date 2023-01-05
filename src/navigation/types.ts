import { BadgeType } from 'types/badges'
import { SupportedConnection } from 'types/connections'
import { DApp, DAppv2 } from 'wallet-connect/types'

import { Network, NFT, NFTCollection } from 'api/types'
import { CreateAccountMode } from 'pages/Account/Create'
import { ShareableDataItemType } from 'pages/Inbox/ShareableDataItem'

export type RootStackParams = {
  Auth: undefined
  Main: undefined
}

export type AuthStackParams = {
  Start: undefined
  CreateAccount: { mode: CreateAccountMode }
  SeedPhrase: undefined
  SeedPhraseGenerated: undefined
  SeedPhraseEntered: undefined
  VerifyPhrase: { shuffled: string[] }
  CreatePin: undefined
  Success: undefined
  SelectNetwork: undefined
}

export type DashboardTabParams = {
  Home: undefined
  Data: undefined
  Tokens: undefined
  Assets: undefined
  Profiles: undefined
  Connections: undefined
}

export type MainStackParams = {
  Inbox: undefined
  ClaimableBadges: undefined
  ClaimBadge: {
    badgeType: BadgeType
  }
  Dashboard: undefined
  InboxItem: { inboxItemId: string }
  LoginHistory: undefined
  LoginRequest: undefined
  PublicProfile: undefined
  PrivateProfile: undefined
  EditProfile: undefined
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
  AddAccount: { mode: CreateAccountMode }
  DeleteAccount: undefined
  SeedPhraseEntered: { usePrivateKey: boolean; previousScreen?: string }
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
  SingleConnection: {
    provider: SupportedConnection
  }
  Success: undefined

  NFTCollectionDetail: { collection: NFTCollection }
  NFTDetail: { nft: NFT }
}

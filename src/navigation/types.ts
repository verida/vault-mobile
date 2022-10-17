import { DApp, DAppv2 } from 'wallet-connect/types'

import { Network } from 'api/types'
import { CreateAccountMode } from 'pages/Account/Create'
import { ShareableDataItemType } from 'pages/Inbox/ShareableDataItem'

export type RootStackParams = {
  Auth: undefined
  Main: undefined
}

export type AuthStackParams = {
  Start: undefined
  CreateAccount: { mode: CreateAccountMode }
  ImportAccount: undefined
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
  Profiles: undefined
  Connections: undefined
}

export type MainStackParams = {
  Dashboard: DashboardTabParams
  Inbox: undefined
  InboxItem: { inboxItemId: string }
  LoginHistory: undefined
  LoginRequest: undefined
  PublicProfile: undefined
  PrivateProfile: undefined
  EditProfile: undefined
  SeedPhraseView: undefined
  SeedPhraseEntered: undefined
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
  ImportAccount: undefined
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
  SingleConnection: undefined
}

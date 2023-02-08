import { DApp, DAppv2 } from 'wallet-connect/types'

import { Network } from 'api/types'
import { AddIdentityMode } from 'pages/Account/Identity/AddIdentity'
import { ShareableDataItemType } from 'pages/Inbox/ShareableDataItem'
import { GenericEditPropertyScreenProps } from 'pages/Profiles/EditGenericProperty'

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

export type DashboardTabParams = {
  Home: undefined
  Data: undefined
  Tokens: undefined
  Profile: undefined
  Connections: undefined
}

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
  SingleConnection: undefined
  Success: undefined
}

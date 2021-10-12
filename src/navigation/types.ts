export type RootStackParams = {
  Auth: undefined
  Main: undefined
}

export type AuthStackParams = {
  Start: undefined
  CreateAccount: undefined
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
  ManageWallets: undefined
  SuccessFailure: undefined
  DataFolder: { folderName: string }
  DataItem: undefined
  Settings: undefined
  ChangePin: undefined
  ScanQrCode: { firstTime: boolean }
}

import { DataManager } from './managers/data'
import { InboxManager } from './managers/inbox'
import { SyncManager } from './managers/sync'

export default class VaultCommon {
  // client-ts/Client
  public client: any
  // client-ts/Context
  public vault: any

  public inbox: InboxManager
  public sync: SyncManager
  public data: DataManager

  public profiles: Record<string, unknown> = {}

  constructor(client: any, vault: any) {
    this.client = client
    this.vault = vault
    this.inbox = new InboxManager(this)
    this.sync = new SyncManager(this)
    this.data = new DataManager(this)
  }

  public async init() {
    const publicProfile = await this.vault.openProfile()

    this.profiles = {
      public: publicProfile,
    }
  }
}

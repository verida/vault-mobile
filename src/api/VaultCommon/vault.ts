import { InboxManager } from './managers/inbox'
import { SyncManager } from './managers/sync'
import { DataManager } from './managers/data'

// Needs work
//import { CredentialsManager } from './managers/credentials'

export default class VaultCommon {

    // client-ts/Client
    public client: any
    // client-ts/Context
    public vault: any

    public inbox: InboxManager
    //public credentials: CredentialsManager
    public sync: SyncManager
    public data: DataManager

    public profiles: Object = {}

    constructor(client: any, vault: any, dataMap: any) {
        this.client = client
        this.vault = vault
        this.inbox = new InboxManager(this) // done
        this.sync = new SyncManager(this)   // done
        this.data = new DataManager(this, dataMap)

        //this.credentials = new CredentialsManager(this)
    }

    public async init() {
        const publicProfile = await this.vault.openProfile()

        this.profiles = {
            public: publicProfile
        }
    }
}

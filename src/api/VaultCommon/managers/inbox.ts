import { Logger } from 'features/telemetry'

import { InboxEntry, InboxType } from '../interfaces/inbox/Inbox'
import VaultCommon from '../vault'
import { DataAction } from './inbox/DataAction'
import { DatastoreSync } from './inbox/DatastoreSync'
import { Message } from './inbox/Message'
import { Request } from './inbox/Request'
import { Send } from './inbox/Send'

const logger = new Logger('InboxManager')

const DataHandler = {
  [InboxType.DATA_SEND]: Send,
  [InboxType.DATA_REQUEST]: Request,
  [InboxType.DATASTORE_SYNC]: DatastoreSync,
  [InboxType.MESSAGE]: Message,
}

export class InboxManager {
  private vaultCommon: VaultCommon
  // client-ts/context/messaging
  private messaging?: any

  constructor(vault: VaultCommon) {
    this.vaultCommon = vault
  }

  /**
   * Perform the requested action on an inbox entry
   *
   * @param {*} inboxEntry
   * @param {*} action
   * @param payload
   */
  public async handleAction(
    inboxEntry: InboxEntry,
    action: keyof DataAction,
    payload: any
  ) {
    await this.init()
    const inbox = await this.messaging.getInbox()

    if (inboxEntry.data.status) {
      throw new Error('Data has already been set to ' + inboxEntry.data.status)
    }

    inboxEntry.data.status = action
    inboxEntry.read = true

    await inbox.privateInbox.save(inboxEntry)

    const Middleware = DataHandler[inboxEntry.type]
    if (!Middleware) {
      const error = new Error('Unknown inbox type!: ' + inboxEntry.type)
      logger.error(error)
      return {
        success: false,
        errors: [error],
      }
    }

    const MiddlewareInstance = new Middleware(
      this.vaultCommon,
      this.messaging,
      inboxEntry,
      payload
    )
    return MiddlewareInstance[action]()
  }

  public async fetchLatest(filter = {}, options = {}) {
    await this.init()

    return this.messaging.getMessages(filter, {
      ...options,
      sort: [{ sentAt: 'desc' }],
    })
  }

  // Fetch the metadata associated with a message:
  //  - Name of the sender
  //  - Schema
  public async fetchMessageMetadata(inboxEntry: InboxEntry) {
    const senderDid = inboxEntry.sentBy.did
    const senderApp = inboxEntry.sentBy.context

    let senderProfile
    try {
      const sender = await this.vaultCommon.client.openProfile(
        'basicProfile',
        senderDid,
        senderApp
      )
      senderProfile = await sender.getMany({ key: 'name' })
    } catch (error) {
      // user may not have a profile
    }

    let senderName = ''
    if (senderProfile && senderProfile.length > 0) {
      senderName = senderProfile[0].value
    }

    const Middleware = DataHandler[inboxEntry.type]
    if (!Middleware) {
      const error = new Error('Unknown inbox type: ' + inboxEntry.type)
      logger.error(error)
      return {
        success: false,
        errors: [error],
      }
    }

    const MiddlewareInstance = new Middleware(
      this.vaultCommon,
      this.messaging,
      inboxEntry
    )
    const metadata = await MiddlewareInstance.metadata()

    const response = {
      senderName,
      senderApp,
      metadata,
    }

    return response
  }

  public async getMessaging() {
    await this.init()
    return this.messaging!
  }

  private async init() {
    if (this.messaging) {
      return
    }

    this.messaging = await this.vaultCommon.vault.getMessaging()
  }

  public async info() {
    await this.init()

    const inbox = await this.messaging.getInbox()
    const privateInbox = inbox.privateInbox
    const privateDb = await privateInbox.getDb()
    const publicInbox = inbox.publicInbox
    const publicDb = await publicInbox.getDb()

    const db1 = await privateDb.info()
    const db2 = await publicDb.info()

    const db1Count = await privateInbox.getMany()
    const db2Count = await publicInbox.getMany()

    return {
      privateDb: db1,
      privateDbCount: db1Count,
      publicDb: db2,
      publicDbCount: db2Count,
    }
  }

  public async rebuild() {
    await this.init()
    this.messaging.inbox = null
    await this.messaging.init()
  }
}

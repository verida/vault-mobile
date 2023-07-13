import { InboxEntry } from '../../interfaces/inbox/Inbox'
import { Messaging } from '../../interfaces/Verida'
import Vault from '../../vault'

export abstract class DataAction {
  protected readonly vaultCommon: Vault
  protected readonly inboxEntry: InboxEntry
  protected readonly payload: any
  protected readonly messaging: Messaging

  constructor(
    vaultCommon: Vault,
    messaging: Messaging,
    inboxEntry: InboxEntry,
    payload: any = {}
  ) {
    this.vaultCommon = vaultCommon
    this.inboxEntry = inboxEntry
    this.payload = payload
    this.messaging = messaging
  }

  abstract accept(): Promise<unknown>
  abstract decline(): any
}

import { DataAction } from './DataAction'

export class DatastoreSync extends DataAction {
  async accept() {
    await this.vaultCommon.sync.datastore(this.inboxEntry.data)
  }

  decline() {}

  async metadata() {
    return {}
  }
}

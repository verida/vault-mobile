import { DataAction } from './DataAction'

export class DatastoreSync extends DataAction {
  async accept() {
    await this.vaultCommon.sync.datastore(this.inboxEntry.data)
  }

  // eslint-disable-next-line @typescript-eslint/no-empty-function
  decline() {}

  async metadata() {
    return {}
  }
}

export enum InboxType {
  DATA_SEND = 'inbox/type/dataSend',
  DATA_REQUEST = 'inbox/type/dataRequest',
  DATASTORE_SYNC = 'inbox/type/datastoreSync',
  MESSAGE = 'inbox/type/message',
}

export interface Inbox {
  // eslint-disable-next-line @typescript-eslint/ban-types
  save: (data: InboxEntry) => {}
  errors: any[]
}

export interface InboxEntry {
  _id: string
  read: boolean
  type: InboxType
  sentBy: InboxSentBy
  schema: string
  data: any
}

export interface InboxSentBy {
  did: string
  context: string
}

export class InboxResponse {
  public data: any | null
  public replyId: string

  constructor(id: string) {
    this.replyId = id
    this.data = null
  }
}

export interface EncryptionKey {
  key: string
  type: string
}

export interface InboxDataSyncExternalDb {
  name: string
  did: string
  context: string
  encryptionKey: EncryptionKey
}

export interface InboxDataSyncInternalDb {
  name: string
}

export interface InboxDatabaseSyncRequest {
  externalDb: InboxDataSyncExternalDb
  internalDb: InboxDataSyncInternalDb
  schemas: string[]
  filter: Record<string, unknown>
  direction: string
  status: string
}

export interface InboxDataSyncExternalDs {
  did: string
  context: string
  encryptionKey: EncryptionKey
  dbName?: string
}

export interface InboxDatastoreSyncRequest {
  externalDs: InboxDataSyncExternalDs
  schema: string
  filter: Record<string, unknown>
  direction: string
  status: string
}

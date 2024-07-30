export const VERIDA_DID_REGEXP = /did:vda:(polamoy|polpos):0x[0-9a-fA-F]{40}/

export enum VeridaMessageType {
  SIMPLE_MESSAGE = 'inbox/type/message',
  DATA_REQUEST = 'inbox/type/dataRequest',
  DATA_SEND = 'inbox/type/dataSend',
  DATABASE_SYNC = 'inbox/type/databaseSync',
  DATASTORE_SYNC = 'inbox/type/datastoreSync',
}

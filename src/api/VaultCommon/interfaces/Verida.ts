// @todo: Move Verida interfaces into a separate package and import

export interface Client {
  openContext(
    contextName: string,
    forceCreate: boolean
  ): Promise<Context | undefined>
  openPublicProfile(did: string, contextName: string): Promise<Profile>
}

export interface Context {
  getMessaging(): Promise<Messaging>
  openProfile(profileName: string, did?: string): Promise<Profile | undefined>
  openDatabase(
    databaseName: string,
    options: DatabaseOpenConfig
  ): Promise<Database>
  openDatastore(
    schemaName: string,
    config: DatastoreOpenConfig
  ): Promise<Datastore>
}

export interface Profile {
  get(key: string, options?: any, extended?: boolean): Promise<any | undefined>
  getMany(filter: any, options: any): Promise<any>
  delete(key: string): Promise<void>
  set(doc: Document | string, value: any): Promise<any>
  listen(callback: any): Promise<any>
}

export interface Messaging {
  send(
    did: string,
    type: string,

    data: object,
    message: string,
    config?: MessageSendConfig
  ): Promise<object | null>
  onMessage(callback: any): void

  getMessages(filter: object, options: any): Promise<any>
  getInbox(): Promise<any>
}

export interface DatabaseOpenConfig {
  permissions?: PermissionsConfig
  did?: string
  dsn?: string
  saveDatabase?: boolean
  readOnly?: boolean
  isOwner?: boolean
  encryptionKey?: string
  createContext?: boolean
}

export interface DatastoreOpenConfig {
  permissions?: PermissionsConfig
  did?: string
  saveDatabase?: boolean
  readOnly?: boolean
  encryptionKey?: string
  databaseName?: string
  createContext?: boolean
}

export interface MessagesConfig {
  maxItems?: number
}

export interface StorageEngineTypes {
  [key: string]: any
}

export interface PermissionsConfig {
  read: PermissionOptionsEnum
  write: PermissionOptionsEnum
  readList?: string[]
  writeList?: string[]
}

export enum PermissionOptionsEnum {
  OWNER = 'owner',
  PUBLIC = 'public',
  USERS = 'users',
}

export interface MessageSendConfig {
  recipientContextName?: string
  expiry?: number
}

export interface Datastore {
  save: (payload: any) => Document
  get: (key: string, options?: any) => Document
  // eslint-disable-next-line @typescript-eslint/ban-types
  delete: (key: string) => {}
  getMany: (filter: any, options?: any) => Document[]
  getDb: () => Database
  errors: []
}

export interface Database {
  save: (payload: any) => Document
  get: (key: string, options?: any) => Document
  // eslint-disable-next-line @typescript-eslint/ban-types
  delete: (key: string) => {}
  getMany: (filter: any, options?: any) => Document[]
  getInstance: () => any
  errors: []
}

export interface Document {
  _id: string
  _rev?: string
  key: string
  value?: any
}

//export interface CouchDB {
//  changes: (options: any) => any
//  // eslint-disable-next-line @typescript-eslint/ban-types
//  get: (docId: string, options?: any, callback?: Function) => any
//}

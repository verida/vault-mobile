import { ContextInterfaces } from '@verida/client-rn'
import Datastore from '@verida/client-rn/dist/src/context/datastore'
import axios from 'axios'
import EventEmitter from 'events'
import moment from 'moment'
import { Linking } from 'react-native'

import AccountManager from './AccountManager'

const DATA_CONNECTION_SCHEMA =
  'https://vault.schemas.verida.io/data-connections/connection/v0.1.0/schema.json'
// const DATA_PROFILE_SCHEMA =
//   'https://vault.schemas.verida.io/data-connections/profile/v0.1.0/schema.json'
// const DATA_SOURCE_SCHEMA =
//   'https://vault.schemas.verida.io/data-connections/source/v0.1.0/schema.json'
const DATA_SYNC_REQUEST_SCHEMA =
  'https://vault.schemas.verida.io/data-connections/sync-request/v0.1.0/schema.json'

// @todo move to global app config somewhere?
const CONFIG = {
  dataConnectorUrl: 'https://dataconnector.tn.verida.tech',
}

const delay = async (ms: number) => {
  await new Promise((resolve: any) => setTimeout(() => resolve(), ms))
}

// possible states for status: syncing, disabled, active

// @todo: Pull this from the server
const FacebookIcon = require('assets/social_icons/facebook.png')
const TwitterIcon = require('assets/social_icons/twitter.png')

const CONNECTIONS: any = {
  facebook: {
    name: 'facebook',
    label: 'Facebook',
    icon: FacebookIcon,
  },
  twitter: {
    name: 'twitter',
    label: 'Twitter',
    icon: TwitterIcon,
  },
}

class DataConnectorsEvents extends EventEmitter {
  private static instance: DataConnectorsEvents

  private constructor() {
    super()
  }

  static getInstance() {
    if (!DataConnectorsEvents.instance) {
      DataConnectorsEvents.instance = new DataConnectorsEvents()
    }
    return DataConnectorsEvents.instance
  }
}

export default class DataConnectorsManager {
  static datastore: Datastore
  private static _connections: any = {}

  static async emit(eventName: string, args: any) {
    DataConnectorsEvents.getInstance().emit(eventName, args)
  }

  static async on(eventName: string, fn: any) {
    DataConnectorsEvents.getInstance().on(eventName, fn)
  }

  static async authComplete(connectorName: string, requestParams: any) {
    const connection = await this.getConnection(connectorName)
    await connection.setAuth(requestParams)
    await connection.sync()
  }

  static async getDatastore(): Promise<Datastore> {
    if (DataConnectorsManager.datastore) {
      return DataConnectorsManager.datastore
    }

    const context = await AccountManager.getInstance().context
    DataConnectorsManager.datastore = await context!.openDatastore(
      DATA_CONNECTION_SCHEMA
    )

    return DataConnectorsManager.datastore
  }

  static getConnectionInfo(connectorName: string) {
    return CONNECTIONS[connectorName]
  }

  static async getConnection(connectorName: string) {
    if (DataConnectorsManager._connections[connectorName]) {
      return DataConnectorsManager._connections[connectorName]
    }

    const connector = new DataConnection(connectorName)
    await connector.init()

    DataConnectorsManager._connections[connectorName] = connector
    return connector
  }

  static async getConnectors(): Promise<any> {
    const connections: any = Object.values(CONNECTIONS)
    const connectors: any = {}
    for (let i = 0; i < connections.length; i++) {
      const connection = await DataConnectorsManager.getConnection(
        connections[i].name
      )
      connectors[connection.name] = connection
    }

    return connectors
  }

  static async resetConnector() {
    const connections: any = Object.values(CONNECTIONS)
    for (let i = 0; i < connections.length; i++) {
      if (
        DataConnectorsManager._connections[connections[i].name].syncStatus !==
        'disabled'
      ) {
        DataConnectorsManager._connections[connections[i].name].disconnect()
      }
    }
  }

  static async triggerSync() {
    const connections = await DataConnectorsManager.getConnectors()
    const now = moment().unix()

    for (const connectorName in connections) {
      const connection = connections[connectorName]
      if (
        connection.syncStatus !== 'active' &&
        connection.syncStatus !== 'error'
      ) {
        continue
      }

      if (!connection.syncNext) {
        connection.sync()
      }

      const next = moment(connection.syncNext).unix()
      if (next < now) {
        connection.sync()
      }
    }
  }
}

class DataConnection extends EventEmitter {
  private name: string
  private label: string
  private _init = false

  private _datastore?: any
  private _record?: any
  private profile?: any

  public _rev?: string
  public encryptionKey?: string
  public accessToken?: string
  public refreshToken?: string
  public source?: string
  public syncFrequency?: moment.unitOfTime.DurationConstructor
  public syncLast?: string
  public syncNext?: string
  public syncLastError?: string
  public syncPosition?: string
  public syncStatus?: string // active, paused, disabled, processing
  public metadata?: any
  public icon?: any

  constructor(name: string) {
    super()
    this.name = this.source = name
    this.syncStatus = 'disabled'
    this.icon = CONNECTIONS[this.name].icon
    this.label = CONNECTIONS[this.name].label
    this.syncFrequency = 'hour'
  }

  public async save(): Promise<any> {
    await this.init()

    // This is ugly AF!
    this._record.accessToken = this.accessToken
    this._record.refreshToken = this.refreshToken
    this._record.syncStatus = this.syncStatus
    this._record.syncLast = this.syncLast
    this._record.syncLastError = this.syncLastError
    this._record.syncFrequency = this.syncFrequency
    this._record.syncNext = this.syncNext
    this._record.syncPosition = this.syncPosition
    this._record.encryptionKey = this.encryptionKey

    try {
      const result = await this._datastore.save(this._record)
      this._rev = this._record._rev = result.rev
      if (!result) {
        // console.error(this._datastore.errors)
        return result
      }

      DataConnectorsManager.emit('connectionUpdated', this)

      return result
    } catch (err) {
      // console.error('Save connection error: ', err.message)
    }
  }

  public async initiateAuth() {
    const context = await AccountManager.getInstance().context

    const account = context?.getAccount()
    const did = await account?.did()

    // console.log(`Initiating auth for ${this.source}`, did)
    Linking.openURL(
      `${CONFIG.dataConnectorUrl}/connect/${this.source}?did=${did}&key=${this.encryptionKey}`
    )
  }

  public async setAuth(auth: any) {
    await this.init()
    this.accessToken = auth.accessToken
    if (auth.refreshToken) {
      this.refreshToken = auth.refreshToken
    }

    this.syncStatus = 'active'
    await this.save()
  }

  public async init() {
    if (this._init) {
      return
    }

    this._datastore = await DataConnectorsManager.getDatastore()

    // @todo: if it doesn't exist, create it
    try {
      this._record = await this._datastore.get(this.name)

      this.profile = this._record.profile

      const obj: any = this
      const record = this._record
      Object.keys(this._record).forEach((key: string) => {
        if (key === 'profile') {
          return
        }

        obj[key] = record[key]
      })
    } catch (err: any) {
      if (err.name === 'not_found') {
        // Set the encryption key to the same encryption key as the connection database
        // In the future this could be a randomly generated key
        const db = await this._datastore.getDb()
        const info = await db.info()
        this.encryptionKey = Buffer.from(info.encryptionKey).toString('hex')
        this.source = this.name
        this._record = {
          _id: this.name,
          name: this.name,
          source: this.source,
          encryptionKey: this.encryptionKey,
        }
      } else {
        throw err
      }
    }

    this._init = true
  }

  public async setSyncError(message: string) {
    this.syncLastError = message
    this.syncLast = new Date().toISOString()
    this.syncStatus = 'error'
    this.syncNext = moment().add(1, this.syncFrequency).toISOString()
    await this.save()
  }

  public async sync(): Promise<void> {
    if (this.syncStatus === 'processing') {
      // @todo: check if the sync has been processing for more than 10 minutes, then reset
      return
    }

    // console.log(`Syncing ${this.name}!`)

    const accessToken = this.accessToken
    const refreshToken = this.refreshToken

    this.syncLastError = undefined
    this.syncStatus = 'processing'
    DataConnectorsManager.emit('connectionUpdated', this)

    try {
      // Request the server to sync the third party connector data into a collection of encrypted datastores
      const context = await AccountManager.getInstance().context
      const account = context?.getAccount()
      const did = await account?.did()

      const axiosInstance = axios.create()

      // @todo: handle errors
      const syncRequestResult = await axiosInstance.get(
        `${CONFIG.dataConnectorUrl}/sync/${this.name}?accessToken=${accessToken}&refreshToken=${refreshToken}&did=${did}&key=${this.encryptionKey}`
      )
      const { serverDid, contextName, syncRequestId, syncRequestDatabaseName } =
        syncRequestResult.data

      this.checkSync(
        serverDid,
        contextName,
        syncRequestId,
        syncRequestDatabaseName
      )
    } catch (err: any) {
      this.setSyncError(err.message)
      // console.error(err)
    }
  }

  public async checkSync(
    serverDid: string,
    contextName: string,
    syncRequestId: string,
    syncRequestDatabaseName: string,
    retryCount = 5
  ) {
    const context = await AccountManager.getInstance().context
    const account = context?.getAccount()
    const did = await account?.did()

    const encryptionKey = Buffer.from(
      this.encryptionKey ? this.encryptionKey : '',
      'hex'
    )

    try {
      const externalDatastore = await context!.openExternalDatastore(
        DATA_SYNC_REQUEST_SCHEMA,
        serverDid,
        {
          permissions: {
            read: ContextInterfaces.PermissionOptionsEnum.USERS,
            write: ContextInterfaces.PermissionOptionsEnum.USERS,
            readList: did ? [did] : [],
            writeList: did ? [did] : [],
          },
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore (incorrect type fixed in next release)
          encryptionKey,
          databaseName: syncRequestDatabaseName,
          contextName,
        }
      )

      const syncRequest = await externalDatastore.get(syncRequestId)

      if (syncRequest.status === 'complete') {
        // Sync has completed on the server, so complete the sync
        // by replicating data from the server
        this.syncReplication(serverDid, contextName, syncRequest)
      } else {
        if (retryCount === 0) {
          // Retry count limit hit
          this.setSyncError('Timeout waiting for server')
          return
        }

        if (syncRequest.status === 'error') {
          // Error syncing from API
          this.setSyncError(`${syncRequest.syncInfo.error}`)
          return
        }

        // Delay for five seconds, then try again
        await delay(5000)
        retryCount--

        this.checkSync(
          serverDid,
          contextName,
          syncRequestId,
          syncRequestDatabaseName,
          retryCount
        )
      }
    } catch (err: any) {
      // @todo: Set error on this connection
      this.setSyncError(err.message)
      // console.error(err)
    }
  }

  /**
   * Replicate data from the Data Connector Server into the users vault.
   *
   * This is triggered when the Data Connector Server updates the sync status to
   * `complete`
   */
  public async syncReplication(
    serverDid: string,
    contextName: string,
    syncRequest: any
  ) {
    const context = await AccountManager.getInstance().context
    const account = context?.getAccount()
    const did = await account?.did()
    const { schemas } = syncRequest.syncInfo

    try {
      // Datastores are now available for syncing into the vault, let's sync them!

      // Loop through all the schemaUri's (that correspond to a given datastore)
      for (const schemaUri in schemas) {
        // Open the external datastore
        const { databaseName, encryptionKey } = schemas[schemaUri]
        const key = Buffer.from(encryptionKey, 'hex')

        const externalDatastore = await context?.openExternalDatastore(
          schemaUri,
          serverDid,
          {
            permissions: {
              read: ContextInterfaces.PermissionOptionsEnum.USERS,
              write: ContextInterfaces.PermissionOptionsEnum.USERS,
              readList: did ? [did] : [],
              writeList: did ? [did] : [],
            },
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore (incorrect type fixed in next release)
            encryptionKey: key,
            databaseName,
            contextName,
          }
        )

        // In order to sync we need to locate the underlying PouchDb instances
        // for the Vault's datastore and the connector's datastore
        const externalDb = await externalDatastore?.getDb()
        const externalCouch = await externalDb.getDb()

        const vaultDatastore = await context!.openDatastore(schemaUri)
        const vaultDb = await vaultDatastore.getDb()
        const vaultCouch = await vaultDb.getDb()

        // Replicate (pull) data from the connector's datastore to this user's Vault datastore
        try {
          // console.log(`Starting replication ${schemaUri}`)
          await externalCouch.replicate.to(vaultCouch, {
            // Don't replicate design documents (such as permissions)
            filter: (doc: any) => {
              return doc._id.indexOf('_design') !== 0
            },
            // This ensures that if there is a conflict between the documents, the "latest" wins
            style: 'main_only',
          })
        } catch (err: any) {
          this.setSyncError(err.message)
          return
        }
      }

      // cleanup by calling sync done to the server so the temporary data can be deleted
      const axiosInstance = axios.create()
      await axiosInstance.get(
        `${CONFIG.dataConnectorUrl}/syncDone/${this.name}?did=${did}`
      )

      this.syncLast = new Date().toISOString()
      this.syncLastError = undefined
      this.syncStatus = 'active'
      this.syncNext = moment().add(1, this.syncFrequency).toISOString()

      await this.save()
      // console.log(`Sync done and sync status updated`)
    } catch (err) {
      // @todo: How to handle?
      // console.error(err)
    }
  }

  // @todo: Disconnect a connector so it stops syncing
  public async disconnect() {
    // console.log(`Disconnect ${this.name}`)
    const syncStatus = this.syncStatus
    this.syncStatus = 'disabled'
    const success = await this.save()

    if (!success) {
      this.syncStatus = syncStatus
      // @todo: display something
      DataConnectorsManager.emit('connectionDisconnectError', this)
    } else {
      DataConnectorsManager.emit('connectionUpdated', this)
    }
  }

  public render() {
    return {
      icon: this.icon,
      label: this.label,
      syncStatus: this.syncStatus,
      name: this.name,
    }
  }

  public duration(val: any) {
    const now = moment(new Date())
    return moment.duration(now.diff(moment(val)))
  }
}

import { DatabasePermissionOptionsEnum, IDatastore } from '@verida/types'
import axios from 'axios'
import EventEmitter from 'events'
import moment from 'moment'
import { Linking } from 'react-native'

import { config } from '~/config'
import { getNetworkFromDID } from '~/features/identities'
import { Logger } from '~/features/telemetry'

import AccountManager from './AccountManager'

const logger = Logger.create('DataConnectorsManager')

const DATA_CONNECTION_SCHEMA =
  'https://vault.schemas.verida.io/data-connections/connection/v0.1.0/schema.json'
// const DATA_PROFILE_SCHEMA =
//   'https://vault.schemas.verida.io/data-connections/profile/v0.1.0/schema.json'
// const DATA_SOURCE_SCHEMA =
//   'https://vault.schemas.verida.io/data-connections/source/v0.1.0/schema.json'
const DATA_SYNC_REQUEST_SCHEMA =
  'https://vault.schemas.verida.io/data-connections/sync-request/v0.1.0/schema.json'

const delay = async (ms: number) => {
  await new Promise((resolve: any) => setTimeout(() => resolve(), ms))
}

function getDataConnectorUrl(did: string) {
  const network = getNetworkFromDID(did)
  return config.verida[network].dataConnectorServerUrl
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
  static datastore: IDatastore
  private static _connections: any = {}

  static async emit(eventName: string, args: any) {
    DataConnectorsEvents.getInstance().emit(eventName, args)
  }

  static async on(eventName: string, fn: any) {
    DataConnectorsEvents.getInstance().on(eventName, fn)
  }

  static async off(eventName: string, fn: any) {
    DataConnectorsEvents.getInstance().off(eventName, fn)
  }

  static async authComplete(connectorName: string, requestParams: any) {
    const connection = await this.getConnection(connectorName)
    await connection.setAuth(requestParams)
    await connection.sync()
  }

  static async getDatastore(): Promise<IDatastore> {
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
        // TODO: Handle this._datastore.errors
        return result
      }

      DataConnectorsManager.emit('connectionUpdated', this)

      return result
    } catch (error) {
      logger.error(new Error('Save connection error', { cause: error }))
    }
  }

  public async initiateAuth() {
    const context = await AccountManager.getInstance().context

    const account = context?.getAccount()
    const did = await account?.did()
    if (!did) {
      throw new Error('No Account found')
    }

    const dataConnectorUrl = getDataConnectorUrl(did)

    // logger.debug(`Initiating auth for ${this.source}`, { did })
    Linking.openURL(
      `${dataConnectorUrl}/connect/${this.source}?did=${did}&key=${this.encryptionKey}`
    )
  }

  public async setAuth(auth: any) {
    logger.debug('setAuth', { auth })
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

      const record = this._record

      Object.keys(this._record).forEach((key) => {
        if (key === 'profile') return

        // TODO: Strictly type the _record field to be
        //       Omit<keyof DataConnection, 'profile'>.
        // @ts-expect-error This is a dangerous assignment as we do not have
        //                  strict guidelines as to what the keyof record is.
        this[key] = record[key]
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

    // logger.debug(`Syncing ${this.name}!`)

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
      if (!did) {
        throw new Error('No Account found')
      }

      const dataConnectorUrl = getDataConnectorUrl(did)

      const axiosInstance = axios.create()

      // @todo: handle errors
      const syncRequestResult = await axiosInstance.get(
        `${dataConnectorUrl}/sync/${this.name}?accessToken=${accessToken}&refreshToken=${refreshToken}&did=${did}&key=${this.encryptionKey}`
      )
      const { serverDid, contextName, syncRequestId, syncRequestDatabaseName } =
        syncRequestResult.data

      this.checkSync(
        serverDid,
        contextName,
        syncRequestId,
        syncRequestDatabaseName
      )
    } catch (error) {
      logger.debug('1')
      logger.error(error)
      if (error instanceof Error) {
        this.setSyncError(error.message)
      }
    }
  }

  public async checkSync(
    serverDid: string,
    contextName: string,
    syncRequestId: string,
    syncRequestDatabaseName: string,
    retryCount: number = config.dataConnector.retryLimit
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
            read: DatabasePermissionOptionsEnum.USERS,
            write: DatabasePermissionOptionsEnum.USERS,
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

      const syncRequest = await externalDatastore.get(syncRequestId, undefined)

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
          this.setSyncError(`API error: ${syncRequest.syncInfo.error}`)
          return
        }

        // Delay for five seconds, then try again
        await delay(config.dataConnector.retyInterval)
        retryCount--

        this.checkSync(
          serverDid,
          contextName,
          syncRequestId,
          syncRequestDatabaseName,
          retryCount
        )
      }
    } catch (error) {
      logger.debug('2')
      logger.error(error)
      // @todo: Set error on this connection
      if (error instanceof Error) {
        this.setSyncError(error.message)
      }
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
    if (!did) {
      throw new Error('No Account found')
    }

    const { schemas, newAuth } = syncRequest.syncInfo

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
              read: DatabasePermissionOptionsEnum.USERS,
              write: DatabasePermissionOptionsEnum.USERS,
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
        const externalCouch = await externalDb?.getDb()

        const vaultDatastore = await context!.openDatastore(schemaUri)
        const vaultDb = await vaultDatastore.getDb()
        const vaultCouch = await vaultDb.getDb()

        // Replicate (pull) data from the connector's datastore to this user's Vault datastore
        try {
          // logger.debug(`Starting replication ${schemaUri}`)
          await externalCouch.replicate.to(vaultCouch, {
            // Don't replicate design documents (such as permissions)
            filter: (doc: any) => {
              return doc._id.indexOf('_design') !== 0
            },
            // This ensures that if there is a conflict between the documents, the "latest" wins
            style: 'main_only',
          })
        } catch (error) {
          logger.debug('3')
          logger.error(error)
          if (error instanceof Error) {
            this.setSyncError(error.message)
          }
          return
        }
      }

      const dataConnectorUrl = getDataConnectorUrl(did)

      // cleanup by calling sync done to the server so the temporary data can be deleted
      const axiosInstance = axios.create()
      await axiosInstance.get(
        `${dataConnectorUrl}/syncDone/${this.name}?did=${did}`
      )

      this.syncLast = new Date().toISOString()
      this.syncLastError = undefined
      this.syncStatus = 'active'
      this.syncNext = moment().add(1, this.syncFrequency).toISOString()

      if (newAuth) {
        logger.debug('New auth', { newAuth })
        this.accessToken = newAuth.accessToken
        this.refreshToken = newAuth.refreshToken
      }

      await this.save()
      // logger.debug(`Sync done and sync status updated`)
    } catch (error) {
      logger.debug('4')
      logger.error(error)
      // @todo: How to handle?
    }
  }

  // @todo: Disconnect a connector so it stops syncing
  public async disconnect() {
    // logger.debug(`Disconnect ${this.name}`)
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

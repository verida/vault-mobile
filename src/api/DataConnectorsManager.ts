import { ContextInterfaces } from '@verida/client-rn'
import Datastore from '@verida/client-rn/dist/src/context/datastore'
import axios from 'axios'
import EventEmitter from 'events'
import { StringIterator, times } from 'lodash'
import { Alert, Linking } from 'react-native'

import AccountManager from './AccountManager'

const DATA_CONNECTION_SCHEMA = 'https://vault.schemas.verida.io/data-connections/connection/v0.1.0/schema.json'
const DATA_PROFILE_SCHEMA = 'https://vault.schemas.verida.io/data-connections/profile/v0.1.0/schema.json'
const DATA_SOURCE_SCHEMA = 'https://vault.schemas.verida.io/data-connections/source/v0.1.0/schema.json'

// @todo move to global app config somewhere?
const CONFIG = {
  dataConnectorUrl: 'http://localhost:5021',
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
    const connection = new DataConnection(connectorName)
    await connection.setAuth(requestParams)
  }

  static async getDatastore(): Promise<Datastore> {
    if (DataConnectorsManager.datastore) {
      return DataConnectorsManager.datastore
    }

    const context = await AccountManager.getInstance().getVeridaContext()
    DataConnectorsManager.datastore = await context!.openDatastore(DATA_CONNECTION_SCHEMA)

    return DataConnectorsManager.datastore
  }

  static async getConnection(connectorName: string) {
    if (DataConnectorsManager._connections[connectorName]) {
      return DataConnectorsManager._connections[connectorName]
    }

    const connector = new DataConnection(connectorName)
    await connector.init()

    DataConnectorsManager._connections[connectorName] = connector
    return connector

    // @todo: load connector info from vault datastore
    /*switch (connectorName) {
      case 'twitter':
        return {
          accessToken: '',
          refreshToken: '',
          nonce: '1',
        }
      case 'facebook':
        return {
          accessToken: ``,
          requestToken: undefined,
          nonce: '1',
        }
    }*/
  }

  static async getConnectors() {
    const connections: any = Object.values(CONNECTIONS)
    const connectors = {}
    for (let i = 0; i < connections.length; i++) {
      const connection = await DataConnectorsManager.getConnection(connections[i].name)
      connectors[connection.name] = connection
    }

    return connectors
  }
}

class DataConnection extends EventEmitter {

  private name: string
  private label: string
  private _init = false

  private _datastore?: any
  private _record?: any
  private profile?: DataProfile

  public _rev?: string
  public encryptionKey?: string
  public accessToken?: string
  public refreshToken?: string
  public source?: string
  public syncFrequency?: string
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

    try {
      const result = await this._datastore.save(this._record)
      this._rev = this._record._rev = result.rev
      DataConnectorsManager.emit('connectionUpdated', this)
      return result
    } catch (err) {
      console.log("Save error", err)
    }
  }

  public async initiateAuth() {
    const context = await AccountManager.getInstance().getVeridaContext()
    
    const account = context?.getAccount()
    const did = await account?.did()

    console.log(`Initiating auth for ${this.source}`, did)
    Linking.openURL(`${CONFIG.dataConnectorUrl}/connect/${this.source}?did=${did}&key=${this.encryptionKey}`)
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

      this.profile = new DataProfile(this._record.profile)

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
        }
      } else {
        throw err
      }
    }

    this._init = true
  }

  public async sync(): Promise<void> {
    console.log(`Syncing ${this.name}`)

    const accessToken = this.accessToken
    const refreshToken = this.refreshToken
    const nonce = 1 //connectorInfo!.nonce

    this.syncLastError = undefined
    this.syncStatus = "processing"
    DataConnectorsManager.emit('connectionUpdated', this)

    try {
      // Request the server to sync the third party connector data into a collection of encrypted datastores
      const context = await AccountManager.getInstance().getVeridaContext()
      const account = context?.getAccount()
      const did = await account?.did()

      const axiosInstance = axios.create()

      // @todo: handle errors
      const syncRequestResult = await axiosInstance.get(
        `${CONFIG.dataConnectorUrl}/sync/${this.name}?accessToken=${accessToken}&refreshToken=${refreshToken}&did=${did}&nonce=${nonce}`
      )
      const { response, signerDid, contextName } = syncRequestResult.data

      // Datastores are now available for syncing into the vault, let's sync them!

      // Loop through all the schemaUri's (that correspond to a given datastore)
      for (const schemaUri in response) {
        console.log(`Processing ${schemaUri}`)
        // Open the external datastore
        const { databaseName, encryptionKey } = response[schemaUri]
        const key = Buffer.from(encryptionKey, 'hex')

        const externalDatastore = await context!.openExternalDatastore(
          schemaUri,
          signerDid,
          {
            permissions: {
              read: ContextInterfaces.PermissionOptionsEnum.USERS,
              write: ContextInterfaces.PermissionOptionsEnum.USERS,
              readList: [did],
              writeList: [did],
            },
            // @ts-ignore (incorrect type fixed in next release)
            encryptionKey: key,
            databaseName,
            contextName,
          }
        )

        // In order to sync we need to locate the underlying PouchDb instances
        // for the Vault's datastore and the connector's datastore
        const externalDb = await externalDatastore.getDb()
        const externalCouch = await externalDb.getDb()

        const vaultDatastore = await context!.openDatastore(schemaUri)
        const vaultDb = await vaultDatastore.getDb()
        const vaultCouch = await vaultDb.getDb()

        //const items = await externalDb.getMany()
        //console.log(items)

        // Replicate (pull) data from the connector's datastore to this user's Vault datastore
        try {
          console.log(`Starting replication ${schemaUri}`)
          const replicateResult = await externalCouch.replicate.to(vaultCouch, {
            // Don't replicate design documents (such as permissions)
            filter: function (doc: any) {
              return doc._id.indexOf('_design') !== 0
            },
            // This ensures that if there is a conflict between the documents, the "latest" wins
            style: 'main_only',
          })
        } catch (err: any) {
          // @todo: How to handle? Have a log somewhere? Show a message to the user?
          this.syncLastError = err.name
          console.error(err)
        }
      }

      // cleanup by calling sync done to the server so the temporary data can be deleted
      await axiosInstance.get(
        `${CONFIG.dataConnectorUrl}/syncDone/${this.name}?did=${did}&nonce=${nonce}`
      )

      this.syncLast = (new Date()).toISOString()
      this.syncLastError = undefined
      this.syncStatus = "active"

      await this.save()
      console.log(`Sync done and sync status updated`)
    } catch (err) {
      // @todo: How to handle?
      console.error(err)
    }
  }

  // @todo: Disconnect a connector so it stops syncing
  public async disconnect() {
    console.log(`Disconnect ${this.name}`)
    this.syncStatus = "disabled"
    const res = await this.save()
  }

  public render() {
    return {
      icon: this.icon,
      label: this.label,
      syncStatus: this.syncStatus,
      name: this.name
    }
  }

}

class DataProfile {

  constructor(profile: any) {

  }

}
import {
    InboxDatastoreSyncRequest,
    InboxDatabaseSyncRequest
} from '../interfaces/inbox/Inbox'
import VaultCommon from '../vault'

/**
 * Manage login requests and responses
 */
export class SyncManager {

    private vaultCommon: VaultCommon

    constructor (vaultCommon: VaultCommon) {
        this.vaultCommon = vaultCommon
    }

    /**
     * Sync a datastore
     */
    async datastore(dsSync: InboxDatastoreSyncRequest) {
        const externalDsConfig = dsSync.externalDs
        const externalContext = await this.vaultCommon.client.openContext(externalDsConfig.context)

        // Connect to the destination database (external)
        const config = {
            permissions: {
                read: 'users',
                write: 'users'
            },
            encryptionKey: externalDsConfig.encryptionKey.key,
            databaseName: externalDsConfig.dbName ? externalDsConfig.dbName : null
        }

        const externalDs = await externalContext.openExternalDatastore(
            dsSync.schema,
            externalDsConfig.did,
            config
        )

        const internalDs = await this.vaultCommon.vault.openDatastore(dsSync.schema)
        const externalDb = await externalDs.getDb()
        const internalDb = await internalDs.getDb()
        const externalCouchDb = await externalDb.getDb()
        const internalCouchDb = await internalDb.getDb()

        const filter = dsSync.filter ? dsSync.filter : {}

        switch (dsSync.direction) {
            case 'pull':
                // pull data from external
                externalCouchDb.replicate(internalCouchDb, {
                    live: false,
                    selector: filter,
                    // Don't replicate design documents
                    filter: function(doc: any) {
                        return doc._id.indexOf('_design') !== 0;
                    },
                    retry: true
                })
                    .on("error", this.onError)
                    .on("denied", this.onDenied)
                    .on("complete", this.onComplete)
                break
            case 'push':
                // push data to external
                externalCouchDb.replicate(internalCouchDb, {
                    live: false,
                    selector: filter,
                    // Don't replicate design documents
                    filter: function(doc: any) {
                        return doc._id.indexOf('_design') !== 0;
                    },
                    retry: true
                })
                    .on("error", this.onError)
                    .on("denied", this.onDenied)
                    .on("complete", this.onComplete)
                break
            case 'both':
                // sync both ways
                await externalCouchDb.sync(internalCouchDb, {
                    live: false,
                    selector: filter,
                    // Don't sync design documents
                    filter: function(doc: any) {
                        return doc._id.indexOf('_design') !== 0;
                    },
                    retry: true
                })
                    .on("error", this.onError)
                    .on("denied", this.onDenied)
                    .on("complete", this.onComplete)
                break
        }
    }

    /**
     * Sync a database
     */
    async database(dbSync: InboxDatabaseSyncRequest) {
        const externalDbConfig = dbSync.externalDb
        const externalContext = await this.vaultCommon.client.openContext(externalDbConfig.context)

        // Connect to the destination database (external)
        let config = {
            permissions: {
                read: 'users',
                write: 'users'
            },
            encryptionKey: externalDbConfig.encryptionKey.key
        }

        const externalDb = await externalContext.openExternalDatabase(
            externalDbConfig.name,
            externalDbConfig.did,
            config
        )

        // Open the source database (internal)
        const internalDb = await this.vaultCommon.vault.openDatabase(dbSync.internalDb.name)

        const filter = dbSync.filter ? dbSync.filter : {}
        filter['schema'] = {'$in': dbSync.schemas}

        const externalCouchDb = await externalDb.getDb()
        const internalCouchDb = await internalDb.getDb()

        switch (dbSync.direction) {
            case 'pull':
                // pull data from external
                externalDb._db.replicate(internalCouchDb, {
                    live: false,
                    filter: filter,
                    retry: true
                }).on("error", this.onError)
                .on("denied", this.onDenied)
                .on("complete", this.onComplete)
                break
            case 'push':
                // push data to external
                internalDb._db.replicate(externalCouchDb, {
                    live: false,
                    filter: filter,
                    retry: true
                }).on("error", this.onError)
                .on("denied", this.onDenied)
                .on("complete", this.onComplete)
                break
            case 'both':
                // sync both ways
                externalDb._db.sync(internalCouchDb, {
                    live: false,
                    filter: filter,
                    retry: true
                }).on("error", this.onError)
                .on("denied", this.onDenied)
                .on("complete", this.onComplete)
                break
        }
    }

    onError(err) {
        console.log("sync error")
        console.log(err)
    }

    onDenied(err) {
        console.log("sync denied")
        console.log(err)
    }

    onComplete(info) {
        //console.log("sync complete", info)
    }

}
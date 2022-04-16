import { Linking } from 'react-native'
import axios from 'axios'
import AccountManager from './AccountManager'
import { ContextInterfaces } from '@verida/client-rn'

// @todo move to global app config somewhere?
const CONFIG = {
    dataConnectorUrl: 'http://localhost:5021',
    connectors: {
        facebook: {}
    }
}

export default class DataConnectorsManager {
    
    static initiateAuth(connectorName: string) {
        console.log(`Initiating auth for ${connectorName}`)
        Linking.openURL(`${CONFIG.dataConnectorUrl}/connect/${connectorName}`)
    }

    static async authComplete(connectorName: string, accessToken?: string, requestToken?: string) {
        // @todo: save connector info to vault datastore
    }

    static async sync(connectorName: string): Promise<void> {
        console.log(`Syncing ${connectorName}`)
        const connectorInfo = DataConnectorsManager.connectorInfo(connectorName)

        const accessToken = connectorInfo!.accessToken
        const refreshToken = connectorInfo!.refreshToken
        const nonce = connectorInfo!.nonce
    
        try {
            // Request the server to sync the third party connector data into a collection of encrypted datastores
            const account = AccountManager.getInstance()
            const selectedAccount = account.getSelectedAccount()

            const did = selectedAccount!.did
            const axiosInstance = axios.create()

            // @todo: handle errors
            const syncRequestResult = await axiosInstance.get(`${CONFIG.dataConnectorUrl}/sync/${connectorName}?accessToken=${accessToken}&refreshToken=${refreshToken}&did=${did}&nonce=${nonce}`)
            const { response, signerDid, contextName } = syncRequestResult.data
    
            // Datastores are now available for syncing into the vault, let's sync them!
            const context = await account.getVeridaContext()
    
            // Loop through all the schemaUri's (that correspond to a given datastore)
            for (var schemaUri in response) {
                console.log(`Processing ${schemaUri}`)
                // Open the external datastore
                const { databaseName, encryptionKey } = response[schemaUri]
                console.log(databaseName)
                const key = Buffer.from(encryptionKey, 'hex')
        
                const externalDatastore = await context!.openExternalDatastore(schemaUri, signerDid, {
                    permissions: {
                        read: ContextInterfaces.PermissionOptionsEnum.USERS,
                        write: ContextInterfaces.PermissionOptionsEnum.USERS,
                        readList: [did],
                        writeList: [did]
                    },
                    // @ts-ignore (incorrect type fixed in next release)
                    encryptionKey: key,
                    databaseName,
                    contextName
                })

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
                        filter: function(doc: any) {
                            return doc._id.indexOf('_design') !== 0;
                        },
                        // This ensures that if there is a conflict between the documents, the "latest" wins
                        style: 'main_only'
                    })
                } catch (err) {
                    // @todo: How to handle? Have a log somewhere? Show a message to the user?
                    console.log('replication error')
                    console.log(err)
                }
            }
    
            // cleanup by calling sync done to the server so the temporary data can be deleted
            await axiosInstance.get(`${CONFIG.dataConnectorUrl}/syncDone/${connectorName}?did=${did}&nonce=${nonce}`)
        } catch (err) {
            // @todo: How to handle?
            console.log('error!')
            console.log(err)
        }
    }

    static connectorInfo(connectorName: string) {
        // @todo: load connector info from vault datastore
        switch (connectorName) {
            case 'twitter':
                return {
                    accessToken: '',
                    refreshToken: '',
                    nonce: '1'
                }
            case 'facebook':
                return {
                    accessToken: ``,
                    requestToken: undefined,
                    nonce: '1'
                }
        }
    }

}
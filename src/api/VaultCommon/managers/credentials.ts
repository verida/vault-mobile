/*import {
    VeridaApp,
    Database
} from "../interfaces/VeridaApp";

const CREDENTIAL_DB = 'credential'

export class CredentialsManager {

    _app: VeridaApp
    _db?: Database

    constructor (app: VeridaApp) {
        this._app = app
    }

    // @todo
    async get(credentialId: string, options: object) {
        await this._init()
        return this._db?.get(credentialId, options)
    }

    // @todo
    async getMany(filter: object, options: object) {
        await this._init()
        return this._db?.getMany(filter, options)
    }

    async _init() {
        if (this._db) {
            return
        }

        this._db = await this._app.openDatabase(CREDENTIAL_DB)
    }

}
*/

export {}

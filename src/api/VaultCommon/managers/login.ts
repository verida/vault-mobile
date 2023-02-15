
/**
 * Manage login requests and responses
 */
export class LoginManager {

    _app: any

    constructor (app: any) {
        this._app = app
    }

    /**
     * Get a list of all login requests
     */
    async getMany(filter: object, options: object) {}

    /**
     * Get a specific login request
     * 
     * @param requestId 
     */
    async get(requestId: string) {}

}
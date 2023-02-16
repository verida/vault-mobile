import {DataAction} from "./DataAction";

const MSG = 'Send you the requested data';

export class DatastoreSync extends DataAction {
    async accept () {
        await this.vaultCommon.sync.datastore(this.inboxEntry.data)
    }

    decline() {}

    async metadata() {
        return {}
    }
}

import {DataAction} from "./DataAction"
import {InboxResponse, InboxType} from "../../interfaces/inbox/Inbox"

const MSG = 'Send you the requested data'

export class Request extends DataAction {
    async accept () {
        const dataRequest = this.inboxEntry.data
        const { did, context } = this.inboxEntry.sentBy

        const response = new InboxResponse(this.inboxEntry._id)

        if (dataRequest.userSelect) {
            response.data = this.payload
        } else {
            const store = await this.vaultCommon.vault.openDatastore(this.inboxEntry.data.requestSchema)
            const foundData = await store.getMany(dataRequest.filter || {})
            response.data = [ foundData ]
        }

        await this.messaging.send(did, InboxType.DATA_SEND, response, MSG, { recipientContextName: context })
    }

    decline() {}

    async metadata() {
        return {}
    }
}

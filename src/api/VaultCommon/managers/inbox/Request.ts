import { Logger } from 'features/telemetry'

import { InboxResponse, InboxType } from '../../interfaces/inbox/Inbox'
import { DataAction } from './DataAction'

const logger = new Logger('InboxDataRequest')

const MSG = 'Send you the requested data'

export class Request extends DataAction {
  async accept() {
    logger.debug('Accepting data request')
    const dataRequest = this.inboxEntry.data
    const { did, context } = this.inboxEntry.sentBy

    const response = new InboxResponse(this.inboxEntry._id)

    if (dataRequest.userSelect) {
      response.data = this.payload
    } else {
      const store = await this.vaultCommon.vault.openDatastore(
        this.inboxEntry.data.requestSchema
      )
      const foundData = await store.getMany(dataRequest.filter || {})
      response.data = [foundData]
    }

    logger.debug('Sending data response')
    await this.messaging.send(did, InboxType.DATA_SEND, response, MSG, {
      recipientContextName: context,
    })
    logger.debug('Data response sent')
  }

  decline() {}

  async metadata() {
    return {}
  }
}

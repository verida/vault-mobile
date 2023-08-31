import { VeridaBaseRecordSchema } from 'features/verida/schemas'
import { z } from 'zod'

export type VeridaBaseRecord = z.infer<typeof VeridaBaseRecordSchema>

export enum VeridaMessageType {
  SIMPLE_MESSAGE = 'inbox/type/message',
  DATA_REQUEST = 'inbox/type/dataRequest',
}

export type SimpleMessage = {
  subject: string
  message: string
  link?: {
    url: string
    text: string
  }
}

export type SendMessageData<D> = {
  data: {
    data: D[]
  }
}

export type SendSimpleMessageOptions = SimpleMessage & {
  messageSubject?: string
  targetDid?: string
  targetContext?: string
}

export type SendDataRequestData = {
  requestSchema: string
  filter?: Record<string, unknown>
  userSelectLimit?: number
  userSelect?: boolean
}

export type SendDataRequestOptions = SendDataRequestData & {
  messageSubject: string
}

export type SentMessage = {
  id: string
  ok: boolean
  rev: string
}

export type ReceivedMessage<D> = {
  type: VeridaMessageType
  read: boolean
  sentAt: string
  message: string
  sentBy: {
    context: string
    did: string
  }
  data: {
    data: D[]
    replyId?: string
  }
}

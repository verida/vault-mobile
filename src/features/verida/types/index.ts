import {
  VeridaBaseRecordSchema,
  VeridaBaseUnsavedRecordSchema,
} from 'features/verida/schemas'
import { z } from 'zod'

import { VeridaMessageType } from '../constants'

export type VeridaBaseUnsavedRecord = z.infer<
  typeof VeridaBaseUnsavedRecordSchema
>

export type VeridaUnsavedRecord<T = Record<string, unknown>> =
  VeridaBaseUnsavedRecord & T

export type VeridaBaseRecord = z.infer<typeof VeridaBaseRecordSchema>

export type VeridaRecord<T = Record<string, unknown>> = VeridaBaseRecord & T

// TODO: Rework all the message types, create schemas for the different types of message and infer the Types from

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

export type VeridaReceivedMessage<D = Record<string, unknown>> = {
  type: VeridaMessageType
  read: boolean
  sentAt: string
  message: string
  sentBy: {
    context: string
    did: string
  }
  data?: {
    data: D[]
    replyId?: string
  }
}

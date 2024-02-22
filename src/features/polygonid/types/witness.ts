import { z } from 'zod'

import { WitnessIncomingEvent, WitnessOutgoingEvent } from '../constants'

export type CalculateWitnessFunction = (
  wasm: Uint8Array,
  inputs: JSON
) => Promise<string>

export const WitnessResultMessageSchema = z.object({
  event: z.literal(WitnessOutgoingEvent.RESULT),
  result: z.string(),
})

export type WitnessResultMessage = z.infer<typeof WitnessResultMessageSchema>

export const WitnessLogMessageSchema = z.object({
  event: z.literal(WitnessOutgoingEvent.LOG),
  level: z.enum(['info', 'warn', 'debug']),
  message: z.string(),
  data: z.record(z.unknown()).optional(),
})

export type WitnessLogMessage = z.infer<typeof WitnessLogMessageSchema>

export const WitnessErrorMessageSchema = z.object({
  event: z.literal(WitnessOutgoingEvent.ERROR),
  error: z.record(z.unknown()),
})

export type WitnessErrorMessage = z.infer<typeof WitnessErrorMessageSchema>

export const WitnessOutgoingMessageSchema = z.discriminatedUnion('event', [
  WitnessResultMessageSchema,
  WitnessLogMessageSchema,
  WitnessErrorMessageSchema,
])

export type WitnessOutgoingMessage = z.infer<
  typeof WitnessOutgoingMessageSchema
>

export type WitnessRequestMessage = {
  event: WitnessIncomingEvent.REQUEST
  binary: string
  inputs: JSON
}

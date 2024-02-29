import { z } from 'zod'

import { WitnessIncomingEvent, WitnessOutgoingEvent } from '../constants'

export type CalculateWitnessFunction = (
  wasm: Uint8Array,
  inputs: JSON
) => Promise<string>

export const WitnessResultMessageSchema = z.object({
  event: z.literal(WitnessOutgoingEvent.RESULT),
  id: z.string(),
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
  id: z.string().optional(),
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
  id: string
  event: WitnessIncomingEvent.REQUEST
  binary: string
  inputs: JSON
}

export type HandleWitnessResultFunction = (result: string) => void

export type HandleWitnessErrorFunction = (error: unknown) => void

export type WitnessResponseHandlers = {
  handleResult: HandleWitnessResultFunction
  handleError: HandleWitnessErrorFunction
}

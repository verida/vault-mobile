import { SupportedConnection } from './connections'

/** Supported nadges to strongly type other types. */
export type SupportedBadge = 'verida-identity' | 'twitter-account'
// | 'discord-account'

/** Not really a connection, should find a better name. Could also find a better way to support Verida alongside other Connections without considering it a connection itself. */
export type VeridaConnection = 'verida'

/** Supported Connection, including Verida */
export type BadgeConnection = VeridaConnection | SupportedConnection

/** Definition of the supported types of badge. */
export type BadgeType = {
  /** Technical id of the badge type. */
  id: SupportedBadge

  /** Label of the badge type. */
  label: string

  /** Description of the badge. */
  description: string

  /** Static image of the badge. */
  image: any

  /** The related connection. For the moment Verida is considered a connection as well, even though not technically one. */
  connection: BadgeConnection

  // image_data?: string
  // external_url?: string
  // background_color?: string
  // animation_url?: string
  // youtube_url?: string
}

// TODO: fix all badges types
//

export interface VeridaBadge {
  /* Unique ID for this type of badge */
  id: string

  /** Label of the badge type. */
  label: string

  /** Name of the badge */
  name: string

  /** URL of a static image representing this badge */
  image: string

  /** Description of the badge. */
  description: string

  /** TODO: Check necessary of the below attributes */

  /* The origin (ie: twitter) of this badge */
  origin: string

  /* The type of badge (ie: account, 10kfollowers) */
  type: string

  /* Unique AccountId that is claimable for this badge (ie: twitter username) */
  claimAcocuntId?: string

  /* CAIP addreses that have not yet claimed this badge, but could */
  claimableAddresses?: string[]

  credentialItem?: any

  // image_data?: string
  // external_url?: string
  // background_color?: string
  // animation_url?: string
  // youtube_url?: string
}

// Do we need this
export interface UserBadge extends VeridaBadge {
  proofSignature: string

  // metadata?: Record<string, string>
}

export interface ClaimBadgeQuery {
  type?: string
  origin?: string
  blockchainNetwork?: string
}

export enum VeridaBagdes {
  VERIDA_IDENTITY = 'verida-identity',
  DISCORD_ACCOOUNT = 'discord-account',
  // TBA
}

export const VeridaBadgesMetadata = {
  [VeridaBagdes.VERIDA_IDENTITY]: {
    label: 'Verida Identity',
    image:
      'https://ipfs.moralis.io:2053/ipfs/QmbPHjLsp48QuSoCtDHvXRnfzAqRDYsX4udQXRQ5gB2w87/Gen0/verida-identity.png',
  },
  [VeridaBagdes.DISCORD_ACCOOUNT]: {
    label: 'Discord Account',
    image:
      'https://ipfs.moralis.io:2053/ipfs/QmQsghP7Y1dbZHgoo48hQz8SHdFk2mjmPikhkHg69HHhWb/Gen0/discord-account.png',
  },
}

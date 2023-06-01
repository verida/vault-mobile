export interface AvailableBadge {
  /* Unique ID for this type of badge */
  id: string

  /** Label of the badge type. */
  label: string

  /** Description of the badge. */
  description: string

  /* The origin (ie: twitter) of this badge */
  origin: string

  /* The type of badge (ie: account, 10kfollowers) */
  type: string

  /* URL of a static image representing this badge */
  imageUrl: string

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

export interface UserBadge extends AvailableBadge {
  proofSignature: string

  // metadata?: Record<string, string>
}

export interface ClaimBadgeQuery {
  type?: string
  origin?: string
  blockchainNetwork?: string
}

export enum BadgeType {
  DISCORD_ACCOOUNT = 'discord-account',
}

export const BadgeTypeMeta = {
  [BadgeType.DISCORD_ACCOOUNT]: {
    label: 'Discord Account',
    image: require('assets/badge_images/discord_account_badge.png'), // TODO: remove, should download somewhere, IPFS?
  },
}

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

  /* Indicate if the user can claim this badge (ie: it may be available, but not claimable because the user doesn't meet the requirement) */
  claimable: boolean

  /* Metadata about the account or connection for this badge (ie: twitter username) if it's claimable */
  claimMetadata?: string

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
export type BadgeData = {
  id: BadgeUniqueID
  username: string
  proof: string
  address: string
  did: string
  // ... any other?
}

export type AccountConnection =
  | 'Facebook'
  | 'Twitter'
  | 'Verida-Identity'
  | 'Discord'

export type BadgeType = {
  id: BadgeUniqueID
  name: string
  description: string
  image: any
  label: AccountConnection
  image_data?: string
  external_url?: string
  background_color?: string
  animation_url?: string
  youtube_url?: string
}

export type BadgeUniqueID =
  | 'verida-identity'
  | 'twitter-account'
  | 'discord-account'
  | 'facebook-account'

export type ClaimableBadgeParams = BadgeData & BadgeType

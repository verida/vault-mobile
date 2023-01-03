import { BadgeData, BadgeType, BadgeUniqueID } from 'types/Badges'

const DiscordIcon = require('../assets/badges_icon/discord_badge_icon.png')
const veridaIdentityIcon = require('../assets/badges_icon/verida_identity_badge_icon.png')
// const facebookIcon = require('../assets/badges_icon/facebook_social_icon.png')
const TwitterIcon = require('../assets/badges_icon/twitter_badge_icon.png')

/**
 * Add other required fields for the static badge data
 */
export const STATIC_BADGES_DATA: BadgeType[] = [
  {
    id: 'verida-identity',
    name: 'Verida Identity',
    label: 'Verida-Identity',
    description:
      'Your Badge will include your Verida DID as proof of ownership',
    image: veridaIdentityIcon,
  },
  {
    id: 'twitter-account',
    name: 'Twitter Account',
    label: 'Twitter',
    description:
      'Your Badge will include your Twitter handle (username) as proof of ownership',
    image: TwitterIcon,
  },
  {
    id: 'discord-account',
    name: 'Discord Account',
    label: 'Discord',
    description:
      'Your Badge will include your Twitter handle (username) as proof of ownership',
    image: DiscordIcon,
  },
]
/**
 * This is will be a dynamic badge data from an API
 */
export const BADGE_DATA: BadgeData[] = [
  {
    id: 'verida-identity',
    username: '@cmcWebCode',
    proof: 'vda:0xD11B3...00cE',
    address: '',
    did: '',
  },
  {
    id: 'twitter-account',
    username: '@cmcWebCode',
    proof: 'vda:0xD11B3...00cE',
    address: '',
    did: '',
  },
  {
    id: 'discord-account',
    username: '@cmcWebCode',
    proof: 'vda:0xD11B3...00cE',
    address: '',
    did: '',
  },
  // {
  //   id: 'facebook-account',
  //   username: '@cmcWebCode',
  //   proof: '',
  //   address: '',
  //   did: '',
  // },
]

export const getBadgeDetailsByID = (id: BadgeUniqueID) => {
  const badgeDetails = STATIC_BADGES_DATA.find((item) => item.id === id)

  return badgeDetails as BadgeType
}

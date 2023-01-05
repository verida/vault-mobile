import { getConnectionData } from 'features/connections'
import { BadgeType, SupportedBadge } from 'types/badges'

import AccountManager from 'api/AccountManager'

const VeridaIdentityBadgeImage = require('assets/badge_images/verida_identity_badge_image.png')
const TwitterAccountBadgeImage = require('assets/badge_images/twitter_account_badge_image.png')
// const DiscordAccountBadgeImage = require('assets/badge_images/discord_account_badge_image.png')

/** Definitions of the types of badge */
export const badgeTypes: BadgeType[] = [
  {
    id: 'verida-identity',
    label: 'Verida Identity',
    description:
      'Your Badge will include your Verida DID as proof of ownership',
    image: VeridaIdentityBadgeImage,
    connection: 'verida',
  },
  {
    id: 'twitter-account',
    label: 'Twitter Account',
    description:
      'Your Badge will include your Twitter handle (username) as proof of ownership',
    image: TwitterAccountBadgeImage,
    connection: 'twitter',
  },
  // {
  //   id: 'discord-account',
  //   name: 'Discord Account',
  //   description:
  //     'Your Badge will include your Discord username as proof of ownership',
  //   image: DiscordAccountBadgeImage,
  //   connection: 'discord',
  // },
]

export const getBadgeType = (id: SupportedBadge): BadgeType | undefined => {
  return badgeTypes.find((type) => type.id === id)
}

export const getBadgeData = (
  badgeTypeId: SupportedBadge
): { account: string; proof: string } | null => {
  const badgeType = getBadgeType(badgeTypeId)

  if (!badgeType) {
    // TODO: Handle the unlikely case of badgeTypes not found? throw error?
    return null
  }

  if (badgeType.connection === 'verida') {
    // Get the DID of the current Identity
    const selectedIdentity = AccountManager.getInstance().getSelectedAccount()
    if (!selectedIdentity) {
      return null
    }
    return {
      account: selectedIdentity.did,
      proof: selectedIdentity.did,
    }
  }

  // If not a Verida-related badge type, get the data from the connection
  const connectionData = getConnectionData(badgeType.connection)

  if (!connectionData) {
    return null
  }

  return {
    account: connectionData.account,
    proof: connectionData.proof,
  }
}

import {
  AvailableBadge,
  BadgeType,
  BadgeTypeMeta,
  ClaimBadgeQuery,
  UserBadge,
} from 'types/Badges'

import AccountManager from './AccountManager'
import { SBTManager } from './SBTManager'

// @todo: replace with API
const availableBadges: AvailableBadge[] = [
  {
    id: 'verida-identity',
    origin: 'verida',
    type: 'identity',
    label: 'Verida Identity',
    description:
      'Your Badge will include your Verida DID as proof of ownership',
    imageUrl:
      'https://uploads-ssl.webflow.com/636b86340271e54460e829bb/636b99c393d67d98c5fa2deb_verida%20one%20logo.svg',
    claimableAddresses: ['eip155:5:0xabcd'],
    claimAccountId: 'did:vda:testnet:0xabc',
  },
  {
    id: 'twitter-account',
    origin: 'twitter',
    type: 'account',
    label: 'Twitter Account',
    description:
      'Your Badge will include your Twitter handle (username) as proof of ownership',
    imageUrl:
      'https://logolook.net/wp-content/uploads/2021/06/Symbol-Twitter.png',
    claimableAddresses: ['eip155:5:0xabcd', 'eip155:1:0xabcd'],
    claimAccountId: '@tahpot',
  },
  {
    id: 'discord-account',
    origin: 'discord',
    type: 'account',
    label: 'Discord Account',
    description:
      'Your Badge will include your Discord handle (username) as proof of ownership',
    imageUrl:
      'https://assets-global.website-files.com/6257adef93867e50d84d30e2/636e0a6a49cf127bf92de1e2_icon_clyde_blurple_RGB.png',
  },
]

class BadgeApi {
  private sbtManager: SBTManager

  constructor() {
    this.sbtManager = new SBTManager()
  }

  /**
   * Get all the available badges supported by Verida
   *
   * Some of these will not be claimable (see `.claimable` property)
   */
  public async getAvailableBadges(origin?: string): Promise<AvailableBadge[]> {
    const vault = AccountManager.getInstance().vault!
    const folder = await vault.data.selectFolder('credentials') // TODO: config
    const items = await folder.getMany(
      {
        credentialSchema:
          'https://common.schemas.verida.io/token/sbt/credential/v0.1.0/schema.json', // TODO: is this the right filter?
      },
      {
        sort: [{ insertedAt: 'desc' }],
      }
    )

    return items.map((item: any) => ({
      id: item._id,
      label: BadgeTypeMeta[item.credentialData.type as BadgeType].label,
      attributes: item.credentialData.attributes,
      description: item.credentialData.description,
      did: item.credentialData.did,
      didAddress: item.credentialData.didAddress,
      image: BadgeTypeMeta[item.credentialData.type as BadgeType].image, // Hardcode for now
      name: item.credentialData.name,
      type: item.credentialData.type,
      uniqueAttribute: item.credentialData.uniqueAttribute,
      credentialItem: item,
    }))
  }

  /**
   * Claim a a badge for the current user
   *
   * @param origin
   * @param type
   * @returns
   */
  public async claimBadge(
    // origin: string,
    // type: string,
    // caipAddress: string,
    // ownershipProof: string
    credentialRecord: any,
    mintAddress: string
  ): Promise<boolean> {
    // console.log('claiming badge', origin, type)
    return await this.sbtManager.mintSbt(credentialRecord, mintAddress)
  }

  /**
   * Get all the badges claimed by this user.
   *
   * Do we need to filter these by origin and / or type?
   *
   * @param origin
   * @returns
   */
  public async getClaimedBadges(
    query: ClaimBadgeQuery = {}
  ): Promise<UserBadge[]> {
    const claimedBadge: UserBadge = {
      ...availableBadges[2],
      proofSignature: '0xabc',
    }

    return [claimedBadge]
  }
}

export const BadgeManager = new BadgeApi()

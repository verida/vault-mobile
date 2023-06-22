import { ImageSourcePropType } from 'react-native'

import { VeridaOnePlatforms } from 'api/types'

const FacebookIcon = require('assets/social_icons/facebook.png')
const TwitterIcon = require('assets/social_icons/twitter.png')
const InstagramIcon = require('assets/social_icons/instagram.png')
const DiscordIcon = require('assets/social_icons/discord.png')
const LinkedInIcon = require('assets/social_icons/linkedin.png')
const TelegramIcon = require('assets/social_icons/telegram.png')
const GithubIcon = require('assets/social_icons/github.png')

// Take from the schema, maybe better to fetch value dynamically.
export const PUBLIC_PROFILE_NAME_MAX_LENGTH = 140

export interface PlatformLinkData {
  name: string
  label: string
  icon: ImageSourcePropType
  baseURL: string
  displayedPrefix?: string
}

// Supported platforms
export const PLATFORM_LINKS: Record<VeridaOnePlatforms, PlatformLinkData> = {
  [VeridaOnePlatforms.FACEBOOK]: {
    name: 'facebook',
    label: 'Facebook',
    icon: FacebookIcon,
    baseURL: 'https://facebook.com/',
  },
  [VeridaOnePlatforms.TWITTER]: {
    name: 'twitter',
    label: 'Twitter',
    icon: TwitterIcon,
    baseURL: 'https://twitter.com/',
    displayedPrefix: '@',
  },
  [VeridaOnePlatforms.INSTAGRAM]: {
    name: 'instagram',
    label: 'Instagram',
    icon: InstagramIcon,
    baseURL: 'https://instagram.com/',
  },
  // TODO: enable, Discord doesn't suport profile URL ATM
  [VeridaOnePlatforms.DISCORD]: {
    name: 'discord',
    label: 'Discord',
    icon: DiscordIcon,
    baseURL: 'https://discord.com/',
  },
  [VeridaOnePlatforms.LINKEDIN]: {
    name: 'linkedin',
    label: 'LinkedIn',
    icon: LinkedInIcon,
    baseURL: 'https://linkedin.com/in/',
  },
  [VeridaOnePlatforms.TELEGRAM]: {
    name: 'telegram',
    label: 'Telegram',
    icon: TelegramIcon,
    baseURL: 'https://t.me/',
    displayedPrefix: '@',
  },
  [VeridaOnePlatforms.GITHUB]: {
    name: 'github',
    label: 'GitHub',
    icon: GithubIcon,
    baseURL: 'https://github.com/',
  },
}

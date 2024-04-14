import { VeridaOnePlatformMetadata, VeridaOnePlatforms } from '../types'

const FacebookIcon = require('assets/social_icons/facebook.png')
const TwitterIcon = require('assets/social_icons/twitter.png')
const InstagramIcon = require('assets/social_icons/instagram.png')
// const DiscordIcon = require('assets/social_icons/discord.png')
const LinkedInIcon = require('assets/social_icons/linkedin.png')
const TelegramIcon = require('assets/social_icons/telegram.png')
const GithubIcon = require('assets/social_icons/github.png')

// TODO: For the moment, only specific to Verida One, make it more generic if needed elsewhere in the app
// Supported platforms on Verida One
export const VERIDA_ONE_PLATFORM_METADATA: Record<
  VeridaOnePlatforms,
  VeridaOnePlatformMetadata
> = {
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
  // [VeridaOnePlatforms.DISCORD]: {
  //   name: 'discord',
  //   label: 'Discord',
  //   icon: DiscordIcon,
  //   baseURL: 'https://discord.com/',
  // },
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

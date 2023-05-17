const FacebookIcon = require('assets/social_icons/facebook.png')
const TwitterIcon = require('assets/social_icons/twitter.png')
const InstagramIcon = require('assets/social_icons/instagram.png')
const DiscordIcon = require('assets/social_icons/discord.png')
const LinkedinIcon = require('assets/social_icons/linkedin.png')
const TelegramIcon = require('assets/social_icons/telegram.png')
const GithubIcon = require('assets/social_icons/github.png')

// Take from the schema, maybe better to fetch value dynamically.
export const PUBLIC_PROFILE_NAME_MAX_LENGTH = 140

export const PLATFORM_LINKS = {
  facebook: {
    name: 'facebook',
    label: 'Facebook',
    icon: FacebookIcon,
    baseURL: 'https://facebook.com/',
  },
  twitter: {
    name: 'twitter',
    label: 'Twitter',
    icon: TwitterIcon,
    baseURL: 'https://twitter.com/',
  },
  instagram: {
    name: 'instagram',
    label: 'Instagram',
    icon: InstagramIcon,
    baseURL: 'https://instagram.com/',
  },
  discord: {
    name: 'discord',
    label: 'Discord',
    icon: DiscordIcon,
    baseURL: 'https://discord.com/',
  },
  linkedin: {
    name: 'linkedin',
    label: 'Linkedin',
    icon: LinkedinIcon,
    baseURL: 'https://linkedin.com/in/',
  },
  telegram: {
    name: 'telegram',
    label: 'Telegram',
    icon: TelegramIcon,
    baseURL: 'https://telegram.com/',
  },
  github: {
    name: 'github',
    label: 'Github',
    icon: GithubIcon,
    baseURL: 'https://github.com/',
  },
}

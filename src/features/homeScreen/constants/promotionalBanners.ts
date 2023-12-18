import { HomeScreenPromotionalBanner } from '../types'

const veridaMainnetBannerImage = require('assets/home_promo_banners/verida_mainnet_banner_3x.png')
const veridaMissionsBannerImage = require('assets/home_promo_banners/verida_missions_banner_3x.png')
const veridaOneBannerImage = require('assets/home_promo_banners/verida_one_banner_3x.png')
// const veridaBadgesBannerImage = require('assets/home_promo_banners/verida_badges_banner_3x.png')

export const promotionalBanners: HomeScreenPromotionalBanner[] = [
  {
    key: 'veridaMainnet',
    buttonLabel: 'Read our announcement',
    image: veridaMainnetBannerImage,
    actionType: 'link',
    actionValue: 'https://www.verida.network/',
  },
  {
    key: 'veridaMissions',
    buttonLabel: 'Go contribute',
    image: veridaMissionsBannerImage,
    actionType: 'link',
    actionValue: 'https://missions.verida.network/',
  },
  {
    key: 'veridaOne',
    buttonLabel: 'Join the waitlist',
    image: veridaOneBannerImage,
    actionType: 'link',
    actionValue: 'https://www.verida.one/',
  },
  // {
  //   key: 'veridaBadges',
  //   buttonLabel: 'Claim your Verida Badges',
  //   image: veridaBadgesBannerImage,
  //   actionType: 'link',
  //   actionValue: 'https://www.verida.one/',
  // },
]

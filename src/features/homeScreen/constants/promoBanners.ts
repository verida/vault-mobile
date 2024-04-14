import { HomeScreenPromoBanner } from '../types'

const veridaBanksiaBannerImage = require('assets/home_promo_banners/verida_banksia_banner_3x.png')
const veridaMainnetBannerImage = require('assets/home_promo_banners/verida_mainnet_banner_3x.png')
const veridaMissionsBannerImage = require('assets/home_promo_banners/verida_missions_banner_3x.png')
const veridaOneBannerImage = require('assets/home_promo_banners/verida_one_banner_3x.png')
// const veridaBadgesBannerImage = require('assets/home_promo_banners/verida_badges_banner_3x.png')

export const promoBanners: HomeScreenPromoBanner[] = [
  {
    key: 'veridaBanksia',
    order: 1,
    buttonLabel: 'Learn more',
    image: veridaBanksiaBannerImage,
    actionType: 'link',
    actionValue:
      'https://news.verida.io/upgrade-notice-verida-testnet-to-be-replaced-by-verida-banksia-to-support-polygon-pos-amoy-testnet-07d2d6e45e6a',
  },
  {
    key: 'veridaMainnet',
    order: 2,
    buttonLabel: 'Learn more',
    image: veridaMainnetBannerImage,
    actionType: 'link',
    actionValue: 'https://www.verida.network/',
  },
  {
    key: 'veridaMissions',
    order: 3,
    buttonLabel: 'Learn more',
    image: veridaMissionsBannerImage,
    actionType: 'link',
    actionValue: 'https://missions.verida.network/',
  },
  {
    key: 'veridaOne',
    order: 4,
    buttonLabel: 'Join the waitlist',
    image: veridaOneBannerImage,
    actionType: 'link',
    actionValue: 'https://www.verida.one/',
  },
  // {
  //   key: 'veridaBadges',
  //   order: 1,
  //   buttonLabel: 'Claim your Verida Badges',
  //   image: veridaBadgesBannerImage,
  //   actionType: 'link',
  //   actionValue: 'https://www.verida.one/',
  // },
]

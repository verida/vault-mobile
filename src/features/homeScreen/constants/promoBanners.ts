import { HomeScreenPromoBanner } from '../types'

const veridaCommunityPreSaleBannerImage = require('assets/home_promo_banners/verida_community_pre-sale_3x.png')
const veridaMainnetBannerImage = require('assets/home_promo_banners/verida_mainnet_banner_3x.png')
const veridaMissionsBannerImage = require('assets/home_promo_banners/verida_missions_banner_3x.png')
const veridaOneBannerImage = require('assets/home_promo_banners/verida_one_banner_3x.png')
// const veridaBadgesBannerImage = require('assets/home_promo_banners/verida_badges_banner_3x.png')

export const promoBanners: HomeScreenPromoBanner[] = [
  {
    key: 'communityPreSale',
    buttonLabel: 'Learn more',
    image: veridaCommunityPreSaleBannerImage,
    actionType: 'link',
    actionValue:
      'https://news.verida.io/announcing-the-verida-storage-credit-community-pre-sale-and-whitelist-d7f92e78b91c',
  },
  {
    key: 'veridaMainnet',
    buttonLabel: 'Learn more',
    image: veridaMainnetBannerImage,
    actionType: 'link',
    actionValue: 'https://www.verida.network/',
  },
  {
    key: 'veridaMissions',
    buttonLabel: 'Learn more',
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

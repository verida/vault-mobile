// import { promoBannersApi } from '../redux'
import { Banner } from '../types'

// const { useBannersQuery } = promoBannersApi

export function usePromoBanners() {
  // const { isLoading, isError, data, error } = useBannersQuery({})

  // return {
  //   promoBanners: data || [],
  //   isProcessing: isLoading,
  //   hasError: isError,
  //   error: error,
  // }

  // id: z.string(),
  // order: z.number(),
  // image: z.string(),
  // buttonLabel: z.string(),
  // actionType: z.union([z.literal('screen'), z.literal('link')]),
  // actionValue: z.string(),
  // params: z.object({}).optional(),

  // NOTE: hard coded the one sunset banner banner for now
  return {
    promoBanners: [
      {
        id: '1',
        order: 0,
        buttonLabel: 'Learn More',
        image: require('~/assets/wallet_support_ending_banner_3x.png'),
        actionType: 'link',
        actionValue:
          'https://verida.medium.com/verida-vault-launches-take-control-of-your-personal-data-in-the-age-of-private-ai-78e859ade48d',
      } as Banner,
    ],
  }
}

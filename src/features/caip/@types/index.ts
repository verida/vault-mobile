// Source of truth for what protocols are supported by the app.
export enum SupportedCaipProtocolStandard {
  EIP_155 = 'eip155',
  NEAR = 'near',
}

export type ParsedCaipType<
  Standard extends SupportedCaipProtocolStandard = SupportedCaipProtocolStandard
> = {
  readonly standard: Standard // i.e. "eip155"
  readonly chainId: string // i.e. "1"
  readonly address: string | undefined
}

export type ChainMetadata<Standard extends SupportedCaipProtocolStandard> =
  Omit<ParsedCaipType<Standard>, 'address'> & {
    readonly name: string
    readonly logo: string
    readonly rgb: string
    readonly rpc: string
  }

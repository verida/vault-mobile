// @aurelticot: I think it's more relevant in the 'blockchains' feature but didn't want to refactor everything using the enum from the 'caip' feature.
// I was not able to use the 'caip' enum, though, because of a weird circular dependency. Hence the duplication here.
// TODO: Remove the 'caip' enum and use this one instead.
export enum SupportedBlockchainNamespace {
  EIP_155 = 'eip155',
  NEAR = 'near',
}

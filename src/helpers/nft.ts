export function getNFTImageUri(nftImage: string) {
  const processIpfs = (ipfsLink: string) =>
    ipfsLink?.replace('ipfs://', 'https://ipfs.io/ipfs/')
  const isIpfsLink = (uri: string) => uri?.startsWith('ipfs://')
  const uri = isIpfsLink(nftImage) ? processIpfs(nftImage) : nftImage

  return uri
}

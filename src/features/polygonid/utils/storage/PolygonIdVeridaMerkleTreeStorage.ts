import {
  IdentityMerkleTreeMetaInformation,
  IMerkleTreeStorage,
  MerkleTreeType,
} from '@0xpolygonid/js-sdk'
import { Merkletree, str2Bytes } from '@iden3/js-merkletree'

import { PolygonIdVeridaMerkleTreeDataSource } from './PolygonIdVeridaMerkleTreeDataSource'
import { PolygonIdVeridaTreeStorage } from './PolygonIdVeridaTreeStorage'

const mtTypes = [
  MerkleTreeType.Claims,
  MerkleTreeType.Revocations,
  MerkleTreeType.Roots,
]

/* Do not modify value without proper migration */
const MERKLE_TREE_META_RECORD_KEY = 'merkleTreeMeta'

export class PolygonIdVeridaMerkleTreeStorage implements IMerkleTreeStorage {
  private readonly mtDepth: number
  public readonly dataSource: PolygonIdVeridaMerkleTreeDataSource

  constructor(
    dataSource: PolygonIdVeridaMerkleTreeDataSource,
    mtDepth: number
  ) {
    this.dataSource = dataSource
    this.mtDepth = mtDepth
  }

  async createIdentityMerkleTrees(
    identifier: string
  ): Promise<IdentityMerkleTreeMetaInformation[]> {
    if (!identifier) {
      identifier = [Math.random(), Math.random()]
        .map((part) => String(part).replace('.', ''))
        .join()
    }

    const createMetaInfo = () => {
      const treesMeta: IdentityMerkleTreeMetaInformation[] = []

      for (const mType of mtTypes) {
        const treeId = identifier.concat(`+${mType.toString()}`)
        const metaInfo = { treeId, identifier, type: mType }
        treesMeta.push(metaInfo)
      }
      return treesMeta
    }

    const meta = await this.dataSource.get(MERKLE_TREE_META_RECORD_KEY)

    if (meta) {
      const metaInfo: IdentityMerkleTreeMetaInformation[] = JSON.parse(meta)

      const identityMetaInfo = metaInfo.filter(
        (m) => m.identifier === identifier
      )

      if (identityMetaInfo.length > 0) {
        return identityMetaInfo
      }
    }

    const treesMeta = createMetaInfo()

    await this.dataSource.save(
      MERKLE_TREE_META_RECORD_KEY,
      JSON.stringify(treesMeta)
    )

    return treesMeta
  }

  async getIdentityMerkleTreesInfo(
    identifier: string
  ): Promise<IdentityMerkleTreeMetaInformation[]> {
    const meta = await this.dataSource.get(MERKLE_TREE_META_RECORD_KEY)

    if (meta) {
      const metaInfo: IdentityMerkleTreeMetaInformation[] = JSON.parse(meta)
      return metaInfo.filter((m) => m.identifier === identifier)
    }

    throw new Error(`Merkle tree meta not found for identifier ${identifier}`)
  }

  async getMerkleTreeByIdentifierAndType(
    identifier: string,
    mtType: MerkleTreeType
  ): Promise<Merkletree> {
    const meta = await this.dataSource.get(MERKLE_TREE_META_RECORD_KEY)
    if (!meta) {
      throw new Error(`Merkle tree meta not found for identifier ${identifier}`)
    }

    const metaInfo: IdentityMerkleTreeMetaInformation[] = JSON.parse(meta)
    const resultMeta = metaInfo.filter(
      (m) => m.identifier === identifier && m.type === mtType
    )[0]
    if (!resultMeta) {
      throw new Error(
        `Merkle tree not found for identifier ${identifier} and type ${mtType}`
      )
    }

    return new Merkletree(
      new PolygonIdVeridaTreeStorage(
        this.dataSource,
        str2Bytes(resultMeta.treeId)
      ),
      true,
      this.mtDepth
    )
  }

  async addToMerkleTree(
    identifier: string,
    mtType: MerkleTreeType,
    hindex: bigint,
    hvalue: bigint
  ): Promise<void> {
    const meta = await this.dataSource.get(MERKLE_TREE_META_RECORD_KEY)
    if (!meta) {
      throw new Error(`Merkle tree meta not found for identifier ${identifier}`)
    }

    const metaInfo: IdentityMerkleTreeMetaInformation[] = JSON.parse(meta)
    const resultMeta = metaInfo.filter(
      (m) => m.identifier === identifier && m.type === mtType
    )[0]

    if (!resultMeta) {
      throw new Error(
        `Merkle tree not found for identifier ${identifier} and type ${mtType}`
      )
    }

    const tree = new Merkletree(
      new PolygonIdVeridaTreeStorage(
        this.dataSource,
        str2Bytes(resultMeta.treeId)
      ),
      true,
      this.mtDepth
    )

    await tree.add(hindex, hvalue)
  }

  async bindMerkleTreeToNewIdentifier(
    oldIdentifier: string,
    newIdentifier: string
  ): Promise<void> {
    const meta = await this.dataSource.get(MERKLE_TREE_META_RECORD_KEY)
    if (!meta) {
      throw new Error(
        `Merkle tree meta not found for identifier ${oldIdentifier}`
      )
    }
    const metaInfo: IdentityMerkleTreeMetaInformation[] = JSON.parse(meta)

    const treesMeta = metaInfo
      .filter((m) => m.identifier === oldIdentifier)
      .map((m) => ({ ...m, identifier: newIdentifier }))
    if (treesMeta.length === 0) {
      throw new Error(
        `Merkle tree meta not found for identifier ${oldIdentifier}`
      )
    }

    const newMetaInfo = [
      ...metaInfo.filter((m) => m.identifier !== oldIdentifier),
      ...treesMeta,
    ]

    await this.dataSource.save(
      MERKLE_TREE_META_RECORD_KEY,
      JSON.stringify(newMetaInfo)
    )
  }
}

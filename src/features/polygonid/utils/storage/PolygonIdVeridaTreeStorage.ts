import {
  Bytes,
  bytes2Hex,
  Hash,
  ITreeStorage,
  Node,
  NODE_TYPE_EMPTY,
  NODE_TYPE_LEAF,
  NODE_TYPE_MIDDLE,
  NodeEmpty,
  NodeLeaf,
  NodeMiddle,
  ZERO_HASH,
} from '@iden3/js-merkletree'

import { PolygonIdVeridaMerkleTreeDataSource } from './PolygonIdVeridaMerkleTreeDataSource'

export class PolygonIdVeridaTreeStorage implements ITreeStorage {
  private readonly dataSource: PolygonIdVeridaMerkleTreeDataSource
  private readonly prefix: Bytes
  private readonly prefixHash: string
  private currentRoot: Hash

  constructor(dataSource: PolygonIdVeridaMerkleTreeDataSource, prefix: Bytes) {
    this.dataSource = dataSource
    this.prefix = prefix
    this.prefixHash = bytes2Hex(prefix)
    this.currentRoot = ZERO_HASH
  }

  async get(k: Bytes): Promise<Node | undefined> {
    const kBytes = new Uint8Array([...this.prefix, ...k])
    const key = bytes2Hex(kBytes)

    const value = await this.dataSource.get(key)

    if (!value) {
      return undefined
    }

    const parsedValue = JSON.parse(value)

    switch (parsedValue.type) {
      case NODE_TYPE_EMPTY:
        return new NodeEmpty()
      case NODE_TYPE_MIDDLE: {
        const cL = new Hash(Uint8Array.from(parsedValue.childL))
        const cR = new Hash(Uint8Array.from(parsedValue.childR))

        return new NodeMiddle(cL, cR)
      }

      case NODE_TYPE_LEAF: {
        const kv = new Hash(Uint8Array.from(parsedValue.entry[0]))
        const v = new Hash(Uint8Array.from(parsedValue.entry[1]))

        return new NodeLeaf(kv, v)
      }
    }

    throw new Error(
      `Value found for key ${bytes2Hex(kBytes)} is not of type Node`
    )
  }

  async put(k: Bytes, n: Node): Promise<void> {
    const kBytes = new Uint8Array([...this.prefix, ...k])
    const key = bytes2Hex(kBytes)
    const toSerialize: Record<string, unknown> = {
      type: n.type,
    }

    if (n instanceof NodeMiddle) {
      toSerialize.childL = Array.from(n.childL.bytes)
      toSerialize.childR = Array.from(n.childR.bytes)
    } else if (n instanceof NodeLeaf) {
      toSerialize.entry = [
        Array.from(n.entry[0].bytes),
        Array.from(n.entry[1].bytes),
      ]
    }

    const value = JSON.stringify(toSerialize)

    await this.dataSource.save(key, value)
  }

  async getRoot(): Promise<Hash> {
    if (!this.currentRoot.equals(ZERO_HASH)) {
      return this.currentRoot
    }

    const rootString = await this.dataSource.get(this.prefixHash)

    if (!rootString) {
      this.currentRoot = ZERO_HASH
    } else {
      const bytes: number[] = JSON.parse(rootString)
      this.currentRoot = new Hash(Uint8Array.from(bytes))
    }

    return this.currentRoot
  }

  async setRoot(r: Hash): Promise<void> {
    this.currentRoot = r
    await this.dataSource.save(
      this.prefixHash,
      JSON.stringify(Array.from(r.bytes))
    )
  }
}

import { IDatastore } from '@verida/types'

import AccountManager from '~/api/AccountManager'
import { DID_METADATA_V010_SCHEMA_URL } from '~/features/did/constants'
import { DidMetadata, DidMetadataRecord } from '~/features/did/types'
import { Logger } from '~/features/telemetry'

const logger = Logger.create('DID Metadata')

async function getDidMetadataDatastore() {
  logger.info('Opening DID metadata datastore')
  const didMetadataDatastore =
    await AccountManager.getInstance().context?.openDatastore(
      DID_METADATA_V010_SCHEMA_URL
    )
  logger.info('DID metadata datastore opened')
  if (!didMetadataDatastore) {
    throw new Error('Error while opening DID metadata datastore')
  }
  return didMetadataDatastore
}

async function getDidMetadataRecord(
  didMetadataDatastore: IDatastore,
  did: string
) {
  logger.info(`Getting DID metadata record for ${did}`)
  try {
    const record = await didMetadataDatastore.get(did, {})
    logger.info(`DID Metadata record for ${did} found`)
    logger.debug(`DID Metadata record for ${did}:`, { record })
    return record as DidMetadataRecord
  } catch (error) {
    // TODO: Check if the error is a "not found" error, report the erro if not
    logger.warn(`DID Metadata record not found for ${did}`)
    return undefined
  }
}

/**
 * Get metadata for a DID.
 *
 * @param did
 * @returns
 */
export async function getDidMetadata(
  did: string
): Promise<DidMetadata | undefined> {
  try {
    const didMetadataDatastore = await getDidMetadataDatastore()

    const didMetadataRecord = await getDidMetadataRecord(
      didMetadataDatastore,
      did
    )
    if (!didMetadataRecord) {
      return undefined
    }

    const { name, icon } = didMetadataRecord
    return {
      name,
      icon,
    }
  } catch (error) {
    logger.error(new Error('Error getting did metadata', { cause: error }))
    return undefined
  }
}

/**
 * Save metadata for a DID.
 *
 * @param did
 * @param didMetadata
 */
export async function saveDidMetadata(did: string, didMetadata: DidMetadata) {
  logger.info('Saving DID metadata', { did, metadata: didMetadata })

  try {
    const didMetadataDatastore = await getDidMetadataDatastore()

    // Check if a record already exists for the given DID
    const existingRecord = await getDidMetadataRecord(didMetadataDatastore, did)

    if (
      existingRecord &&
      existingRecord.name === didMetadata.name &&
      existingRecord.icon === didMetadata.icon
    ) {
      logger.info('No need to save DID metadata')
      return
    }

    // Merge the existing record with the new metadata
    const recordToSave = {
      ...existingRecord,
      ...didMetadata,
    }

    logger.info('Saving DID metadata', { did, recordToSave })

    await didMetadataDatastore.save(
      {
        ...recordToSave,
        _id: did,
      },
      {}
    )
    logger.info('DID metadata saved')
  } catch (error) {
    logger.error(new Error('Error saving did metadata', { cause: error }))
  }
}

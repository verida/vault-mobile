import { DataAction } from './DataAction'

type ActionError = {
  dataEntry: any
  errors: any[]
}

type ActionResult = {
  success: boolean
  errors: ActionError[]
}

export class Send extends DataAction {
  async accept() {
    const acceptResult: ActionResult = {
      success: true,
      errors: [],
    }
    const dataSent = this.inboxEntry.data.data
    for (const i in dataSent) {
      const dataEntry = dataSent[i]
      // Delete any revision information in the data to avoid document update conflicts
      delete dataEntry._rev

      try {
        const store = await this.vaultCommon.vault.openDatastore(
          dataEntry.schema
        )
        const result = await store.save(dataEntry, {
          forceUpdate: true,
        })

        if (!result) {
          acceptResult.success = false
          acceptResult.errors.push({
            dataEntry,
            errors: store.errors,
          })
        }
      } catch (error) {
        acceptResult.success = false
        acceptResult.errors.push({
          dataEntry,
          errors: [error],
        })
      }
    }

    return acceptResult
  }

  decline() {
    const declineResult = {
      success: true,
      errors: {},
    }
    return declineResult
  }

  async metadata() {
    return {}
  }
}

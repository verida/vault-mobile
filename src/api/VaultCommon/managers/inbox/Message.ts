import { DataAction } from './DataAction'

export class Message extends DataAction {
  async accept() {
    return {
      success: true,
      errors: {},
    }
  }

  decline() {
    return {
      success: true,
      errors: {},
    }
  }

  async metadata() {
    return {}
  }
}

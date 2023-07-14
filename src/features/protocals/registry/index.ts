import { ProtocolHandler } from '../@types'

class ProtocalHandlerRegistry {
  private handlers: ProtocolHandler[]
  private static instance: ProtocalHandlerRegistry

  public constructor() {
    this.handlers = []
  }

  public static getInstance(): ProtocalHandlerRegistry {
    if (!ProtocalHandlerRegistry.instance) {
      ProtocalHandlerRegistry.instance = new ProtocalHandlerRegistry()
    }

    return ProtocalHandlerRegistry.instance
  }

  public addHandler(handler: ProtocolHandler) {
    if (
      !handler.identifier() ||
      !this.handlers.some((it) => it.identifier() === handler.identifier())
    ) {
      this.handlers.push(handler)
    }
  }

  public addHandlers(handlers: ProtocolHandler[]) {
    handlers.forEach((handler) => {
      this.addHandler(handler)
    })
  }

  public removeHandler(handler: ProtocolHandler) {
    this.handlers = this.handlers.filter(
      (it) => it.identifier() !== handler.identifier() || it === handler
    )
  }

  public removeAll() {
    this.handlers = []
  }

  public processDeeplink(uri: string) {
    this.handlers.forEach((handler) => {
      handler.handleDeepLink(uri)
    })
  }

  public processQR(qrCodeMessage: string) {
    this.handlers.forEach((handler) => {
      handler.handleQRCode(qrCodeMessage)
    })
  }
}

export async function configProtocalHandlers(handlers: ProtocolHandler[]) {
  ProtocalHandlerRegistry.getInstance().addHandlers(handlers)
}

export async function processDeeplink(uri: string) {
  ProtocalHandlerRegistry.getInstance().processDeeplink(uri)
}

export async function processQR(qrCodeMessage: string) {
  ProtocalHandlerRegistry.getInstance().processQR(qrCodeMessage)
}

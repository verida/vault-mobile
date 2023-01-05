import React from 'react'

// FIXME: Double check these types are relevant. They have been built while implementing the Badge feature.

/** Supported connections to strongly type other types. */
export type SupportedConnection = 'facebook' | 'twitter'

/** Definition of a supported connection (label, logo, etc.). */
export type ConnectionType = {
  /** Technical name of the connection among the supported ones. ie: twitter. */
  name: SupportedConnection

  /** Label of the connection. ie: 'Twitter'. */
  label: string

  /** Icon/logo of the connection. */
  icon: React.ReactNode
}

/** Details of a connection. ie: The user is connection with their account '@johndoe'. */
export type Connection = {
  /** The type of connection, among the supported ones. */
  type: SupportedConnection

  /** The actual identifier/username/account the user is connected to. ie: @johndoe on Twitter */
  account: string

  /** The proof of ownership, supposed to be stored in the Verida Network */
  proof: string
}

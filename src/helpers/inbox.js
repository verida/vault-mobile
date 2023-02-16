import { get } from 'lodash'
import moment from 'moment'
import React from 'react'

import { getInboxProfile } from '../api/utils'
import DataSnapshot from '../assets/inbox/snapshot.svg'
import DataSynchronization from '../assets/inbox/synchronization.svg'

export const TYPES = [
  {
    id: 'inbox/type/dataSend',
    title: 'Incoming Data',
    svg: (width = 20, height = 20, style = {}) => (
      <DataSnapshot width={width} height={height} style={style} />
    ),
  },
  {
    id: 'inbox/type/dataRequest',
    title: 'Request for Data',
    svg: (width = 20, height = 20, style = {}) => (
      <DataSnapshot width={width} height={height} style={style} />
    ),
  },
  {
    id: 'inbox/type/databaseSync',
    title: 'Sync Database Request',
    svg: (width = 20, height = 20, style = {}) => (
      <DataSynchronization width={width} height={height} style={style} />
    ),
  },
  {
    id: 'inbox/type/datastoreSync',
    title: 'Sync Data Request',
    svg: (width = 20, height = 20, style = {}) => (
      <DataSynchronization width={width} height={height} style={style} />
    ),
  },
  {
    id: 'inbox/type/message',
    title: 'Message',
    svg: (width = 20, height = 20, style = {}) => (
      <DataSnapshot width={width} height={height} style={style} />
    ),
  },
  {
    id: 'unknown',
    title: 'Unknown',
  },
]

export const findTypeById = (id) =>
  TYPES.find((type) => type.id === id) ||
  TYPES.find((type) => type.id === 'unknown')

// @todo: Add to vault common
export const buildItem = async (inboxItem) => {
  const item = {
    id: inboxItem._id,
    logo: null,
    title: inboxItem.message,
    createdAt: moment(inboxItem.sentAt).format('MMM DD'),
    type: inboxItem.type,
    read: inboxItem.read,
    item: inboxItem,
  }

  const profile = await getInboxProfile(
    inboxItem.sentBy.did,
    inboxItem.sentBy.context
  )
  const name = get(profile, 'name', '')
  const avatar = get(profile, 'avatar')
  item.from = name ? `Sent by ${name}\n` : ''
  item.from += `via ${inboxItem.sentBy.context}`
  if (avatar) {
    item.logo = avatar
  }

  return item
}

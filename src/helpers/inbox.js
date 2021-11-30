import React from 'react'
import DataSnapshot from '../assets/inbox/snapshot.svg'
import DataSynchronization from '../assets/inbox/synchronization.svg'
import moment from 'moment'
import { get } from 'lodash'
import AccountManager from 'api/AccountManager'

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
    id: 'unknown',
    title: 'Unknown',
  },
]

export const findTypeById = (id) =>
  TYPES.find((type) => type.id === id) ||
  TYPES.find((type) => type.id === 'unknown')

export const getAvatarFromSource = (source) => {
  const parsedSource = JSON.parse(source)
  const { format, base64 } = parsedSource

  return `data:image/${format};base64,${base64}`
}

// @todo: Add to vault common
export const buildItem = async (inboxItem) => {
  const item = {
    id: inboxItem._id,
    logo: 'http://logok.org/wp-content/uploads/2014/05/Total-logo-earth-1024x768.png',
    title: inboxItem.message,
    createdAt: moment(inboxItem.sentAt).format('MMM DD'),
    type: inboxItem.type,
    read: inboxItem.read,
    item: inboxItem,
  }

  const profile = await getProfile(inboxItem.sentBy)
  const name = get(profile, 'name', '')
  const avatar = get(profile, 'avatar')
  item.from = name ? `Sent by ${name}\n` : ''
  item.from += `via ${inboxItem.sentBy.context}`
  if (avatar) {
    item.logo = getAvatarFromSource(avatar)
  }
  return item
}

// @todo: Add to vault common
export const getProfile = async (sentBy) => {
  const verida = AccountManager.getInstance().context
  try {
    const profile = await verida.openProfile('basicProfile', sentBy.did)
    return await profile.getMany()
  } catch (err) {
    // User may not have created a profile
    return {}
  }
}

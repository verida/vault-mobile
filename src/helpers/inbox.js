import React from 'react'
import DataSnapshot from '../assets/inbox/snapshot.svg'
import DataSynchronization from '../assets/inbox/synchronization.svg'
import { getVeridaApp } from '../api'
import moment from 'moment'
import _ from 'lodash'

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
  const name = profile('name', '')
  const avatar = profile('avatar')
  item.from = name ? `Sent by ${name} ` : ''
  item.from += `via ${inboxItem.sentBy.app}`
  if (avatar) {
    item.logo = getAvatarFromSource(avatar)
  }
  return item
}

// @todo: Add to vault common
export const getProfile = async (sentBy) => {
  const verida = await getVeridaApp()
  try {
    const profile = await verida.openProfile(sentBy.did, sentBy.appName)
    const profileItems = await profile.getMany()

    return (key, stub) => {
      const data = _.find(profileItems, (_data) => _data.key === key)
      return (data && data.value) || stub
    }
  } catch (err) {
    // User may not have created a profile
    return () => {
      return ''
    }
  }
}

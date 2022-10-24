import { Container, Content } from 'native-base'
import React from 'react'

import NavigationHeader from 'components/Navigation/NavigationHeader'

import RequestDetailsLayout from '../../components/Inbox/RequestDetailsLayout'
import RecordList from '../../components/RecordList'

const company = {
  uri: 'https://assets.verida.io/avatar.svg',
  name: 'Steve Smith from Verida Health: ERM',
  createdAt: 'May 25',
  type: 2,
}

const records = [
  {
    id: 1,
    title: 'Health / Notes',
    amount: 32,
    insertedAt: '2019.07.03',
  },
  {
    id: 2,
    title: 'Health / Activities',
    amount: 512,
    insertedAt: '2019.07.03',
    filters: [
      'Type = Heart Rate',
      'Source = Mt barker medical practice',
      'Type = Cycling',
    ],
  },
  {
    id: 3,
    title: 'Health / Activities',
    amount: 6,
    insertedAt: '2019.07.03',
    filters: ['Source = Mt barker medical practice', 'Type = Heart Rate'],
  },
  {
    id: 4,
    title: 'Health / Clinical Impressions',
    amount: 20,
    insertedAt: '2019.07.03',
    filters: [
      'Source = Mt barker medical practice',
      'Type = Cycling',
      'Source = Mt barker medical practice',
      'Type = Heart Rate',
    ],
  },
  {
    id: 5,
    title: 'Health / Clinical Impressions',
    amount: 20,
    insertedAt: '2019.07.03',
    filters: [
      'Source = Mt barker medical practice',
      'Type = Cycling',
      'Source = Mt barker medical practice',
      'Type = Heart Rate',
    ],
  },
  {
    id: 6,
    title: 'Health / Clinical Impressions',
    amount: 20,
    insertedAt: '2019.07.03',
    filters: [
      'Source = Mt barker medical practice',
      'Type = Cycling',
      'Source = Mt barker medical practice',
      'Type = Heart Rate',
    ],
  },
]

export default () => {
  return (
    <Container>
      <NavigationHeader title='Request details' />
      <Content>
        <RequestDetailsLayout company={company}>
          <RecordList list={records} />
        </RequestDetailsLayout>
      </Content>
    </Container>
  )
}

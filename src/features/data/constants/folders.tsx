import React from 'react'

import ContactSvg from '~/assets/icons/data/contact.svg'
// import DocumentsSvg from '~/assets/icons/data/documents.svg'
// import EmploymentSvg from '~/assets/icons/data/employment.svg'
// import FinanceSvg from '~/assets/icons/data/finance.svg'
// import HealthSvg from '~/assets/icons/data/health.svg'
import IdentitySvg from '~/assets/icons/data/identity.svg'
// import QualificationsSvg from '~/assets/icons/data/qualifications.svg'
// import ShoppingSvg from '~/assets/icons/data/shopping.svg'
// import ShoppingCouponSvg from '~/assets/icons/data/shopping/coupon.svg'
// import ShoppingReceiptSvg from '~/assets/icons/data/shopping/receipt.svg'
import SocialSvg from '~/assets/icons/data/social.svg'
import SocialFollowingSvg from '~/assets/icons/data/social/following.svg'
import SocialPostSvg from '~/assets/icons/data/social/post.svg'
import { DataFolderDefinition } from '~/features/data'
// import SubscriptionsSvg from '~/assets/icons/data/subscriptions.svg'
// import TicketsSvg from '~/assets/icons/data/tickets.svg'

export const dataFolders: DataFolderDefinition[] = [
  {
    name: 'credentials',
    title: 'Credential',
    titlePlural: 'Credentials',
    color: '#5BE1B0',
    icon: <IdentitySvg />,
    root: true,
    display: 'grid',
    database: 'credential',
  },
  // health: {
  //   title: 'Health',
  //   color: '#FD4F64',
  //   icon: <HealthSvg />,
  //   root: true,
  //   display: 'folders',
  //   folders: [
  //     'health/patient',
  //     'health/encounter',
  //     'health/clinical-impression',
  //   ],
  // },
  // 'health/patient': {
  //   title: 'Patient',
  //   titlePlural: 'Patients',
  //   color: '#9234eb',
  //   icon: <HealthSvg />,
  //   root: false,
  //   display: 'grid',
  //   database: 'health_patient',
  //   layouts: {
  //     list: ['displayName', 'gender', 'generalPractitioner[0]', 'insertedAt'],
  //     view: ['displayName', 'gender', 'generalPractitioner[0]', 'insertedAt'],
  //   },
  //   fields: {
  //     displayName: {
  //       label: 'Name',
  //     },
  //     'generalPractitioner[0]': {
  //       label: 'Practioner',
  //     },
  //   },
  //   card: {
  //     summary: function (row) {
  //       return `${row.birthDate} (${row.gender})`
  //     },
  //   },
  //   nameField: 'displayName',
  // },
  // 'health/encounter': {
  //   title: 'Encounter',
  //   titlePlural: 'Encounters',
  //   color: '#f55e07',
  //   icon: <HealthSvg />,
  //   root: false,
  //   display: 'grid',
  //   database: 'health_encounter',
  //   sort: [
  //     {
  //       'period.start': 'desc',
  //     },
  //   ],
  //   layouts: {
  //     list: ['serviceType.text', 'status', 'period.start'],
  //     view: ['serviceType.text', 'period.start'],
  //   },
  //   fields: {
  //     'serviceType.text': {
  //       label: 'Service type',
  //     },
  //     'period.start': {
  //       label: 'Date/time',
  //     },
  //   },
  //   card: {
  //     name: function (row) {
  //       return row.serviceType.text
  //     },
  //   },
  //   summaryField: 'class',
  // },
  // 'health/clinical-impression': {
  //   title: 'Clinical Impression',
  //   titlePlural: 'Clinical Impressions',
  //   color: '#ff000a',
  //   icon: <HealthSvg />,
  //   root: false,
  //   display: 'grid',
  //   database: 'health_clinical_impression',
  //   sort: [
  //     {
  //       'note.0.time': 'desc',
  //     },
  //   ],
  //   layouts: {
  //     list: ['note.0.time', 'status', 'summary'],
  //     view: ['status', 'summary'],
  //   },
  //   fields: {
  //     'note.0.text': {
  //       label: 'Note',
  //     },
  //     'note.0.time': {
  //       label: 'Date/time',
  //     },
  //     subject: {
  //       label: 'Patient',
  //     },
  //   },
  //   card: {
  //     name: function () {
  //       return 'Medical impression'
  //     },
  //   },
  //   summaryField: 'summary',
  // },
  // shopping: {
  //   title: 'Shopping',
  //   titlePlural: 'Shopping',
  //   icon: <ShoppingSvg />,
  //   root: true,
  //   display: 'folders',
  //   folders: ['shopping/receipt', 'shopping/coupon'],
  // },
  // 'shopping/receipt': {
  //   title: 'Receipt',
  //   titlePlural: 'Receipts',
  //   color: '#69BB02',
  //   icon: <ShoppingReceiptSvg />,
  //   root: false,
  //   display: 'grid',
  //   database: 'shopping_receipt',
  //   layouts: {
  //     list: ['store', 'amount', 'transactionTimestamp'],
  //     view: ['store', 'amount', 'transactionTimestamp'],
  //   },
  // },
  // 'shopping/coupon': {
  //   title: 'Coupon',
  //   titlePlural: 'Coupons',
  //   color: '#2DB6F0',
  //   icon: <ShoppingCouponSvg />,
  //   root: false,
  //   display: 'grid',
  //   database: 'shopping_coupon',
  //   layouts: {
  //     list: [
  //       'name',
  //       'description',
  //       'value',
  //       'valueType',
  //       'currency',
  //       'barcode',
  //     ],
  //   },
  // },
  // finance: {
  //   title: 'Finance',
  //   titlePlural: 'Finance',
  //   color: '#47E6E5',
  //   icon: <FinanceSvg />,
  //   root: true,
  //   display: 'folders',
  //   folders: [],
  // },
  // employment: {
  //   title: 'Employment',
  //   titlePlural: 'Employment',
  //   color: '#47E6E5',
  //   icon: <EmploymentSvg />,
  //   root: true,
  //   display: 'folders',
  //   folders: [],
  // },
  // education: {
  //   title: 'Education',
  //   titlePlural: 'Education',
  //   color: '#47E6E5',
  //   icon: <QualificationsSvg />,
  //   root: true,
  //   display: 'folders',
  //   folders: [],
  // },
  // subscriptions: {
  //   title: 'Subscription',
  //   titlePlural: 'Subscriptions',
  //   color: '#47E6E5',
  //   icon: <SubscriptionsSvg />,
  //   root: true,
  //   display: 'folders',
  //   folders: [],
  // },
  // tickets: {
  //   title: 'Ticket',
  //   titlePlural: 'Tickets',
  //   color: '#47E6E5',
  //   icon: <TicketsSvg />,
  //   root: true,
  //   display: 'folders',
  //   folders: [],
  // },
  // documents: {
  //   title: 'Document',
  //   titlePlural: 'Documents',
  //   color: '#47E6E5',
  //   icon: <DocumentsSvg />,
  //   root: true,
  //   display: 'folders',
  //   folders: [],
  // },
  {
    name: 'contacts',
    title: 'Contacts',
    titlePlural: 'Contacts',
    color: '#47E6E5',
    icon: <ContactSvg />,
    root: true,
    display: 'cards',
    database: 'social_contact',
    layouts: {
      list: ['firstName', 'lastName', 'email', 'mobile'],
      view: ['firstName', 'lastName', 'email', 'mobile', 'insertedAt'],
    },
  },
  {
    name: 'social',
    title: 'Social',
    titlePlural: 'Social',
    icon: <SocialSvg />,
    root: true,
    display: 'folders',
    folders: ['social/following', 'social/posts'],
  },
  {
    name: 'social/following',
    title: 'Following',
    titlePlural: 'Following',
    color: '#7A78E5',
    icon: <SocialFollowingSvg />,
    root: false,
    display: 'cards',
    database: 'social_following',
    layouts: {
      list: ['name', 'sourceApplication'],
      view: [
        'name',
        'sourceApplication',
        'followedTimestamp',
        'sourceId',
        'uri',
      ],
    },
  },
  {
    name: 'social/posts',
    title: 'Posts',
    titlePlural: 'Posts',
    color: '#EE7D91',
    icon: <SocialPostSvg />,
    root: false,
    display: 'cards',
    database: 'social_post',
    layouts: {
      list: ['name', 'sourceApplication'],
      view: [
        'name',
        'content',
        'uri',
        'sourceApplication',
        'sourceId',
        'insertedAt',
      ],
    },
  },
]

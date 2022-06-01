import React from 'react'

import DocumentsSvg from '../assets/icons/data/documents.svg'
import EmploymentSvg from '../assets/icons/data/employment.svg'
import FinanceSvg from '../assets/icons/data/finance.svg'
import HealthSvg from '../assets/icons/data/health.svg'
import IdentitySvg from '../assets/icons/data/identity.svg'
import QualificationsSvg from '../assets/icons/data/qualifications.svg'

import ContactSvg from '../assets/icons/data/contact.svg'

import ShoppingSvg from '../assets/icons/data/shopping.svg'
import ShoppingCouponSvg from '../assets/icons/data/shopping/coupon.svg'
import ShoppingReceiptSvg from '../assets/icons/data/shopping/receipt.svg'

import SocialSvg from '../assets/icons/data/social.svg'
import SocialPostSvg from '../assets/icons/data/social/post.svg'
import SocialFollowingSvg from '../assets/icons/data/social/following.svg'

import SubscriptionsSvg from '../assets/icons/data/subscriptions.svg'
import TicketsSvg from '../assets/icons/data/tickets.svg'

const dataMap = {
  navigation: [
    'credentials',
    /*'health',
    'shopping',
    'finance',
    'employment',
    'education',
    'insurance',
    'subscriptions',
    'tickets',
    'documents',
    */
    'contact',
    'shopping',
    'documents',
    'social',
  ],
  folders: {
    credentials: {
      title: 'Credential',
      titlePlural: 'Credentials',
      icon: <IdentitySvg />,
      display: 'grid',
      database: 'credential',
      color: '#5BE1B0',
    },
    health: {
      title: 'Health',
      icon: <HealthSvg />,
      display: 'folders',
      color: '#FD4F64',
      folders: [
        'health/patient',
        'health/encounter',
        'health/clinical-impression',
      ],
    },
    'health/patient': {
      title: 'Patient',
      titlePlural: 'Patients',
      color: '#9234eb',
      icon: <HealthSvg />,
      display: 'grid',
      database: 'health_patient',
      layouts: {
        list: ['displayName', 'gender', 'generalPractitioner[0]', 'insertedAt'],
        view: ['displayName', 'gender', 'generalPractitioner[0]', 'insertedAt'],
      },
      fields: {
        displayName: {
          label: 'Name',
        },
        'generalPractitioner[0]': {
          label: 'Practioner',
        },
      },
      card: {
        summary: function (row) {
          return `${row.birthDate} (${row.gender})`
        },
      },
      nameField: 'displayName',
    },
    'health/encounter': {
      title: 'Encounter',
      titlePlural: 'Encounters',
      color: '#f55e07',
      icon: <HealthSvg />,
      display: 'grid',
      database: 'health_encounter',
      sort: [
        {
          'period.start': 'desc',
        },
      ],
      layouts: {
        list: ['serviceType.text', 'status', 'period.start'],
        view: ['serviceType.text', 'period.start'],
      },
      fields: {
        'serviceType.text': {
          label: 'Service type',
        },
        'period.start': {
          label: 'Date/time',
        },
      },
      card: {
        name: function (row) {
          return row.serviceType.text
        },
      },
      summaryField: 'class',
    },
    'health/clinical-impression': {
      title: 'Clinical Impression',
      titlePlural: 'Clinical Impressions',
      color: '#ff000a',
      icon: <HealthSvg />,
      display: 'grid',
      database: 'health_clinical_impression',
      sort: [
        {
          'note.0.time': 'desc',
        },
      ],
      layouts: {
        list: ['note.0.time', 'status', 'summary'],
        view: ['status', 'summary'],
      },
      fields: {
        'note.0.text': {
          label: 'Note',
        },
        'note.0.time': {
          label: 'Date/time',
        },
        subject: {
          label: 'Patient',
        },
      },
      card: {
        name: function () {
          return 'Medical impression'
        },
      },
      summaryField: 'summary',
    },
    shopping: {
      title: 'Shopping',
      titlePlural: 'Shopping',
      icon: <ShoppingSvg />,
      display: 'folders',
      folders: ['shopping/receipt', 'shopping/coupon'],
    },
    'shopping/receipt': {
      title: 'Receipt',
      titlePlural: 'Receipts',
      database: 'shopping_receipt',
      display: 'grid',
      icon: <ShoppingReceiptSvg />,
      color: '#69BB02',
      layouts: {
        list: ['store', 'amount', 'transactionTimestamp'],
        view: ['store', 'amount', 'transactionTimestamp'],
      },
    },
    'shopping/coupon': {
      title: 'Coupon',
      titlePlural: 'Coupons',
      database: 'shopping_coupon',
      display: 'grid',
      icon: <ShoppingCouponSvg />,
      color: '#2DB6F0',
      layouts: {
        list: [
          'name',
          'description',
          'value',
          'valueType',
          'currency',
          'barcode',
        ],
      },
    },
    finance: {
      title: 'Finance',
      titlePlural: 'Finance',
      icon: <FinanceSvg />,
      display: 'folders',
      color: '#47E6E5',
    },
    employment: {
      title: 'Employment',
      titlePlural: 'Employment',
      icon: <EmploymentSvg />,
      display: 'folders',
      color: '#47E6E5',
    },
    education: {
      title: 'Education',
      titlePlural: 'Education',
      icon: <QualificationsSvg />,
      display: 'folders',
      color: '#47E6E5',
    },
    /*insurance: {
      title: 'Insurance',
      titlePlural: 'Insurance',
      icon: <InsuranceSvg />,
      display: 'folders',
      color: '#47E6E5',
    },*/
    subscriptions: {
      title: 'Subscription',
      titlePlural: 'Subscriptions',
      icon: <SubscriptionsSvg />,
      display: 'folders',
      color: '#47E6E5',
    },
    tickets: {
      title: 'Ticket',
      titlePlural: 'Tickets',
      icon: <TicketsSvg />,
      display: 'folders',
      color: '#47E6E5',
    },
    documents: {
      title: 'Document',
      titlePlural: 'Documents',
      icon: <DocumentsSvg />,
      display: 'folders',
      color: '#47E6E5',
    },
    contact: {
      title: 'Contacts',
      titlePlural: 'Contacts',
      icon: <ContactSvg />,
      display: 'cards',
      database: 'social_contact',
      color: '#47E6E5',
      layouts: {
        list: ['firstName', 'lastName', 'email', 'mobile'],
        view: ['firstName', 'lastName', 'email', 'mobile', 'insertedAt'],
      },
    },
    social: {
      title: 'Social',
      titlePlural: 'Social',
      icon: <SocialSvg />,
      display: 'folders',
      folders: ['social/following', 'social/posts'],
    },
    'social/following': {
      title: 'Following',
      titlePlural: 'Following',
      display: 'cards',
      icon: <SocialFollowingSvg />,
      database: 'social_following',
      color: '#7A78E5',
      layouts: {
        list: ['name', 'sourceApplication'],
        view: ['name', 'sourceApplication', 'followedTimestamp', 'sourceId', 'uri'],
      },
    },
    'social/posts': {
      title: 'Posts',
      titlePlural: 'Posts',
      display: 'cards',
      icon: <SocialPostSvg />,
      database: 'social_post',
      color: '#EE7D91',
      layouts: {
        list: ['name', 'sourceApplication'],
        view: [
          'name',
          'content',
          'uri',
          'sourceApplication',
          'sourceId',
          'insertedAt',
        ]
      },
    },
  },
}

export default dataMap

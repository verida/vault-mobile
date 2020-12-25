import React from 'react';

import IdentitySvg from '../assets/icons/data/identity.svg';
import HealthSvg from '../assets/icons/data/health.svg';
import SocialSvg from '../assets/icons/data/social.svg';

import MeasurementsSvg from '../assets/icons/health/measurements.svg';
import ActivitiesSvg from '../assets/icons/health/activities.svg';
import ResultsSvg from '../assets/icons/health/results.svg';
import NotesSvg from '../assets/icons/health/notes.svg';

import EmploymentSvg from '../assets/icons/data/employment.svg';
import FinanceSvg from '../assets/icons/data/finance.svg';
import QualificationsSvg from '../assets/icons/data/qualifications.svg';
import InsuranceSvg from '../assets/icons/data/insurance.svg';
import SubscriptionsSvg from '../assets/icons/data/subscriptions.svg';
import TicketsSvg from '../assets/icons/data/tickets.svg';
import DocumentsSvg from '../assets/icons/data/documents.svg';

export default dataMap = {
    "navigation": [
        "finance",
        "health",
        "employment",
        "education",
        "insurance",
        "subscriptions",
        "tickets",
        "documents",
        "contact"
    ],
    "folders": {
        "health": {
            "title": "Health",
            "icon": <HealthSvg/>,
            "display": "folders",
            "color": "#FD4F64",
            "folders": [
                "health/patient",
                "health/encounter",
                "health/clinical-impression"
            ]
        },
        "health/patient": {
            "title": "Patient",
            "titlePlural": "Patients",
            "color": "#9234eb",
            "icon": <HealthSvg/>,
            "display": "grid",
            "database": "health_patient",
            "layouts": {
                "list": [
                    "displayName",
                    "gender",
                    "generalPractitioner[0]",
                    "insertedAt"
                ],
                "view": [
                    "displayName",
                    "gender",
                    "generalPractitioner[0]",
                    "insertedAt"
                ]
            },
            "fields": {
                "displayName": {
                    "label": "Name"
                },
                "generalPractitioner[0]": {
                    "label": "Practioner"
                }
            },
            "card": {
                "summary": function(row) {
                    return `${row.birthDate} (${row.gender})`
                }
            },
            "nameField": "displayName",
        },
        "health/encounter": {
            "title": "Encounter",
            "titlePlural": "Encounters",
            "color": "#f55e07",
            "icon": <HealthSvg/>,
            "display": "grid",
            "database": "health_encounter",
            "sort": [
                {
                    "period.start": "desc"
                }
            ],
            "layouts": {
                "list": [
                    "serviceType.text",
                    "status",
                    "period.start"
                ],
                "view": [
                    "serviceType.text",
                    "period.start"
                ]
            },
            "fields": {
                "serviceType.text": {
                    "label": "Service type"
                },
                "period.start": {
                    "label": "Date/time"
                }
            },
            "card": {
                "name": function(row) {
                    return row.serviceType.text
                }
            },
            "summaryField": "class"
        },
        "health/clinical-impression": {
            "title": "Clinical Impression",
            "titlePlural": "Clinical Impressions",
            "color": "#ff000a",
            "icon": <HealthSvg/>,
            "display": "grid",
            "database": "health_clinical_impression",
            "sort": [
                {
                    "note.0.time": "desc"
                }
            ],
            "layouts": {
                "list": [
                    "note.0.time",
                    "status",
                    "summary"
                ],
                "view": [
                    "status",
                    "summary"
                ]
            },
            "fields": {
                "note.0.text": {
                    "label": "Note"
                },
                "note.0.time": {
                    "label": "Date/time"
                },
                "subject": {
                    "label": "Patient"
                }
            },
            "card": {
                "name": function(row) {
                    return "Medical impression"
                }
            },
            "summaryField": "summary"
        },
        "finance": {
            "title": "Finance",
            "titlePlural": "Finance",
            "icon": <FinanceSvg/>,
            "display": "folders",
            "color": "#47E6E5"
        },
        "employment": {
            "title": "Employment",
            "titlePlural": "Employment",
            "icon": <EmploymentSvg/>,
            "display": "folders",
            "color": "#47E6E5"
        },
        "education": {
            "title": "Education",
            "titlePlural": "Education",
            "icon": <QualificationsSvg/>,
            "display": "folders",
            "color": "#47E6E5"
        },
        "insurance": {
            "title": "Insurance",
            "titlePlural": "Insurance",
            "icon": <InsuranceSvg/>,
            "display": "folders",
            "color": "#47E6E5"
        },
        "subscriptions": {
            "title": "Subscription",
            "titlePlural": "Subscriptions",
            "icon": <SubscriptionsSvg/>,
            "display": "folders",
            "color": "#47E6E5"
        },
        "tickets": {
            "title": "Ticket",
            "titlePlural": "Tickets",
            "icon": <TicketsSvg/>,
            "display": "folders",
            "color": "#47E6E5"
        },
        "documents": {
            "title": "Document",
            "titlePlural": "Documents",
            "icon": <DocumentsSvg/>,
            "display": "folders",
            "color": "#47E6E5"
        },
        "contact": {
            "title": "Contacts",
            "titlePlural": "Contacts",
            "icon": <SocialSvg />,
            "display": "cards",
            "database": "social_contact",
            "color": "#47E6E5",
            "layouts": {
                "list": [
                    "firstName",
                    "lastName",
                    "email",
                    "mobile"
                ],
                "view": [
                    "firstName",
                    "lastName",
                    "email",
                    "mobile",
                    "insertedAt"
                ]
            }
        }
    }
}

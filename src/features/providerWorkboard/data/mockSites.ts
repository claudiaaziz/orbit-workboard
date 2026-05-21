import type {
    ServiceType,
    ServiceVisit,
    ServicePriority,
    VisitStatus,
    WorkStatus,
    ServiceSite,
} from '../types';

const TECHNICIANS = [
    'Alex Kim',
    'Jordan Lee',
    'Sam Rivera',
    'Taylor Brooks',
    'Morgan Patel',
];

const CUSTOMERS = [
    'Northwind Logistics',
    'Brightline Retail',
    'Summit Healthcare',
    'Harbor Foods Co-op',
    'Metro Transit Authority',
    'Cascade Manufacturing',
    'Blue Oak Properties',
    'Pioneer Cold Storage',
    'Silverline Telecom',
    'Greenfield Schools',
];

const CITIES: { city: string; region: string; postalCode: string }[] = [
    { city: 'Portland', region: 'OR', postalCode: '97201' },
    { city: 'Seattle', region: 'WA', postalCode: '98101' },
    { city: 'Boise', region: 'ID', postalCode: '83702' },
    { city: 'Spokane', region: 'WA', postalCode: '99201' },
    { city: 'Eugene', region: 'OR', postalCode: '97401' },
    { city: 'Tacoma', region: 'WA', postalCode: '98402' },
    { city: 'Bend', region: 'OR', postalCode: '97701' },
    { city: 'Missoula', region: 'MT', postalCode: '59801' },
];

const SERVICE_TYPES: ServiceType[] = [
    'inspection',
    'repair',
    'swap',
    'pickup',
    'delivery',
];

function addHours(base: Date, hours: number): Date {
    const hoursInMilliseconds = hours * 60 * 60 * 1000;
    return new Date(base.getTime() + hoursInMilliseconds);
}

function createVisit(
    index: number,
    siteId: string,
    status: VisitStatus,
    start: Date,
    options: Partial<ServiceVisit> = {},
): ServiceVisit {
    const end = addHours(start, 2);
    const serviceType = SERVICE_TYPES[index % SERVICE_TYPES.length];

    return {
        id: `visit-${siteId}-${index}`,
        siteId,
        status,
        serviceType,
        scheduledStart: start.toISOString(),
        scheduledEnd: end.toISOString(),
        assignedTech: TECHNICIANS[index % TECHNICIANS.length],
        equipmentLabel: options.equipmentLabel ?? `Unit ${index + 1} · ${serviceType}`,
        expectedAssetCode: options.expectedAssetCode ?? `AST-${siteId}-${index}`,
        evidenceRequired: options.evidenceRequired ?? index % 3 === 0,
        motionCheckRequired: options.motionCheckRequired ?? index % 4 === 0,
        locationRequired: options.locationRequired ?? index % 5 === 0,
        issueSummary: options.issueSummary,
        blockedReason: options.blockedReason,
        lastUpdatedAt: addHours(start, -1).toISOString(),
        ...options,
    };
}

function createGeneratedSite(
    siteNumber: number,
    now: Date,
    workStatus: WorkStatus,
    priority: ServicePriority,
    visitStatuses: VisitStatus[],
): ServiceSite {
    const siteId = `site-${String(siteNumber).padStart(3, '0')}`;
    const customer = CUSTOMERS[siteNumber % CUSTOMERS.length];
    const location = CITIES[siteNumber % CITIES.length];

    const visits = visitStatuses.map((status, visitIndex) => {
        const dayOffset = (siteNumber + visitIndex) % 10;
        const hourOffset = (visitIndex * 3) % 12;
        const start = addHours(now, dayOffset * 24 + hourOffset - 12);

        return createVisit(visitIndex + 1, siteId, status, start, {
            evidenceRequired: visitIndex % 2 === 0,
            motionCheckRequired: visitIndex === 0,
        });
    });

    return {
        id: siteId,
        customerName: customer,
        siteName: `${customer.split(' ')[0]} ${location.city} ${siteNumber}`,
        address: {
            line1: `${100 + siteNumber} Industrial Way`,
            city: location.city,
            region: location.region,
            postalCode: location.postalCode,
        },
        workStatus,
        priority,
        visits,
        contactName: `Site Lead ${siteNumber}`,
        contactPhone: `(555) 010-${String(siteNumber).padStart(4, '0')}`,
    };
}

export function buildMockSites(now: Date): ServiceSite[] {
    const yesterday = addHours(now, -30);
    const todayMorning = addHours(now, 2);
    const todayAfternoon = addHours(now, 6);
    const tomorrow = addHours(now, 26);
    const nextWeek = addHours(now, 24 * 5);

    const handcrafted: ServiceSite[] = [
        {
            id: 'site-edge-001',
            customerName: 'Northwind Logistics',
            siteName: 'Northwind PDX Dock 4',
            address: {
                line1: '2200 NW Front Ave',
                city: 'Portland',
                region: 'OR',
                postalCode: '97209',
            },
            workStatus: 'needs_attention',
            priority: 'urgent',
            contactName: 'Riley Chen',
            contactPhone: '(555) 201-4401',
            visits: [
                createVisit(1, 'site-edge-001', 'blocked', yesterday, {
                    equipmentLabel: 'Dock Leveler B2',
                    expectedAssetCode: 'NW-DL-8821',
                    evidenceRequired: true,
                    motionCheckRequired: true,
                    blockedReason: 'Customer gate code expired',
                    issueSummary: 'Cannot access equipment bay',
                }),
                createVisit(2, 'site-edge-001', 'scheduled', todayMorning, {
                    equipmentLabel: 'Conveyor Motor C14',
                    expectedAssetCode: 'NW-CV-4410',
                    evidenceRequired: true,
                }),
                createVisit(3, 'site-edge-001', 'confirmed', todayAfternoon, {
                    equipmentLabel: 'Pallet Scanner PS-02',
                    expectedAssetCode: 'NW-PS-0202',
                    evidenceRequired: false,
                }),
            ],
        },
        {
            id: 'site-edge-002',
            customerName: 'Summit Healthcare',
            siteName: 'Summit Imaging East',
            address: {
                line1: '800 NE Medical Dr',
                city: 'Seattle',
                region: 'WA',
                postalCode: '98122',
            },
            workStatus: 'in_progress',
            priority: 'high',
            contactName: 'Dr. Ana Ortiz',
            contactPhone: '(555) 301-1188',
            visits: [
                createVisit(1, 'site-edge-002', 'on_site', todayMorning, {
                    equipmentLabel: 'MRI Chiller Unit',
                    expectedAssetCode: 'SH-MRI-901',
                    evidenceRequired: true,
                    motionCheckRequired: true,
                    locationRequired: true,
                }),
                createVisit(2, 'site-edge-002', 'en_route', todayAfternoon, {
                    equipmentLabel: 'Backup Generator Panel',
                    expectedAssetCode: 'SH-GEN-112',
                    evidenceRequired: false,
                }),
            ],
        },
        {
            id: 'site-edge-003',
            customerName: 'Harbor Foods Co-op',
            siteName: 'Harbor Cold Chain Hub',
            address: {
                line1: '44 Pier Road',
                city: 'Tacoma',
                region: 'WA',
                postalCode: '98421',
            },
            workStatus: 'completed',
            priority: 'normal',
            contactName: 'Chris Nolan',
            contactPhone: '(555) 401-9920',
            visits: [
                createVisit(1, 'site-edge-003', 'completed', yesterday, {
                    equipmentLabel: 'Walk-in Freezer Compressor',
                    expectedAssetCode: 'HF-FZ-330',
                    evidenceRequired: true,
                }),
                createVisit(2, 'site-edge-003', 'cancelled', tomorrow, {
                    equipmentLabel: 'Loading Bay Sensor Array',
                    expectedAssetCode: 'HF-LB-019',
                    issueSummary: 'Rescheduled by customer',
                }),
            ],
        },
    ];

    const generated: ServiceSite[] = [
        createGeneratedSite(4, now, 'scheduled', 'normal', [
            'scheduled',
            'confirmed',
            'scheduled',
        ]),
        createGeneratedSite(5, now, 'needs_attention', 'high', [
            'blocked',
            'scheduled',
        ]),
        createGeneratedSite(6, now, 'in_progress', 'urgent', [
            'en_route',
            'on_site',
            'scheduled',
        ]),
        createGeneratedSite(7, now, 'blocked', 'high', ['blocked', 'blocked']),
        createGeneratedSite(8, now, 'scheduled', 'normal', [
            'scheduled',
            'scheduled',
            'confirmed',
        ]),
        createGeneratedSite(9, now, 'in_progress', 'normal', [
            'on_site',
            'scheduled',
        ]),
        createGeneratedSite(10, now, 'needs_attention', 'urgent', [
            'confirmed',
            'en_route',
            'blocked',
        ]),
        createGeneratedSite(11, now, 'completed', 'normal', [
            'completed',
            'completed',
        ]),
        createGeneratedSite(12, now, 'scheduled', 'high', [
            'scheduled',
            'confirmed',
            'en_route',
        ]),
        createGeneratedSite(13, now, 'in_progress', 'high', [
            'on_site',
            'on_site',
            'scheduled',
        ]),
        createGeneratedSite(14, now, 'needs_attention', 'normal', [
            'blocked',
            'scheduled',
            'confirmed',
        ]),
        createGeneratedSite(15, now, 'scheduled', 'urgent', [
            'scheduled',
            'scheduled',
        ]),
        createGeneratedSite(16, now, 'blocked', 'urgent', [
            'blocked',
            'scheduled',
            'scheduled',
        ]),
        createGeneratedSite(17, now, 'in_progress', 'normal', [
            'en_route',
            'scheduled',
            'scheduled',
        ]),
        createGeneratedSite(18, now, 'scheduled', 'normal', [
            'confirmed',
            'scheduled',
            'scheduled',
        ]),
        createGeneratedSite(19, now, 'needs_attention', 'high', [
            'on_site',
            'blocked',
            'scheduled',
        ]),
        createGeneratedSite(20, now, 'completed', 'normal', [
            'completed',
            'cancelled',
        ]),
        createGeneratedSite(21, now, 'scheduled', 'high', [
            'scheduled',
            'confirmed',
            'en_route',
            'scheduled',
        ]),
        createGeneratedSite(22, now, 'in_progress', 'urgent', [
            'on_site',
            'scheduled',
            'confirmed',
        ]),
    ];

    // Push a few visits into explicit date buckets for future filter work.
    const withDateSpread = generated.map((site, index) => {
        if (index % 4 !== 0) {
            return site;
        }

        const extraVisits: ServiceVisit[] = [
            createVisit(99, site.id, 'scheduled', nextWeek, {
                equipmentLabel: 'Rooftop HVAC Pack',
                expectedAssetCode: `AST-${site.id}-ROOF`,
            }),
            createVisit(100, site.id, 'scheduled', tomorrow, {
                equipmentLabel: 'Emergency Lighting Panel',
                expectedAssetCode: `AST-${site.id}-EL`,
                evidenceRequired: true,
            }),
        ];

        return {
            ...site,
            visits: [...site.visits, ...extraVisits],
        };
    });

    return [...handcrafted, ...withDateSpread];
}

export const MOCK_SITES: ServiceSite[] = buildMockSites(new Date());

export function getTotalVisitCount(sites: ServiceSite[]): number {
    return sites.reduce((total, site) => total + site.visits.length, 0);
}

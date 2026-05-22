import { MOCK_SITES } from '../data/mockSites';
import type { ServiceSite, ServiceVisit } from '../types';
import { EMPTY_WORKBOARD_CONTEXT } from './workboardContext';
import {
    TEST_CONTEXT_CAPTURED_ON_SITE,
    TEST_CONTEXT_SCAN_MISMATCH,
} from './testWorkboardContext';
import { buildVisitDetailModel } from './visitDetail';

function getSite(siteId: string): ServiceSite {
    const site = MOCK_SITES.find((entry) => entry.id === siteId);
    expect(site).toBeDefined();
    return site as ServiceSite;
}

function getVisit(site: ServiceSite, visitId: string): ServiceVisit {
    const visit = site.visits.find((entry) => entry.id === visitId);
    expect(visit).toBeDefined();
    return visit as ServiceVisit;
}

describe('visitDetail', () => {
    it('builds visit detail fields from a visit and field context', () => {
        const site = getSite('site-edge-002');
        const visit = getVisit(site, 'visit-site-edge-002-1');
        const model = buildVisitDetailModel(visit, TEST_CONTEXT_CAPTURED_ON_SITE);

        expect(model.visitId).toBe('visit-site-edge-002-1');
        expect(model.equipmentLabel).toBe('MRI Chiller Unit');
        expect(model.statusLabel).toBe('on site');
        expect(model.assignedTechLabel).toBeTruthy();
        expect(model.scheduledWindowLabel).toContain('·');
        expect(model.evidenceChecklist[0].status).toBe('complete');
        expect(model.assetScanLabel).toContain('Asset verified');
        expect(model.motionCheckLabel).toContain('Not required');
        expect(model.uploadStatusLabel).toContain('uploaded');
        expect(model.motionEvidenceMetadataLabel).toContain('Motion at capture: stable');
        expect(model.motionEvidenceMetadataLabel).toContain('0.060g');
        expect(model.availableActions.some((action) => action.id === 'complete_visit')).toBe(
            true,
        );
    });

    it('shows not required when photo evidence is not required', () => {
        const site = getSite('site-edge-002');
        const visit = getVisit(site, 'visit-site-edge-002-2');
        const model = buildVisitDetailModel(visit, EMPTY_WORKBOARD_CONTEXT);

        expect(model.evidenceChecklist[0].status).toBe('not_required');
        expect(model.evidenceChecklist[0].detail).toContain('Not required');
    });

    it('shows not scanned yet when there is no scan result in context', () => {
        const site = getSite('site-edge-001');
        const visit = getVisit(site, 'visit-site-edge-001-2');
        const model = buildVisitDetailModel(visit, EMPTY_WORKBOARD_CONTEXT);

        expect(model.assetScanLabel).toContain('Not scanned yet');
        expect(model.assetScanLabel).toContain(visit.expectedAssetCode);
    });

    it('shows scan mismatch and pending evidence on edge visits', () => {
        const site = getSite('site-edge-001');
        const blockedVisit = getVisit(site, 'visit-site-edge-001-1');
        const blockedModel = buildVisitDetailModel(blockedVisit, TEST_CONTEXT_SCAN_MISMATCH);

        expect(blockedModel.assetScanLabel).toContain('mismatch');
        expect(blockedModel.uploadStatusLabel).toContain('failed');

        const needsProofVisit = getVisit(site, 'visit-site-edge-001-2');
        const proofModel = buildVisitDetailModel(needsProofVisit, EMPTY_WORKBOARD_CONTEXT);

        expect(proofModel.evidenceChecklist[0].status).toBe('pending');
        expect(proofModel.evidenceChecklist[0].detail).toContain('still needed');
    });

    it('returns no actions for completed visits', () => {
        const site = getSite('site-edge-003');
        const visit = site.visits.find((entry) => entry.status === 'completed');
        expect(visit).toBeDefined();

        const model = buildVisitDetailModel(visit as ServiceVisit, EMPTY_WORKBOARD_CONTEXT);

        expect(model.availableActions).toEqual([]);
    });
});

/**
 * Sheet navigation: which site/visit is open and what to show in each sheet.
 *
 * Owns: selectedSiteId, selectedVisitId, open/close site & visit.
 * Derives: selectedSiteDetail, selectedVisitDetail (from full sites store + context).
 * Uses all sites, not filteredSites, so an action that changes work status does not
 * tear down open sheets while list filters still hide the site from the list.
 * Calls resetVisitUi when opening/closing so capture overlays do not leak across visits.
 */
import { useMemo, useState } from 'react';

import { trackEvent } from '../analytics';
import { buildSiteDetailModel } from '../domain/siteDetail';
import type { SiteDetailModel } from '../domain/siteDetail';
import { buildVisitDetailModel } from '../domain/visitDetail';
import type { VisitDetailModel } from '../domain/visitDetail';
import type { ServiceSite, WorkboardContext } from '../types';

type UseWorkboardSheetsParams = {
    sites: ServiceSite[];
    workboardContext: WorkboardContext;
    resetVisitUi: () => void;
};

export function useWorkboardSheets({
    sites,
    workboardContext,
    resetVisitUi,
}: UseWorkboardSheetsParams) {
    const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
    const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);

    function openSite(siteId: string) {
        setSelectedSiteId(siteId);
        setSelectedVisitId(null);
        resetVisitUi();
        trackEvent('site_opened', { siteId });
    }

    function closeSite() {
        setSelectedSiteId(null);
        setSelectedVisitId(null);
        resetVisitUi();
    }

    function openVisit(visitId: string) {
        setSelectedVisitId(visitId);
        resetVisitUi();
        trackEvent('visit_opened', { visitId, siteId: selectedSiteId ?? undefined });
    }

    function closeVisit() {
        setSelectedVisitId(null);
        resetVisitUi();
    }

    const selectedSiteDetail = useMemo((): SiteDetailModel | null => {
        if (!selectedSiteId) {
            return null;
        }

        const site = sites.find((entry) => entry.id === selectedSiteId);
        if (!site) {
            return null;
        }

        return buildSiteDetailModel(site, workboardContext);
    }, [sites, selectedSiteId, workboardContext]);

    const selectedVisitDetail = useMemo((): VisitDetailModel | null => {
        if (!selectedSiteId || !selectedVisitId) {
            return null;
        }

        const site = sites.find((entry) => entry.id === selectedSiteId);
        const visit = site?.visits.find((entry) => entry.id === selectedVisitId);
        if (!visit) {
            return null;
        }

        return buildVisitDetailModel(visit, workboardContext);
    }, [sites, selectedSiteId, selectedVisitId, workboardContext]);

    return {
        selectedSiteId,
        selectedVisitId,
        selectedSiteDetail,
        selectedVisitDetail,
        openSite,
        closeSite,
        openVisit,
        closeVisit,
    };
}

export type UseWorkboardSheetsResult = ReturnType<typeof useWorkboardSheets>;

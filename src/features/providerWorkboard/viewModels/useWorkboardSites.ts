import { useRef, useState } from 'react';

import { EMPTY_WORKBOARD_CONTEXT } from '../domain/workboardContext';
import type { WorkboardContext } from '../types';
import { useVisitFieldWorkflow } from './useVisitFieldWorkflow';
import { useWorkboardList } from './useWorkboardList';
import { useWorkboardSheets } from './useWorkboardSheets';

/**
 * Composer hook — wires list, sheets, and visit workflow for the workboard screen.
 *
 * Holds: workboardContext (visit field state across the app).
 * Delegates: useWorkboardList, useWorkboardSheets, useVisitFieldWorkflow.
 * Entry point: ProviderWorkboardScreen should only need this hook.
 */
export function useWorkboardSites() {
    const [workboardContext, setWorkboardContext] = useState<WorkboardContext>(() =>
        structuredClone(EMPTY_WORKBOARD_CONTEXT),
    );

    const list = useWorkboardList(workboardContext);
    const visitUiRef = useRef({ resetVisitUi: () => {} });

    const sheets = useWorkboardSheets({
        sites: list.sites,
        workboardContext,
        resetVisitUi: () => visitUiRef.current.resetVisitUi(),
    });

    const visit = useVisitFieldWorkflow({
        sites: list.sites,
        setSites: list.setSites,
        workboardContext,
        setWorkboardContext,
        selectedSiteId: sheets.selectedSiteId,
        selectedVisitId: sheets.selectedVisitId,
    });

    visitUiRef.current = visit;

    return {
        // List + filters
        sites: list.sites,
        siteListItems: list.siteListItems,
        summary: list.summary,
        filters: list.filters,
        filtersActive: list.filtersActive,
        loadState: list.loadState,
        errorMessage: list.errorMessage,
        fetchedAt: list.fetchedAt,
        isRefreshing: list.isRefreshing,
        isWorkboardDataStale: list.isWorkboardDataStale,
        workboardStaleAgeLabel: list.workboardStaleAgeLabel,
        setSearchQuery: list.setSearchQuery,
        submitSearch: list.submitSearch,
        setWorkStatusFilter: list.setWorkStatusFilter,
        setDateScopeFilter: list.setDateScopeFilter,
        setEvidenceFilter: list.setEvidenceFilter,
        resetPanelFilters: list.resetPanelFilters,
        reload: list.reload,
        // Sheet navigation
        selectedSiteId: sheets.selectedSiteId,
        selectedVisitId: sheets.selectedVisitId,
        selectedSiteDetail: sheets.selectedSiteDetail,
        selectedVisitDetail: sheets.selectedVisitDetail,
        openSite: sheets.openSite,
        closeSite: sheets.closeSite,
        openVisit: sheets.openVisit,
        closeVisit: sheets.closeVisit,
        // Visit workflow (grouped for sheets)
        visitWorkflow: visit.visitWorkflow,
    };
}

export type UseWorkboardSitesResult = ReturnType<typeof useWorkboardSites>;

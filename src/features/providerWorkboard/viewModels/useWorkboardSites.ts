import { useEffect, useMemo, useRef, useState } from 'react';

import { trackEvent } from '../analytics';
import { MOCK_WORKBOARD_CONTEXT } from '../data/mockWorkboardContext';
import { fetchSites, performVisitAction, WorkboardApiError } from '../data/mockApi';
import { isVisitActionEnabled } from '../domain/visitActionMutations';
import type { VisitActionId } from '../domain/visitActions';
import { buildSiteDetailModel } from '../domain/siteDetail';
import type { SiteDetailModel } from '../domain/siteDetail';
import { buildVisitDetailModel } from '../domain/visitDetail';
import type { VisitDetailModel } from '../domain/visitDetail';
import { buildSiteListItem } from '../domain/siteSummary';
import { filterSites, hasActiveFilters } from '../domain/workboardFilters';
import { buildWorkboardSummary } from '../domain/workboardSummary';
import type { WorkboardSummaryModel } from '../domain/workboardSummary';
import type { SiteListItemModel } from '../domain/siteSummary';
import type {
    DateScopeFilter,
    EvidenceFilter,
    ServiceSite,
    WorkboardContext,
    WorkboardFilters,
    WorkStatus,
} from '../types';
import { DEFAULT_WORKBOARD_FILTERS } from '../types';

type WorkboardLoadState = 'idle' | 'loading' | 'success' | 'error';

type UseWorkboardSitesResult = {
    sites: ServiceSite[];
    siteListItems: SiteListItemModel[];
    summary: WorkboardSummaryModel;
    filters: WorkboardFilters;
    filtersActive: boolean;
    loadState: WorkboardLoadState;
    errorMessage: string | null;
    fetchedAt: string | null;
    isRefreshing: boolean;
    setSearchQuery: (searchQuery: string) => void;
    submitSearch: (searchQuery: string) => void;
    setWorkStatusFilter: (workStatus: WorkStatus | 'all') => void;
    setDateScopeFilter: (dateScope: DateScopeFilter) => void;
    setEvidenceFilter: (evidenceFilter: EvidenceFilter) => void;
    resetPanelFilters: () => void;
    selectedSiteId: string | null;
    selectedVisitId: string | null;
    selectedSiteDetail: SiteDetailModel | null;
    selectedVisitDetail: VisitDetailModel | null;
    pendingVisitActionId: VisitActionId | null;
    visitActionError: string | null;
    openSite: (siteId: string) => void;
    closeSite: () => void;
    openVisit: (visitId: string) => void;
    closeVisit: () => void;
    runVisitAction: (actionId: VisitActionId) => void;
    clearVisitActionError: () => void;
    reload: (options?: { isRefresh?: boolean }) => void;
};

export function useWorkboardSites(): UseWorkboardSitesResult {
    const [sites, setSites] = useState<ServiceSite[]>([]);
    const [workboardContext] = useState<WorkboardContext>(() =>
        structuredClone(MOCK_WORKBOARD_CONTEXT),
    );
    const [filters, setFilters] = useState<WorkboardFilters>(DEFAULT_WORKBOARD_FILTERS);
    const [loadState, setLoadState] = useState<WorkboardLoadState>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [fetchedAt, setFetchedAt] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
    const [selectedVisitId, setSelectedVisitId] = useState<string | null>(null);
    const [pendingVisitActionId, setPendingVisitActionId] = useState<VisitActionId | null>(
        null,
    );
    const [visitActionError, setVisitActionError] = useState<string | null>(null);
    const hasTrackedWorkboardView = useRef(false);

    async function reload(options?: { isRefresh?: boolean }) {
        const isRefresh = options?.isRefresh ?? false;

        if (isRefresh) {
            setIsRefreshing(true);
            trackEvent('refresh_triggered', { source: 'workboard_list' });
        } else {
            setLoadState('loading');
        }

        setErrorMessage(null);

        try {
            const response = await fetchSites();
            setSites(response.sites);
            setFetchedAt(response.fetchedAt);
            setLoadState('success');

            if (!hasTrackedWorkboardView.current) {
                trackEvent('workboard_viewed', { siteCount: response.sites.length });
                hasTrackedWorkboardView.current = true;
            }
        } catch (error) {
            const message =
                error instanceof WorkboardApiError
                    ? error.message
                    : 'Something went wrong while loading sites.';

            setErrorMessage(message);
            setLoadState('error');
        } finally {
            setIsRefreshing(false);
        }
    }

    useEffect(() => {
        void reload();
    }, []);

    const filteredSites = useMemo(
        () => filterSites(sites, filters, workboardContext),
        [sites, filters, workboardContext],
    );

    const siteListItems = useMemo(
        () =>
            filteredSites.map((site) =>
                buildSiteListItem(site, workboardContext),
            ),
        [filteredSites, workboardContext],
    );

    const summary = useMemo(
        () => buildWorkboardSummary(filteredSites, workboardContext),
        [filteredSites, workboardContext],
    );

    function setSearchQuery(searchQuery: string) {
        setFilters((current) => ({ ...current, searchQuery }));
    }

    function submitSearch(searchQuery: string) {
        trackEvent('search_submitted', { queryLength: searchQuery.trim().length });
    }

    function setWorkStatusFilter(workStatus: WorkStatus | 'all') {
        setFilters((current) => ({ ...current, workStatus }));
        trackEvent('filter_changed', { filter: 'work_status', value: workStatus });
    }

    function setDateScopeFilter(dateScope: DateScopeFilter) {
        setFilters((current) => ({ ...current, dateScope }));
        trackEvent('filter_changed', { filter: 'date_scope', value: dateScope });
    }

    function setEvidenceFilter(evidenceFilter: EvidenceFilter) {
        setFilters((current) => ({ ...current, evidenceFilter }));
        trackEvent('filter_changed', {
            filter: 'evidence',
            value: evidenceFilter ?? 'none',
        });
    }

    function resetPanelFilters() {
        setFilters((current) => ({
            ...current,
            workStatus: DEFAULT_WORKBOARD_FILTERS.workStatus,
            dateScope: DEFAULT_WORKBOARD_FILTERS.dateScope,
            evidenceFilter: DEFAULT_WORKBOARD_FILTERS.evidenceFilter,
        }));
        trackEvent('filter_changed', { filter: 'reset_panel', value: 'all' });
    }

    function openSite(siteId: string) {
        setSelectedSiteId(siteId);
        setSelectedVisitId(null);
        setVisitActionError(null);
        trackEvent('site_opened', { siteId });
    }

    function closeSite() {
        setSelectedSiteId(null);
        setSelectedVisitId(null);
        setVisitActionError(null);
    }

    function openVisit(visitId: string) {
        setSelectedVisitId(visitId);
        setVisitActionError(null);
        trackEvent('visit_opened', { visitId, siteId: selectedSiteId ?? undefined });
    }

    function closeVisit() {
        setSelectedVisitId(null);
        setVisitActionError(null);
    }

    function clearVisitActionError() {
        setVisitActionError(null);
    }

    async function runVisitAction(actionId: VisitActionId) {
        if (!selectedSiteId || !selectedVisitId || pendingVisitActionId !== null) {
            return;
        }

        const site = sites.find((entry) => entry.id === selectedSiteId);
        const visit = site?.visits.find((entry) => entry.id === selectedVisitId);
        if (!visit) {
            return;
        }

        if (!isVisitActionEnabled(visit, actionId, workboardContext)) {
            return;
        }

        setVisitActionError(null);
        setPendingVisitActionId(actionId);
        trackEvent('visit_action_started', {
            actionId,
            visitId: selectedVisitId,
            siteId: selectedSiteId,
        });

        try {
            const result = await performVisitAction({
                siteId: selectedSiteId,
                visitId: selectedVisitId,
                actionId,
                context: workboardContext,
            });
            setSites(result.sites);
            trackEvent('visit_action_completed', {
                actionId,
                visitId: selectedVisitId,
                siteId: selectedSiteId,
            });
        } catch (error) {
            const message =
                error instanceof WorkboardApiError
                    ? error.message
                    : 'Unable to update the visit right now. Try again in a moment.';

            setVisitActionError(message);
            trackEvent('visit_action_failed', {
                actionId,
                visitId: selectedVisitId,
                siteId: selectedSiteId,
                message,
            });
        } finally {
            setPendingVisitActionId(null);
        }
    }

    const selectedSiteDetail = useMemo(() => {
        if (!selectedSiteId) {
            return null;
        }

        const site = filteredSites.find((entry) => entry.id === selectedSiteId);
        if (!site) {
            return null;
        }

        return buildSiteDetailModel(site, workboardContext);
    }, [filteredSites, selectedSiteId, workboardContext]);

    const selectedVisitDetail = useMemo(() => {
        if (!selectedSiteId || !selectedVisitId) {
            return null;
        }

        const site = filteredSites.find((entry) => entry.id === selectedSiteId);
        const visit = site?.visits.find((entry) => entry.id === selectedVisitId);
        if (!visit) {
            return null;
        }

        return buildVisitDetailModel(visit, workboardContext);
    }, [filteredSites, selectedSiteId, selectedVisitId, workboardContext]);

    return {
        sites,
        siteListItems,
        summary,
        filters,
        filtersActive: hasActiveFilters(filters),
        loadState,
        errorMessage,
        fetchedAt,
        isRefreshing,
        setSearchQuery,
        submitSearch,
        setWorkStatusFilter,
        setDateScopeFilter,
        setEvidenceFilter,
        resetPanelFilters,
        selectedSiteId,
        selectedVisitId,
        selectedSiteDetail,
        selectedVisitDetail,
        pendingVisitActionId,
        visitActionError,
        openSite,
        closeSite,
        openVisit,
        closeVisit,
        runVisitAction,
        clearVisitActionError,
        reload,
    };
}

import { useEffect, useMemo, useRef, useState } from 'react';

import { trackEvent } from '../analytics';
import { MOCK_WORKBOARD_CONTEXT } from '../data/mockWorkboardContext';
import { fetchSites, WorkboardApiError } from '../data/mockApi';
import { buildSiteDetailModel } from '../domain/siteDetail';
import type { SiteDetailModel } from '../domain/siteDetail';
import { buildSiteListItem } from '../domain/siteSummary';
import { filterSites, hasActiveFilters } from '../domain/workboardFilters';
import { buildWorkboardSummary } from '../domain/workboardSummary';
import type { WorkboardSummaryModel } from '../domain/workboardSummary';
import type { SiteListItemModel } from '../domain/siteSummary';
import type {
    DateScopeFilter,
    EvidenceFilter,
    ServiceSite,
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
    selectedSiteDetail: SiteDetailModel | null;
    openSite: (siteId: string) => void;
    closeSite: () => void;
    reload: (options?: { isRefresh?: boolean }) => void;
};

export function useWorkboardSites(): UseWorkboardSitesResult {
    const [sites, setSites] = useState<ServiceSite[]>([]);
    const [filters, setFilters] = useState<WorkboardFilters>(DEFAULT_WORKBOARD_FILTERS);
    const [loadState, setLoadState] = useState<WorkboardLoadState>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [fetchedAt, setFetchedAt] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedSiteId, setSelectedSiteId] = useState<string | null>(null);
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
        () => filterSites(sites, filters, MOCK_WORKBOARD_CONTEXT),
        [sites, filters],
    );

    const siteListItems = useMemo(
        () =>
            filteredSites.map((site) =>
                buildSiteListItem(site, MOCK_WORKBOARD_CONTEXT),
            ),
        [filteredSites],
    );

    const summary = useMemo(
        () => buildWorkboardSummary(filteredSites, MOCK_WORKBOARD_CONTEXT),
        [filteredSites],
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
        trackEvent('site_opened', { siteId });
    }

    function closeSite() {
        setSelectedSiteId(null);
    }

    const selectedSiteDetail = useMemo(() => {
        if (!selectedSiteId) {
            return null;
        }

        const site = filteredSites.find((entry) => entry.id === selectedSiteId);
        if (!site) {
            return null;
        }

        return buildSiteDetailModel(site, MOCK_WORKBOARD_CONTEXT);
    }, [filteredSites, selectedSiteId]);

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
        selectedSiteDetail,
        openSite,
        closeSite,
        reload,
    };
}

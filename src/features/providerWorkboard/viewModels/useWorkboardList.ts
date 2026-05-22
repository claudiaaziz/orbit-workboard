/**
 * Workboard list data: fetch sites, filters, and derived list UI models.
 *
 * Owns: sites[], filters, load/error/refresh, reload().
 * Derives: filteredSites, siteListItems, summary (needs workboardContext for evidence/scan filters).
 * Used by: useWorkboardSites → ProviderWorkboardScreen list + header.
 */
import { useEffect, useMemo, useRef, useState } from 'react';

import { trackEvent } from '../analytics';
import { fetchSites, WorkboardApiError } from '../data/mockApi';
import { filterSites, hasActiveFilters } from '../domain/workboardFilters';
import { buildWorkboardSummary } from '../domain/workboardSummary';
import { buildSiteListItem } from '../domain/siteSummary';
import {
    formatWorkboardAgeAgo,
    isWorkboardStale,
} from '../domain/workboardStaleness';
import type {
    DateScopeFilter,
    EvidenceFilter,
    ServiceSite,
    WorkboardContext,
    WorkboardFilters,
    WorkStatus,
} from '../types';
import { DEFAULT_WORKBOARD_FILTERS } from '../types';

export type WorkboardLoadState = 'idle' | 'loading' | 'success' | 'error';

export function useWorkboardList(workboardContext: WorkboardContext) {
    const [sites, setSites] = useState<ServiceSite[]>([]);
    const [filters, setFilters] = useState<WorkboardFilters>(DEFAULT_WORKBOARD_FILTERS);
    const [loadState, setLoadState] = useState<WorkboardLoadState>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [fetchedAt, setFetchedAt] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [stalenessNow, setStalenessNow] = useState(() => new Date());
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

    useEffect(() => {
        if (loadState !== 'success' || !fetchedAt) {
            return;
        }

        const intervalId = setInterval(() => {
            setStalenessNow(new Date());
        }, 60_000);

        return () => clearInterval(intervalId);
    }, [loadState, fetchedAt]);

    // filter functionality
    const filteredSites = useMemo(
        () => filterSites(sites, filters, workboardContext),
        [sites, filters, workboardContext],
    );

    const siteListItems = useMemo(
        () => filteredSites.map((site) => buildSiteListItem(site, workboardContext)),
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

    const isWorkboardDataStale =
        loadState === 'success' && isWorkboardStale(fetchedAt, stalenessNow);
    const workboardStaleAgeLabel = fetchedAt
        ? formatWorkboardAgeAgo(fetchedAt, stalenessNow)
        : null;

    return {
        sites,
        setSites,
        filteredSites,
        siteListItems,
        summary,
        filters,
        filtersActive: hasActiveFilters(filters),
        loadState,
        errorMessage,
        fetchedAt,
        isRefreshing,
        isWorkboardDataStale,
        workboardStaleAgeLabel,
        setSearchQuery,
        submitSearch,
        setWorkStatusFilter,
        setDateScopeFilter,
        setEvidenceFilter,
        resetPanelFilters,
        reload,
    };
}

export type UseWorkboardListResult = ReturnType<typeof useWorkboardList>;

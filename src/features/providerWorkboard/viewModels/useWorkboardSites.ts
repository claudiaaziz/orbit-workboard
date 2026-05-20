import { useCallback, useEffect, useMemo, useState } from 'react';

import { fetchSites, WorkboardApiError } from '../data/mockApi';
import { buildSiteListItem, type SiteListItemModel } from '../domain/siteSummary';
import type { ServiceSite } from '../types';

type WorkboardLoadState = 'idle' | 'loading' | 'success' | 'error';

type UseWorkboardSitesResult = {
    sites: ServiceSite[];
    siteListItems: SiteListItemModel[];
    loadState: WorkboardLoadState;
    errorMessage: string | null;
    fetchedAt: string | null;
    isRefreshing: boolean;
    reload: (options?: { isRefresh?: boolean }) => Promise<void>;
};

// todo might switch to tanstack query 
export function useWorkboardSites(): UseWorkboardSitesResult {
    const [sites, setSites] = useState<ServiceSite[]>([]);
    const [loadState, setLoadState] = useState<WorkboardLoadState>('idle');
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [fetchedAt, setFetchedAt] = useState<string | null>(null);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const reload = useCallback(async (options?: { isRefresh?: boolean }) => {
        const isRefresh = options?.isRefresh ?? false;

        if (isRefresh) {
            setIsRefreshing(true);
        } else {
            setLoadState('loading');
        }

        setErrorMessage(null);

        try {
            const response = await fetchSites();
            setSites(response.sites);
            setFetchedAt(response.fetchedAt);
            setLoadState('success');
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
    }, []);

    useEffect(() => {
        void reload();
    }, [reload]);

    const siteListItems = useMemo(
        () => sites.map((site) => buildSiteListItem(site)),
        [sites],
    );

    return {
        sites,
        siteListItems,
        loadState,
        errorMessage,
        fetchedAt,
        isRefreshing,
        reload,
    };
}

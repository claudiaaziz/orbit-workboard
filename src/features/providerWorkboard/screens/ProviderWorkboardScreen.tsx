import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaView } from 'react-native-safe-area-context';

import { SiteDetailSheet } from '../components/SiteDetailSheet';
import { SiteListRow } from '../components/SiteListRow';
import { WorkboardFilterControls } from '../components/WorkboardFilterControls';
import { WorkboardSummaryHeader } from '../components/WorkboardSummaryHeader';
import { useWorkboardSites } from '../viewModels/useWorkboardSites';

function formatUpdatedAt(isoTimestamp: string): string {
    return new Date(isoTimestamp).toLocaleTimeString(undefined, {
        hour: 'numeric',
        minute: '2-digit',
    });
}

export function ProviderWorkboardScreen() {
    const {
        siteListItems,
        summary,
        filters,
        filtersActive,
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
    } = useWorkboardSites();

    if (loadState === 'loading') {
        return (
            <SafeAreaView style={styles.centered}>
                <StatusBar style="dark" />
                <ActivityIndicator size="large" color="#1D4ED8" />
                <Text style={styles.stateText}>Loading workboard…</Text>
            </SafeAreaView>
        );
    }

    if (loadState === 'error') {
        return (
            <SafeAreaView style={styles.centered}>
                <StatusBar style="dark" />
                <Text style={styles.errorTitle}>Could not load workboard</Text>
                <Text style={styles.stateText}>{errorMessage}</Text>
                <Pressable
                    accessibilityRole="button"
                    accessibilityLabel="Retry loading workboard"
                    onPress={() => void reload()}
                    style={({ pressed }) => [styles.retryButton, pressed && styles.retryPressed]}
                >
                    <Text style={styles.retryLabel}>Retry</Text>
                </Pressable>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.screen}>
            <StatusBar style="dark" />
            <FlatList
                data={siteListItems}
                keyExtractor={(item) => item.siteId}
                renderItem={({ item }) => (
                    <SiteListRow item={item} onPress={openSite} />
                )}
                contentContainerStyle={styles.listContent}
                refreshing={isRefreshing}
                onRefresh={() => void reload({ isRefresh: true })}
                showsVerticalScrollIndicator={false}
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <View style={styles.screenChrome}>
                            <View style={styles.titleBlock}>
                                <Text style={styles.title}>Provider Workboard</Text>
                                <Text style={styles.subtitle}>Orbit Field Services</Text>
                            </View>
                            {fetchedAt ? (
                                <Text style={styles.lastRefreshed}>
                                    Updated {formatUpdatedAt(fetchedAt)}
                                </Text>
                            ) : null}
                        </View>

                        <WorkboardSummaryHeader summary={summary} />

                        <WorkboardFilterControls
                            filters={filters}
                            onSearchChange={setSearchQuery}
                            onSearchSubmit={submitSearch}
                            onWorkStatusChange={setWorkStatusFilter}
                            onDateScopeChange={setDateScopeFilter}
                            onEvidenceFilterChange={setEvidenceFilter}
                            onResetPanelFilters={resetPanelFilters}
                        />
                    </View>
                }
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>
                            {filtersActive ? 'No matching sites' : 'Nothing on your workboard'}
                        </Text>
                        <Text style={styles.stateText}>
                            {filtersActive
                                ? 'Try clearing filters or broadening your search.'
                                : 'Pull down to refresh. If you expected sites here, try again in a moment.'}
                        </Text>
                    </View>
                }
            />

            <SiteDetailSheet
                visible={selectedSiteId !== null}
                model={selectedSiteDetail}
                onClose={closeSite}
            />
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    screen: {
        flex: 1,
        backgroundColor: '#EEF2F7',
    },
    centered: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 24,
        backgroundColor: '#EEF2F7',
    },
    listHeader: {
        paddingTop: 8,
    },
    screenChrome: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        paddingHorizontal: 16,
        marginBottom: 10,
    },
    titleBlock: {
        flex: 1,
        gap: 2,
    },
    title: {
        fontSize: 22,
        fontWeight: '700',
        color: '#111827',
    },
    subtitle: {
        fontSize: 14,
        color: '#6B7280',
    },
    lastRefreshed: {
        flexShrink: 0,
        marginTop: 2,
        fontSize: 12,
        color: '#9CA3AF',
    },
    listContent: {
        paddingBottom: 24,
    },
    stateText: {
        marginTop: 8,
        fontSize: 15,
        color: '#6B7280',
        textAlign: 'center',
        paddingHorizontal: 24,
    },
    errorTitle: {
        fontSize: 20,
        fontWeight: '600',
        color: '#111827',
        textAlign: 'center',
    },
    retryButton: {
        marginTop: 16,
        minHeight: 44,
        minWidth: 120,
        borderRadius: 10,
        backgroundColor: '#1D4ED8',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    retryPressed: {
        opacity: 0.85,
    },
    retryLabel: {
        color: '#FFFFFF',
        fontSize: 16,
        fontWeight: '600',
    },
    emptyState: {
        padding: 32,
        alignItems: 'center',
    },
    emptyTitle: {
        fontSize: 18,
        fontWeight: '600',
        color: '#111827',
    },
});

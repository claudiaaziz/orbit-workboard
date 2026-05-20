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

import { SiteListRow } from '../components/SiteListRow';
import { useWorkboardSites } from '../viewModels/useWorkboardSites';

export function ProviderWorkboardScreen() {
    const {
        siteListItems,
        loadState,
        errorMessage,
        fetchedAt,
        isRefreshing,
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
            <View style={styles.header}>
                <Text style={styles.title}>Provider Workboard</Text>
                <Text style={styles.subtitle}>Orbit Field Services</Text>
                {fetchedAt ? (
                    <Text style={styles.fetchedAt}>
                        Updated {new Date(fetchedAt).toLocaleTimeString()}
                    </Text>
                ) : null}
            </View>

            <FlatList
                data={siteListItems}
                keyExtractor={(item) => item.siteId}
                renderItem={({ item }) => <SiteListRow item={item} />}
                contentContainerStyle={styles.listContent}
                refreshing={isRefreshing}
                onRefresh={() => void reload({ isRefresh: true })}
                showsVerticalScrollIndicator={false}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyTitle}>Nothing on your workboard</Text>
                        <Text style={styles.stateText}>
                            Pull down to refresh. If you expected sites here, try again in a moment.
                        </Text>
                    </View>
                }
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
    header: {
        paddingHorizontal: 16,
        paddingTop: 8,
        paddingBottom: 12,
    },
    title: {
        fontSize: 28,
        fontWeight: '700',
        color: '#111827',
    },
    subtitle: {
        marginTop: 4,
        fontSize: 15,
        color: '#6B7280',
    },
    fetchedAt: {
        marginTop: 6,
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

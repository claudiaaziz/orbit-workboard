import { Pressable, StyleSheet, Text, View } from 'react-native';

type WorkboardStaleBannerProps = {
    lastRefreshedLabel: string;
    onRefresh: () => void;
    isRefreshing: boolean;
};

export function WorkboardStaleBanner({
    lastRefreshedLabel,
    onRefresh,
    isRefreshing,
}: WorkboardStaleBannerProps) {
    return (
        <View style={styles.banner} accessibilityRole="alert">
            <Text style={styles.title}>Workboard data may be out of date.</Text>
            <Text style={styles.subtitle}>Last refreshed {lastRefreshedLabel}.</Text>
            <Pressable
                accessibilityRole="button"
                accessibilityLabel="Refresh workboard data"
                accessibilityState={{ disabled: isRefreshing }}
                disabled={isRefreshing}
                onPress={onRefresh}
                style={({ pressed }) => [
                    styles.refreshButton,
                    (pressed || isRefreshing) && styles.refreshPressed,
                ]}
            >
                <Text style={styles.refreshLabel}>
                    {isRefreshing ? 'Refreshing…' : 'Refresh now'}
                </Text>
            </Pressable>
        </View>
    );
}

const styles = StyleSheet.create({
    banner: {
        marginHorizontal: 16,
        marginBottom: 10,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#FEF3C7',
        borderWidth: 1,
        borderColor: '#FCD34D',
        gap: 4,
    },
    title: {
        fontSize: 14,
        fontWeight: '600',
        color: '#92400E',
    },
    subtitle: {
        fontSize: 14,
        color: '#B45309',
        lineHeight: 20,
    },
    refreshButton: {
        alignSelf: 'flex-start',
        marginTop: 4,
        minHeight: 44,
        justifyContent: 'center',
        paddingHorizontal: 4,
    },
    refreshPressed: {
        opacity: 0.7,
    },
    refreshLabel: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1D4ED8',
    },
});

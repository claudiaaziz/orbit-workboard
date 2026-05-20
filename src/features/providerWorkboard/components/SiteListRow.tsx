import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { SiteListItemModel } from '../domain/siteSummary';

type SiteListRowProps = {
    item: SiteListItemModel;
    onPress?: (siteId: string) => void; // this wont be optional in next step so remove optional then
};


export function SiteListRow({ item, onPress }: SiteListRowProps) {
    return (
        <Pressable
            accessibilityRole="button"
            accessibilityLabel={`${item.siteName}, ${item.customerName}`}
            onPress={() => onPress?.(item.siteId)}
            style={({ pressed }) => [styles.row, pressed && styles.rowPressed]}
        >
            <View style={styles.headerRow}>
                <Text style={styles.siteName}>{item.siteName}</Text>
                <Text
                    style={[
                        styles.priorityBadge,
                        item.flags.isUrgent && styles.priorityUrgent,
                    ]}
                >
                    {item.priority.toUpperCase()}
                </Text>
            </View>

            <Text style={styles.customerName}>{item.customerName}</Text>
            <Text style={styles.location}>{item.locationLabel}</Text>

            <View style={styles.metaRow}>
                <Text style={styles.workStatus}>{item.workStatus.replaceAll('_', ' ')}</Text>
                {item.nextVisitTimeLabel ? (
                    <Text style={styles.nextVisit}>Next: {item.nextVisitTimeLabel}</Text>
                ) : null}
            </View>

            <Text style={styles.visitSummary}>{item.visitStatusSummary}</Text>

            <View style={styles.flagsRow}>
                {item.flags.isLate ? <Text style={styles.flagLate}>Late</Text> : null}
                {item.flags.isBlocked ? (
                    <Text style={styles.flagBlocked}>Blocked</Text>
                ) : null}
                {item.flags.needsProof ? (
                    <Text style={styles.flagProof}>
                        {item.missingEvidenceCount} missing proof
                    </Text>
                ) : null}
            </View>
        </Pressable>
    );
}

const styles = StyleSheet.create({
    row: {
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        padding: 16,
        marginHorizontal: 16,
        marginVertical: 6,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#D7DCE3',
        minHeight: 44,
    },
    rowPressed: {
        backgroundColor: '#F3F6FA',
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        gap: 12,
    },
    siteName: {
        flex: 1,
        fontSize: 17,
        fontWeight: '600',
        color: '#111827',
    },
    customerName: {
        marginTop: 4,
        fontSize: 15,
        color: '#374151',
    },
    location: {
        marginTop: 2,
        fontSize: 14,
        color: '#6B7280',
    },
    metaRow: {
        marginTop: 10,
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 8,
        flexWrap: 'wrap',
    },
    workStatus: {
        fontSize: 14,
        fontWeight: '500',
        color: '#1D4ED8',
        textTransform: 'capitalize',
    },
    nextVisit: {
        fontSize: 13,
        color: '#4B5563',
    },
    visitSummary: {
        marginTop: 8,
        fontSize: 13,
        color: '#6B7280',
    },
    priorityBadge: {
        fontSize: 11,
        fontWeight: '700',
        color: '#4B5563',
        backgroundColor: '#E5E7EB',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 999,
        overflow: 'hidden',
    },
    priorityUrgent: {
        color: '#991B1B',
        backgroundColor: '#FEE2E2',
    },
    flagsRow: {
        marginTop: 10,
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    flagLate: {
        fontSize: 12,
        fontWeight: '600',
        color: '#9A3412',
        backgroundColor: '#FFEDD5',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    flagBlocked: {
        fontSize: 12,
        fontWeight: '600',
        color: '#7F1D1D',
        backgroundColor: '#FEE2E2',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
    flagProof: {
        fontSize: 12,
        fontWeight: '600',
        color: '#1E3A8A',
        backgroundColor: '#DBEAFE',
        paddingHorizontal: 8,
        paddingVertical: 4,
        borderRadius: 6,
    },
});

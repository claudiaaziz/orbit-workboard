import { StyleSheet, Text, View } from 'react-native';

import type { WorkboardSummaryModel } from '../domain/workboardSummary';

type WorkboardSummaryHeaderProps = {
    summary: WorkboardSummaryModel;
};

type SummaryTone = 'default' | 'blocked' | 'urgent';

type SummaryItemProps = {
    label: string;
    value: number;
    tone?: SummaryTone;
};

function SummaryItem({ label, value, tone = 'default' }: SummaryItemProps) {
    const isEmphasis = tone === 'blocked' || tone === 'urgent';
    const hasValue = value > 0;

    return (
        <View
            style={[
                styles.item,
                isEmphasis && hasValue && tone === 'blocked' && styles.itemBlocked,
                isEmphasis && hasValue && tone === 'urgent' && styles.itemUrgent,
            ]}
        >
            <Text
                style={[
                    styles.value,
                    isEmphasis && hasValue && tone === 'blocked' && styles.valueBlocked,
                    isEmphasis && hasValue && tone === 'urgent' && styles.valueUrgent,
                ]}
            >
                {value}
            </Text>
            <Text
                style={[
                    styles.label,
                    isEmphasis && hasValue && tone === 'blocked' && styles.labelBlocked,
                    isEmphasis && hasValue && tone === 'urgent' && styles.labelUrgent,
                ]}
            >
                {label}
            </Text>
        </View>
    );
}

export function WorkboardSummaryHeader({ summary }: WorkboardSummaryHeaderProps) {
    return (
        <View style={styles.container}>
            <SummaryItem label="Sites" value={summary.totalMatchingSites} />
            <SummaryItem label="Due today" value={summary.visitsDueToday} />
            <SummaryItem label="Blocked" value={summary.blockedVisits} tone="blocked" />
            <SummaryItem label="Urgent" value={summary.urgentSites} tone="urgent" />
            <SummaryItem label="Needs proof" value={summary.visitsMissingEvidence} />
            <SummaryItem label="Upload queue" value={summary.failedOrQueuedUploads} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
        paddingHorizontal: 16,
        paddingBottom: 12,
    },
    item: {
        minWidth: '30%',
        flexGrow: 1,
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingVertical: 10,
        paddingHorizontal: 12,
        borderWidth: StyleSheet.hairlineWidth,
        borderColor: '#D7DCE3',
    },
    itemBlocked: {
        borderColor: '#FECACA',
        backgroundColor: '#FEF2F2',
    },
    itemUrgent: {
        borderColor: '#FDBA74',
        backgroundColor: '#FFF7ED',
    },
    value: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    valueBlocked: {
        color: '#991B1B',
    },
    valueUrgent: {
        color: '#9A3412',
    },
    label: {
        marginTop: 2,
        fontSize: 12,
        color: '#6B7280',
    },
    labelBlocked: {
        color: '#B91C1C',
    },
    labelUrgent: {
        color: '#C2410C',
    },
});

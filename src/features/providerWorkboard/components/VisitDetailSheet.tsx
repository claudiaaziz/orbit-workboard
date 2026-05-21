import type { ReactNode } from 'react';
import {
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import type { VisitChecklistItem, VisitDetailModel } from '../domain/visitDetail';

function Section({ title, children }: { title: string; children: ReactNode }) {
    return (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{title}</Text>
            {children}
        </View>
    );
}

function ChecklistRow({ item }: { item: VisitChecklistItem }) {
    const statusStyle =
        item.status === 'complete'
            ? styles.checklistComplete
            : item.status === 'pending'
                ? styles.checklistPending
                : styles.checklistNeutral;

    return (
        <View style={styles.checklistRow}>
            <Text style={[styles.checklistLabel, statusStyle]}>{item.label}</Text>
            <Text style={styles.checklistDetail}>{item.detail}</Text>
        </View>
    );
}

type VisitDetailSheetProps = {
    visible: boolean;
    model: VisitDetailModel | null;
    onClose: () => void;
};

export function VisitDetailSheet({ visible, model, onClose }: VisitDetailSheetProps) {
    return (
        <Modal
            visible={visible && model !== null}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={onClose}
        >
            {model ? (
                <SafeAreaView style={styles.sheet} edges={['top', 'bottom']}>
                    <View style={styles.header}>
                        <View style={styles.headerText}>
                            <Text style={styles.equipmentLabel}>{model.equipmentLabel}</Text>
                            <Text style={styles.statusMeta}>
                                {model.serviceTypeLabel} · {model.statusLabel}
                            </Text>
                        </View>
                        <Pressable
                            accessibilityRole="button"
                            accessibilityLabel="Close visit details"
                            onPress={onClose}
                            hitSlop={8}
                            style={({ pressed }) => [styles.closeButton, pressed && styles.closePressed]}
                        >
                            <Text style={styles.closeLabel}>Close</Text>
                        </Pressable>
                    </View>

                    <ScrollView
                        contentContainerStyle={styles.scrollContent}
                        showsVerticalScrollIndicator={false}
                    >
                        <Section title="Schedule">
                            <Text style={styles.bodyText}>{model.scheduledWindowLabel}</Text>
                            {model.assignedTechLabel ? (
                                <Text style={styles.mutedText}>
                                    Assigned to {model.assignedTechLabel}
                                </Text>
                            ) : null}
                            <Text style={styles.mutedText}>
                                Last updated {model.lastUpdatedLabel}
                            </Text>
                        </Section>

                        {model.issueOrBlockedLabel ? (
                            <Section title={model.statusLabel === 'blocked' ? 'Blocked reason' : 'Issue'}>
                                <Text style={styles.bodyText}>{model.issueOrBlockedLabel}</Text>
                            </Section>
                        ) : null}

                        <Section title="Evidence checklist">
                            {model.evidenceChecklist.map((item) => (
                                <ChecklistRow key={item.label} item={item} />
                            ))}
                        </Section>

                        <Section title="Asset scan">
                            <Text style={styles.bodyText}>{model.assetScanLabel}</Text>
                        </Section>

                        <Section title="Motion check">
                            <Text style={styles.bodyText}>{model.motionCheckLabel}</Text>
                        </Section>

                        <Section title="Upload status">
                            <Text style={styles.bodyText}>{model.uploadStatusLabel}</Text>
                        </Section>

                        <Section title="Actions">
                            {model.availableActions.length === 0 ? (
                                <Text style={styles.mutedText}>No actions available</Text>
                            ) : (
                                model.availableActions.map((action) => (
                                    <View key={action.id} style={styles.actionRow}>
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel={action.label}
                                            accessibilityState={{ disabled: !action.enabled }}
                                            disabled={!action.enabled}
                                            style={({ pressed }) => [
                                                styles.actionButton,
                                                !action.enabled && styles.actionButtonDisabled,
                                                pressed && action.enabled && styles.actionButtonPressed,
                                            ]}
                                        >
                                            <Text
                                                style={[
                                                    styles.actionLabel,
                                                    !action.enabled && styles.actionLabelDisabled,
                                                ]}
                                            >
                                                {action.label}
                                            </Text>
                                        </Pressable>
                                        {action.disabledReason ? (
                                            <Text style={styles.actionHint}>{action.disabledReason}</Text>
                                        ) : null}
                                    </View>
                                ))
                            )}
                        </Section>
                    </ScrollView>
                </SafeAreaView>
            ) : null}
        </Modal>
    );
}

const styles = StyleSheet.create({
    sheet: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: 12,
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: '#E5E7EB',
    },
    headerText: {
        flex: 1,
        gap: 4,
    },
    equipmentLabel: {
        fontSize: 20,
        fontWeight: '700',
        color: '#111827',
    },
    statusMeta: {
        fontSize: 15,
        color: '#6B7280',
        textTransform: 'capitalize',
    },
    closeButton: {
        minHeight: 44,
        minWidth: 44,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 8,
    },
    closePressed: {
        opacity: 0.7,
    },
    closeLabel: {
        fontSize: 17,
        fontWeight: '600',
        color: '#1D4ED8',
    },
    scrollContent: {
        padding: 16,
        gap: 16,
        paddingBottom: 32,
    },
    section: {
        gap: 8,
    },
    sectionTitle: {
        fontSize: 12,
        fontWeight: '600',
        color: '#6B7280',
        textTransform: 'uppercase',
        letterSpacing: 0.4,
    },
    bodyText: {
        fontSize: 15,
        color: '#111827',
        lineHeight: 20,
    },
    mutedText: {
        fontSize: 14,
        color: '#6B7280',
        lineHeight: 20,
    },
    checklistRow: {
        gap: 2,
        paddingVertical: 6,
    },
    checklistLabel: {
        fontSize: 15,
        fontWeight: '600',
    },
    checklistComplete: {
        color: '#047857',
    },
    checklistPending: {
        color: '#9A3412',
    },
    checklistNeutral: {
        color: '#6B7280',
    },
    checklistDetail: {
        fontSize: 14,
        color: '#4B5563',
        lineHeight: 20,
    },
    actionRow: {
        gap: 4,
        marginBottom: 8,
    },
    actionButton: {
        minHeight: 44,
        borderRadius: 10,
        backgroundColor: '#1D4ED8',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    actionButtonPressed: {
        opacity: 0.85,
    },
    actionButtonDisabled: {
        backgroundColor: '#E5E7EB',
    },
    actionLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    actionLabelDisabled: {
        color: '#9CA3AF',
    },
    actionHint: {
        fontSize: 13,
        color: '#6B7280',
        paddingHorizontal: 4,
    },
});

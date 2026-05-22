import type { ReactNode } from 'react';
import {
    ActivityIndicator,
    Alert,
    Image,
    Modal,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import {
    getVisitActionConfirmationMessage,
    visitActionRequiresConfirmation,
} from '../domain/visitActionMutations';
import type { VisitActionId } from '../domain/visitActions';
import type { VisitChecklistItem, VisitDetailModel } from '../domain/visitDetail';
import type { VisitWorkflowProps } from '../viewModels/visitWorkflowTypes';
import { VisitAssetScanOverlay } from '../native/VisitAssetScanOverlay';
import { VisitEvidenceCaptureOverlay } from '../native/VisitEvidenceCaptureOverlay';

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
    onCloseVisit: () => void;
    visitWorkflow: VisitWorkflowProps;
};

export function VisitDetailSheet({
    visible,
    model,
    onCloseVisit,
    visitWorkflow,
}: VisitDetailSheetProps) {
    const { actions, evidence, scan, motion } = visitWorkflow;

    function handleActionPress(actionId: VisitActionId, enabled: boolean) {
        if (!enabled || actions.pendingVisitActionId !== null) {
            return;
        }

        if (visitActionRequiresConfirmation(actionId)) {
            Alert.alert('Confirm action', getVisitActionConfirmationMessage(actionId), [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Continue',
                    style: actionId === 'cancel_visit' ? 'destructive' : 'default',
                    onPress: () => void actions.run(actionId),
                },
            ]);
            return;
        }

        void actions.run(actionId);
    }

    function handleRequestClose() {
        // iOS pageSheet swipe dismiss hits this Modal, not the in-sheet overlay.
        if (evidence.isOpen) {
            evidence.close();
            return;
        }

        if (scan.isOpen) {
            scan.close();
            return;
        }

        onCloseVisit();
    }

    return (
        <Modal
            visible={visible && model !== null}
            animationType="slide"
            presentationStyle="pageSheet"
            onRequestClose={handleRequestClose}
        >
            {model ? (
                <SafeAreaView style={styles.sheet} edges={['top', 'bottom']}>
                    {scan.isOpen ? (
                        <VisitAssetScanOverlay
                            expectedAssetCode={model.expectedAssetCode}
                            equipmentLabel={model.equipmentLabel}
                            onClose={scan.close}
                            onScanSaved={(scannedCode) => scan.save(scannedCode)}
                        />
                    ) : null}
                    {evidence.isOpen ? (
                        <VisitEvidenceCaptureOverlay
                            equipmentLabel={model.equipmentLabel}
                            isRetake={evidence.isRetake}
                            onClose={evidence.close}
                            onCaptured={(localUri, options) =>
                                evidence.save(localUri, options)
                            }
                        />
                    ) : null}
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
                            onPress={onCloseVisit}
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

                        <Section title="Evidence">
                            {model.evidenceChecklist.map((item) => (
                                <ChecklistRow key={item.label} item={item} />
                            ))}
                            {model.evidencePhotoUri ? (
                                <Image
                                    source={{ uri: model.evidencePhotoUri }}
                                    style={styles.evidencePreview}
                                    accessibilityLabel="Captured visit evidence photo"
                                />
                            ) : null}
                            {model.evidenceCapturedAtLabel ? (
                                <Text style={styles.mutedText}>
                                    Captured {model.evidenceCapturedAtLabel}
                                </Text>
                            ) : null}
                            {model.evidenceRequired ? (
                                <View style={styles.evidenceActions}>
                                    {!model.evidencePhotoUri ? (
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel="Capture visit evidence photo"
                                            onPress={() => evidence.open()}
                                            style={({ pressed }) => [
                                                styles.evidencePrimaryButton,
                                                pressed && styles.evidenceButtonPressed,
                                            ]}
                                        >
                                            <Text style={styles.evidencePrimaryLabel}>
                                                Capture evidence photo
                                            </Text>
                                        </Pressable>
                                    ) : (
                                        <Pressable
                                            accessibilityRole="button"
                                            accessibilityLabel="Retake visit evidence photo"
                                            onPress={() => evidence.open({ isRetake: true })}
                                            style={({ pressed }) => [
                                                styles.evidenceSecondaryButton,
                                                pressed && styles.evidenceButtonPressed,
                                            ]}
                                        >
                                            <Text style={styles.evidenceSecondaryLabel}>
                                                Retake photo
                                            </Text>
                                        </Pressable>
                                    )}
                                </View>
                            ) : null}
                        </Section>

                        <Section title="Asset scan">
                            <Text style={styles.bodyText}>{model.assetScanLabel}</Text>
                            {model.assetScanResult === 'match' ? (
                                <Text style={styles.scanSuccess}>
                                    Scan requirement satisfied for this visit.
                                </Text>
                            ) : null}
                            <Text style={styles.mutedText}>
                                Expected code: {model.expectedAssetCode}
                            </Text>
                            {model.assetScanResult === null ? (
                                <>
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel="Scan asset barcode with device camera"
                                        onPress={() => void scan.start()}
                                        style={({ pressed }) => [
                                            styles.evidencePrimaryButton,
                                            pressed && styles.evidenceButtonPressed,
                                        ]}
                                    >
                                        <Text style={styles.evidencePrimaryLabel}>
                                            Scan asset barcode
                                        </Text>
                                    </Pressable>
                                    <Text style={styles.mutedText}>
                                        Point the scanner at a QR or barcode labeled with the
                                        expected code above.
                                    </Text>
                                </>
                            ) : (
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="Rescan asset barcode"
                                    onPress={() => void scan.start()}
                                    style={({ pressed }) => [
                                        model.assetScanResult === 'mismatch'
                                            ? styles.evidencePrimaryButton
                                            : styles.evidenceSecondaryButton,
                                        pressed && styles.evidenceButtonPressed,
                                    ]}
                                >
                                    <Text
                                        style={
                                            model.assetScanResult === 'mismatch'
                                                ? styles.evidencePrimaryLabel
                                                : styles.evidenceSecondaryLabel
                                        }
                                    >
                                        Rescan
                                    </Text>
                                </Pressable>
                            )}
                            {model.assetScanResult === 'mismatch' ? (
                                <Text style={styles.scanWarning}>
                                    Wrong code saved — rescan before completing.
                                </Text>
                            ) : null}
                        </Section>

                        <Section title="Motion check">
                            <Text style={styles.bodyText}>{model.motionCheckLabel}</Text>
                            {model.motionCheckRequired &&
                                !model.motionCheckLabel.includes('stable') ? (
                                <Pressable
                                    accessibilityRole="button"
                                    accessibilityLabel="Record stable motion check for development"
                                    onPress={motion.recordStable}
                                    style={({ pressed }) => [
                                        styles.evidenceSecondaryButton,
                                        pressed && styles.evidenceButtonPressed,
                                    ]}
                                >
                                    <Text style={styles.evidenceSecondaryLabel}>
                                        Record stable motion (dev)
                                    </Text>
                                </Pressable>
                            ) : null}
                        </Section>

                        <Section title="Upload status">
                            <Text style={styles.bodyText}>{model.uploadStatusLabel}</Text>
                        </Section>

                        <Section title="Actions">
                            {actions.visitActionError ? (
                                <View style={styles.actionErrorBanner}>
                                    <Text style={styles.actionErrorText}>
                                        {actions.visitActionError}
                                    </Text>
                                    <Pressable
                                        accessibilityRole="button"
                                        accessibilityLabel="Dismiss action error"
                                        onPress={actions.clearError}
                                        hitSlop={8}
                                    >
                                        <Text style={styles.actionErrorDismiss}>Dismiss</Text>
                                    </Pressable>
                                </View>
                            ) : null}
                            {model.availableActions.length === 0 ? (
                                <Text style={styles.mutedText}>No actions available</Text>
                            ) : (
                                model.availableActions.map((action) => {
                                    const isPending = actions.pendingVisitActionId === action.id;
                                    const actionDisabled =
                                        !action.enabled ||
                                        actions.pendingVisitActionId !== null;

                                    return (
                                        <View key={action.id} style={styles.actionRow}>
                                            <Pressable
                                                accessibilityRole="button"
                                                accessibilityLabel={action.label}
                                                accessibilityState={{ disabled: actionDisabled }}
                                                disabled={actionDisabled}
                                                onPress={() =>
                                                    handleActionPress(action.id, action.enabled)
                                                }
                                                style={({ pressed }) => [
                                                    styles.actionButton,
                                                    actionDisabled && styles.actionButtonDisabled,
                                                    pressed &&
                                                    !actionDisabled &&
                                                    styles.actionButtonPressed,
                                                ]}
                                            >
                                                {isPending ? (
                                                    <ActivityIndicator color="#FFFFFF" />
                                                ) : (
                                                    <Text
                                                        style={[
                                                            styles.actionLabel,
                                                            actionDisabled &&
                                                            styles.actionLabelDisabled,
                                                        ]}
                                                    >
                                                        {action.label}
                                                    </Text>
                                                )}
                                            </Pressable>
                                            {action.disabledReason ? (
                                                <Text style={styles.actionHint}>
                                                    {action.disabledReason}
                                                </Text>
                                            ) : null}
                                        </View>
                                    );
                                })
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
        position: 'relative',
    },
    evidencePreview: {
        width: '100%',
        height: 180,
        borderRadius: 10,
        backgroundColor: '#F3F4F6',
    },
    evidenceActions: {
        marginTop: 4,
    },
    evidencePrimaryButton: {
        minHeight: 44,
        borderRadius: 10,
        backgroundColor: '#1D4ED8',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    evidencePrimaryLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#FFFFFF',
    },
    evidenceSecondaryButton: {
        minHeight: 44,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: '#D1D5DB',
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 16,
    },
    evidenceSecondaryLabel: {
        fontSize: 16,
        fontWeight: '600',
        color: '#1D4ED8',
    },
    evidenceButtonPressed: {
        opacity: 0.85,
    },
    scanWarning: {
        fontSize: 13,
        color: '#9A3412',
        lineHeight: 18,
    },
    scanSuccess: {
        fontSize: 14,
        fontWeight: '600',
        color: '#047857',
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
    actionErrorBanner: {
        gap: 8,
        padding: 12,
        borderRadius: 10,
        backgroundColor: '#FEF2F2',
        marginBottom: 8,
    },
    actionErrorText: {
        fontSize: 14,
        color: '#991B1B',
        lineHeight: 20,
    },
    actionErrorDismiss: {
        fontSize: 15,
        fontWeight: '600',
        color: '#1D4ED8',
        alignSelf: 'flex-start',
    },
});

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Linking,
  Modal,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { assignmentsApi, GuardianInfo } from '../../api/assignments';
import { paymentsApi } from '../../api/payments';
import { Assignment, Transaction } from '../../types';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/formatting';
import { handleApiError } from '../../api/client';
import { RootStackParamList } from '../../navigation/RootNavigator';

type RouteType = RouteProp<RootStackParamList, 'AssignmentDetail'>;
type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AssignmentDetailScreen: React.FC = () => {
  const route = useRoute<RouteType>();
  const navigation = useNavigation<NavigationProp>();
  const { assignmentId } = route.params;

  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [guardian, setGuardian] = useState<GuardianInfo | null>(null);
  const [payments, setPayments] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [guardianLoading, setGuardianLoading] = useState(false);
  const [showGuardian, setShowGuardian] = useState(false);
  const [showTuitionModal, setShowTuitionModal] = useState(false);

  useEffect(() => {
    fetchAssignment();
    fetchPaymentHistory();
  }, [assignmentId]);

  const fetchAssignment = async () => {
    try {
      const response = await assignmentsApi.getById(assignmentId);
      if (response.success) {
        setAssignment(response.data);
      }
    } catch (error) {
      Alert.alert('Error', handleApiError(error as any));
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await paymentsApi.getAssignmentPayments(assignmentId);
      if (response.success) {
        setPayments(response.data);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const fetchGuardian = async () => {
    setGuardianLoading(true);
    try {
      const response = await assignmentsApi.getGuardian(assignmentId);
      if (response.success) {
        setGuardian(response.data);
        setShowGuardian(true);
      }
    } catch (error) {
      Alert.alert('Error', handleApiError(error as any));
    } finally {
      setGuardianLoading(false);
    }
  };

  const handleCall = (phone: string) => {
    Linking.openURL(`tel:${phone}`);
  };

  const handlePayment = () => {
    if (assignment) {
      navigation.navigate('PaymentForm', {
        assignmentId: assignment.id,
        amount: assignment.effective_due,
      });
    }
  };

  const handleViewReceipt = (transactionId: number) => {
    const receiptUrl = `https://manage.bdtuition.com/manage/transactions/${transactionId}/receipt`;
    Linking.openURL(receiptUrl);
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!assignment) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Assignment not found</Text>
      </View>
    );
  }

  const tuition = assignment.tuition;

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Header Card */}
      <Card style={styles.headerCard}>
        <Text style={styles.tuitionCodeLabel}>Tuition Code</Text>
        <Text style={styles.tuitionCode}>{tuition?.tuition_code || `#${assignment.id}`}</Text>
        <View style={styles.statusBadge}>
          <Icon name="check-circle" size={16} color="#fff" />
          <Text style={styles.statusText}>
            {assignment.status}
          </Text>
        </View>
      </Card>

      {/* Payment Summary */}
      <Card style={styles.paymentCard}>
        <Text style={styles.sectionTitle}>Payment Summary</Text>
        <View style={styles.paymentRow}>
          <View style={styles.paymentItem}>
            <Text style={styles.paymentLabel}>Due Amount</Text>
            <Text style={[styles.paymentValue, { color: colors.error }]}>
              {formatCurrency(assignment.effective_due)}
            </Text>
          </View>
          <View style={styles.paymentDivider} />
          <View style={styles.paymentItem}>
            <Text style={styles.paymentLabel}>Total Paid</Text>
            <Text style={[styles.paymentValue, { color: colors.success }]}>
              {formatCurrency(assignment.total_paid)}
            </Text>
          </View>
        </View>
        {assignment.effective_due > 0 && (
          <Button
            title="Make Payment"
            onPress={handlePayment}
            fullWidth
            style={styles.payButton}
          />
        )}
      </Card>

      {/* Tuition Details */}
      {tuition && (
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Tuition Details</Text>
          <DetailRow icon="map-marker" label="Location" value={`${tuition.area}, ${tuition.city}`} />
          <DetailRow icon="school" label="Class" value={tuition.class} />
          <DetailRow icon="book-open-variant" label="Subjects" value={tuition.prefered_subjects} />
          <DetailRow icon="translate" label="Medium" value={tuition.medium} />
          <DetailRow icon="calendar-week" label="Days/Week" value={tuition.day_per_week} />
          <DetailRow icon="cash" label="Salary" value={formatCurrency(tuition.salary) + '/mo'} />
          <Button
            title="View Tuition Details"
            onPress={() => setShowTuitionModal(true)}
            variant="outline"
            fullWidth
            style={styles.viewDetailsButton}
          />
        </Card>
      )}

      {/* Guardian Contact */}
      {(assignment.status === 'Assigned' || assignment.status === 'Assinged') && (
        <Card style={styles.guardianCard}>
          <Text style={styles.sectionTitle}>Guardian Contact</Text>
          {showGuardian && guardian ? (
            <>
              <View style={styles.guardianInfo}>
                <Icon name="phone" size={24} color={colors.primary} />
                <View style={styles.guardianDetails}>
                  <Text style={styles.guardianLabel}>Phone Number</Text>
                  <Text style={styles.guardianValue}>{guardian.guardian_number}</Text>
                </View>
                <Button
                  title="Call"
                  onPress={() => handleCall(guardian.guardian_number)}
                  size="small"
                />
              </View>
              {guardian.tuition_address && (
                <View style={styles.addressInfo}>
                  <Icon name="map-marker" size={24} color={colors.textSecondary} />
                  <View style={styles.guardianDetails}>
                    <Text style={styles.guardianLabel}>Address</Text>
                    <Text style={styles.guardianValue}>{guardian.tuition_address}</Text>
                  </View>
                </View>
              )}
            </>
          ) : (
            <Button
              title="View Guardian Contact"
              onPress={fetchGuardian}
              loading={guardianLoading}
              variant="outline"
              fullWidth
            />
          )}
        </Card>
      )}

      {/* Payment History */}
      {payments.length > 0 && (
        <Card style={styles.historyCard}>
          <Text style={styles.sectionTitle}>Payment History</Text>
          {payments.map((payment, index) => (
            <View key={payment.id} style={[styles.paymentHistoryItem, index > 0 && styles.paymentHistoryBorder]}>
              {/* Amount Row */}
              <View style={styles.paymentHistoryRow}>
                <View style={styles.paymentHistoryIcon}>
                  <Icon
                    name={payment.payment_method === 'bkash' ? 'cellphone' : 'cash'}
                    size={16}
                    color={colors.success}
                  />
                </View>
                <View style={styles.paymentHistoryDetails}>
                  <Text style={styles.paymentHistoryAmount}>{formatCurrency(payment.amount)}</Text>
                  <View style={[styles.paymentHistoryStatus, { backgroundColor: payment.status === 'Completed' ? colors.success + '20' : colors.warning + '20' }]}>
                    <Text style={[styles.paymentHistoryStatusText, { color: payment.status === 'Completed' ? colors.success : colors.warning }]}>
                      {payment.status || 'Paid'}
                    </Text>
                  </View>
                </View>
              </View>

              {/* Info Grid */}
              <View style={styles.paymentInfoGrid}>
                <View style={styles.paymentInfoItem}>
                  <Text style={styles.paymentInfoLabel}>Paid To</Text>
                  <Text style={styles.paymentInfoValue}>{payment.payment_by || 'BD Tuition'}</Text>
                </View>
                <View style={styles.paymentInfoItem}>
                  <Text style={styles.paymentInfoLabel}>Date</Text>
                  <Text style={styles.paymentInfoValue}>{formatDate(payment.date)}</Text>
                </View>
                <View style={styles.paymentInfoItem}>
                  <Text style={styles.paymentInfoLabel}>Method</Text>
                  <Text style={styles.paymentInfoValue}>{payment.payment_method?.toUpperCase() || 'Manual'}</Text>
                </View>
              </View>

              {/* View Receipt Button */}
              <Button
                title="View Receipt"
                onPress={() => handleViewReceipt(payment.id)}
                variant="outline"
                size="small"
                fullWidth
                style={styles.viewReceiptButton}
              />
            </View>
          ))}
        </Card>
      )}

        {/* Assignment Notes */}
        {assignment.note && (
          <Card style={styles.notesCard}>
            <Text style={styles.sectionTitle}>Notes</Text>
            <Text style={styles.notesText}>{assignment.note}</Text>
          </Card>
        )}
      </ScrollView>

      {/* Tuition Details Modal */}
      <Modal
        visible={showTuitionModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowTuitionModal(false)}
      >
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalBackdrop}
            activeOpacity={1}
            onPress={() => setShowTuitionModal(false)}
          />
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                Tuition Details - {tuition?.tuition_code}
              </Text>
              <TouchableOpacity onPress={() => setShowTuitionModal(false)}>
                <Icon name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>

            {tuition && (
              <ScrollView style={styles.modalBody} contentContainerStyle={styles.modalBodyContent}>
                <Text style={styles.modalSectionTitle}>Tuition Information</Text>
                <ModalDetailItem label="Code" value={tuition.tuition_code} />
                <ModalDetailItem label="Class" value={tuition.class} />
                <ModalDetailItem label="Area" value={tuition.area} />
                <ModalDetailItem label="City" value={tuition.city} />
                <ModalDetailItem label="Medium" value={tuition.medium} />
                <ModalDetailItem label="Group of Study" value={tuition.group_of_study} />
                <ModalDetailItem label="Preferred Subjects" value={tuition.prefered_subjects} />
                <ModalDetailItem label="Preferred University" value={tuition.prefered_university} />
                <ModalDetailItem label="Preferred Gender" value={tuition.prefered_gender} />
                <ModalDetailItem label="Day per Week" value={tuition.day_per_week} />
                <ModalDetailItem label="Salary" value={formatCurrency(tuition.salary)} />
                <ModalDetailItem label="Media Fee" value={formatCurrency(tuition.media_fee)} />
                <ModalDetailItem label="Preferred Time" value={tuition.prefered_time} />
                <ModalDetailItem label="Preferred Duration" value={tuition.prefered_duration} />
                <ModalDetailItem label="Student Short Details" value={tuition.student_short_details} />
                <ModalDetailItem label="Tutor Requirement" value={tuition.tutor_requirement} />
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <Button
                title="Close"
                onPress={() => setShowTuitionModal(false)}
                variant="outline"
                fullWidth
              />
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

interface DetailRowProps {
  icon: string;
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <View style={styles.detailIconContainer}>
      <Icon name={icon} size={18} color={colors.primary} />
    </View>
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value || 'Not specified'}</Text>
    </View>
  </View>
);

interface ModalDetailItemProps {
  label: string;
  value: string | undefined | null;
}

const ModalDetailItem: React.FC<ModalDetailItemProps> = ({ label, value }) => (
  <View style={styles.modalDetailItem}>
    <Text style={styles.modalDetailLabel}>{label}</Text>
    <Text style={styles.modalDetailValue}>{value || 'N/A'}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: fontSize.lg,
    color: colors.textSecondary,
  },
  headerCard: {
    backgroundColor: colors.primary,
    padding: spacing.lg,
  },
  tuitionCodeLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
    marginBottom: spacing.xs,
  },
  tuitionCode: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: '#fff',
    marginBottom: spacing.md,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
  },
  statusText: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#fff',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  paymentCard: {},
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
  },
  paymentItem: {
    flex: 1,
    alignItems: 'center',
  },
  paymentDivider: {
    width: 1,
    height: 50,
    backgroundColor: colors.border,
  },
  paymentLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  paymentValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
  },
  payButton: {
    marginTop: spacing.sm,
  },
  detailsCard: {},
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.md,
  },
  detailIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  detailValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
  },
  guardianCard: {},
  guardianInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    marginBottom: spacing.md,
  },
  guardianDetails: {
    flex: 1,
  },
  guardianLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  guardianValue: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.text,
  },
  addressInfo: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.md,
  },
  historyCard: {},
  paymentHistoryItem: {
    paddingVertical: spacing.md,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  paymentHistoryBorder: {
    marginTop: spacing.sm,
  },
  paymentHistoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  paymentHistoryIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.success + '15',
    justifyContent: 'center',
    alignItems: 'center',
  },
  paymentHistoryDetails: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  paymentHistoryAmount: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  paymentHistoryStatus: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  paymentHistoryStatusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  paymentInfoGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  paymentInfoItem: {
    flex: 1,
    minWidth: '30%',
    backgroundColor: colors.surface,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  paymentInfoLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: 2,
  },
  paymentInfoValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '600',
  },
  viewReceiptButton: {
    marginTop: spacing.xs,
  },
  notesCard: {},
  notesText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  viewDetailsButton: {
    marginTop: spacing.md,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalBackdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContent: {
    backgroundColor: colors.surface,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
    maxHeight: '85%',
    minHeight: 300,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.md,
    backgroundColor: colors.primary,
    borderTopLeftRadius: borderRadius.xl,
    borderTopRightRadius: borderRadius.xl,
  },
  modalTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  modalBody: {
    maxHeight: 450,
  },
  modalBodyContent: {
    padding: spacing.md,
    paddingBottom: spacing.xl,
    gap: spacing.sm,
  },
  modalFooter: {
    padding: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  modalSectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  modalDetailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  modalDetailLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  modalDetailValue: {
    fontSize: fontSize.sm,
    color: colors.text,
    fontWeight: '600',
    flex: 1,
    textAlign: 'right',
  },
  noteBox: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    marginBottom: spacing.sm,
  },
  noteLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  noteText: {
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
});

export default AssignmentDetailScreen;

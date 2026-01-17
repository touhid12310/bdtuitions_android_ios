import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { paymentsApi, RefundInfo, RefundRequest } from '../../api/payments';
import { formatCurrency, formatDate, getStatusColor } from '../../utils/formatting';
import { handleApiError } from '../../api/client';

const RefundsScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [refundInfo, setRefundInfo] = useState<RefundInfo | null>(null);
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestData, setRequestData] = useState({
    amount: '',
    reason: '',
    bkash_number: '',
  });

  const fetchRefunds = async () => {
    try {
      const response = await paymentsApi.getRefunds();
      if (response.success) {
        setRefundInfo(response.data);
      }
    } catch (error) {
      console.error('Error fetching refunds:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRefunds();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchRefunds();
  }, []);

  const handleRequestRefund = async () => {
    if (!requestData.amount || !requestData.reason || !requestData.bkash_number) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amount = parseFloat(requestData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (refundInfo && amount > refundInfo.eligible_amount) {
      Alert.alert('Error', `Maximum refundable amount is ${formatCurrency(refundInfo.eligible_amount)}`);
      return;
    }

    setSubmitting(true);
    try {
      const response = await paymentsApi.requestRefund({
        amount,
        reason: requestData.reason,
        bkash_number: requestData.bkash_number,
      });

      if (response.success) {
        Alert.alert('Success', 'Refund request submitted successfully');
        setShowRequestForm(false);
        setRequestData({ amount: '', reason: '', bkash_number: '' });
        fetchRefunds();
      }
    } catch (error) {
      Alert.alert('Error', handleApiError(error as any));
    } finally {
      setSubmitting(false);
    }
  };

  const renderRefundItem = ({ item }: { item: RefundRequest }) => (
    <Card style={styles.refundCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.refundAmount}>{formatCurrency(item.amount)}</Text>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(item.status) + '20' },
          ]}
        >
          <Text style={[styles.statusText, { color: getStatusColor(item.status) }]}>
            {item.status}
          </Text>
        </View>
      </View>

      <View style={styles.refundDetails}>
        <View style={styles.detailRow}>
          <Icon name="phone" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{item.bkash_number}</Text>
        </View>
        <View style={styles.detailRow}>
          <Icon name="calendar" size={16} color={colors.textSecondary} />
          <Text style={styles.detailText}>{formatDate(item.created_at)}</Text>
        </View>
      </View>

      <Text style={styles.reasonLabel}>Reason:</Text>
      <Text style={styles.reasonText}>{item.reason}</Text>

      {item.admin_note && (
        <>
          <Text style={styles.reasonLabel}>Admin Note:</Text>
          <Text style={styles.reasonText}>{item.admin_note}</Text>
        </>
      )}
    </Card>
  );

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>
      {/* Eligibility Card */}
      {refundInfo && (
        <Card style={styles.eligibilityCard}>
          <View style={styles.eligibilityHeader}>
            <Icon
              name={refundInfo.is_eligible ? 'check-circle' : 'close-circle'}
              size={32}
              color={refundInfo.is_eligible ? colors.success : colors.error}
            />
            <View style={styles.eligibilityInfo}>
              <Text style={styles.eligibilityTitle}>
                {refundInfo.is_eligible ? 'Eligible for Refund' : 'Not Eligible'}
              </Text>
              <Text style={styles.eligibilityAmount}>
                Available: {formatCurrency(refundInfo.eligible_amount)}
              </Text>
            </View>
          </View>

          {refundInfo.is_eligible && !showRequestForm && (
            <Button
              title="Request Refund"
              onPress={() => setShowRequestForm(true)}
              fullWidth
              style={styles.requestButton}
            />
          )}
        </Card>
      )}

      {/* Request Form */}
      {showRequestForm && (
        <Card style={styles.formCard}>
          <Text style={styles.formTitle}>Request Refund</Text>

          <Input
            label="Amount"
            placeholder={`Max: ${refundInfo ? formatCurrency(refundInfo.eligible_amount) : '0'}`}
            value={requestData.amount}
            onChangeText={(value) =>
              setRequestData((prev) => ({ ...prev, amount: value }))
            }
            keyboardType="numeric"
          />

          <Input
            label="bKash Number"
            placeholder="01XXXXXXXXX"
            value={requestData.bkash_number}
            onChangeText={(value) =>
              setRequestData((prev) => ({ ...prev, bkash_number: value }))
            }
            keyboardType="phone-pad"
          />

          <Input
            label="Reason"
            placeholder="Why are you requesting a refund?"
            value={requestData.reason}
            onChangeText={(value) =>
              setRequestData((prev) => ({ ...prev, reason: value }))
            }
            multiline
          />

          <View style={styles.formButtons}>
            <Button
              title="Cancel"
              onPress={() => {
                setShowRequestForm(false);
                setRequestData({ amount: '', reason: '', bkash_number: '' });
              }}
              variant="outline"
              style={styles.formButton}
            />
            <Button
              title="Submit"
              onPress={handleRequestRefund}
              loading={submitting}
              style={styles.formButton}
            />
          </View>
        </Card>
      )}

      {/* Refund History */}
      <Text style={styles.sectionTitle}>Refund History</Text>

      <FlatList
        data={refundInfo?.refunds || []}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderRefundItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="cash-refund"
            title="No Refund Requests"
            message="You haven't made any refund requests yet."
          />
        }
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  eligibilityCard: {
    margin: spacing.md,
    marginBottom: 0,
  },
  eligibilityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  eligibilityInfo: {
    flex: 1,
  },
  eligibilityTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
  },
  eligibilityAmount: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
  requestButton: {
    marginTop: spacing.md,
  },
  formCard: {
    margin: spacing.md,
    marginBottom: 0,
  },
  formTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  formButtons: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  formButton: {
    flex: 1,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    margin: spacing.md,
    marginBottom: 0,
  },
  listContent: {
    padding: spacing.md,
    flexGrow: 1,
  },
  refundCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  refundAmount: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  refundDetails: {
    flexDirection: 'row',
    gap: spacing.lg,
    marginBottom: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  detailText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  reasonLabel: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
    marginTop: spacing.sm,
  },
  reasonText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    lineHeight: 20,
  },
});

export default RefundsScreen;

import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import VerificationBanner from '../../components/common/VerificationBanner';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { assignmentsApi } from '../../api/assignments';
import { Assignment } from '../../types';
import { formatCurrency, getStatusColor } from '../../utils/formatting';
import { RootStackParamList } from '../../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

const AssignmentsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchAssignments = async () => {
    try {
      const response = await assignmentsApi.getList();
      if (response.success) {
        setAssignments(response.data);
      }
    } catch (error) {
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAssignments();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchAssignments();
  }, []);

  const handlePress = (assignment: Assignment) => {
    navigation.navigate('AssignmentDetail', { assignmentId: assignment.id });
  };

  const renderItem = ({ item }: { item: Assignment }) => (
    <Card style={styles.assignmentCard} onPress={() => handlePress(item)}>
      {/* Header with Tuition Code and Status */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.tuitionLabel}>Tuition Code</Text>
          <Text style={styles.tuitionCode}>
            {item.tuition?.tuition_code || `#${item.id}`}
          </Text>
        </View>
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

      {/* Assignment Details */}
      {item.tuition && (
        <View style={styles.detailsSection}>
          <View style={styles.detailRow}>
            <Icon name="map-marker" size={18} color={colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Location</Text>
              <Text style={styles.detailValue}>
                {item.tuition.area}, {item.tuition.city}
              </Text>
            </View>
          </View>
          <View style={styles.detailRow}>
            <Icon name="school" size={18} color={colors.primary} />
            <View style={styles.detailContent}>
              <Text style={styles.detailLabel}>Class</Text>
              <Text style={styles.detailValue}>{item.tuition.class}</Text>
            </View>
          </View>
          {item.tuition.prefered_subjects && (
            <View style={styles.detailRow}>
              <Icon name="book-open-variant" size={18} color={colors.primary} />
              <View style={styles.detailContent}>
                <Text style={styles.detailLabel}>Subject</Text>
                <Text style={styles.detailValue}>{item.tuition.prefered_subjects}</Text>
              </View>
            </View>
          )}
        </View>
      )}

      {/* Payment Summary */}
      <View style={styles.cardFooter}>
        <View style={styles.paymentBox}>
          <Text style={styles.paymentLabel}>Due Amount</Text>
          <Text style={[styles.paymentValue, { color: item.effective_due > 0 ? colors.error : colors.success }]}>
            {formatCurrency(item.effective_due)}
          </Text>
        </View>
        <View style={styles.paymentDivider} />
        <View style={styles.paymentBox}>
          <Text style={styles.paymentLabel}>Total Paid</Text>
          <Text style={[styles.paymentValue, { color: colors.success }]}>
            {formatCurrency(item.total_paid)}
          </Text>
        </View>
      </View>
    </Card>
  );

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>
      <VerificationBanner />
      <FlatList
        style={styles.list}
        data={assignments}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="briefcase-outline"
            title="No Assignments"
            message="You don't have any assignments yet. Apply to tuitions to get assigned."
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
  list: {
    flex: 1,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
    flexGrow: 1,
  },
  assignmentCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tuitionLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    marginBottom: 2,
  },
  tuitionCode: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  detailsSection: {
    gap: spacing.sm,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: fontSize.xs,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '600',
  },
  cardFooter: {
    flexDirection: 'row',
    marginTop: spacing.md,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.background,
    marginHorizontal: -spacing.md,
    marginBottom: -spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomLeftRadius: borderRadius.lg,
    borderBottomRightRadius: borderRadius.lg,
  },
  paymentBox: {
    flex: 1,
    alignItems: 'center',
  },
  paymentDivider: {
    width: 1,
    backgroundColor: colors.border,
  },
  paymentLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    fontWeight: '500',
    marginBottom: spacing.xs,
  },
  paymentValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
});

export default AssignmentsScreen;

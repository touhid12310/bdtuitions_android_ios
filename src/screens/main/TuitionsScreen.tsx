import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import VerificationBanner from '../../components/common/VerificationBanner';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { tuitionsApi, TuitionsFilter } from '../../api/tuitions';
import { Tuition } from '../../types';
import { formatCurrency } from '../../utils/formatting';
import { RootStackParamList } from '../../navigation/RootNavigator';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface TuitionItemProps {
  tuition: Tuition;
  onPress: () => void;
}

// Detail row component for consistent styling
const DetailRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.detailItem}>
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value || 'Not specified'}</Text>
  </View>
);

// Two-column detail row
const TwoColumnRow: React.FC<{
  label1: string;
  value1: string;
  label2: string;
  value2: string;
}> = ({ label1, value1, label2, value2 }) => (
  <View style={styles.twoColumnRow}>
    <View style={styles.columnItem}>
      <Text style={styles.detailLabel}>{label1}:</Text>
      <Text style={styles.detailValue}>{value1 || 'Not specified'}</Text>
    </View>
    <View style={styles.columnItem}>
      <Text style={styles.detailLabel}>{label2}:</Text>
      <Text style={styles.detailValue}>{value2 || 'Not specified'}</Text>
    </View>
  </View>
);

const TuitionItem: React.FC<TuitionItemProps> = ({ tuition, onPress }) => (
  <Card style={styles.tuitionCard} padding="none">
    {/* Header Section - Blue background like Laravel */}
    <View style={styles.cardHeaderSection}>
      <Text style={styles.cardTitle}>
        <Text style={styles.titleUnderline}>{tuition.prefered_gender} Tutor Wanted</Text> at{' '}
        <Text style={styles.titleUnderline}>{tuition.city}</Text>,{' '}
        <Text style={styles.titleUnderline}>{tuition.area}</Text>!
      </Text>
      <View style={styles.tuitionCodeBadge}>
        <Text style={styles.tuitionCodeLabel}>Tuition Code: </Text>
        <View style={styles.codeBadge}>
          <Text style={styles.codeText}>{tuition.tuition_code}</Text>
        </View>
      </View>
      <View style={[styles.statusBadge, tuition.has_applied ? styles.appliedBadge : styles.availableBadge]}>
        <Text style={[styles.statusText, !tuition.has_applied && styles.availableBadgeText]}>
          {tuition.has_applied ? 'Applied' : tuition.status}
        </Text>
      </View>
    </View>

    {/* Body Section - Details */}
    <View style={styles.cardBodySection}>
      {/* Class | Medium */}
      <TwoColumnRow
        label1="Class"
        value1={tuition.class}
        label2="Medium"
        value2={tuition.medium}
      />

      {/* Subject */}
      <DetailRow
        label="Subject"
        value={tuition.prefered_subjects?.length > 40
          ? tuition.prefered_subjects.substring(0, 40) + '...'
          : tuition.prefered_subjects}
      />

      {/* Salary | Media Fee */}
      <TwoColumnRow
        label1="Salary"
        value1={formatCurrency(tuition.salary)}
        label2="Media Fee"
        value2={`${tuition.media_fee}%`}
      />

      {/* Time | Duration */}
      <TwoColumnRow
        label1="Time"
        value1={tuition.prefered_time || 'Not specified'}
        label2="Duration"
        value2={tuition.prefered_duration || 'Not specified'}
      />

      {/* Days/Week */}
      <DetailRow label="Days/Week" value={tuition.day_per_week} />
    </View>

    {/* Footer Section - Apply Button */}
    <View style={styles.cardFooterSection}>
      {tuition.has_applied ? (
        <Button
          title="Applied"
          onPress={() => {}}
          variant="secondary"
          fullWidth
          disabled
        />
      ) : (
        <Button
          title="Apply Now"
          onPress={onPress}
          variant="primary"
          fullWidth
        />
      )}
    </View>
  </Card>
);

const TuitionsScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();
  const [tuitions, setTuitions] = useState<Tuition[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<TuitionsFilter>({});

  const fetchTuitions = async (pageNum: number, isRefresh: boolean = false) => {
    if (isRefresh) {
      setRefreshing(true);
    } else if (pageNum > 1) {
      setLoadingMore(true);
    }

    try {
      const response = await tuitionsApi.getList({ ...filters, page: pageNum, per_page: 20 });
      if (response.success) {
        const newTuitions = response.data;
        if (isRefresh || pageNum === 1) {
          setTuitions(newTuitions);
        } else {
          setTuitions((prev) => [...prev, ...newTuitions]);
        }
        setHasMore(response.meta.current_page < response.meta.last_page);
        setPage(pageNum);
      }
    } catch (error) {
      console.error('Error fetching tuitions:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
      setLoadingMore(false);
    }
  };

  useEffect(() => {
    fetchTuitions(1);
  }, [filters]);

  const onRefresh = useCallback(() => {
    fetchTuitions(1, true);
  }, [filters]);

  const onLoadMore = useCallback(() => {
    if (!loadingMore && hasMore) {
      fetchTuitions(page + 1);
    }
  }, [loadingMore, hasMore, page, filters]);

  const handleTuitionPress = (tuition: Tuition) => {
    navigation.navigate('TuitionDetail', { tuitionId: tuition.id });
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View style={styles.footerLoader}>
        <LoadingSpinner size="small" />
      </View>
    );
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>
      {/* Verification Banner */}
      <VerificationBanner />

      {/* Search/Filter Bar */}
      <View style={styles.filterBar}>
        <TouchableOpacity style={styles.searchButton}>
          <Icon name="magnify" size={20} color={colors.textSecondary} />
          <Text style={styles.searchText}>Search tuitions...</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Icon name="filter-variant" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>

      <FlatList
        style={styles.list}
        data={tuitions}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TuitionItem tuition={item} onPress={() => handleTuitionPress(item)} />
        )}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={onLoadMore}
        onEndReachedThreshold={0.3}
        ListFooterComponent={renderFooter}
        ListEmptyComponent={
          <EmptyState
            icon="school-outline"
            title="No Tuitions Found"
            message="There are no available tuitions matching your criteria."
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
  filterBar: {
    flexDirection: 'row',
    padding: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  searchButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: borderRadius.md,
    gap: spacing.sm,
  },
  searchText: {
    color: colors.textSecondary,
    fontSize: fontSize.md,
  },
  filterButton: {
    padding: spacing.sm,
    backgroundColor: colors.background,
    borderRadius: borderRadius.md,
  },
  listContent: {
    padding: spacing.md,
    gap: spacing.md,
  },
  tuitionCard: {
    marginBottom: spacing.md,
    overflow: 'hidden',
  },

  // Card Header Section (Blue background)
  cardHeaderSection: {
    backgroundColor: colors.primary,
    padding: spacing.md,
    paddingRight: spacing.xl + spacing.lg, // Extra space for badge
  },
  cardTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#fff',
    lineHeight: 22,
    marginBottom: spacing.sm,
  },
  titleUnderline: {
    textDecorationLine: 'underline',
  },
  tuitionCodeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: spacing.xs,
  },
  tuitionCodeLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#fff',
  },
  codeBadge: {
    backgroundColor: '#FFC107',
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: borderRadius.sm,
  },
  codeText: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: '#212529',
    fontFamily: 'monospace',
  },
  statusBadge: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.sm,
  },
  appliedBadge: {
    backgroundColor: colors.success,
  },
  availableBadge: {
    backgroundColor: '#fff',
  },
  availableBadgeText: {
    color: colors.primary,
  },
  statusText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#fff',
  },

  // Card Body Section
  cardBodySection: {
    padding: spacing.md,
    gap: spacing.sm,
  },

  // Detail row styles
  detailItem: {
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },
  detailLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    color: colors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.text,
  },

  // Two column row
  twoColumnRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  columnItem: {
    flex: 1,
    backgroundColor: colors.background,
    padding: spacing.sm,
    borderRadius: borderRadius.sm,
  },

  // Card Footer Section
  cardFooterSection: {
    padding: spacing.md,
    paddingTop: 0,
  },

  footerLoader: {
    paddingVertical: spacing.lg,
  },
});

export default TuitionsScreen;

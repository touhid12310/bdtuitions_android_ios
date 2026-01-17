import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EmptyState from '../../components/common/EmptyState';
import VerificationBanner from '../../components/common/VerificationBanner';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import apiClient from '../../api/client';
import { API_ENDPOINTS } from '../../constants/api';
import { Application } from '../../types';
import { formatDate, getStatusColor } from '../../utils/formatting';

const ApplicationsScreen: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchApplications = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.APPLICATIONS);
      if (response.data.success) {
        setApplications(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchApplications();
  }, []);

  const renderItem = ({ item }: { item: Application }) => (
    <Card style={styles.applicationCard}>
      <View style={styles.cardHeader}>
        <Text style={styles.tuitionCode}>
          {item.tuition?.tuition_code || `Application #${item.id}`}
        </Text>
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

      {item.tuition && (
        <>
          <View style={styles.infoRow}>
            <Icon name="map-marker" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>
              {item.tuition.area}, {item.tuition.city}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="school" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>Class: {item.tuition.class}</Text>
          </View>
          <View style={styles.infoRow}>
            <Icon name="book-open-variant" size={16} color={colors.textSecondary} />
            <Text style={styles.infoText}>{item.tuition.prefered_subjects}</Text>
          </View>
        </>
      )}

      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>Applied: {formatDate(item.date)}</Text>
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
        data={applications}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <EmptyState
            icon="file-document-outline"
            title="No Applications"
            message="You haven't applied to any tuitions yet. Browse tuitions to apply."
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
  applicationCard: {
    marginBottom: spacing.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
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
    fontSize: fontSize.xs,
    fontWeight: '600',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  infoText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    flex: 1,
  },
  cardFooter: {
    marginTop: spacing.md,
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  dateText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
});

export default ApplicationsScreen;

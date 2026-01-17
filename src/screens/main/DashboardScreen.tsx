import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { MainTabParamList } from '../../navigation/MainTabs';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import VerificationBanner from '../../components/common/VerificationBanner';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/client';
import { API_ENDPOINTS } from '../../constants/api';
import { DashboardStats } from '../../types';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: string;
  color: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, color }) => (
  <Card style={styles.statCard}>
    <View style={[styles.iconContainer, { backgroundColor: color + '20' }]}>
      <Icon name={icon} size={24} color={color} />
    </View>
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </Card>
);

const DashboardScreen: React.FC = () => {
  const navigation = useNavigation<BottomTabNavigationProp<MainTabParamList>>();
  const teacher = useAuthStore((state) => state.teacher);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.DASHBOARD_STATS);
      if (response.data.success) {
        setStats(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <View style={styles.container}>
      {/* Verification Banner */}
      <VerificationBanner />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
      {/* Welcome Card */}
      <Card style={styles.welcomeCard}>
        <Text style={styles.welcomeText}>Welcome back,</Text>
        <Text style={styles.nameText}>{teacher?.teacher_name || 'Teacher'}</Text>
        <View style={styles.statusBadge}>
          <Text style={styles.statusText}>{stats?.profile_status || teacher?.status}</Text>
        </View>
      </Card>

      {/* Stats Grid */}
      <Text style={styles.sectionTitle}>Overview</Text>
      <View style={styles.statsGrid}>
        <StatCard
          title="Applications"
          value={stats?.total_applications || 0}
          icon="file-document-outline"
          color={colors.primary}
        />
        <StatCard
          title="Active Jobs"
          value={stats?.active_assignments || 0}
          icon="briefcase-outline"
          color={colors.success}
        />
        <StatCard
          title="Pending Payments"
          value={stats?.pending_payments || 0}
          icon="cash-clock"
          color={colors.warning}
        />
        <StatCard
          title="Notifications"
          value={stats?.unread_notifications || 0}
          icon="bell-outline"
          color={colors.error}
        />
      </View>

      {/* Payment Summary */}
      <Text style={styles.sectionTitle}>Payment Summary</Text>
      <Card style={styles.paymentCard}>
        <View style={styles.paymentRow}>
          <View style={styles.paymentItem}>
            <Text style={styles.paymentLabel}>Total Due</Text>
            <Text style={[styles.paymentValue, { color: colors.error }]}>
              ৳{stats?.total_due || '0.00'}
            </Text>
          </View>
          <View style={styles.paymentDivider} />
          <View style={styles.paymentItem}>
            <Text style={styles.paymentLabel}>Total Paid</Text>
            <Text style={[styles.paymentValue, { color: colors.success }]}>
              ৳{stats?.total_paid || '0.00'}
            </Text>
          </View>
        </View>
      </Card>

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.actionsGrid}>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Tuitions')}>
          <Icon name="magnify" size={28} color={colors.primary} />
          <Text style={styles.actionText}>Find Tuition</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Applications')}>
          <Icon name="file-document-edit" size={28} color={colors.primary} />
          <Text style={styles.actionText}>My Applications</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Assignments')}>
          <Icon name="cash" size={28} color={colors.primary} />
          <Text style={styles.actionText}>Payments</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Profile')}>
          <Icon name="account-cog" size={28} color={colors.primary} />
          <Text style={styles.actionText}>Profile</Text>
        </TouchableOpacity>
      </View>
      </ScrollView>
    </View>
  );
};

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
  },
  welcomeCard: {
    backgroundColor: colors.primary,
    marginBottom: spacing.lg,
  },
  welcomeText: {
    fontSize: fontSize.md,
    color: 'rgba(255,255,255,0.8)',
  },
  nameText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: '#fff',
    marginTop: spacing.xs,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    marginTop: spacing.sm,
  },
  statusText: {
    fontSize: fontSize.xs,
    color: '#fff',
    fontWeight: '500',
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  statCard: {
    width: '48%',
    alignItems: 'center',
    padding: spacing.md,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  statValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
  },
  statTitle: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  paymentCard: {
    marginBottom: spacing.lg,
  },
  paymentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  paymentItem: {
    flex: 1,
    alignItems: 'center',
  },
  paymentDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  paymentLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  paymentValue: {
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  actionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  actionButton: {
    width: '48%',
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionText: {
    fontSize: fontSize.sm,
    color: colors.text,
    marginTop: spacing.sm,
    fontWeight: '500',
  },
});

export default DashboardScreen;

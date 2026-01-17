import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import VerificationBanner from '../../components/common/VerificationBanner';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import { authApi } from '../../api/auth';
import { handleApiError } from '../../api/client';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { getStatusColor, getImageUrl } from '../../utils/formatting';

const ProfileScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { teacher, clearAuth } = useAuthStore();
  const [imageError, setImageError] = useState(false);

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await authApi.logout();
            } catch (error) {
              console.error('Logout error:', error);
            } finally {
              clearAuth();
            }
          },
        },
      ]
    );
  };

  if (!teacher) return null;

  const imageUrl = getImageUrl(teacher.personal_photo);

  return (
    <View style={styles.container}>
      <VerificationBanner />
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Profile Header */}
      <Card style={styles.headerCard}>
        <View style={styles.avatarContainer}>
          {imageUrl && !imageError ? (
            <Image
              source={{ uri: imageUrl }}
              style={styles.avatar}
              onError={() => setImageError(true)}
            />
          ) : (
            <View style={styles.avatarPlaceholder}>
              <Icon name="account" size={48} color={colors.textSecondary} />
            </View>
          )}
        </View>
        <Text style={styles.name}>{teacher.teacher_name}</Text>
        <Text style={styles.code}>{teacher.teacher_code}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(teacher.status) + '20' }]}>
          <Text style={[styles.statusText, { color: getStatusColor(teacher.status) }]}>
            {teacher.status}
          </Text>
        </View>
      </Card>

      {/* Quick Actions */}
      <View style={styles.actionsRow}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Icon name="pencil" size={24} color={colors.primary} />
          <Text style={styles.actionText}>Edit Profile</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => navigation.navigate('Verification')}
        >
          <Icon name="shield-check" size={24} color={colors.success} />
          <Text style={styles.actionText}>Verification</Text>
        </TouchableOpacity>
      </View>

      {/* Contact Info */}
      <Card style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Contact Information</Text>
        <InfoRow icon="phone" label="Phone" value={teacher.phone_number} />
        <InfoRow icon="email" label="Email" value={teacher.email} />
        <InfoRow icon="whatsapp" label="WhatsApp" value={teacher.whatsapp_number || 'Not set'} />
      </Card>

      {/* Academic Info */}
      <Card style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Academic Information</Text>
        <InfoRow icon="school" label="University" value={teacher.university_name} />
        <InfoRow icon="book" label="Department" value={teacher.department_name} />
        <InfoRow icon="calendar" label="Academic Year" value={teacher.academic_year} />
        <InfoRow icon="translate" label="Medium" value={teacher.medium} />
      </Card>

      {/* Location Info */}
      <Card style={styles.infoCard}>
        <Text style={styles.sectionTitle}>Location</Text>
        <InfoRow icon="city" label="City" value={teacher.city} />
        <InfoRow icon="map-marker" label="Area" value={teacher.area} />
        <InfoRow icon="home" label="Address" value={teacher.living_address} />
      </Card>

      {/* Preferences */}
      {teacher.expected_class && (
        <Card style={styles.infoCard}>
          <Text style={styles.sectionTitle}>Teaching Preferences</Text>
          <InfoRow icon="school" label="Expected Class" value={teacher.expected_class} />
          <InfoRow icon="book" label="Expected Subject" value={teacher.expected_subject || 'Not set'} />
          <InfoRow icon="translate" label="Expected Medium" value={teacher.expected_medium || 'Not set'} />
          <InfoRow icon="cash" label="Expected Salary" value={teacher.expected_salary ? `৳${teacher.expected_salary}` : 'Not set'} />
        </Card>
      )}

      {/* Logout Button */}
      <Button
        title="Logout"
        onPress={handleLogout}
        variant="danger"
        fullWidth
        style={styles.logoutButton}
      />
      </ScrollView>
    </View>
  );
};

interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
}

const InfoRow: React.FC<InfoRowProps> = ({ icon, label, value }) => (
  <View style={styles.infoRow}>
    <Icon name={icon} size={20} color={colors.textSecondary} />
    <View style={styles.infoContent}>
      <Text style={styles.infoLabel}>{label}</Text>
      <Text style={styles.infoValue}>{value}</Text>
    </View>
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
  headerCard: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  avatarContainer: {
    marginBottom: spacing.md,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  avatarPlaceholder: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  name: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  code: {
    fontSize: fontSize.md,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: spacing.sm,
  },
  statusBadge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
  },
  statusText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    padding: spacing.md,
    borderRadius: borderRadius.lg,
    alignItems: 'center',
    gap: spacing.xs,
  },
  actionText: {
    fontSize: fontSize.sm,
    fontWeight: '500',
    color: colors.text,
  },
  infoCard: {},
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  infoContent: {
    flex: 1,
  },
  infoLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  infoValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});

export default ProfileScreen;

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import { RouteProp, useRoute } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Input from '../../components/common/Input';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { tuitionsApi, TuitionDetailResponse } from '../../api/tuitions';
import { formatCurrency } from '../../utils/formatting';
import { handleApiError } from '../../api/client';
import { RootStackParamList } from '../../navigation/RootNavigator';

type RouteType = RouteProp<RootStackParamList, 'TuitionDetail'>;

const TuitionDetailScreen: React.FC = () => {
  const route = useRoute<RouteType>();
  const { tuitionId } = route.params;

  const [data, setData] = useState<TuitionDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [showApplyForm, setShowApplyForm] = useState(false);

  useEffect(() => {
    fetchTuition();
  }, [tuitionId]);

  const fetchTuition = async () => {
    try {
      const response = await tuitionsApi.getById(tuitionId);
      if (response.success) {
        setData(response.data);
      }
    } catch (error) {
      Alert.alert('Error', handleApiError(error as any));
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    setApplying(true);
    try {
      const response = await tuitionsApi.apply(tuitionId, coverLetter);
      if (response.success) {
        Alert.alert('Success', 'Application submitted successfully!');
        fetchTuition(); // Refresh to update status
        setShowApplyForm(false);
      }
    } catch (error) {
      Alert.alert('Error', handleApiError(error as any));
    } finally {
      setApplying(false);
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  if (!data) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Tuition not found</Text>
      </View>
    );
  }

  const { tuition, has_applied, can_apply } = data;

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header Card */}
      <Card style={styles.headerCard}>
        <Text style={styles.tuitionCode}>{tuition.tuition_code}</Text>
        <View style={styles.statusRow}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: has_applied ? colors.success + '20' : colors.primary + '20' },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: has_applied ? colors.success : colors.primary },
              ]}
            >
              {has_applied ? 'Already Applied' : 'Available'}
            </Text>
          </View>
        </View>
        <View style={styles.salaryRow}>
          <Text style={styles.salaryLabel}>Monthly Salary</Text>
          <Text style={styles.salaryValue}>{formatCurrency(tuition.salary)}</Text>
        </View>
      </Card>

      {/* Details Card */}
      <Card style={styles.detailsCard}>
        <Text style={styles.sectionTitle}>Tuition Details</Text>

        <DetailRow icon="map-marker" label="Location" value={`${tuition.area}, ${tuition.city}`} />
        <DetailRow icon="school" label="Class" value={tuition.class} />
        <DetailRow icon="book-open-variant" label="Subjects" value={tuition.prefered_subjects} />
        <DetailRow icon="translate" label="Medium" value={tuition.medium} />
        <DetailRow icon="calendar-week" label="Days/Week" value={tuition.day_per_week} />
        <DetailRow icon="clock-outline" label="Preferred Time" value={tuition.prefered_time || 'Flexible'} />
        <DetailRow icon="account" label="Gender Preference" value={tuition.prefered_gender} />
        <DetailRow icon="office-building" label="Preferred University" value={tuition.prefered_university || 'Any'} />
        {tuition.group_of_study && (
          <DetailRow icon="book-education" label="Group" value={tuition.group_of_study} />
        )}
      </Card>

      {/* Requirements Card */}
      {(tuition.student_short_details || tuition.tutor_requirement) && (
        <Card style={styles.detailsCard}>
          <Text style={styles.sectionTitle}>Requirements</Text>

          {tuition.student_short_details && (
            <View style={styles.requirementItem}>
              <Text style={styles.requirementLabel}>Student Details</Text>
              <Text style={styles.requirementText}>{tuition.student_short_details}</Text>
            </View>
          )}

          {tuition.tutor_requirement && (
            <View style={styles.requirementItem}>
              <Text style={styles.requirementLabel}>Tutor Requirement</Text>
              <Text style={styles.requirementText}>{tuition.tutor_requirement}</Text>
            </View>
          )}
        </Card>
      )}

      {/* Apply Section */}
      {!has_applied && can_apply && (
        <Card style={styles.applyCard}>
          {showApplyForm ? (
            <>
              <Text style={styles.sectionTitle}>Apply for this Tuition</Text>
              <Input
                label="Cover Letter (Optional)"
                placeholder="Write a brief message to the guardian..."
                value={coverLetter}
                onChangeText={setCoverLetter}
                multiline
                numberOfLines={4}
                style={styles.coverLetterInput}
              />
              <View style={styles.buttonRow}>
                <Button
                  title="Cancel"
                  onPress={() => setShowApplyForm(false)}
                  variant="outline"
                  style={styles.cancelButton}
                />
                <Button
                  title="Submit Application"
                  onPress={handleApply}
                  loading={applying}
                  style={styles.submitButton}
                />
              </View>
            </>
          ) : (
            <Button
              title="Apply Now"
              onPress={() => setShowApplyForm(true)}
              fullWidth
              size="large"
            />
          )}
        </Card>
      )}

      {has_applied && (
        <Card style={[styles.applyCard, { backgroundColor: colors.success + '10' }]}>
          <View style={styles.appliedContainer}>
            <Icon name="check-circle" size={32} color={colors.success} />
            <Text style={styles.appliedText}>You have already applied for this tuition</Text>
          </View>
        </Card>
      )}

      {!can_apply && !has_applied && (
        <Card style={[styles.applyCard, { backgroundColor: colors.warning + '10' }]}>
          <View style={styles.appliedContainer}>
            <Icon name="alert-circle" size={32} color={colors.warning} />
            <Text style={styles.notEligibleText}>
              You are not eligible for this tuition based on gender preference
            </Text>
          </View>
        </Card>
      )}
    </ScrollView>
  );
};

interface DetailRowProps {
  icon: string;
  label: string;
  value: string;
}

const DetailRow: React.FC<DetailRowProps> = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <Icon name={icon} size={20} color={colors.textSecondary} />
    <View style={styles.detailContent}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{value}</Text>
    </View>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
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
  tuitionCode: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: '#fff',
  },
  statusRow: {
    marginTop: spacing.sm,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.full,
    backgroundColor: 'rgba(255,255,255,0.2)',
  },
  statusText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#fff',
  },
  salaryRow: {
    marginTop: spacing.md,
  },
  salaryLabel: {
    fontSize: fontSize.sm,
    color: 'rgba(255,255,255,0.8)',
  },
  salaryValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: '#fff',
  },
  detailsCard: {},
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.md,
    gap: spacing.sm,
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  detailValue: {
    fontSize: fontSize.md,
    color: colors.text,
    fontWeight: '500',
  },
  requirementItem: {
    marginBottom: spacing.md,
  },
  requirementLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.xs,
  },
  requirementText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
  },
  applyCard: {},
  coverLetterInput: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonRow: {
    flexDirection: 'row',
    gap: spacing.md,
    marginTop: spacing.md,
  },
  cancelButton: {
    flex: 1,
  },
  submitButton: {
    flex: 1,
  },
  appliedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  appliedText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.success,
    fontWeight: '500',
  },
  notEligibleText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.warning,
    fontWeight: '500',
  },
});

export default TuitionDetailScreen;

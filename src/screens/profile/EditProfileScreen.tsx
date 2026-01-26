import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/client';
import { API_ENDPOINTS } from '../../constants/api';
import { handleApiError } from '../../api/client';

// Options for select dropdowns
const MEDIUM_OPTIONS = [
  { label: 'Bangla', value: 'Bangla' },
  { label: 'English', value: 'English' },
  { label: 'Both', value: 'Both' },
];

const DAYS_OPTIONS = [
  { label: '1 day', value: '1 day' },
  { label: '2 days', value: '2 days' },
  { label: '3 days', value: '3 days' },
  { label: '4 days', value: '4 days' },
  { label: '5 days', value: '5 days' },
  { label: '6 days', value: '6 days' },
];

const SSC_GROUP_OPTIONS = [
  { label: 'Science', value: 'Science' },
  { label: 'Commerce', value: 'Commerce' },
  { label: 'Humanities', value: 'Humanities' },
  { label: 'Dakhil', value: 'Dakhil' },
  { label: 'O Level', value: 'O Level' },
];

const HSC_GROUP_OPTIONS = [
  { label: 'Science', value: 'Science' },
  { label: 'Commerce', value: 'Commerce' },
  { label: 'Humanities', value: 'Humanities' },
  { label: 'Alim', value: 'Alim' },
  { label: 'A Level', value: 'A Level' },
];

interface FieldErrors {
  [key: string]: string;
}

const EditProfileScreen: React.FC = () => {
  const navigation = useNavigation();
  const { teacher, updateTeacher } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [formData, setFormData] = useState({
    expected_class: teacher?.expected_class || '',
    expected_subject: teacher?.expected_subject || '',
    expected_medium: teacher?.expected_medium || '',
    day_per_week: teacher?.day_per_week || '',
    expected_salary: teacher?.expected_salary?.toString() || '',
    mother_sister_phone: teacher?.mother_sister_phone || '',
    school_name: teacher?.school_name || '',
    ssc_group: teacher?.ssc_group || '',
    college_name: teacher?.college_name || '',
    hsc_group: teacher?.hsc_group || '',
  });

  const fieldLabels: { [key: string]: string } = {
    expected_class: 'Expected Class',
    expected_subject: 'Expected Subject',
    expected_medium: 'Expected Medium',
    day_per_week: 'Days Per Week',
    expected_salary: 'Expected Salary',
    mother_sister_phone: "Mother's/Sister's Phone",
    school_name: 'School Name',
    ssc_group: 'SSC Group',
    college_name: 'College Name',
    hsc_group: 'HSC Group',
  };

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleSave = async () => {
    setErrors({});
    setLoading(true);
    try {
      const response = await apiClient.put(API_ENDPOINTS.PROFILE, {
        ...formData,
        expected_salary: formData.expected_salary ? parseFloat(formData.expected_salary) : null,
      });

      if (response.data.success) {
        updateTeacher(response.data.data);
        Alert.alert('Success', 'Profile updated successfully!');
        navigation.goBack();
      }
    } catch (error: any) {
      // Parse validation errors from API response
      if (error.response?.data?.errors) {
        const apiErrors = error.response.data.errors;
        const fieldErrors: FieldErrors = {};
        const missingFields: string[] = [];

        Object.keys(apiErrors).forEach((field) => {
          fieldErrors[field] = apiErrors[field][0];
          if (fieldLabels[field]) {
            missingFields.push(fieldLabels[field]);
          }
        });

        setErrors(fieldErrors);

        // Show user-friendly alert with missing fields
        if (missingFields.length > 0) {
          Alert.alert(
            'Required Fields Missing',
            `Please fill in the following fields:\n\n• ${missingFields.join('\n• ')}`,
            [{ text: 'OK' }]
          );
        }
      } else {
        Alert.alert('Error', handleApiError(error));
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.content}>
        {/* Registration Information (Read-only) */}
        <Card style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Icon name="information" size={20} color={colors.primary} />
            <Text style={styles.infoTitle}>Registration Information</Text>
          </View>
          <View style={styles.infoContent}>
            <InfoRow label="Name" value={teacher?.teacher_name || ''} />
            <InfoRow label="Phone" value={teacher?.phone_number || ''} />
            <InfoRow label="Email" value={teacher?.email || ''} />
            <InfoRow label="University" value={teacher?.university_name || ''} />
            <InfoRow label="Department" value={teacher?.department_name || ''} />
            <InfoRow label="City" value={`${teacher?.city || ''}, ${teacher?.area || ''}`} />
          </View>
        </Card>

        {/* Teaching Preferences Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="school" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Teaching Preferences</Text>
          </View>

          <Input
            label="Expected Class"
            placeholder="e.g., Class 5-10, HSC, SSC"
            value={formData.expected_class}
            onChangeText={(value) => updateField('expected_class', value)}
            error={errors.expected_class}
            required
          />

          <Input
            label="Expected Subject"
            placeholder="e.g., Mathematics, Physics, English"
            value={formData.expected_subject}
            onChangeText={(value) => updateField('expected_subject', value)}
            error={errors.expected_subject}
            required
          />

          <Select
            label="Expected Medium"
            placeholder="Select Medium"
            value={formData.expected_medium}
            options={MEDIUM_OPTIONS}
            onValueChange={(value) => updateField('expected_medium', value)}
            error={errors.expected_medium}
            required
          />

          <Select
            label="Days Per Week"
            placeholder="Select Days"
            value={formData.day_per_week}
            options={DAYS_OPTIONS}
            onValueChange={(value) => updateField('day_per_week', value)}
            error={errors.day_per_week}
            required
          />

          <Input
            label="Expected Salary (BDT)"
            placeholder="e.g., 5000"
            value={formData.expected_salary}
            onChangeText={(value) => updateField('expected_salary', value)}
            keyboardType="numeric"
            error={errors.expected_salary}
            required
          />
        </View>

        {/* Educational Background Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Icon name="school-outline" size={20} color={colors.primary} />
            <Text style={styles.sectionTitle}>Educational Background</Text>
          </View>

          <Input
            label="Mother's/Sister's Phone Number"
            placeholder="Enter phone number"
            value={formData.mother_sister_phone}
            onChangeText={(value) => updateField('mother_sister_phone', value)}
            keyboardType="phone-pad"
            error={errors.mother_sister_phone}
            required
          />

          <Input
            label="School / Madrasa Name"
            placeholder="Enter school/madrasa name"
            value={formData.school_name}
            onChangeText={(value) => updateField('school_name', value)}
            error={errors.school_name}
            required
          />

          <Select
            label="SSC/Dakhil/O Level Group"
            placeholder="Select Group"
            value={formData.ssc_group}
            options={SSC_GROUP_OPTIONS}
            onValueChange={(value) => updateField('ssc_group', value)}
            error={errors.ssc_group}
            required
          />

          <Input
            label="College / Madrasa Name"
            placeholder="Enter college/madrasa name"
            value={formData.college_name}
            onChangeText={(value) => updateField('college_name', value)}
            error={errors.college_name}
            required
          />

          <Select
            label="HSC/Alim/A Level Group"
            placeholder="Select Group"
            value={formData.hsc_group}
            options={HSC_GROUP_OPTIONS}
            onValueChange={(value) => updateField('hsc_group', value)}
            error={errors.hsc_group}
            required
          />
        </View>

        {/* Warning Note */}
        <Card style={styles.warningCard}>
          <View style={styles.warningContent}>
            <Icon name="alert" size={20} color="#856404" />
            <Text style={styles.warningText}>
              Note: Once you submit your information for verification, you will not be able to edit your information!
            </Text>
          </View>
        </Card>

        <Button
          title="Submit for Verification"
          onPress={handleSave}
          loading={loading}
          fullWidth
          size="large"
          style={styles.saveButton}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

// Info Row Component
const InfoRow: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <View style={styles.infoRow}>
    <Text style={styles.infoLabel}>{label}:</Text>
    <Text style={styles.infoValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
  },
  infoCard: {
    backgroundColor: '#cce5ff',
    borderLeftWidth: 4,
    borderLeftColor: colors.primary,
    marginBottom: spacing.lg,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  infoTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
  infoContent: {
    gap: spacing.xs,
  },
  infoRow: {
    flexDirection: 'row',
  },
  infoLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#004085',
    width: 100,
  },
  infoValue: {
    fontSize: fontSize.sm,
    color: '#004085',
    flex: 1,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.md,
    paddingBottom: spacing.sm,
    borderBottomWidth: 2,
    borderBottomColor: colors.primary + '30',
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.primary,
  },
  warningCard: {
    backgroundColor: '#fff3cd',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
    marginBottom: spacing.md,
  },
  warningContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
  },
  warningText: {
    fontSize: fontSize.sm,
    color: '#856404',
    flex: 1,
    lineHeight: 20,
  },
  saveButton: {
    marginBottom: spacing.xl,
    backgroundColor: colors.success,
  },
});

export default EditProfileScreen;

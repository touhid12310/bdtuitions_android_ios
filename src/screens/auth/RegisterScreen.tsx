import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useNavigation } from '@react-navigation/native';
import { AuthStackParamList } from '../../navigation/AuthStack';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { colors, spacing, fontSize } from '../../constants/theme';
import { authApi } from '../../api/auth';
import { handleApiError } from '../../api/client';

type NavigationProp = NativeStackNavigationProp<AuthStackParamList, 'Register'>;

const RegisterScreen: React.FC = () => {
  const navigation = useNavigation<NavigationProp>();

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    teacher_name: '',
    phone_number: '',
    email: '',
    password: '',
    password_confirmation: '',
    gender: 'Male',
    university_name: '',
    department_name: '',
    academic_year: '',
    medium: 'Bangla',
    city: '',
    area: '',
    living_address: '',
    whatsapp_number: '',
    facebook_link: '',
    father_brother_phone: '',
    departmental_friend_phone: '',
    expected_area: [] as string[],
  });

  const updateField = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    // Validate current step
    if (step === 1) {
      if (!formData.teacher_name || !formData.phone_number || !formData.email) {
        Alert.alert('Error', 'Please fill in all required fields');
        return;
      }
    }
    setStep(step + 1);
  };

  const handleBack = () => {
    setStep(step - 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      // Note: For file uploads, you would use image picker
      // This is a simplified version without file uploads for demo
      Alert.alert(
        'Note',
        'For full registration with document uploads, please use the web portal. This demo shows the flow.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Registration Failed', handleApiError(error));
    } finally {
      setLoading(false);
    }
  };

  const renderStep1 = () => (
    <>
      <Text style={styles.stepTitle}>Personal Information</Text>
      <Input
        label="Full Name *"
        placeholder="Enter your full name"
        value={formData.teacher_name}
        onChangeText={(value) => updateField('teacher_name', value)}
        leftIcon="account"
      />
      <Input
        label="Phone Number *"
        placeholder="01XXXXXXXXX"
        value={formData.phone_number}
        onChangeText={(value) => updateField('phone_number', value)}
        keyboardType="phone-pad"
        leftIcon="phone"
      />
      <Input
        label="Email *"
        placeholder="your@email.com"
        value={formData.email}
        onChangeText={(value) => updateField('email', value)}
        keyboardType="email-address"
        autoCapitalize="none"
        leftIcon="email"
      />
      <Input
        label="Password *"
        placeholder="Minimum 6 characters"
        value={formData.password}
        onChangeText={(value) => updateField('password', value)}
        isPassword
        leftIcon="lock"
      />
      <Input
        label="Confirm Password *"
        placeholder="Re-enter password"
        value={formData.password_confirmation}
        onChangeText={(value) => updateField('password_confirmation', value)}
        isPassword
        leftIcon="lock-check"
      />
    </>
  );

  const renderStep2 = () => (
    <>
      <Text style={styles.stepTitle}>Academic Information</Text>
      <Input
        label="University Name *"
        placeholder="Enter your university"
        value={formData.university_name}
        onChangeText={(value) => updateField('university_name', value)}
        leftIcon="school"
      />
      <Input
        label="Department *"
        placeholder="Enter your department"
        value={formData.department_name}
        onChangeText={(value) => updateField('department_name', value)}
        leftIcon="book"
      />
      <Input
        label="Academic Year *"
        placeholder="e.g., 1st Year, 2nd Year"
        value={formData.academic_year}
        onChangeText={(value) => updateField('academic_year', value)}
        leftIcon="calendar"
      />
    </>
  );

  const renderStep3 = () => (
    <>
      <Text style={styles.stepTitle}>Location & Contact</Text>
      <Input
        label="City *"
        placeholder="Enter your city"
        value={formData.city}
        onChangeText={(value) => updateField('city', value)}
        leftIcon="city"
      />
      <Input
        label="Area *"
        placeholder="Enter your area"
        value={formData.area}
        onChangeText={(value) => updateField('area', value)}
        leftIcon="map-marker"
      />
      <Input
        label="Living Address *"
        placeholder="Enter your full address"
        value={formData.living_address}
        onChangeText={(value) => updateField('living_address', value)}
        leftIcon="home"
        multiline
      />
      <Input
        label="WhatsApp Number *"
        placeholder="01XXXXXXXXX"
        value={formData.whatsapp_number}
        onChangeText={(value) => updateField('whatsapp_number', value)}
        keyboardType="phone-pad"
        leftIcon="whatsapp"
      />
      <Input
        label="Facebook Profile Link *"
        placeholder="https://facebook.com/..."
        value={formData.facebook_link}
        onChangeText={(value) => updateField('facebook_link', value)}
        autoCapitalize="none"
        leftIcon="facebook"
      />
    </>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Progress indicator */}
        <View style={styles.progressContainer}>
          {[1, 2, 3].map((s) => (
            <View
              key={s}
              style={[
                styles.progressDot,
                s <= step && styles.progressDotActive,
              ]}
            />
          ))}
        </View>

        <Text style={styles.stepIndicator}>Step {step} of 3</Text>

        {step === 1 && renderStep1()}
        {step === 2 && renderStep2()}
        {step === 3 && renderStep3()}

        <View style={styles.buttonContainer}>
          {step > 1 && (
            <Button
              title="Back"
              onPress={handleBack}
              variant="outline"
              style={styles.backButton}
            />
          )}
          {step < 3 ? (
            <Button
              title="Next"
              onPress={handleNext}
              style={styles.nextButton}
            />
          ) : (
            <Button
              title="Submit"
              onPress={handleSubmit}
              loading={loading}
              style={styles.nextButton}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing.lg,
  },
  progressContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: spacing.sm,
  },
  progressDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.border,
    marginHorizontal: spacing.xs,
  },
  progressDotActive: {
    backgroundColor: colors.primary,
  },
  stepIndicator: {
    textAlign: 'center',
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing.lg,
  },
  stepTitle: {
    fontSize: fontSize.xl,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.lg,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: spacing.lg,
    gap: spacing.md,
  },
  backButton: {
    flex: 1,
  },
  nextButton: {
    flex: 1,
  },
});

export default RegisterScreen;

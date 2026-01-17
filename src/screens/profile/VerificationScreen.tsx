import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';
import apiClient from '../../api/client';
import { API_ENDPOINTS } from '../../constants/api';
import { getStatusColor } from '../../utils/formatting';

const VERIFICATION_FEE = 500;

interface VerificationStatus {
  status: string;
  is_verified: boolean;
  is_pending_verification: boolean;
  needs_payment: boolean;
  is_profile_incomplete: boolean;
  profile_complete: boolean;
  missing_fields: string[];
}

const VerificationScreen: React.FC = () => {
  const navigation = useNavigation();
  const { teacher, updateTeacher } = useAuthStore();
  const [loading, setLoading] = useState(true);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<VerificationStatus | null>(null);
  const [showWebView, setShowWebView] = useState(false);
  const [bkashUrl, setBkashUrl] = useState('');
  const [paymentId, setPaymentId] = useState('');

  useEffect(() => {
    fetchVerificationStatus();
  }, []);

  const fetchVerificationStatus = async () => {
    try {
      const response = await apiClient.get(API_ENDPOINTS.PROFILE_VERIFICATION);
      if (response.data.success) {
        setVerificationStatus(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching verification status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePayForVerification = async () => {
    setPaymentLoading(true);
    try {
      const response = await apiClient.post(API_ENDPOINTS.VERIFICATION_PAY, {
        amount: VERIFICATION_FEE,
      });

      if (response.data.success) {
        const { bkash_url, payment_id } = response.data.data;
        setBkashUrl(bkash_url);
        setPaymentId(payment_id);
        setShowWebView(true);
      } else {
        Alert.alert('Error', response.data.message || 'Failed to initiate payment');
      }
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create payment. Please try again.');
    } finally {
      setPaymentLoading(false);
    }
  };

  const handleWebViewNavigationChange = async (navState: any) => {
    const { url } = navState;

    // Check if redirected back from bKash
    if (url.includes('status=success') || url.includes('status=failure') || url.includes('status=cancel')) {
      setShowWebView(false);

      const urlParams = new URLSearchParams(url.split('?')[1]);
      const status = urlParams.get('status');
      const returnedPaymentId = urlParams.get('paymentID') || paymentId;

      if (status === 'success') {
        try {
          const executeResponse = await apiClient.post(API_ENDPOINTS.VERIFICATION_EXECUTE, {
            payment_id: returnedPaymentId,
            status: 'success',
          });

          if (executeResponse.data.success) {
            Alert.alert(
              'Success!',
              'Verification payment completed! Your profile is now pending verification.',
              [{ text: 'OK', onPress: () => {
                updateTeacher({ status: 'Pending Verification' });
                fetchVerificationStatus();
              }}]
            );
          } else {
            Alert.alert('Error', executeResponse.data.message || 'Payment verification failed');
          }
        } catch (error: any) {
          Alert.alert('Error', error.response?.data?.message || 'Payment verification failed');
        }
      } else {
        Alert.alert('Payment Cancelled', 'Your payment was cancelled or failed. Please try again.');
      }
    }
  };

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  const status = verificationStatus || {
    status: teacher?.status || 'Unknown',
    is_verified: false,
    is_pending_verification: false,
    needs_payment: true,
    is_profile_incomplete: true,
    profile_complete: false,
    missing_fields: [],
  };

  const isVerified = status.is_verified || teacher?.status?.toLowerCase() === 'verified';
  const isPendingVerification = status.is_pending_verification || teacher?.status?.toLowerCase() === 'pending verification';

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Header */}
      <Card style={styles.headerCard}>
        <Icon name="shield-check" size={48} color={colors.primary} />
        <Text style={styles.headerTitle}>প্রোফাইল ভেরিফিকেশন</Text>
        <Text style={styles.headerSubtitle}>
          আপনার প্রোফাইল ভেরিফিকেশন সম্পন্ন করুন এবং টিউশন পাওয়ার সম্ভাবনা বাড়ান
        </Text>
      </Card>

      {/* Status Card */}
      {(isVerified || isPendingVerification) && (
        <Card style={[styles.statusCard, isVerified ? styles.verifiedCard : styles.pendingCard]}>
          <Icon
            name={isVerified ? 'check-circle' : 'clock-outline'}
            size={32}
            color={isVerified ? colors.success : colors.warning}
          />
          <Text style={styles.statusTitle}>
            {isVerified ? 'আপনি ভেরিফাইড!' : 'ভেরিফিকেশন পেন্ডিং'}
          </Text>
          <Text style={styles.statusText}>
            {isVerified
              ? 'আপনার প্রোফাইল ভেরিফাইড। আপনি এখন সকল সুবিধা উপভোগ করতে পারবেন।'
              : 'আপনার পেমেন্ট সম্পন্ন হয়েছে। আমাদের টিম আপনার ডকুমেন্ট রিভিউ করছে।'}
          </Text>
        </Card>
      )}

      {/* Benefits Card */}
      {!isVerified && !isPendingVerification && (
        <>
          <Card style={styles.benefitsCard}>
            <Text style={styles.sectionTitle}>
              <Icon name="information" size={20} color={colors.primary} /> আপনি কেনো বিডি টিউশন এর ভেরিফাইড টিউটর হবেন?
            </Text>

            <BenefitItem text="টিউশন কনফার্ম হওয়ার আগে কোনো মিডিয়া ফি দিতে হবে না।" />
            <BenefitItem text="প্রতিটি টিউশনে সার্ভিস চার্জ ১০% কম রাখা হবে।" />
            <BenefitItem text="টিউশন দেওয়ার ক্ষেত্রে ভেরিফাইড টিউটরকে অগ্রাধিকার দেওয়া হবে।" />
            <BenefitItem text="আপনার প্রোফাইল টা ওয়েবসাইটে ভেরিফাইড টিউটর হিসেবে সবার উপরে দেখানো হবে।" />
            <BenefitItem text="গার্ডিয়ান ওয়েবসাইটে ডুকে ভেরিফাইড টিউটরদের টিউটর হিসেবে নেওয়ার জন্য রিকোয়েস্ট করতে পারবে।" />
          </Card>

          {/* Payment Details Card */}
          <Card style={styles.paymentCard}>
            <Text style={styles.sectionTitle}>
              <Icon name="cash" size={20} color={colors.primary} /> পেমেন্ট বিবরণ
            </Text>

            <View style={styles.paymentDetails}>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>ওয়ান টাইম ভেরিফিকেশন চার্জ:</Text>
                <Text style={styles.paymentValue}>৳{VERIFICATION_FEE}</Text>
              </View>
              <View style={styles.paymentRow}>
                <Text style={styles.paymentLabel}>প্রসেসিং ফি:</Text>
                <Text style={styles.paymentValue}>৳০</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.paymentRow}>
                <Text style={styles.paymentTotalLabel}>মোট পরিমাণ:</Text>
                <Text style={styles.paymentTotalValue}>৳{VERIFICATION_FEE}</Text>
              </View>
            </View>
          </Card>

          {/* Payment Method Info */}
          <View style={styles.paymentMethodInfo}>
            <Icon name="information" size={20} color="#0c5460" />
            <Text style={styles.paymentMethodText}>
              পেমেন্ট পদ্ধতি: bKash (মোবাইল ব্যাংকিং)
            </Text>
          </View>

          {/* Pay Button */}
          <Button
            title={`bKash দিয়ে ৳${VERIFICATION_FEE} পেমেন্ট করুন`}
            onPress={handlePayForVerification}
            fullWidth
            size="large"
            loading={paymentLoading}
            style={styles.payButton}
          />

          {/* Important Notes */}
          <Card style={styles.notesCard}>
            <Text style={styles.notesTitle}>
              <Icon name="alert" size={18} color="#664d03" /> গুরুত্বপূর্ণ নোট:
            </Text>
            <NoteItem text="পেমেন্ট bKash এর মাধ্যমে নিরাপদে প্রক্রিয়া করা হয়" />
            <NoteItem text="আপনাকে bKash পেমেন্ট পেজে রিডাইরেক্ট করা হবে" />
            <NoteItem text="সফল পেমেন্টের পর, আপনার প্রোফাইল স্বয়ংক্রিয়ভাবে ভেরিফাইড হবে" />
            <NoteItem text="যদি পেমেন্ট ব্যর্থ হয়, আপনি আবার চেষ্টা করতে পারেন" />
            <NoteItem text="এটি একটি এককালীন ভেরিফিকেশন চার্জ" />
          </Card>
        </>
      )}

      {/* bKash WebView Modal */}
      <Modal visible={showWebView} animationType="slide" onRequestClose={() => setShowWebView(false)}>
        <View style={styles.webViewContainer}>
          <View style={styles.webViewHeader}>
            <Text style={styles.webViewTitle}>bKash Payment</Text>
            <Button
              title="Cancel"
              onPress={() => setShowWebView(false)}
              variant="text"
              size="small"
            />
          </View>
          {bkashUrl ? (
            <WebView
              source={{ uri: bkashUrl }}
              onNavigationStateChange={handleWebViewNavigationChange}
              startInLoadingState
              renderLoading={() => (
                <View style={styles.webViewLoading}>
                  <ActivityIndicator size="large" color={colors.primary} />
                  <Text style={styles.loadingText}>Loading bKash...</Text>
                </View>
              )}
            />
          ) : (
            <View style={styles.webViewLoading}>
              <ActivityIndicator size="large" color={colors.primary} />
            </View>
          )}
        </View>
      </Modal>
    </ScrollView>
  );
};

// Benefit Item Component
const BenefitItem: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.benefitItem}>
    <Icon name="check-circle" size={18} color={colors.success} />
    <Text style={styles.benefitText}>{text}</Text>
  </View>
);

// Note Item Component
const NoteItem: React.FC<{ text: string }> = ({ text }) => (
  <View style={styles.noteItem}>
    <Text style={styles.noteText}>• {text}</Text>
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
  headerCard: {
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  headerTitle: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.primary,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
  headerSubtitle: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
    lineHeight: 22,
  },
  statusCard: {
    alignItems: 'center',
    padding: spacing.lg,
  },
  verifiedCard: {
    backgroundColor: '#D1FAE5',
    borderLeftWidth: 4,
    borderLeftColor: colors.success,
  },
  pendingCard: {
    backgroundColor: '#FEF3C7',
    borderLeftWidth: 4,
    borderLeftColor: colors.warning,
  },
  statusTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.text,
    marginTop: spacing.sm,
  },
  statusText: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: spacing.xs,
  },
  benefitsCard: {
    backgroundColor: colors.surface,
  },
  sectionTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  benefitText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: colors.text,
    lineHeight: 20,
  },
  paymentCard: {
    backgroundColor: colors.surface,
  },
  paymentDetails: {
    backgroundColor: colors.background,
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderWidth: 2,
    borderColor: colors.border,
  },
  paymentRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  paymentLabel: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
  },
  paymentValue: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.sm,
  },
  paymentTotalLabel: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.text,
  },
  paymentTotalValue: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.success,
  },
  paymentMethodInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(13, 202, 240, 0.1)',
    padding: spacing.md,
    borderRadius: borderRadius.md,
    borderLeftWidth: 4,
    borderLeftColor: '#0dcaf0',
    gap: spacing.sm,
  },
  paymentMethodText: {
    flex: 1,
    fontSize: fontSize.sm,
    color: '#0c5460',
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: colors.success,
    marginVertical: spacing.sm,
  },
  notesCard: {
    backgroundColor: 'rgba(255, 193, 7, 0.1)',
    borderLeftWidth: 4,
    borderLeftColor: '#ffc107',
  },
  notesTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: '#664d03',
    marginBottom: spacing.sm,
  },
  noteItem: {
    paddingVertical: spacing.xs,
  },
  noteText: {
    fontSize: fontSize.sm,
    color: '#664d03',
    lineHeight: 20,
  },
  webViewContainer: {
    flex: 1,
    backgroundColor: colors.background,
  },
  webViewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.md,
    backgroundColor: colors.primary,
  },
  webViewTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#fff',
  },
  webViewLoading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing.md,
    fontSize: fontSize.md,
    color: colors.textSecondary,
  },
});

export default VerificationScreen;

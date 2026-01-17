import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  ScrollView,
} from 'react-native';
import { WebView } from 'react-native-webview';
import { RouteProp, useRoute, useNavigation } from '@react-navigation/native';
import Button from '../../components/common/Button';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { colors, spacing, fontSize } from '../../constants/theme';
import { paymentsApi } from '../../api/payments';
import { handleApiError } from '../../api/client';
import { RootStackParamList } from '../../navigation/RootNavigator';
import { formatCurrency } from '../../utils/formatting';

type RouteType = RouteProp<RootStackParamList, 'PaymentForm'>;

const PaymentFormScreen: React.FC = () => {
  const route = useRoute<RouteType>();
  const navigation = useNavigation();
  const { assignmentId, amount } = route.params;

  const [loading, setLoading] = useState(false);
  const [bkashUrl, setBkashUrl] = useState<string | null>(null);
  const [paymentId, setPaymentId] = useState<string | null>(null);

  const webViewRef = useRef<WebView>(null);

  const handleBkashPayment = async () => {
    setLoading(true);
    try {
      const response = await paymentsApi.createBkashPayment(assignmentId, amount);
      if (response.success && response.data.bkash_url) {
        setBkashUrl(response.data.bkash_url);
        setPaymentId(response.data.payment_id);
      } else {
        Alert.alert('Error', 'Failed to initialize bKash payment');
      }
    } catch (error) {
      Alert.alert('Error', handleApiError(error as any));
    } finally {
      setLoading(false);
    }
  };

  const handleWebViewNavigationStateChange = async (navState: any) => {
    const { url } = navState;

    // Check for bKash callback with status
    if (url.includes('status=success') && paymentId) {
      setBkashUrl(null);
      setLoading(true);

      try {
        // Execute the bKash payment
        const response = await paymentsApi.executeBkashPayment(paymentId, 'success');
        if (response.success) {
          Alert.alert(
            'Payment Successful',
            'Your payment has been processed successfully.',
            [{ text: 'OK', onPress: () => navigation.goBack() }]
          );
        } else {
          Alert.alert('Error', 'Failed to complete payment. Please contact support.');
        }
      } catch (error) {
        Alert.alert('Error', handleApiError(error as any));
      } finally {
        setLoading(false);
        setPaymentId(null);
      }
    } else if (url.includes('status=cancel') || url.includes('status=failure')) {
      setBkashUrl(null);
      setPaymentId(null);
      Alert.alert('Payment Cancelled', 'Your payment was not completed. Please try again.');
    }
  };

  if (bkashUrl) {
    return (
      <View style={styles.webViewContainer}>
        <WebView
          ref={webViewRef}
          source={{ uri: bkashUrl }}
          onNavigationStateChange={handleWebViewNavigationStateChange}
          startInLoadingState
          renderLoading={() => <LoadingSpinner fullScreen />}
          style={styles.webView}
        />
      </View>
    );
  }

  if (loading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Payment Summary */}
      <Card style={styles.summaryCard}>
        <Text style={styles.summaryTitle}>Payment Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>Amount Due</Text>
          <Text style={styles.summaryValue}>{formatCurrency(amount)}</Text>
        </View>
      </Card>

      {/* bKash Payment */}
      <Card style={styles.paymentCard}>
        <Text style={styles.sectionTitle}>Pay with bKash</Text>
        <Text style={styles.description}>
          Click the button below to proceed with bKash payment. You will be redirected to the bKash payment page to complete your transaction securely.
        </Text>

        <View style={styles.bkashLogo}>
          <Text style={styles.bkashLogoText}>bKash</Text>
        </View>

        <Button
          title={`Pay ${formatCurrency(amount)}`}
          onPress={handleBkashPayment}
          loading={loading}
          fullWidth
          size="large"
          style={styles.payButton}
        />

        <Text style={styles.secureText}>
          Secure payment powered by bKash
        </Text>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    padding: spacing.md,
    gap: spacing.md,
  },
  webViewContainer: {
    flex: 1,
  },
  webView: {
    flex: 1,
  },
  summaryCard: {
    backgroundColor: colors.primary,
  },
  summaryTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: '#fff',
    marginBottom: spacing.md,
  },
  sectionTitle: {
    fontSize: fontSize.lg,
    fontWeight: '600',
    color: colors.text,
    marginBottom: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  summaryLabel: {
    fontSize: fontSize.md,
    color: '#fff',
    opacity: 0.9,
  },
  summaryValue: {
    fontSize: fontSize.xxl,
    fontWeight: '700',
    color: '#fff',
  },
  paymentCard: {},
  description: {
    fontSize: fontSize.md,
    color: colors.textSecondary,
    lineHeight: 22,
    marginBottom: spacing.lg,
  },
  bkashLogo: {
    backgroundColor: '#E2136E',
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xl,
    borderRadius: 8,
    alignSelf: 'center',
    marginBottom: spacing.lg,
  },
  bkashLogoText: {
    color: '#fff',
    fontSize: fontSize.xl,
    fontWeight: '700',
  },
  payButton: {
    marginBottom: spacing.md,
  },
  secureText: {
    fontSize: fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
  },
});

export default PaymentFormScreen;

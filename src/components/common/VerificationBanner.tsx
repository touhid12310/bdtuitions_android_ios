import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { MaterialCommunityIcons as Icon } from '@expo/vector-icons';
import { colors, spacing, fontSize, borderRadius } from '../../constants/theme';
import { useAuthStore } from '../../store/authStore';

const VerificationBanner: React.FC = () => {
  const navigation = useNavigation<any>();
  const { teacher } = useAuthStore();

  const isVerified = teacher?.status?.toLowerCase() === 'verified';

  // Don't show if verified
  if (isVerified || !teacher) {
    return null;
  }

  return (
    <View style={styles.banner}>
      <View style={styles.bannerContent}>
        <Icon name="shield-check" size={16} color="#fff" />
        <Text style={styles.text} numberOfLines={1}>
          Become a Verified Tutor!
        </Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.navigate('Verification')}
        >
          <Text style={styles.buttonText}>Get Verified</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: colors.primary,
  },
  bannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    gap: spacing.sm,
  },
  text: {
    flex: 1,
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: '#fff',
  },
  button: {
    backgroundColor: '#10B981',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs + 2,
    borderRadius: borderRadius.md,
  },
  buttonText: {
    fontSize: fontSize.xs,
    fontWeight: '600',
    color: '#fff',
  },
});

export default VerificationBanner;
